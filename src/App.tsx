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
import { Category, Item, CartItem, Sale, DayEndReport, PaymentMethod } from './types';

interface Settings {
  company_name: string;
  tax_rate: string;
  address: string;
  contact: string;
}

// --- Global Styles for Print ---
const PrintStyles = () => (
  <style>{`
    @media print {
      @page { margin: 0; size: auto; }
      html, body { height: 100%; overflow: visible !important; background: white !important; margin: 0 !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .print-only { 
        display: block !important; 
        position: static !important; 
        visibility: visible !important;
        width: 100% !important; 
        height: auto !important; 
        overflow: visible !important;
        opacity: 1 !important;
      }
      #root { display: block !important; height: auto !important; overflow: visible !important; }
    }
    /* Hide on screen but keep in DOM for React to render */
    .print-only { 
      position: fixed; 
      top: -10000px; 
      left: 0; 
      width: 1px; 
      height: 1px; 
      overflow: hidden; 
      opacity: 0;
      pointer-events: none;
    }
  `}</style>
);

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab, onLogout, currentUser }: { activeTab: string, setActiveTab: (tab: string) => void, onLogout: () => void, currentUser: { username: string, role: string } | null }) => {
  const menuItems = [
    { id: 'pos', icon: ShoppingCart, label: 'Checkout' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
  ];

  if (currentUser?.role === 'admin') {
    menuItems.push({ id: 'admin', icon: Settings, label: 'Admin' });
  }

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
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

// --- Receipt Component ---
const Receipt = ({ sale, items, settings }: { sale: any, items: CartItem[], settings: Settings }) => {
  const now = new Date();
  const taxRate = parseFloat(settings.tax_rate) || 0;
  
  return (
    <div className="receipt-80mm font-mono text-xs leading-tight text-black bg-white p-2">
      <div className="text-center mb-2">
        <h2 className="text-lg font-bold uppercase">{settings.company_name || 'MODERN STORE'}</h2>
        <p>{settings.address || '123 Business Street, City'}</p>
        <p>Tel: {settings.contact || '+1 234 567 890'}</p>
      </div>
      
      <div className="border-t border-b border-dashed border-black py-2 mb-2">
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

      <div className="mb-2">
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
          <span>VAT ({taxRate}%):</span>
          <span>₱{sale.tax?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-black pt-1 mt-1">
          <span>TOTAL:</span>
          <span>₱{sale.total?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span>Payment:</span>
          <span className="uppercase">{sale.payment_method}</span>
        </div>
      </div>
      
      <div className="text-center mt-4 text-[10px]">
        <p>Thank you for your purchase!</p>
        <p>Please come again.</p>
      </div>
    </div>
  );
};

// --- Report Print Component ---
const ReportPrint = ({ report, salesHistory, settings, type, date }: { report: DayEndReport, salesHistory: Sale[], settings: Settings, type: string, date: string }) => {
  console.log("Rendering ReportPrint", { report, salesHistory });
  const totalRevenue = report.summary.reduce((a, b) => a + b.total_sales, 0);
  const totalTransactions = report.summary.reduce((a, b) => a + b.transaction_count, 0);

  return (
    <div className="receipt-80mm font-mono text-xs leading-tight text-black bg-white p-2">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold uppercase">{settings.company_name}</h2>
        <p>{settings.address}</p>
        <p>Tel: {settings.contact}</p>
        <div className="border-b border-black my-2"></div>
        <p className="text-sm font-bold uppercase">
          {type === 'day' ? 'DAILY' : type === 'month' ? 'MONTHLY' : 'YEARLY'} SALES REPORT
        </p>
        <p>Date: {type === 'day' ? new Date(date).toLocaleDateString() : date}</p>
        <p>Generated: {new Date().toLocaleTimeString()}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="font-bold border-b border-dashed border-black mb-2">SALES SUMMARY</h3>
        <div className="flex justify-between mb-1">
          <span>Total Revenue:</span>
          <span className="font-bold">₱{totalRevenue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Transactions:</span>
          <span>{totalTransactions}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Avg Transaction:</span>
          <span>₱{totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : '0.00'}</span>
        </div>
        
        <div className="mt-2 pt-2 border-t border-dashed border-black">
          <div className="font-bold mb-1">BY PAYMENT METHOD</div>
          {report.summary.map(s => (
            <div key={s.payment_method} className="flex justify-between mb-1 pl-2">
              <span className="uppercase">{s.payment_method}:</span>
              <span>₱{s.total_sales.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {report.categories && report.categories.length > 0 && (
        <div className="mb-4">
          <h3 className="font-bold border-b border-dashed border-black mb-2">SALES BY CATEGORY</h3>
          {report.categories.map((cat, idx) => (
            <div key={idx} className="flex justify-between mb-1">
              <span>{cat.name || 'Uncategorized'}</span>
              <span>₱{cat.total_revenue.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-bold border-b border-dashed border-black mb-2">TOP ITEMS (By Revenue)</h3>
        <div className="flex justify-between font-bold border-b border-black pb-1 mb-1">
          <span className="w-1/2">Item</span>
          <span className="w-1/4 text-center">Qty</span>
          <span className="w-1/4 text-right">Amt</span>
        </div>
        {report.items.slice(0, 10).map((item, idx) => (
          <div key={idx} className="flex justify-between py-1">
            <span className="w-1/2 truncate">{item.name}</span>
            <span className="w-1/4 text-center">{item.total_quantity}</span>
            <span className="w-1/4 text-right">{item.total_revenue.toFixed(2)}</span>
          </div>
        ))}
        {(!report.items || report.items.length === 0) && (
          <div className="text-center py-2">No sales recorded</div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-bold border-b border-dashed border-black mb-2">RECENT TRANSACTIONS</h3>
        <div className="flex justify-between font-bold border-b border-black pb-1 mb-1">
          <span className="w-1/3">Time</span>
          <span className="w-1/3 text-center">Type</span>
          <span className="w-1/3 text-right">Total</span>
        </div>
        {salesHistory.slice(0, 10).map(sale => (
          <div key={sale.id} className="flex justify-between py-1">
            <span className="w-1/3">{new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="w-1/3 text-center uppercase">{sale.payment_method.substring(0, 4)}</span>
            <span className="w-1/3 text-right">{sale.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-6 border-t border-black pt-2">
        <p>*** END OF REPORT ***</p>
        <p className="mt-2 text-[10px]">Printed by: {settings.company_name}</p>
      </div>
    </div>
  );
};

// --- Settings Component ---
const SettingsPanel = ({ settings, onUpdate }: { settings: Settings, onUpdate: (s: Settings) => void }) => {
  const [formData, setFormData] = useState(settings);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onUpdate(formData);
        setMessage('Settings updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update settings.');
      }
    } catch (err) {
      setMessage('Error updating settings.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8 max-w-4xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
          <p className="text-slate-500">Manage company details and tax configuration</p>
        </div>
      </div>

      <div className="card p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input 
                type="text" 
                name="company_name"
                className="input w-full" 
                value={formData.company_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
              <input 
                type="number" 
                name="tax_rate"
                className="input w-full" 
                value={formData.tax_rate}
                onChange={handleChange}
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input 
                type="text" 
                name="address"
                className="input w-full" 
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
              <input 
                type="text" 
                name="contact"
                className="input w-full" 
                value={formData.contact}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {message && <div className={`p-3 text-sm rounded-lg ${message.includes('Failed') || message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{message}</div>}

          <button type="submit" className="btn btn-primary">Save Changes</button>
        </form>
      </div>
    </motion.div>
  );
};

// --- Admin Component ---
const AdminPanel = ({ onUpdatePaymentMethods }: { onUpdatePaymentMethods?: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cashier');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [paymentMethodError, setPaymentMethodError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchPaymentMethods();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods');
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data);
      }
    } catch (err) {
      console.error("Failed to fetch payment methods");
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentMethod.trim()) return;
    setPaymentMethodError('');

    try {
      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPaymentMethod }),
      });
      
      if (res.ok) {
        setNewPaymentMethod('');
        fetchPaymentMethods();
        onUpdatePaymentMethods?.();
      } else {
        const data = await res.json();
        setPaymentMethodError(data.error || 'Failed to add payment method');
      }
    } catch (err) {
      setPaymentMethodError('Network error');
    }
  };

  const handleDeletePaymentMethod = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    try {
      const res = await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPaymentMethods();
        onUpdatePaymentMethods?.();
      }
    } catch (err) {
      console.error("Failed to delete payment method");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`User ${data.username} created successfully!`);
        setUsername('');
        setPassword('');
        setRole('cashier');
        fetchUsers();
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/users/${userToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
        setUserToDelete(null);
      } else {
        alert('Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const handleUpdatePassword = async (id: number) => {
    if (!newPassword) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setEditingUser(null);
        setNewPassword('');
        alert('Password updated successfully');
      } else {
        alert('Failed to update password');
      }
    } catch (err) {
      alert('Error updating password');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8 max-w-6xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Admin Panel</h2>
          <p className="text-slate-500">Manage system users and settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-6">Create New User</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                className="input w-full" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                className="input w-full" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select 
                className="input w-full" 
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {message && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">{message}</div>}
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

            <button type="submit" className="btn btn-primary w-full">Create User</button>
          </form>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold mb-6">Existing Users</h3>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{user.username}</div>
                  <div className="text-xs text-slate-500 uppercase">{user.role}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditingUser(user.id);
                      setNewPassword('');
                    }}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && <p className="text-slate-500 text-center py-4">No users found.</p>}
          </div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Settings size={24} className="text-indigo-600" />
          Payment Methods
        </h2>
        
        <form onSubmit={handleAddPaymentMethod} className="flex gap-4 mb-6">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="New Payment Method (e.g. GCash, Maya)" 
              className="input w-full"
              value={newPaymentMethod}
              onChange={(e) => setNewPaymentMethod(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary whitespace-nowrap">
            <Plus size={18} className="mr-2" />
            Add Method
          </button>
        </form>

        {paymentMethodError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 text-sm">
            {paymentMethodError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-medium capitalize">{method.name}</span>
              <button 
                onClick={() => handleDeletePaymentMethod(method.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-2"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 text-red-600">Delete User?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={confirmDeleteUser}
                className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
              >
                Delete
              </button>
              <button 
                onClick={() => setUserToDelete(null)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Change Password</h3>
            <p className="text-sm text-slate-500 mb-4">Enter new password for user.</p>
            <input 
              type="password" 
              className="input w-full mb-4" 
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => handleUpdatePassword(editingUser)}
                className="btn btn-primary flex-1"
              >
                Update
              </button>
              <button 
                onClick={() => { setEditingUser(null); setNewPassword(''); }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// --- Login Component ---
const Login = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <LayoutDashboard size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Modern POS</h1>
          <p className="text-indigo-100">Store Management System</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="Enter username"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="Enter password"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Access System'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-400">
            Protected System • Authorized Personnel Only
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string, role: string } | null>(null);
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
  const [reportType, setReportType] = useState<'day' | 'month' | 'year'>('day');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  const [isPrinting, setIsPrinting] = useState(false);

  const [settings, setSettings] = useState<Settings>({
    company_name: 'MODERN STORE',
    tax_rate: '12',
    address: '123 Main St, City',
    contact: '555-0123'
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
      fetchCategories();
      fetchSettings();
      fetchPaymentMethods();
    }
  }, [isAuthenticated]);

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods');
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data);
      }
    } catch (err) {
      console.error("Failed to fetch payment methods");
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  const handleLogin = (user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCart([]);
    setActiveTab('pos');
  };

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
  const taxRate = parseFloat(settings.tax_rate) || 0;
  const cartTax = cartSubtotal * (taxRate / 100);
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

  const fetchReportSummary = async () => {
    try {
      const res = await fetch(`/api/reports/summary?type=${reportType}&date=${reportDate}`);
      if (!res.ok) throw new Error('Failed to fetch summary');
      const data = await res.json();
      setDayEndReport(data);
      return data;
    } catch (error) {
      console.error("Error fetching report summary:", error);
      return null;
    }
  };

  const fetchSalesHistory = async () => {
    try {
      const res = await fetch(`/api/reports/sales?type=${reportType}&date=${reportDate}`);
      if (!res.ok) throw new Error('Failed to fetch sales');
      const data = await res.json();
      setSalesHistory(data);
      return data;
    } catch (error) {
      console.error("Error fetching sales history:", error);
      return [];
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReportSummary();
      fetchSalesHistory();
    }
  }, [activeTab, reportType, reportDate]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const [printType, setPrintType] = useState<'receipt' | 'report' | null>(null);
  const [printTrigger, setPrintTrigger] = useState(0);

  const triggerPrint = () => {
    console.log("Triggering print...");
    setPrintTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (printTrigger > 0) {
      console.log("Print effect running, waiting for timeout...");
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        console.log("Calling window.print()");
        window.print();
        // Reset printing state after print dialog opens (or a bit later)
        setTimeout(() => setIsPrinting(false), 1000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printTrigger]);

  const handlePrintReceipt = () => {
    setPrintType('receipt');
    setIsPrinting(true);
    triggerPrint();
  };

  const handlePrintReport = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    
    try {
      // 1. Fetch latest data
      const [summaryData, salesData] = await Promise.all([
        fetchReportSummary(),
        fetchSalesHistory()
      ]);

      if (!summaryData) {
        throw new Error("Failed to load report data");
      }

      // 2. Set print type
      setPrintType('report');
      
      // 3. Trigger print
      triggerPrint();

    } catch (err) {
      console.error('Failed to prepare report:', err);
      alert("Failed to load report data. Please try again.");
      setIsPrinting(false);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <PrintStyles />
      <div className="h-screen overflow-hidden bg-slate-50 main-container no-print">
        <div className="flex w-full h-full">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} currentUser={currentUser} />

        <main className="flex-1 overflow-auto relative">
          <AnimatePresence mode="wait">
          {activeTab === 'admin' && currentUser?.role === 'admin' && (
             <div className="space-y-8">
               <AdminPanel onUpdatePaymentMethods={fetchPaymentMethods} />
               <SettingsPanel settings={settings} onUpdate={setSettings} />
             </div>
          )}
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
                      <span>VAT ({settings.tax_rate}%)</span>
                      <span>₱{cartTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span>₱{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button 
                        key={method.id}
                        disabled={cart.length === 0}
                        onClick={() => handleCheckout(method.name)}
                        className={`btn text-white flex flex-col items-center py-4 gap-1 ${
                          method.name.toLowerCase() === 'cash' 
                            ? 'bg-emerald-600 hover:bg-emerald-700' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        <span className="text-lg font-bold capitalize">{method.name}</span>
                        <span className="text-[10px] opacity-80 uppercase tracking-wider">Checkout</span>
                      </button>
                    ))}
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
                <div className="flex gap-4 items-end">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                    <select 
                      className="input py-2 px-4"
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as any)}
                    >
                      <option value="day">Daily</option>
                      <option value="month">Monthly</option>
                      <option value="year">Yearly</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                    <input 
                      type={reportType === 'day' ? 'date' : reportType === 'month' ? 'month' : 'number'} 
                      className="input py-2 px-4"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      placeholder={reportType === 'year' ? 'YYYY' : undefined}
                      min={reportType === 'year' ? '2000' : undefined}
                      max={reportType === 'year' ? '2100' : undefined}
                    />
                  </div>
                  <button 
                    onClick={handlePrintReport}
                    disabled={isPrinting}
                    className="btn btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Printer size={18} />
                    {isPrinting ? 'Preparing...' : 'Print Report'}
                  </button>
                </div>
              </div>

              {/* Day End Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 bg-indigo-600 text-white border-none shadow-xl shadow-indigo-100">
                  <p className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-1">
                    {reportType === 'day' ? "Today's" : reportType === 'month' ? "This Month's" : "This Year's"} Total Sales
                  </p>
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
                    <h3 className="text-lg font-bold">Top Selling Items ({reportType})</h3>
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
                   <Receipt sale={lastSale} items={lastSale.items} settings={settings} />
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

      {/* Hidden Print Content Area - Always rendered to ensure availability for print */}
      <div className="print-only">
        {printType === 'receipt' && lastSale && (
          <Receipt sale={lastSale} items={lastSale.items} settings={settings} />
        )}
        
        {printType === 'report' && (
          dayEndReport ? (
            <ReportPrint 
              report={dayEndReport} 
              salesHistory={salesHistory} 
              settings={settings} 
              type={reportType} 
              date={reportDate} 
            />
          ) : (
            <div className="p-4 text-center font-bold text-red-500">
              ERROR: Report data not loaded.
            </div>
          )
        )}
      </div>
    </>
  );
}
