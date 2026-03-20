/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./lib/supabase";
import { 
  LogIn, 
  UserPlus, 
  LogOut, 
  Mail, 
  Lock, 
  Loader2, 
  User, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  Sparkles, 
  X, 
  Save, 
  ArrowLeft, 
  RefreshCw, 
  Upload, 
  AlertCircle,
  Coffee,
  Layers,
  Grid,
  BarChart3,
  ShoppingBag
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  subcategory_id?: string;
  image_url: string;
  extras?: { name: string; price: number }[];
}

interface CartItem {
  id: string;
  menuItem: MenuItem;
  selectedExtras: { name: string; price: number }[];
  totalPrice: number;
  quantity: number;
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
  const [selectedCategory, setSelectedCategory] = useState<string>('DRINKS');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [adminSubView, setAdminSubView] = useState<'dashboard' | 'menu' | 'categories' | 'subcategories'>('dashboard');
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Partial<Subcategory> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const addToCart = () => {
    if (!selectedItem) return;

    const extras = selectedItem.extras 
      ? Array.from(selectedExtras).map(idx => selectedItem.extras![idx])
      : [];
    
    const totalPrice = selectedItem.price + extras.reduce((acc, e) => acc + e.price, 0);

    const newCartItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      menuItem: selectedItem,
      selectedExtras: extras,
      totalPrice,
      quantity: 1
    };

