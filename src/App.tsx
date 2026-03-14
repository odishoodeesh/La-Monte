/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./lib/supabase";
import { LogIn, UserPlus, LogOut, Mail, Lock, Loader2, User, ChevronRight, ChevronDown, Plus, Edit2, Trash2, Image as ImageIcon, Sparkles, X, Save, ArrowLeft, RefreshCw } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { initialMenuData } from "./data/menuData";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  subcategory_id?: string;
  image_url: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'menu' | 'auth' | 'admin'>('menu');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Drinks');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [adminSubView, setAdminSubView] = useState<'dashboard' | 'menu' | 'categories' | 'subcategories'>('dashboard');
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Partial<Subcategory> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Expand all categories by default when menuItems are loaded
    if (menuItems.length > 0) {
      const initialExpanded: Record<string, boolean> = {};
      menuItems.forEach(item => {
        initialExpanded[`${item.category}-${item.subcategory}`] = true;
      });
      setExpandedCategories(initialExpanded);
    }
  }, [menuItems]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setView('admin');
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setView('admin');
      else if (view === 'admin') setView('menu');
    });

    fetchMenu();
    if (session) fetchCategories();

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const fetchMenu = async () => {
    setMenuLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          subcategories (
            id,
            name,
            categories (
              id,
              name
            )
          )
        `)
        .eq('is_available', true)
        .order('name', { ascending: true });

      if (data) {
        const flattenedData = data.map((item: any) => ({
          ...item,
          category: item.subcategories?.categories?.name || 'Uncategorized',
          subcategory: item.subcategories?.name || 'General',
          subcategory_id: item.subcategory_id
        }));
        setMenuItems(flattenedData);
      }
      if (error) throw error;
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setMenuLoading(false);
    }
  };

  const autoPopulateMenu = async () => {
    if (categories.length > 0 || menuLoading || authLoading) return;
    
    // Check if categories really don't exist in DB
    const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    if (count !== 0) return;

    console.log('Auto-populating menu...');
    setAuthLoading(true);
    try {
      const catNames = [...new Set(initialMenuData.map(item => item.category))];
      
      for (const catName of catNames) {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .insert({ name: catName })
          .select()
          .single();
        
        if (catError) throw catError;

        const subcats = [...new Set(initialMenuData
          .filter(item => item.category === catName)
          .map(item => item.subcategory))];

        for (const subName of subcats) {
          const { data: subData, error: subError } = await supabase
            .from('subcategories')
            .insert({ category_id: catData.id, name: subName })
            .select()
            .single();
          
          if (subError) throw subError;

          const items = initialMenuData.filter(item => 
            item.category === catName && item.subcategory === subName
          );

          const { error: itemError } = await supabase
            .from('menu_items')
            .insert(items.map(item => ({
              subcategory_id: subData.id,
              name: item.name,
              price: item.price,
              description: item.description || '',
              image_url: item.image_url || '',
              is_available: true
            })));
          
          if (itemError) throw itemError;
        }
      }
      fetchCategories();
      fetchMenu();
    } catch (error) {
      console.error('Auto-populate error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && categories.length === 0) {
      autoPopulateMenu();
    }
  }, [loading, categories.length]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (*)
        `)
        .order('display_order', { ascending: true });
      
      if (data) {
        setCategories(data);
        const allSubcats = data.flatMap((c: any) => c.subcategories);
        setSubcategories(allSubcats);
      }
      if (error) throw error;
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const groupedMenu = menuItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    const subcategory = item.subcategory || 'General';
    if (!acc[category]) acc[category] = {};
    if (!acc[category][subcategory]) acc[category][subcategory] = [];
    acc[category][subcategory].push(item);
    return acc;
  }, {} as Record<string, Record<string, MenuItem[]>>);

  const mainCategories = ['Drinks', 'SHISHA', 'FOOD'];
  
  // Get all categories from data to ensure we don't miss any
  const allCategories = Object.keys(groupedMenu);
  
  // Categories to display in order: main categories first, then any others
  const displayCategories = [
    ...mainCategories.filter(cat => allCategories.some(k => k.toLowerCase() === cat.toLowerCase())),
    ...allCategories.filter(cat => !mainCategories.some(m => m.toLowerCase() === cat.toLowerCase()))
  ];

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setAuthError(error.message);
      setAuthLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;

    setAuthLoading(true);
    try {
      if (editingCategory.id) {
        const { error } = await supabase
          .from('categories')
          .update({ name: editingCategory.name })
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ name: editingCategory.name }]);
        if (error) throw error;
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure? This will delete all subcategories and items in this category.')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      fetchCategories();
      fetchMenu();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubcategory?.name || !editingSubcategory?.category_id) return;

    setAuthLoading(true);
    try {
      if (editingSubcategory.id) {
        const { error } = await supabase
          .from('subcategories')
          .update({ name: editingSubcategory.name, category_id: editingSubcategory.category_id })
          .eq('id', editingSubcategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subcategories')
          .insert([{ name: editingSubcategory.name, category_id: editingSubcategory.category_id }]);
        if (error) throw error;
      }
      setIsSubcategoryModalOpen(false);
      setEditingSubcategory(null);
      fetchCategories();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm('Are you sure? This will delete all items in this subcategory.')) return;
    try {
      const { error } = await supabase.from('subcategories').delete().eq('id', id);
      if (error) throw error;
      fetchCategories();
      fetchMenu();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.subcategory_id) {
      alert('Please select a subcategory');
      return;
    }

    setAuthLoading(true);
    try {
      const itemToSave = {
        name: editingItem.name,
        description: editingItem.description || '',
        price: editingItem.price,
        image_url: editingItem.image_url || '',
        subcategory_id: editingItem.subcategory_id,
        is_available: true
      };

      if (editingItem.id) {
        const { error } = await supabase
          .from('menu_items')
          .update(itemToSave)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert([itemToSave]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchMenu();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchMenu();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const generateImage = async () => {
    if (!editingItem?.name) {
      alert('Please enter an item name first');
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Professional food photography of ${editingItem.name}. ${editingItem.description || ''}. High-end restaurant style, minimalist background, warm lighting, 4k resolution. Please include a small, elegant, and subtle "Lamonte" restaurant logo in one of the corners of the image.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }] }],
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        const imageUrl = `data:image/png;base64,${imagePart.inlineData.data}`;
        setEditingItem(prev => ({ ...prev, image_url: imageUrl }));
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center overflow-hidden">
        <motion.div
          key="intro"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <img
            src="https://i.ibb.co/84TCyPNf/logo.png"
            alt="Lamonte Logo"
            className="max-w-[80vw] h-auto"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-serif">
      <AnimatePresence mode="wait">
        {view === 'auth' ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-white rounded-[32px] shadow-xl p-8 border border-[#e5e5e0]">
              <button 
                onClick={() => setView('menu')}
                className="mb-6 text-sm text-gray-400 hover:text-[#A65E3E] flex items-center gap-1 transition-colors"
              >
                <ChevronRight className="rotate-180 w-4 h-4" />
                Back to Menu
              </button>
              <div className="text-center mb-8">
                <img
                  src="https://i.ibb.co/84TCyPNf/logo.png"
                  alt="Lamonte Logo"
                  className="h-16 mx-auto mb-4"
                  referrerPolicy="no-referrer"
                />
                <h2 className="text-3xl font-bold text-[#A65E3E]">
                  Admin Access
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Sign in to manage Lamonte
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A65E3E]/20 focus:border-[#A65E3E] transition-all"
                      placeholder="admin@lamonte.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A65E3E]/20 focus:border-[#A65E3E] transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-[#A65E3E] hover:bg-[#8d4f34] text-white rounded-2xl font-bold shadow-lg shadow-[#A65E3E]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {authLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e5e5e0]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-gray-400 tracking-widest font-bold">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full py-4 bg-white border border-[#e5e5e0] hover:bg-[#f9f9f7] text-[#1a1a1a] rounded-2xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
            </div>
          </motion.div>
        ) : view === 'admin' && session ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col"
          >
            <nav className="bg-white border-b border-[#e5e5e0] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="https://i.ibb.co/84TCyPNf/logo.png"
                  alt="Lamonte Logo"
                  className="h-10"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs uppercase tracking-widest font-bold text-[#A65E3E] bg-[#A65E3E]/10 px-3 py-1 rounded-full">
                  Admin Panel
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setView('menu')}
                  className="text-sm text-gray-500 hover:text-[#A65E3E] transition-colors"
                >
                  View Public Menu
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#f9f9f7] rounded-full text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  {session.user.user_metadata?.full_name || session.user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            </nav>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
              {adminSubView === 'dashboard' ? (
                <>
                  <div className="mb-12">
                    <h1 className="text-5xl font-bold text-[#A65E3E] mb-4">
                      Admin Dashboard
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl">
                      Manage your menu items, reservations, and restaurant settings.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                      { title: "Manage Menu", desc: "Add, edit, or remove menu items.", icon: "🍔", view: 'menu' },
                      { title: "Categories", desc: "Manage top-level menu sections.", icon: "📂", view: 'categories' },
                      { title: "Subcategories", desc: "Manage nested menu groups.", icon: "📁", view: 'subcategories' },
                      { title: "Reservations", desc: "View and manage table bookings.", icon: "📅", view: 'dashboard' },
                      { title: "Analytics", desc: "Track your restaurant's performance.", icon: "📈", view: 'dashboard' }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        onClick={() => item.view !== 'dashboard' && setAdminSubView(item.view as any)}
                        className="bg-white p-8 rounded-[32px] border border-[#e5e5e0] shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="text-4xl mb-4">{item.icon}</div>
                        <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-500">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : adminSubView === 'categories' ? (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setAdminSubView('dashboard')}
                      className="flex items-center gap-2 text-gray-400 hover:text-[#A65E3E] transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back to Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory({ name: '' });
                        setIsCategoryModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-[#A65E3E] text-white rounded-2xl font-bold hover:bg-[#8d4f34] transition-all shadow-lg shadow-[#A65E3E]/20"
                    >
                      <Plus className="w-5 h-5" />
                      Add Category
                    </button>
                  </div>

                  <div className="bg-white rounded-[32px] border border-[#e5e5e0] overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#f9f9f7] border-b border-[#e5e5e0]">
                        <tr>
                          <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-gray-400">Category Name</th>
                          <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-gray-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e5e0]">
                        {categories.map((cat) => (
                          <tr key={cat.id} className="hover:bg-[#f9f9f7] transition-colors">
                            <td className="px-6 py-4 font-bold text-[#1a1a1a]">{cat.name}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingCategory(cat);
                                    setIsCategoryModalOpen(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-[#A65E3E] transition-colors"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : adminSubView === 'subcategories' ? (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setAdminSubView('dashboard')}
                      className="flex items-center gap-2 text-gray-400 hover:text-[#A65E3E] transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back to Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setEditingSubcategory({ name: '', category_id: categories[0]?.id });
                        setIsSubcategoryModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-[#A65E3E] text-white rounded-2xl font-bold hover:bg-[#8d4f34] transition-all shadow-lg shadow-[#A65E3E]/20"
                    >
                      <Plus className="w-5 h-5" />
                      Add Subcategory
                    </button>
                  </div>

                  <div className="bg-white rounded-[32px] border border-[#e5e5e0] overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#f9f9f7] border-b border-[#e5e5e0]">
                        <tr>
                          <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-gray-400">Subcategory Name</th>
                          <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-gray-400">Parent Category</th>
                          <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-gray-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e5e0]">
                        {subcategories.map((sub) => (
                          <tr key={sub.id} className="hover:bg-[#f9f9f7] transition-colors">
                            <td className="px-6 py-4 font-bold text-[#1a1a1a]">{sub.name}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold uppercase tracking-tighter text-[#A65E3E] bg-[#A65E3E]/10 px-2 py-1 rounded-md">
                                {categories.find(c => c.id === sub.category_id)?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingSubcategory(sub);
                                    setIsSubcategoryModalOpen(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-[#A65E3E] transition-colors"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubcategory(sub.id)}
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setAdminSubView('dashboard')}
                      className="flex items-center gap-2 text-gray-400 hover:text-[#A65E3E] transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          setEditingItem({ name: '', description: '', price: 0, category: '', subcategory: '', subcategory_id: '', image_url: '' });
                          setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-[#A65E3E] text-white rounded-2xl font-bold hover:bg-[#8d4f34] transition-all shadow-lg shadow-[#A65E3E]/20"
                      >
                        <Plus className="w-5 h-5" />
                        Add New Item
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] border border-[#e5e5e0] overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#f9f9f7] border-b border-[#e5e5e0]">
                        <tr>
                          <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-gray-400">Item</th>
                          <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-gray-400">Category</th>
                          <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-gray-400">Price</th>
                          <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-gray-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e5e0]">
                        {menuItems.map((item) => (
                          <tr key={item.id} className="hover:bg-[#f9f9f7] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                  {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                      <ImageIcon className="w-6 h-6" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-[#1a1a1a]">{item.name}</div>
                                  <div className="text-xs text-gray-400 line-clamp-1">{item.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold uppercase tracking-tighter text-[#A65E3E] bg-[#A65E3E]/10 px-2 py-1 rounded-md">
                                {item.category}
                              </span>
                              <span className="ml-2 text-xs text-gray-400">{item.subcategory}</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-[#1a1a1a]">
                              {item.price.toLocaleString()} <span className="text-[10px] text-gray-400">IQD</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingItem(item);
                                    setIsModalOpen(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-[#A65E3E] transition-colors"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </main>

            {/* Category Modal */}
            <AnimatePresence>
              {isCategoryModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
                  >
                    <div className="p-8 border-b border-[#e5e5e0] flex items-center justify-between">
                      <h2 className="text-3xl font-bold text-[#A65E3E]">
                        {editingCategory?.id ? 'Edit Category' : 'New Category'}
                      </h2>
                      <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 text-gray-400 hover:text-[#1a1a1a]">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCategory} className="p-8 space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Category Name</label>
                        <input
                          type="text"
                          required
                          value={editingCategory?.name || ''}
                          onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:ring-2 focus:ring-[#A65E3E]/20 focus:border-[#A65E3E] outline-none transition-all"
                          placeholder="e.g. Drinks, Food, etc."
                        />
                      </div>

                      <div className="pt-4 flex gap-4">
                        <button
                          type="button"
                          onClick={() => setIsCategoryModalOpen(false)}
                          className="flex-1 py-4 bg-[#f9f9f7] text-gray-500 rounded-2xl font-bold hover:bg-[#f0f0ed] transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="flex-1 py-4 bg-[#A65E3E] text-white rounded-2xl font-bold hover:bg-[#8d4f34] transition-all shadow-lg shadow-[#A65E3E]/20 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                          {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Save Category
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Subcategory Modal */}
            <AnimatePresence>
              {isSubcategoryModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSubcategoryModalOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
                  >
                    <div className="p-8 border-b border-[#e5e5e0] flex items-center justify-between">
                      <h2 className="text-3xl font-bold text-[#A65E3E]">
                        {editingSubcategory?.id ? 'Edit Subcategory' : 'New Subcategory'}
                      </h2>
                      <button onClick={() => setIsSubcategoryModalOpen(false)} className="p-2 text-gray-400 hover:text-[#1a1a1a]">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveSubcategory} className="p-8 space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Parent Category</label>
                        <select
                          required
                          value={editingSubcategory?.category_id || ''}
                          onChange={(e) => setEditingSubcategory(prev => ({ ...prev, category_id: e.target.value }))}
                          className="w-full px-4 py-3 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:ring-2 focus:ring-[#A65E3E]/20 focus:border-[#A65E3E] outline-none transition-all"
                        >
                          <option value="" disabled>Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Subcategory Name</label>
                        <input
                          type="text"
                          required
                          value={editingSubcategory?.name || ''}
                          onChange={(e) => setEditingSubcategory(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:ring-2 focus:ring-[#A65E3E]/20 focus:border-[#A65E3E] outline-none transition-all"
                          placeholder="e.g. Hot Drinks, Pasta, etc."
                        />
                      </div>

                      <div className="pt-4 flex gap-4">
                        <button
                          type="button"
                          onClick={() => setIsSubcategoryModalOpen(false)}
                          className="flex-1 py-4 bg-[#f9f9f7] text-gray-500 rounded-2xl font-bold hover:bg-[#f0f0ed] transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="flex-1 py-4 bg-[#A65E3E] text-white rounded-2xl font-bold hover:bg-[#8d4f34] transition-all shadow-lg shadow-[#A65E3E]/20 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                          {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Save Subcategory
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
              {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsModalOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
                  >
                    <div className="p-8 border-b border-[#e5e5e0] flex items-center justify-between">
                      <h2 className="text-3xl font-bold text-[#A65E3E]">
                        {editingItem?.id ? 'Edit Item' : 'New Menu Item'}
                      </h2>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-[#1a1a1a]">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveItem} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Item Name</label>
                          <input
                            type="text"
                            required
                            value={editingItem?.name || ''}
                            onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:ring-2 focus:ring-[#A65E3E]/20 focus:border-[#A65E3E] outline-none transition-all"
                            placeholder="e.g. Spanish Latte"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Price (IQD)</label>
                          <input
                            type="number"
                            required
                            value={editingItem?.price || 0}
                            onChange={(e) => setEditingItem(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                            className="w-full px-4 py-3 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:ring-2 focus:ring-[#A65E3E]/20 focus:border-[#A65E3E] outline-none transition-all"
                            placeholder="7000"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Category</label>
                          <select
                            value={categories.find(c => c.name === editingItem?.category)?.id || ''}
                            onChange={(e) => {
                              const catId = e.target.value;
                              const cat = categories.find(c => c.id === catId);
                              const firstSub = cat?.subcategories[0];
                              setEditingItem(prev => ({ 
                                ...prev, 
                                category: cat?.name || '', 
                                subcategory: firstSub?.name || '',
                                subcategory_id: firstSub?.id || ''
                              }));
                            }}
                            className="w-full px-4 py-3 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:ring-2 focus:ring-[#A65E3E]/20 focus:border-[#A65E3E] outline-none transition-all"
                          >
                            <option value="" disabled>Select Category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Subcategory</label>
                          <select
                            value={editingItem?.subcategory_id || ''}
                            onChange={(e) => {
                              const subId = e.target.value;
                              const sub = subcategories.find(s => s.id === subId);
                              setEditingItem(prev => ({ 
                                ...prev, 
                                subcategory: sub?.name || '',
                                subcategory_id: subId 
                              }));
                            }}
                            className="w-full px-4 py-3 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:ring-2 focus:ring-[#A65E3E]/20 focus:border-[#A65E3E] outline-none transition-all"
                          >
                            <option value="" disabled>Select Subcategory</option>
                            {subcategories
                              .filter(sub => sub.category_id === categories.find(c => c.name === editingItem?.category)?.id)
                              .map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                              ))
                            }
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Description</label>
                        <textarea
                          value={editingItem?.description || ''}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-3 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:ring-2 focus:ring-[#A65E3E]/20 focus:border-[#A65E3E] outline-none transition-all h-24 resize-none"
                          placeholder="Describe your item..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Item Image</label>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={editingItem?.image_url || ''}
                              onChange={(e) => setEditingItem(prev => ({ ...prev, image_url: e.target.value }))}
                              className="w-full px-4 py-3 bg-[#f9f9f7] border border-[#e5e5e0] rounded-2xl focus:ring-2 focus:ring-[#A65E3E]/20 focus:border-[#A65E3E] outline-none transition-all"
                              placeholder="Image URL or Base64"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e: any) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (re) => {
                                        setEditingItem(prev => ({ ...prev, image_url: re.target?.result as string }));
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  };
                                  input.click();
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#e5e5e0] rounded-xl text-xs font-bold hover:bg-[#f9f9f7] transition-all"
                              >
                                <ImageIcon className="w-4 h-4" />
                                Upload
                              </button>
                              <button
                                type="button"
                                onClick={generateImage}
                                disabled={isGenerating}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#A65E3E]/10 text-[#A65E3E] rounded-xl text-xs font-bold hover:bg-[#A65E3E]/20 transition-all disabled:opacity-50"
                              >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                Generate AI
                              </button>
                            </div>
                          </div>
                          <div className="w-full md:w-48 h-48 bg-[#f9f9f7] border border-[#e5e5e0] rounded-[32px] overflow-hidden relative group">
                            {editingItem?.image_url ? (
                              <>
                                <img src={editingItem.image_url} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <img 
                                    src="https://i.ibb.co/84TCyPNf/logo.png" 
                                    alt="Logo Overlay" 
                                    className="w-12 h-12 object-contain opacity-80"
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                                <ImageIcon className="w-8 h-8" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Preview</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex gap-4">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="flex-1 py-4 bg-[#f9f9f7] text-gray-500 rounded-2xl font-bold hover:bg-[#f0f0ed] transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="flex-1 py-4 bg-[#A65E3E] text-white rounded-2xl font-bold hover:bg-[#8d4f34] transition-all shadow-lg shadow-[#A65E3E]/20 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                          {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Save Item
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col"
          >
            <header className="py-12 flex flex-col items-center bg-white border-b border-[#e5e5e0] sticky top-0 z-50">
              <img
                src="https://i.ibb.co/84TCyPNf/logo.png"
                alt="Lamonte Logo"
                className="h-20 mb-6"
                referrerPolicy="no-referrer"
              />
              
              <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar w-full max-w-md justify-center">
                {[
                  { id: 'Drinks', icon: '☕' },
                  { id: 'SHISHA', icon: '💨' },
                  { id: 'FOOD', icon: '🍰' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      const element = document.getElementById(`category-${cat.id}`);
                      if (element) {
                        const offset = 180; // Header height
                        const bodyRect = document.body.getBoundingClientRect().top;
                        const elementRect = element.getBoundingClientRect().top;
                        const elementPosition = elementRect - bodyRect;
                        const offsetPosition = elementPosition - offset;

                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className="flex flex-col items-center gap-1 px-6 py-3 rounded-2xl bg-[#f9f9f7] text-gray-400 hover:bg-[#f0f0ed] hover:text-[#A65E3E] transition-all min-w-[90px]"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold">{cat.id}</span>
                  </button>
                ))}
              </div>
            </header>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
              {menuLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="w-12 h-12 text-[#A65E3E] animate-spin" />
                  <p className="text-gray-400 font-medium animate-pulse">Loading menu...</p>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
                  <div className="w-24 h-24 bg-[#f9f9f7] rounded-full flex items-center justify-center text-4xl">🍽️</div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-[#1a1a1a]">No Menu Items Yet</h3>
                    <p className="text-gray-400 max-w-xs">Our kitchen is preparing something special. Please check back later!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-24">
                  {displayCategories.map(categoryName => {
                    // Find the actual key in groupedMenu (case-insensitive)
                    const actualKey = allCategories.find(k => k.toLowerCase() === categoryName.toLowerCase()) || categoryName;
                    const subcategories = groupedMenu[actualKey];
                    if (!subcategories) return null;
                    
                    return (
                      <div key={actualKey} id={`category-${actualKey}`} className="space-y-8 scroll-mt-48">
                        <div className="flex flex-col items-center gap-6">
                          <div className="flex items-center gap-4 w-full">
                            <div className="h-px flex-1 bg-[#e5e5e0]"></div>
                            <h2 className="text-3xl font-bold text-[#A65E3E] uppercase tracking-[0.2em]">
                              {actualKey}
                            </h2>
                            <div className="h-px flex-1 bg-[#e5e5e0]"></div>
                          </div>
                          
                          {/* Subcategory Quick Links */}
                          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full pb-2">
                            {Object.keys(subcategories).map(sub => (
                              <button
                                key={sub}
                                onClick={() => {
                                  const element = document.getElementById(`subcategory-${actualKey}-${sub}`);
                                  if (element) {
                                    const offset = 220; // Header + Subnav height
                                    const bodyRect = document.body.getBoundingClientRect().top;
                                    const elementRect = element.getBoundingClientRect().top;
                                    const elementPosition = elementRect - bodyRect;
                                    const offsetPosition = elementPosition - offset;
                                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                                  }
                                }}
                                className="px-4 py-2 rounded-full bg-white border border-[#e5e5e0] text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap hover:border-[#A65E3E] hover:text-[#A65E3E] transition-all"
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-8">
                          {Object.entries(subcategories).map(([subcategory, items]) => (
                            <div key={subcategory} id={`subcategory-${actualKey}-${subcategory}`} className="space-y-4 scroll-mt-60">
                              <button 
                                onClick={() => toggleCategory(`${actualKey}-${subcategory}`)}
                                className="flex items-center justify-between w-full p-4 bg-white rounded-2xl border border-[#e5e5e0] text-xl font-semibold text-[#1a1a1a] hover:border-[#A65E3E] transition-all"
                              >
                                <span className="flex items-center gap-3">
                                  <span className="w-1.5 h-6 bg-[#A65E3E] rounded-full"></span>
                                  {subcategory}
                                </span>
                                {expandedCategories[`${actualKey}-${subcategory}`] ? <ChevronDown className="text-[#A65E3E]" /> : <ChevronRight className="text-gray-300" />}
                              </button>
                              
                              <AnimatePresence>
                                {expandedCategories[`${actualKey}-${subcategory}`] && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                                      {(items as MenuItem[]).map((item) => (
                                        <motion.div
                                          key={item.id}
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className="bg-white p-5 rounded-2xl border border-[#e5e5e0] shadow-sm flex justify-between items-center group hover:border-[#A65E3E]/30 transition-all"
                                        >
                                          <div className="flex-1">
                                            <h3 className="text-lg font-bold text-[#1a1a1a] group-hover:text-[#A65E3E] transition-colors">
                                              {item.name}
                                            </h3>
                                            {item.description && (
                                              <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                                            )}
                                          </div>
                                          <div className="ml-4 text-right">
                                            <div className="text-[#A65E3E] font-bold text-lg">
                                              {item.price.toLocaleString()}
                                            </div>
                                            <div className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">IQD</div>
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>

            <footer className="mt-24 pb-12 flex flex-col items-center border-t border-[#e5e5e0] pt-12">
              <p className="text-gray-400 text-sm mb-8">© 2026 Lamonte Restaurant & Cafe. All rights reserved.</p>
              <button
                onClick={() => setView('auth')}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-[#e5e5e0] rounded-full text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-[#A65E3E] hover:border-[#A65E3E] transition-all"
              >
                <Lock className="w-4 h-4" />
                Admin Panel
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
