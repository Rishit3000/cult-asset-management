// src/components/AssetManager.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

export default function AssetManager() {
    const [assets, setAssets] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [error, setError] = useState('');

    // Form Fields
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [status, setStatus] = useState('active');

    const fetchAssets = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/assets');
            const data = await response.json();
            setAssets(data);
        } catch (err) {
            console.error("Error reading repository matrix:", err);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const openCreateModal = () => {
        setEditingAsset(null);
        setName('');
        setCategory('');
        setDescription('');
        setQuantity(1);
        setStatus('active');
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (asset) => {
        setEditingAsset(asset);
        setName(asset.name);
        setCategory(asset.category);
        setDescription(asset.description);
        setQuantity(asset.quantity_available);
        setStatus(asset.status);
        setError('');
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const token = localStorage.getItem('token'); // Grab your secure admin token
        const url = editingAsset 
            ? `http://localhost:5000/api/assets/${editingAsset.id}`
            : 'http://localhost:5000/api/assets';
        const method = editingAsset ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Protects the configuration change
                },
                body: JSON.stringify({
                    name,
                    category,
                    description,
                    quantity_available: parseInt(quantity),
                    status
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Operation failed.');
            }

            setIsModalOpen(false);
            fetchAssets();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you certain you want to remove this asset entirely from system logs?")) return;
        
        const token = localStorage.getItem('token'); // Grab your secure admin token
        try {
            const response = await fetch(`http://localhost:5000/api/assets/${id}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // Protects the deletion pipeline
                }
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Failed to delete asset.');
                return;
            }

            fetchAssets();
        } catch (err) {
            console.error("Deletion lifecycle breakdown:", err);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Control Console</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Add, update, or decommission shared council assets</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" /> Add New Asset
                </button>
            </div>

            {/* Assets Inventory Grid Table */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-gray-100">
                            <th className="p-4">Asset Details</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Available Stock</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                        {assets.map((asset) => (
                            <tr key={asset.id} className="hover:bg-slate-50/50 transition-all">
                                <td className="p-4">
                                    <p className="font-semibold text-gray-900">{asset.name}</p>
                                    <p className="text-xs text-gray-400 line-clamp-1 max-w-md mt-0.5">{asset.description}</p>
                                </td>
                                <td className="p-4 text-xs font-medium text-gray-500">{asset.category}</td>
                                <td className="p-4 font-bold text-gray-900">{asset.quantity_available} units</td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                                        asset.status === 'active' 
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                            : 'bg-amber-50 border-amber-100 text-amber-600'
                                    }`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEditModal(asset)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-all">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(asset.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Overlay Creation/Editing Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-gray-100 max-w-md w-full rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-lg">{editingAsset ? 'Modify Resource Parameters' : 'Register New Asset'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:bg-gray-50 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium rounded-lg">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Resource Title</label>
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Studio Tripod Stand" className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Category Cluster</label>
                                    <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Media Gear" className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Base Stock Pool</label>
                                    <input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">System Allocation State</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                                    <option value="active">Active (Available)</option>
                                    <option value="maintenance">Maintenance Locked</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Operational Specifications</label>
                                <textarea rows="3" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide condition specifications or usage limits..." className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none" />
                            </div>
                            <div className="pt-4 border-t border-gray-50 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 rounded-xl">Cancel</button>
                                <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm"><Save className="w-3.5 h-3.5" /> Save Specifications</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}