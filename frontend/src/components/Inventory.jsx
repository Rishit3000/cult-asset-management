// src/components/Inventory.jsx
import React, { useState, useEffect } from 'react';
import { Camera, Lightbulb, Package, Search } from 'lucide-react';
import BookingModal from './BookingModal'; // 1. Import our new booking modal component

export default function Inventory() {
    const [assets, setAssets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAsset, setSelectedAsset] = useState(null); // Tracks which card was clicked

    const fetchInventory = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/assets?search=${searchTerm}`);
            const data = await response.json();
            setAssets(data);
        } catch (err) {
            console.error("Failed to load backend assets:", err);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [searchTerm]);

    const getIcon = (category) => {
        if (category.toLowerCase().includes('camera')) return <Camera className="w-5 h-5 text-indigo-600" />;
        if (category.toLowerCase().includes('light')) return <Lightbulb className="w-5 h-5 text-amber-500" />;
        return <Package className="w-5 h-5 text-gray-500" />;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Smart Asset Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Cultural Council Shared Resource Inventory</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search assets (e.g., Sony)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Live Cards Grid */}
            {assets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-500">No matching assets found in the inventory system.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assets.map((asset) => (
                        <div key={asset.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600">
                                        {getIcon(asset.category)}
                                        {asset.category}
                                    </span>
                                    <span className={`h-2.5 w-2.5 rounded-full ${asset.quantity_available > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                </div>
                                <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">{asset.name}</h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2rem]">{asset.description}</p>
                            </div>

                            <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Available Stock</p>
                                    <p className="text-lg font-extrabold text-gray-900">{asset.quantity_available} units</p>
                                </div>
                                <button 
                                    disabled={asset.quantity_available === 0}
                                    onClick={() => setSelectedAsset(asset)} // 2. Set the active asset on click
                                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                        asset.quantity_available > 0 
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-100' 
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {asset.quantity_available > 0 ? 'Book Asset' : 'Out of Stock'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. Render the popup overlay modal conditionally when selectedAsset is active */}
            {selectedAsset && (
                <BookingModal 
                    asset={selectedAsset} 
                    onClose={() => setSelectedAsset(null)} 
                    onBookingSuccess={fetchInventory} // Refresh numbers on success
                />
            )}
        </div>
    );
}