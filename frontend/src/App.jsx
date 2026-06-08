// src/App.jsx
import React, { useState, useEffect } from 'react';
import Inventory from './components/Inventory';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AssetManager from './components/AssetManager';
import UserHistory from './components/UserHistory'; // Import history element

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('inventory');
  };

  if (!user) {
    return <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b border-gray-100 py-4 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
            Logged in as: <strong>{user.name} ({user.role})</strong>
          </span>
          
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('inventory')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              Browse Assets
            </button>
            
            {/* If regular consumer user, provide history access toggle */}
            {user.role === 'consumer' && (
              <button onClick={() => setActiveTab('history')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                My Bookings Workspace
              </button>
            )}

            {user.role === 'admin' && (
              <>
                <button onClick={() => setActiveTab('manage')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${activeTab === 'manage' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  Manage Inventory
                </button>
                <button onClick={() => setActiveTab('analytics')} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  Analytics Dashboard
                </button>
              </>
            )}
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs font-bold text-rose-600 hover:text-rose-700 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all">Logout</button>
      </nav>

      {/* Dynamic Render Section Control Block */}
      {activeTab === 'inventory' && <Inventory />}
      {activeTab === 'history' && <UserHistory />}
      {activeTab === 'manage' && <AssetManager />}
      {activeTab === 'analytics' && <AdminDashboard />}
    </div>
  );
}

export default App;