    setCart(prev => [...prev, newCartItem]);
    setSelectedItem(null);
    setSelectedExtras(new Set());
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.totalPrice * item.quantity), 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;
    
    setIsSubmittingOrder(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          id: item.menuItem.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          selectedExtras: item.selectedExtras,
          totalPrice: item.totalPrice
        })),
        total_price: cartTotal,
        user_id: session?.user?.id || null,
        status: 'pending'
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) throw error;

      setOrderConfirmed(true);
      setCart([]);
      setTimeout(() => {
        setOrderConfirmed(false);
        setIsCartOpen(false);
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setShowHeader(false);
        } else {
          setShowHeader(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

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
    fetchCategories();
    fetchMedia();

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const fetchMenu = async () => {
    setMenuLoading(true);
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          subcategories (
            id,
            name,
            categories (
              id,
              name,
              menus (
                id,
                name
              )
            )
          )
        `)
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

  const fetchMedia = async () => {
    setMediaLoading(true);
    setMediaError(null);
    try {
      console.log('Fetching media from server API');
      const response = await fetch('/api/media');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch media');
      }
      
      const data = await response.json();
      console.log('Media fetched successfully, count:', data?.length);
      setMediaFiles(data);
    } catch (error: any) {
      console.error('Error fetching media:', error.message);
      setMediaError(error.message);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target?.files?.[0] || e.files?.[0];
    if (!file) {
      console.log('No file selected');
      return null;
    }

    console.log('Starting upload for:', file.name, 'Size:', file.size);
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Max size is 5MB.');
      return null;
    }
    setMediaLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log('Uploading to server API');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const { url } = await response.json();
      console.log('Upload successful, URL:', url);
      await fetchMedia();
      return url;
    } catch (error: any) {
      console.error('Upload catch error:', error);
      alert('Upload failed: ' + error.message);
      return null;
    } finally {
      setMediaLoading(false);
    }
  };

  const getPublicUrl = (name: string) => {
    const { data } = supabase.storage.from('uploads').getPublicUrl(`${name}`);
    return data.publicUrl;
  };

  const handleDeleteMedia = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this image?')) return;

    setMediaLoading(true);
    try {
      const response = await fetch(`/api/media/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      fetchMedia();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setMediaLoading(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const groupedMenu = menuItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    const subcategory = item.subcategory || 'General';
    
    // Filter for public view
    if (view === 'menu' && !item.is_available) return acc;

    if (!acc[category]) acc[category] = {};
    if (!acc[category][subcategory]) acc[category][subcategory] = [];
    acc[category][subcategory].push(item);
    return acc;
  }, {} as Record<string, Record<string, MenuItem[]>>);

  const mainCategories = ['DRINKS', 'SHISHA', 'FOOD'];
  
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
      // Get the Main Menu ID first
      const { data: menuData } = await supabase.from('menus').select('id').eq('name', 'Main Menu').single();
      const menuId = menuData?.id;

      if (!menuId) throw new Error("Main Menu not found. Please refresh the page.");

      if (editingCategory.id) {
        const { error } = await supabase
          .from('categories')
          .update({ name: editingCategory.name, menu_id: menuId })
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ name: editingCategory.name, menu_id: menuId }]);
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
        is_available: true,
        extras: editingItem.extras || []
      };

      if (editingItem.id) {
        const { error } = await supabase
          .from('items')
          .update(itemToSave)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('items')
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
        .from('items')
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
        const base64Image = `data:image/png;base64,${imagePart.inlineData.data}`;
        
        // Upload to server
        const uploadRes = await fetch('/api/upload-base64', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image, name: editingItem.name })
        });

        if (!uploadRes.ok) throw new Error('Failed to upload generated image');
        const { url } = await uploadRes.json();
        setEditingItem(prev => ({ ...prev, image_url: url }));
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
      <div className="min-h-screen bg-bg flex items-center justify-center overflow-hidden">
        <motion.div
          key="intro"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <img
            src="https://i.ibb.co/84TCyPNf/logo.png"
            alt="Lamonte Logo"
            className="max-w-[60vw] md:max-w-[400px] h-auto transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 h-px w-12 bg-primary/30"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink font-sans">
      <AnimatePresence mode="wait">
        {view === 'auth' ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4 bg-bg"
          >
            <div className="w-full max-w-md space-y-12">
              <div className="text-center space-y-6">
                <img
                  src="https://i.ibb.co/84TCyPNf/logo.png"
                  alt="Lamonte Logo"
                  className="h-12 mx-auto"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-2">
                  <h2 className="text-4xl font-display text-ink italic">
                    Admin Access
                  </h2>
                  <p className="text-sm text-gray-400 tracking-widest uppercase font-light">
                    Management Portal
                  </p>
                </div>
              </div>

              <form onSubmit={handleAuth} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 ml-1">
                      Identity
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-0 py-4 bg-transparent border-b border-line focus:outline-none focus:border-primary transition-all text-lg font-light"
                      placeholder="Email Address"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 ml-1">
                      Security
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-0 py-4 bg-transparent border-b border-line focus:outline-none focus:border-primary transition-all text-lg font-light"
                      placeholder="Password"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="text-red-500 text-xs text-center italic">
                    {authError}
                  </div>
                )}

                <div className="space-y-4 pt-4">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-4 bg-ink text-white hover:bg-primary transition-all duration-500 text-sm uppercase tracking-[0.3em] font-bold disabled:opacity-50"
                  >
                    {authLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Enter'}
                  </button>
                  
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-line"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                      <span className="bg-bg px-4 text-gray-400 font-bold">Or</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    type="button"
                    className="w-full py-4 bg-white border border-line hover:bg-bg text-ink text-[10px] uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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

                  <button
                    type="button"
                    onClick={() => setView('menu')}
                    className="w-full py-4 text-gray-400 hover:text-ink transition-all text-[10px] uppercase tracking-[0.3em] font-bold"
                  >
                    Return to Menu
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : view === 'admin' && session ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col"
          >
            <motion.nav 
              animate={{ y: showHeader ? 0 : -100 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white border-b border-line px-8 py-6 flex items-center justify-between sticky top-0 z-50"
            >
              <div className="flex items-center gap-8">
                <img
                  src="https://i.ibb.co/84TCyPNf/logo.png"
                  alt="Lamonte Logo"
                  className="h-8"
                  referrerPolicy="no-referrer"
                />
                <div className="h-4 w-px bg-line hidden md:block" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary hidden md:block">
                  Studio
                </span>
              </div>
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setView('menu')}
                  className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-ink transition-colors"
                >
                  Public View
                </button>
                <div className="h-4 w-px bg-line" />
                <button
                  onClick={handleSignOut}
                  className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.nav>

            <main className="flex-1 p-8 md:p-16 max-w-7xl mx-auto w-full">
              {adminSubView === 'dashboard' ? (
                <div className="space-y-24">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                      <h1 className="text-6xl font-display text-ink italic leading-tight">
                        Dashboard
                      </h1>
                      <p className="text-gray-400 font-light tracking-wide max-w-md">
                        Refining the Lamonte experience through intentional management.
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        fetchMenu();
                        fetchCategories();
                      }}
                      className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 hover:text-primary transition-all"
                    >
                      <RefreshCw className={`w-4 h-4 ${menuLoading ? 'animate-spin' : ''}`} />
                      Sync Data
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line overflow-hidden rounded-sm">
                    {[
                      { title: "Menu Items", desc: "Curate your offerings.", icon: <Coffee className="w-5 h-5" />, view: 'menu' },
                      { title: "Categories", desc: "Define the structure.", icon: <Layers className="w-5 h-5" />, view: 'categories' },
                      { title: "Subcategories", desc: "Nested organization.", icon: <Grid className="w-5 h-5" />, view: 'subcategories' },
                      { title: "Media Library", desc: "Visual assets.", icon: <ImageIcon className="w-5 h-5" />, action: () => setIsMediaLibraryOpen(true) },
                      { title: "Analytics", desc: "Performance insights.", icon: <BarChart3 className="w-5 h-5" />, view: 'dashboard' }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ backgroundColor: "var(--color-bg)" }}
                        onClick={() => {
                          if ('action' in item) {
                            item.action();
                          } else if (item.view !== 'dashboard') {
                            setAdminSubView(item.view as any);
                          }
                        }}
                        className="bg-white p-12 space-y-6 cursor-pointer transition-colors group"
                      >
                        <div className="text-gray-300 group-hover:text-primary transition-colors">
                          {item.icon}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-display italic text-ink">{item.title}</h3>
                          <p className="text-xs text-gray-400 font-light tracking-wide">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : adminSubView === 'categories' ? (
                <div className="space-y-12">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setAdminSubView('dashboard')}
                      className="flex items-center gap-3 text-gray-400 hover:text-ink transition-colors group"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Return</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory({ name: '' });
                        setIsCategoryModalOpen(true);
                      }}
                      className="px-8 py-4 bg-ink text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary transition-all flex items-center gap-3"
                    >
                      <Plus className="w-4 h-4" />
                      New Collection
                    </button>
                  </div>

                  <div className="bg-white border border-line overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-bg/50 border-b border-line">
                        <tr>
                          <th className="px-8 py-6 text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Collection Nomenclature</th>
                          <th className="px-8 py-6 text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {categories.map((cat) => (
                          <tr key={cat.id} className="hover:bg-bg/30 transition-colors group">
                            <td className="px-8 py-6 font-display italic text-xl text-ink">{cat.name}</td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-6">
                                <button
                                  onClick={() => {
                                    setEditingCategory(cat);
                                    setIsCategoryModalOpen(true);
                                  }}
                                  className="text-gray-300 hover:text-primary transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="text-gray-300 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
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
                <div className="space-y-12">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setAdminSubView('dashboard')}
                      className="flex items-center gap-3 text-gray-400 hover:text-ink transition-colors group"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Return</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingSubcategory({ name: '', category_id: categories[0]?.id });
                        setIsSubcategoryModalOpen(true);
                      }}
                      className="px-8 py-4 bg-ink text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary transition-all flex items-center gap-3"
                    >
                      <Plus className="w-4 h-4" />
                      New Classification
                    </button>
                  </div>

                  <div className="bg-white border border-line overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-bg/50 border-b border-line">
                        <tr>
                          <th className="px-8 py-6 text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Classification</th>
                          <th className="px-8 py-6 text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Parent Collection</th>
                          <th className="px-8 py-6 text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {subcategories.map((sub) => (
                          <tr key={sub.id} className="hover:bg-bg/30 transition-colors group">
                            <td className="px-8 py-6 font-display italic text-xl text-ink">{sub.name}</td>
                            <td className="px-8 py-6">
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                                {categories.find(c => c.id === sub.category_id)?.name}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-6">
                                <button
                                  onClick={() => {
                                    setEditingSubcategory(sub);
                                    setIsSubcategoryModalOpen(true);
                                  }}
                                  className="text-gray-300 hover:text-primary transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubcategory(sub.id)}
                                  className="text-gray-300 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
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
                <div className="space-y-12">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setAdminSubView('dashboard')}
                      className="flex items-center gap-3 text-gray-400 hover:text-ink transition-colors group"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Return</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem({ name: '', description: '', price: 0, category: '', subcategory: '', subcategory_id: '', image_url: '' });
                        setIsModalOpen(true);
                      }}
                      className="px-8 py-4 bg-ink text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary transition-all flex items-center gap-3"
                    >
                      <Plus className="w-4 h-4" />
                      New Creation
                    </button>
                  </div>

                  <div className="bg-white border border-line overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-bg/50 border-b border-line">
                        <tr>
                          <th className="px-8 py-6 text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Item</th>
                          <th className="px-8 py-6 text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Collection</th>
                          <th className="px-8 py-6 text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Valuation</th>
                          <th className="px-8 py-6 text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {menuItems.map((item) => (
                          <tr key={item.id} className="hover:bg-bg/30 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-bg border border-line rounded-xl overflow-hidden flex-shrink-0">
                                  {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                                      <ImageIcon className="w-6 h-6" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-display italic text-xl text-ink">{item.name}</div>
                                  <div className="text-[10px] text-gray-400 uppercase tracking-widest line-clamp-1 mt-1">{item.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                                  {item.category}
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest">{item.subcategory}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 font-display italic text-lg text-ink">
                              {item.price.toLocaleString()} <span className="text-[10px] text-gray-400 uppercase tracking-widest not-italic ml-1">IQD</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-6">
                                <button
                                  onClick={() => {
                                    setEditingItem(item);
                                    setIsModalOpen(true);
                                  }}
                                  className="text-gray-300 hover:text-primary transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-gray-300 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
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
                    <div className="p-12 border-b border-line flex items-center justify-between bg-bg">
                      <h2 className="text-4xl font-display italic text-ink lowercase">
                        {editingCategory?.id ? 'Refine Collection' : 'New Collection'}
                      </h2>
                      <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 text-gray-400 hover:text-ink transition-colors">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCategory} className="p-12 space-y-12 bg-bg">
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 ml-1">Collection Nomenclature</label>
                        <input
                          type="text"
                          required
                          value={editingCategory?.name || ''}
                          onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-0 py-3 bg-transparent border-b border-line focus:border-primary outline-none transition-all font-display italic text-xl text-ink placeholder:text-gray-200"
                          placeholder="e.g. Drinks, Food, etc."
                        />
                      </div>

                      <div className="pt-8 flex gap-6">
                        <button
                          type="button"
                          onClick={() => setIsCategoryModalOpen(false)}
                          className="flex-1 py-5 border border-line text-ink text-[10px] uppercase tracking-[0.4em] font-bold hover:border-primary hover:text-primary transition-all"
                        >
                          Discard
                        </button>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="flex-1 py-5 bg-ink text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                          {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Commit
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
                    <div className="p-12 border-b border-line flex items-center justify-between bg-bg">
                      <h2 className="text-4xl font-display italic text-ink lowercase">
                        {editingSubcategory?.id ? 'Refine Classification' : 'New Classification'}
                      </h2>
                      <button onClick={() => setIsSubcategoryModalOpen(false)} className="p-2 text-gray-400 hover:text-ink transition-colors">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveSubcategory} className="p-12 space-y-12 bg-bg">
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 ml-1">Parent Collection</label>
                        <select
                          required
                          value={editingSubcategory?.category_id || ''}
                          onChange={(e) => setEditingSubcategory(prev => ({ ...prev, category_id: e.target.value }))}
                          className="w-full px-0 py-3 bg-transparent border-b border-line focus:border-primary outline-none transition-all font-display italic text-xl text-ink appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select Collection</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 ml-1">Classification Nomenclature</label>
                        <input
                          type="text"
                          required
                          value={editingSubcategory?.name || ''}
                          onChange={(e) => setEditingSubcategory(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-0 py-3 bg-transparent border-b border-line focus:border-primary outline-none transition-all font-display italic text-xl text-ink placeholder:text-gray-200"
                          placeholder="e.g. Hot Drinks, Pasta, etc."
                        />
                      </div>

                      <div className="pt-8 flex gap-6">
                        <button
                          type="button"
                          onClick={() => setIsSubcategoryModalOpen(false)}
                          className="flex-1 py-5 border border-line text-ink text-[10px] uppercase tracking-[0.4em] font-bold hover:border-primary hover:text-primary transition-all"
                        >
                          Discard
                        </button>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="flex-1 py-5 bg-ink text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                          {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Commit
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Media Library Modal */}
            <AnimatePresence>
              {isMediaLibraryOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMediaLibraryOpen(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                  >
                    <div className="p-12 border-b border-line flex items-center justify-between bg-bg/50 backdrop-blur-sm">
                      <div>
                        <h2 className="text-4xl font-display italic text-ink lowercase">Media Library</h2>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-2">Curate your visual selection</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <label className="cursor-pointer px-8 py-4 bg-ink text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary transition-all flex items-center gap-3">
                          <Upload className="w-4 h-4" />
                          Upload
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                        <button onClick={() => setIsMediaLibraryOpen(false)} className="p-2 text-gray-400 hover:text-ink transition-colors">
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-bg">
                      {mediaLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-300 gap-6">
                          <div className="w-12 h-px bg-line animate-pulse" />
                          <p className="text-[10px] uppercase tracking-[0.4em] font-bold">Scanning Archives</p>
                        </div>
                      ) : mediaError ? (
                        <div className="h-64 flex flex-col items-center justify-center text-red-400 gap-6">
                          <AlertCircle className="w-12 h-12 opacity-50" />
                          <p className="text-[10px] uppercase tracking-[0.4em] font-bold">{mediaError}</p>
                          <button 
                            onClick={fetchMedia}
                            className="px-8 py-4 bg-ink text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary transition-all"
                          >
                            Retry
                          </button>
                        </div>
                      ) : mediaFiles.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-300 gap-6">
                          <ImageIcon className="w-16 h-16 opacity-20" />
                          <p className="text-[10px] uppercase tracking-[0.4em] font-bold">No visuals found</p>
                          <button 
                            onClick={fetchMedia}
                            className="px-8 py-4 border border-line text-ink text-[10px] uppercase tracking-[0.4em] font-bold hover:border-primary hover:text-primary transition-all"
                          >
                            Refresh
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {mediaFiles.map((file, i) => {
                            const url = getPublicUrl(file.name);
                            return (
                              <motion.div
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => {
                                  if (editingItem) {
                                    setEditingItem(prev => ({ ...prev, image_url: url }));
                                  }
                                  setIsMediaLibraryOpen(false);
                                }}
                                className="aspect-square bg-white border border-line rounded-xl overflow-hidden cursor-pointer group relative"
                              >
                                <img src={url} alt={file.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                  <span className="text-white text-[10px] uppercase tracking-[0.4em] font-bold">Select</span>
                                  <button
                                    onClick={(e) => handleDeleteMedia(file.name, e)}
                                    className="p-3 bg-white/10 hover:bg-red-500/80 rounded-full text-white transition-all backdrop-blur-sm"
                                    title="Delete Image"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
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
                    <div className="p-12 border-b border-line flex items-center justify-between bg-bg">
                      <h2 className="text-4xl font-display italic text-ink lowercase">
                        {editingItem?.id ? 'Refine Item' : 'New Creation'}
                      </h2>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-ink transition-colors">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveItem} className="p-12 space-y-12 max-h-[70vh] overflow-y-auto custom-scrollbar bg-bg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 ml-1">Nomenclature</label>
                          <input
                            type="text"
                            required
                            value={editingItem?.name || ''}
                            onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-0 py-3 bg-transparent border-b border-line focus:border-primary outline-none transition-all font-display italic text-xl text-ink placeholder:text-gray-200"
                            placeholder="e.g. Spanish Latte"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 ml-1">Valuation (IQD)</label>
                          <input
                            type="number"
                            required
                            value={editingItem?.price || 0}
                            onChange={(e) => setEditingItem(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                            className="w-full px-0 py-3 bg-transparent border-b border-line focus:border-primary outline-none transition-all font-display italic text-xl text-ink placeholder:text-gray-200"
                            placeholder="7000"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 ml-1">Collection</label>
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
                            className="w-full px-0 py-3 bg-transparent border-b border-line focus:border-primary outline-none transition-all font-display italic text-xl text-ink appearance-none cursor-pointer"
                          >
                            <option value="" disabled>Select Collection</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 ml-1">Classification</label>
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
                            className="w-full px-0 py-3 bg-transparent border-b border-line focus:border-primary outline-none transition-all font-display italic text-xl text-ink appearance-none cursor-pointer"
                          >
                            <option value="" disabled>Select Classification</option>
                            {subcategories
                              .filter(sub => sub.category_id === categories.find(c => c.name === editingItem?.category)?.id)
                              .map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                              ))
                            }
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 ml-1">Narrative</label>
                        <textarea
                          value={editingItem?.description || ''}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-0 py-3 bg-transparent border-b border-line focus:border-primary outline-none transition-all font-display italic text-xl text-ink h-24 resize-none placeholder:text-gray-200"
                          placeholder="Describe the essence..."
                        />
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 ml-1">Extras / Add-ons</label>
                          <button
                            type="button"
                            onClick={() => {
                              const currentExtras = editingItem?.extras || [];
                              setEditingItem(prev => ({
                                ...prev,
                                extras: [...currentExtras, { name: '', price: 0 }]
                              }));
                            }}
                            className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary hover:text-ink transition-colors flex items-center gap-2"
                          >
                            <Plus className="w-3 h-3" />
                            Add Extra
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {(editingItem?.extras || []).map((extra, index) => (
                            <div key={index} className="flex items-end gap-4 group">
                              <div className="flex-1 space-y-2">
                                <input
                                  type="text"
                                  value={extra.name}
                                  onChange={(e) => {
                                    const newExtras = [...(editingItem?.extras || [])];
                                    newExtras[index].name = e.target.value;
                                    setEditingItem(prev => ({ ...prev, extras: newExtras }));
                                  }}
                                  className="w-full px-0 py-2 bg-transparent border-b border-line focus:border-primary outline-none transition-all font-display italic text-lg text-ink placeholder:text-gray-200"
                                  placeholder="Extra name (e.g. Caramel syrup)"
                                />
                              </div>
                              <div className="w-32 space-y-2">
                                <input
                                  type="number"
                                  value={extra.price}
                                  onChange={(e) => {
                                    const newExtras = [...(editingItem?.extras || [])];
                                    newExtras[index].price = parseInt(e.target.value) || 0;
                                    setEditingItem(prev => ({ ...prev, extras: newExtras }));
                                  }}
                                  className="w-full px-0 py-2 bg-transparent border-b border-line focus:border-primary outline-none transition-all font-display italic text-lg text-ink placeholder:text-gray-200"
                                  placeholder="Price"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newExtras = (editingItem?.extras || []).filter((_, i) => i !== index);
                                  setEditingItem(prev => ({ ...prev, extras: newExtras }));
                                }}
                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {(editingItem?.extras || []).length === 0 && (
                            <p className="text-[10px] text-gray-300 italic tracking-widest">No extras defined for this item.</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-8">
                        <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 ml-1">Visual Representation</label>
                        <div className="flex flex-col md:flex-row gap-12">
                          <div className="flex-1 space-y-8">
                            <div className="flex gap-4">
                              <input
                                type="text"
                                value={editingItem?.image_url || ''}
                                onChange={(e) => setEditingItem(prev => ({ ...prev, image_url: e.target.value }))}
                                className="flex-1 px-0 py-3 bg-transparent border-b border-line focus:border-primary outline-none transition-all font-display italic text-lg text-ink placeholder:text-gray-200"
                                placeholder="Visual URL"
                              />
                              <button
                                type="button"
                                onClick={() => setIsMediaLibraryOpen(true)}
                                className="px-6 py-3 border border-line text-ink text-[10px] uppercase tracking-[0.4em] font-bold hover:border-primary hover:text-primary transition-all flex items-center gap-3"
                              >
                                <ImageIcon className="w-4 h-4" />
                                Library
                              </button>
                            </div>
                            <div className="flex gap-4">
                              <label className="flex-1 flex items-center justify-center gap-3 px-6 py-4 border border-line text-ink text-[10px] uppercase tracking-[0.4em] font-bold hover:border-primary hover:text-primary transition-all cursor-pointer disabled:opacity-50">
                                {mediaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {mediaLoading ? 'Uploading' : 'Upload'}
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  disabled={mediaLoading}
                                  onChange={async (e) => {
                                    const url = await handleFileUpload(e);
                                    if (url && editingItem) {
                                      setEditingItem(prev => ({ ...prev, image_url: url }));
                                    }
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={generateImage}
                                disabled={isGenerating}
                                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-ink text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary transition-all disabled:opacity-50"
                              >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                AI Vision
                              </button>
                            </div>
                          </div>
                          <div className="w-full md:w-48 h-48 bg-white border border-line rounded-2xl overflow-hidden relative group">
                            {editingItem?.image_url ? (
                              <>
                                <img src={editingItem.image_url} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <img 
                                    src="https://i.ibb.co/84TCyPNf/logo.png" 
                                    alt="Logo Overlay" 
                                    className="w-12 h-12 object-contain opacity-50"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-200 gap-4">
                                <ImageIcon className="w-12 h-12" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Visual</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 flex gap-6">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="flex-1 py-5 border border-line text-ink text-[10px] uppercase tracking-[0.4em] font-bold hover:border-primary hover:text-primary transition-all"
                        >
                          Discard
                        </button>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="flex-1 py-5 bg-ink text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                          {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Commit Changes
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
            className="min-h-screen flex flex-col bg-bg"
          >
            <motion.header 
              animate={{ y: showHeader ? 0 : -200 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="py-6 flex flex-col items-center bg-white/80 backdrop-blur-md border-b border-line sticky top-0 z-50"
            >
              <div className="w-full flex items-center justify-between px-8 md:px-12 mb-8">
                <div className="w-10 flex items-center">
                  {!session && (
                    <button 
                      onClick={() => setView('auth')}
                      className="p-2 text-gray-300 hover:text-ink transition-colors"
                      title="Admin Access"
                    >
                      <User className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <img
                    src="https://i.ibb.co/84TCyPNf/logo.png"
                    alt="Lamonte Logo"
                    className="h-10 md:h-12 transition-all duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[8px] uppercase tracking-[0.6em] font-bold text-gray-400 ml-2">Lounge & Restaurant</span>
                </div>
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-3 text-ink hover:text-primary transition-all duration-500 group bg-bg rounded-full border border-line hover:border-primary/20"
                >
                  <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
                  <AnimatePresence>
                    {cart.length > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                      >
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
              
              <div className="flex gap-10 px-8 overflow-x-auto no-scrollbar w-full max-w-3xl justify-center">
                {[
                  { id: 'DRINKS', label: 'Beverages' },
                  { id: 'SHISHA', label: 'Shisha' },
                  { id: 'FOOD', label: 'Cuisine' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      const element = document.getElementById(`category-${cat.id}`);
                      if (element) {
                        const offset = 200;
                        const bodyRect = document.body.getBoundingClientRect().top;
                        const elementRect = element.getBoundingClientRect().top;
                        const elementPosition = elementRect - bodyRect;
                        const offsetPosition = elementPosition - offset;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                      }
                    }}
                    className="group flex flex-col items-center gap-3 transition-all"
                  >
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 group-hover:text-primary transition-colors">
                      {cat.label}
                    </span>
                    <div className="h-px w-0 group-hover:w-full bg-primary transition-all duration-500" />
                  </button>
                ))}
              </div>
            </motion.header>

            <main className="flex-1 p-8 md:p-16 max-w-7xl mx-auto w-full">
              {menuLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                  <div className="w-12 h-px bg-line animate-pulse" />
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300 font-bold">Refining Menu</p>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-8 text-center">
                  <h3 className="text-4xl font-display italic text-ink">Coming Soon</h3>
                  <p className="text-gray-400 font-light tracking-wide max-w-xs">Our artisans are curating the perfect selection for you.</p>
                </div>
              ) : (
                <div className="space-y-40">
                  {displayCategories.map(categoryName => {
                    const actualKey = allCategories.find(k => k.toLowerCase() === categoryName.toLowerCase()) || categoryName;
                    const subcategories = groupedMenu[actualKey];
                    if (!subcategories) return null;
                    
                    return (
                      <div key={actualKey} id={`category-${actualKey}`} className="space-y-16 scroll-mt-48">
                        <div className="flex flex-col items-center gap-8">
                          <div className="flex items-center gap-4 w-full">
                            <div className="h-px flex-1 bg-line opacity-30"></div>
                            <h2 className="text-lg font-display italic text-ink lowercase tracking-tight px-5 py-1.5 border border-line rounded-xl bg-white shadow-sm">
                              {actualKey}
                            </h2>
                            <div className="h-px flex-1 bg-line opacity-30"></div>
                          </div>
                          
                          <div className="flex gap-3 overflow-x-auto no-scrollbar w-full justify-center pb-2">
                            {Object.keys(subcategories).map(sub => (
                              <button
                                key={sub}
                                onClick={() => {
                                  const element = document.getElementById(`subcategory-${actualKey}-${sub}`);
                                  if (element) {
                                    const offset = 200;
                                    const bodyRect = document.body.getBoundingClientRect().top;
                                    const elementRect = element.getBoundingClientRect().top;
                                    const elementPosition = elementRect - bodyRect;
                                    const offsetPosition = elementPosition - offset;
                                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                                  }
                                }}
                                className="px-3 py-1 text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-ink border border-line rounded-lg hover:bg-white hover:shadow-sm transition-all whitespace-nowrap"
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-24">
                          {Object.entries(subcategories).map(([subcategory, items]) => (
                            <div key={subcategory} id={`subcategory-${actualKey}-${subcategory}`} className="space-y-12 scroll-mt-60">
                              <div className="flex items-center gap-6">
                                <h3 className="text-2xl font-display italic text-ink">{subcategory}</h3>
                                <div className="h-px flex-1 bg-line opacity-50" />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                                {(items as MenuItem[]).map((item) => (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setSelectedExtras(new Set());
                                    }}
                                    className="group cursor-pointer flex items-center gap-6"
                                  >
                                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden bg-white border border-line rounded-2xl relative">
                                      {item.image_url ? (
                                        <img 
                                          src={item.image_url} 
                                          alt={item.name} 
                                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                          referrerPolicy="no-referrer"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-100">
                                          <ImageIcon className="w-8 h-8" />
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/5 transition-colors duration-500" />
                                    </div>
                                    
                                    <div className="flex-1 space-y-2">
                                      <div className="flex justify-between items-baseline gap-4">
                                        <h4 className="text-xl font-display italic text-ink group-hover:text-primary transition-colors">
                                          {item.name}
                                        </h4>
                                        <div className="h-px flex-1 bg-line border-dotted border-b opacity-30" />
                                        <span className="text-sm font-light tracking-widest text-ink">
                                          {item.price.toLocaleString()}
                                        </span>
                                      </div>
                                      {item.description && (
                                        <p className="text-xs text-gray-400 font-light leading-relaxed line-clamp-2 italic">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>

            <footer className="mt-40 pb-24 flex flex-col items-center border-t border-line pt-24 space-y-12">
              <div className="flex flex-col items-center space-y-4">
                <img
                  src="https://i.ibb.co/84TCyPNf/logo.png"
                  alt="Lamonte Logo"
                  className="h-8 opacity-50"
                  referrerPolicy="no-referrer"
                />
                <p className="text-gray-300 text-[10px] uppercase tracking-[0.4em] font-bold">Lamonte Cafe & Lounge</p>
              </div>
              
              <div className="flex items-center gap-8">
                <button
                  onClick={() => setView('auth')}
                  className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-300 hover:text-ink transition-colors"
                >
                  Admin
                </button>
                <div className="h-1 w-1 bg-line rounded-full" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-300">© 2026</span>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-ink/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 z-10 p-2 text-ink hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-bg relative">
                {selectedItem.image_url ? (
                  <img 
                    src={selectedItem.image_url} 
                    alt={selectedItem.name} 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-200 gap-4">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
              </div>

              <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col justify-center space-y-12">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                        {selectedItem.category}
                      </span>
                      <div className="h-px w-8 bg-line" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300">
                        {selectedItem.subcategory}
                      </span>
                    </div>
                    <h2 className="text-5xl font-display italic text-ink leading-tight">
                      {selectedItem.name}
                    </h2>
                  </div>
                  
                  {selectedItem.description && (
                    <p className="text-gray-400 font-light leading-relaxed italic">
                      {selectedItem.description}
                    </p>
                  )}
                </div>

                <div className="space-y-8">
                  {selectedItem.extras && selectedItem.extras.length > 0 && (
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Enhancements</label>
                      <div className="space-y-3">
                        {selectedItem.extras.map((extra, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => {
                              const newSelected = new Set(selectedExtras);
                              if (newSelected.has(idx)) newSelected.delete(idx);
                              else newSelected.add(idx);
                              setSelectedExtras(newSelected);
                            }}
                            className="flex items-center justify-between group cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 border border-line rounded flex items-center justify-center transition-colors ${selectedExtras.has(idx) ? 'bg-primary border-primary' : 'group-hover:border-primary'}`}>
                                <Plus className={`w-2 h-2 text-white transition-opacity ${selectedExtras.has(idx) ? 'opacity-100' : 'opacity-0'}`} />
                              </div>
                              <span className={`text-sm font-display italic transition-colors ${selectedExtras.has(idx) ? 'text-primary' : 'text-ink'}`}>{extra.name}</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">+{extra.price.toLocaleString()} IQD</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-light text-ink">
                        {(selectedItem.price + Array.from(selectedExtras).reduce((acc, idx) => acc + (selectedItem.extras?.[idx]?.price || 0), 0)).toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300">IQD</span>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={addToCart}
                        className="flex-1 py-5 bg-ink text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary transition-all duration-500 flex items-center justify-center gap-3"
                      >
                        Add to Selection
                      </button>
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="px-8 py-5 border border-line text-ink text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-bg transition-all duration-500"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Cart Slide-over */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-line flex items-center justify-between bg-bg/50 backdrop-blur-sm">
                <div className="space-y-1">
                  <h2 className="text-3xl font-display italic text-ink lowercase">Selection</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                    {cart.length} {cart.length === 1 ? 'Creation' : 'Creations'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {cart.length > 0 && (
                    <button 
                      onClick={() => {
                        if (confirm('Clear all items from selection?')) setCart([]);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Clear Selection"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 text-gray-300 hover:text-ink transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-bg custom-scrollbar">
                {orderConfirmed ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-display italic text-ink">Selection Confirmed</h3>
                      <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                        Your order has been transmitted. We are preparing your experience.
                      </p>
                    </div>
                  </motion.div>
                ) : cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                    <ShoppingBag className="w-16 h-16 text-gray-300" />
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Your selection is empty</p>
                      <button 
                        onClick={() => setIsCartOpen(false)}
                        className="text-xs font-display italic text-ink hover:text-primary transition-colors"
                      >
                        Explore our menu
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-6 group">
                        <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-line shadow-sm group-hover:shadow-md transition-all duration-500">
                          <img 
                            src={item.menuItem.image_url} 
                            alt={item.menuItem.name} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="text-lg font-display italic text-ink">{item.menuItem.name}</h3>
                              {item.selectedExtras.length > 0 && (
                                <p className="text-[10px] text-gray-400 italic mt-1">
                                  + {item.selectedExtras.map(e => e.name).join(', ')}
                                </p>
                              )}
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 text-gray-200 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 border border-line rounded-xl px-3 py-1.5 bg-white shadow-sm">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="text-gray-400 hover:text-ink transition-colors p-0.5"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold text-ink w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="text-gray-400 hover:text-ink transition-colors p-0.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-display italic text-ink">{(item.totalPrice * item.quantity).toLocaleString()}</span>
                              <span className="text-[8px] font-bold text-gray-400 ml-1 uppercase tracking-widest">IQD</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && !orderConfirmed && (
                <div className="p-8 bg-bg/80 backdrop-blur-md border-t border-line space-y-8">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Total Investment</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-display italic text-ink">{cartTotal.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IQD</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="py-5 border border-line text-ink text-[10px] uppercase tracking-[0.4em] font-bold hover:border-primary hover:text-primary transition-all duration-500"
                    >
                      Continue
                    </button>
                    <button
                      onClick={submitOrder}
                      disabled={isSubmittingOrder}
                      className="py-5 bg-ink text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                      {isSubmittingOrder ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
