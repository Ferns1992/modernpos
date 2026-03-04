import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Plus, 
  Search, 
  Trash2, 
  Minus, 
  Printer, 
  ChevronRight,
  Settings,
  LogOut,
  History,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Item, CartItem, Sale, DayEndReport } from './types';

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const menuItems = [
    { id: 'pos', icon: ShoppingCart, label: 'Checkout' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen no-print">
      <div className="p-6 border-bottom border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight">Modern POS</h1>
            <p className="text-xs text-slate-500 font-medium">Store Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

// --- Receipt Component ---
const Receipt = ({ sale, items }: { sale: any, items: CartItem[] }) => {
  const now = new Date();
  return (
    <div className="receipt-80mm mx-auto border border-dashed border-slate-300 p-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold uppercase">MODERN STORE</h2>
        <p>123 Business Street, City</p>
        <p>Tel: +1 234 567 890</p>
      </div>
      
      <div className="border-t border-b border-dashed border-black py-2 mb-4">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{now.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Time:</span>
          <span>{now.toLocaleTimeString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Receipt:</span>
          <span>#{sale.id || 'TEMP'}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between font-bold border-b border-dashed border-black pb-1 mb-1">
          <span className="w-1/2">Item</span>
          <span className="w-1/4 text-center">Qty</span>
          <span className="w-1/4 text-right">Price</span>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between py-1">
            <span className="w-1/2 truncate">{item.name}</span>
            <span className="w-1/4 text-center">x{item.quantity}</span>
            <span className="w-1/4 text-right">₱{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black pt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₱{sale.subtotal?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT (12%):</span>
          <span>₱{sale.tax?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-black pt-1">
          <span>TOTAL:</span>
          <span>₱{sale.total?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span>Payment:</span>
          <span className="uppercase">{sale.payment_method}</span>
        </div>
      </div>

      <div className="text-center mt-8 pt-4 border-t border-dashed border-black">
        <p>Thank you for shopping!</p>
        <p>Please come again.</p>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<{ id: number; subtotal: number; tax: number; total: number; payment_method: string; items: CartItem[] } | null>(null);

  // Inventory State
  const [newItem, setNewItem] = useState({ name: '', price: '', category_id: '', sku: '', stock: '' });
  const [newCategory, setNewCategory] = useState('');

  // Reports State
  const [dayEndReport, setDayEndReport] = useState<DayEndReport | null>(null);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    const res = await fetch('/api/items');
    const data = await res.json();
    setItems(data);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const addToCart = (item: Item) => {
    if (isNaN(item.price) || item.price < 0) {
      alert("This item has an invalid price and cannot be added to the cart.");
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTax = cartSubtotal * 0.12;
  const cartTotal = cartSubtotal + cartTax;

  const handleCheckout = async (paymentMethod: string) => {
    console.log('Starting checkout with method:', paymentMethod);
    if (cart.length === 0) {
      console.warn('Cart is empty, cannot checkout');
      return;
    }

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          subtotal: cartSubtotal,
          tax: cartTax,
          total: cartTotal,
          payment_method: paymentMethod
        })
      });
      const data = await res.json();
      console.log('Checkout response:', data);
      if (data.success) {
        setLastSale({ 
          id: data.id, 
          subtotal: cartSubtotal, 
          tax: cartTax, 
          total: cartTotal, 
          payment_method: paymentMethod,
          items: [...cart]
        });
        setShowReceipt(true);
        setCart([]);
        fetchItems(); // Refresh stock
      } else {
        console.error('Checkout failed:', data.error, data.details);
        alert(`Checkout failed: ${data.error || 'Unknown error'}${data.details ? ` (${data.details})` : ''}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert("Checkout failed: " + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory })
    });
    setNewCategory('');
    fetchCategories();
  };

  const handleAddItem = async () => {
    const price = parseFloat(newItem.price);
    const stock = parseInt(newItem.stock) || 0;
    
    if (!newItem.name || isNaN(price)) {
      alert("Please enter a valid name and price");
      return;
    }

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          price: price,
          category_id: newItem.category_id ? parseInt(newItem.category_id) : null,
          stock: stock
        })
      });
      
      if (res.ok) {
        setNewItem({ name: '', price: '', category_id: '', sku: '', stock: '' });
        fetchItems();
      } else {
        const data = await res.json();
        alert("Failed to add item: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error adding item");
    }
  };

  const fetchDayEndReport = async () => {
    const res = await fetch('/api/reports/day-end');
    const data = await res.json();
    setDayEndReport(data);
  };

  const fetchSalesHistory = async () => {
    const res = await fetch('/api/reports/sales');
    const data = await res.json();
    setSalesHistory(data);
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchDayEndReport();
      fetchSalesHistory();
    }
  }, [activeTab]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const [printTrigger, setPrintTrigger] = useState(0);
  const [printType, setPrintType] = useState<'receipt' | 'report' | null>(null);

  useEffect(() => {
    if (printTrigger > 0) {
      console.log('Print trigger activated, type:', printType);
      // Small delay to ensure state updates are reflected in DOM
      const timer = setTimeout(() => {
        console.log('Executing window.print()');
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printTrigger]);

  const handlePrintReceipt = () => {
    setPrintType('receipt');
    setPrintTrigger(prev => prev + 1);
  };

  const handlePrintReport = async () => {
    console.log('handlePrintReport called');
    try {
      console.log('Fetching report data...');
      await fetchDayEndReport();
      await fetchSalesHistory();
      console.log('Report data fetched successfully');
    } catch (err) {
      console.error('Failed to load report data:', err);
      alert("Failed to load report data");
      return;
    }
    setPrintType('report');
    setPrintTrigger(prev => prev + 1);
  };

  return (
    <>
      <div className="h-screen overflow-hidden bg-slate-50 main-container no-print">
        <div className="flex w-full h-full">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-auto relative">
          <AnimatePresence mode="wait">
          {activeTab === 'pos' && (
            <motion.div 
              key="pos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex h-full"
            >
              {/* Items Grid */}
              <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search items or scan SKU..." 
                      className="input pl-10 h-12 text-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 max-w-md">
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                        selectedCategory === null ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                          selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start">
                  {filteredItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="card p-4 text-left hover:border-indigo-500 hover:shadow-md transition-all group"
                    >
                      <div className="w-full aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                        <Tag size={32} />
                      </div>
                      <h3 className="font-bold text-slate-900 truncate">{item.name}</h3>
                      <p className="text-xs text-slate-500 mb-2">{item.category_name || 'No Category'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-600 font-bold">₱{item.price.toFixed(2)}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {item.stock} in stock
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cart Sidebar */}
              <div className="w-96 bg-white border-l border-slate-200 flex flex-col shadow-2xl">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingCart size={24} className="text-indigo-600" />
                    Current Order
                  </h2>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <ShoppingCart size={32} />
                      </div>
                      <p className="font-medium">Your cart is empty</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex gap-3 items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                          <p className="text-sm text-indigo-600 font-medium">₱{item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-50 rounded text-slate-500">
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-50 rounded text-slate-500">
                            <Plus size={14} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>₱{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>VAT (12%)</span>
                      <span>₱{cartTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span>₱{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      disabled={cart.length === 0}
                      onClick={() => handleCheckout('cash')}
                      className="btn bg-emerald-600 text-white hover:bg-emerald-700 flex flex-col items-center py-4 gap-1"
                    >
                      <span className="text-lg font-bold">Cash</span>
                      <span className="text-[10px] opacity-80 uppercase tracking-wider">Checkout</span>
                    </button>
                    <button 
                      disabled={cart.length === 0}
                      onClick={() => handleCheckout('card')}
                      className="btn bg-indigo-600 text-white hover:bg-indigo-700 flex flex-col items-center py-4 gap-1"
                    >
                      <span className="text-lg font-bold">Card</span>
                      <span className="text-[10px] opacity-80 uppercase tracking-wider">Checkout</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div 
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 max-w-6xl mx-auto space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Inventory Management</h2>
                  <p className="text-slate-500">Manage your products and categories</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Item Form */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="card p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Plus size={20} className="text-indigo-600" />
                      Add New Item
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Item Name</label>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="e.g. Organic Coffee Beans" 
                          value={newItem.name}
                          onChange={e => setNewItem({...newItem, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Price ($)</label>
                        <input 
                          type="number" 
                          className="input" 
                          placeholder="0.00" 
                          value={newItem.price}
                          onChange={e => setNewItem({...newItem, price: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category</label>
                        <select 
                          className="input"
                          value={newItem.category_id}
                          onChange={e => setNewItem({...newItem, category_id: e.target.value})}
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">SKU / Barcode</label>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="Unique ID" 
                          value={newItem.sku}
                          onChange={e => setNewItem({...newItem, sku: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Initial Stock</label>
                        <input 
                          type="number" 
                          className="input" 
                          placeholder="0" 
                          value={newItem.stock}
                          onChange={e => setNewItem({...newItem, stock: e.target.value})}
                        />
                      </div>
                    </div>
                    <button onClick={handleAddItem} className="btn btn-primary w-full mt-6">Add Item to Inventory</button>
                  </div>

                  <div className="card overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Item</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Category</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Price</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">{item.name}</div>
                              <div className="text-xs text-slate-400 font-mono">{item.sku || 'No SKU'}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{item.category_name || '-'}</td>
                            <td className="px-6 py-4 font-medium text-indigo-600">₱{item.price.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                item.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                              }`}>
                                {item.stock}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Categories Management */}
                <div className="space-y-6">
                  <div className="card p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Plus size={20} className="text-indigo-600" />
                      Add Category
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category Name</label>
                        <input 
                          type="text" 
                          className="input" 
                          placeholder="e.g. Beverages" 
                          value={newCategory}
                          onChange={e => setNewCategory(e.target.value)}
                        />
                      </div>
                      <button onClick={handleAddCategory} className="btn btn-secondary w-full">Create Category</button>
                    </div>
                  </div>

                  <div className="card p-6">
                    <h3 className="text-lg font-bold mb-4">All Categories</h3>
                    <div className="space-y-2">
                      {categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-medium text-slate-700">{cat.name}</span>
                          <span className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-400">
                            {items.filter(i => i.category_id === cat.id).length} items
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div 
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 max-w-6xl mx-auto space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Sales & Reports</h2>
                  <p className="text-slate-500">Track your business performance</p>
                </div>
                <button 
                  onClick={handlePrintReport}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Printer size={18} />
                  Print Report
                </button>
              </div>

              {/* Day End Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 bg-indigo-600 text-white border-none shadow-xl shadow-indigo-100">
                  <p className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-1">Today's Total Sales</p>
                  <h3 className="text-4xl font-bold">
                    ₱{dayEndReport?.summary.reduce((a, b) => a + b.total_sales, 0).toFixed(2) || '0.00'}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-indigo-100 text-sm">
                    <History size={16} />
                    <span>{dayEndReport?.summary.reduce((a, b) => a + b.transaction_count, 0) || 0} Transactions</span>
                  </div>
                </div>

                {dayEndReport?.summary.map(s => (
                  <div key={s.payment_method} className="card p-6">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{s.payment_method} Sales</p>
                    <h3 className="text-3xl font-bold text-slate-900">₱{s.total_sales.toFixed(2)}</h3>
                    <p className="text-slate-400 text-sm mt-2">{s.transaction_count} Transactions</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Selling Items */}
                <div className="card">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold">Top Selling Items (Today)</h3>
                  </div>
                  <div className="overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="px-6 py-3">Item</th>
                          <th className="px-6 py-3 text-center">Qty</th>
                          <th className="px-6 py-3 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dayEndReport?.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                            <td className="px-6 py-4 text-center text-slate-600">{item.total_quantity}</td>
                            <td className="px-6 py-4 text-right font-bold text-indigo-600">₱{item.total_revenue.toFixed(2)}</td>
                          </tr>
                        ))}
                        {(!dayEndReport?.items || dayEndReport.items.length === 0) && (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-slate-400">No sales recorded today</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="card">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold">Recent Transactions</h3>
                  </div>
                  <div className="overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="px-6 py-3">Time</th>
                          <th className="px-6 py-3">Method</th>
                          <th className="px-6 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {salesHistory.slice(0, 10).map(sale => (
                          <tr key={sale.id}>
                            <td className="px-6 py-4 text-slate-600">
                              {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4">
                              <span className="uppercase text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">
                                {sale.payment_method}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-900">₱{sale.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && lastSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm no-print">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">Sale Successful</h3>
                <button onClick={() => setShowReceipt(false)} className="text-slate-400 hover:text-slate-600">
                  <ChevronRight size={24} />
                </button>
              </div>
              <div className="p-8 bg-slate-50 flex justify-center">
                <div id="thermal-receipt" className="bg-white shadow-lg">
                   <Receipt sale={lastSale} items={lastSale.items} />
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <button 
                  onClick={handlePrintReceipt}
                  className="btn btn-primary flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Print Receipt
                </button>
                <button 
                  onClick={() => setShowReceipt(false)}
                  className="btn btn-secondary"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
      </div>

      {/* Hidden Print Content Area */}
      <div className="print-only">
        {printType === 'receipt' && lastSale && (
          <Receipt sale={lastSale} items={lastSale.items} />
        )}
        {printType === 'report' && dayEndReport && (
          <div className="report-print">
            <h1 className="text-3xl font-bold mb-6 text-center">Sales Report - {new Date().toLocaleDateString()}</h1>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="p-4 border border-slate-200 rounded-lg">
                <p className="text-slate-500 text-sm uppercase font-bold">Total Sales</p>
                <p className="text-2xl font-bold">₱{dayEndReport.summary.reduce((a, b) => a + b.total_sales, 0).toFixed(2)}</p>
              </div>
              {dayEndReport.summary.map(s => (
                <div key={s.payment_method} className="p-4 border border-slate-200 rounded-lg">
                  <p className="text-slate-500 text-sm uppercase font-bold">{s.payment_method} Sales</p>
                  <p className="text-2xl font-bold">₱{s.total_sales.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold mb-4">Top Selling Items</h2>
            <table className="w-full text-left border-collapse border border-slate-200 mb-8">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-3 border border-slate-200">Item</th>
                  <th className="p-3 border border-slate-200 text-center">Qty</th>
                  <th className="p-3 border border-slate-200 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {dayEndReport.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 border border-slate-200">{item.name}</td>
                    <td className="p-3 border border-slate-200 text-center">{item.total_quantity}</td>
                    <td className="p-3 border border-slate-200 text-right">₱{item.total_revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-3 border border-slate-200">Time</th>
                  <th className="p-3 border border-slate-200">Method</th>
                  <th className="p-3 border border-slate-200 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {salesHistory.slice(0, 20).map(sale => (
                  <tr key={sale.id}>
                    <td className="p-3 border border-slate-200">{new Date(sale.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3 border border-slate-200 uppercase">{sale.payment_method}</td>
                    <td className="p-3 border border-slate-200 text-right">₱{sale.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
