// src/components/BookingModal.jsx
import React, { useState } from 'react';
import { Calendar, Layers, X } from 'lucide-react';

export default function BookingModal({ asset, onClose, onBookingSuccess }) {
    const [quantity, setQuantity] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:5000/api/bookings/request', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    asset_id: asset.id, // 👈 Double check that this matches 'asset.id' exactly, NOT 'asset.asset_id' or a temporary index loop key!
                    quantity_requested: parseInt(quantity),
                    start_date: startDate,
                    end_date: endDate
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process reservation request.');
            }

            setSuccess(data.message);
            setTimeout(() => {
                onBookingSuccess();
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-gray-100 max-w-md w-full rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Request Shared Resource</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{asset.name}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-500 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Panels */}
                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium rounded-lg">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-medium rounded-lg">
                            {success}
                        </div>
                    )}

                    {/* Quantity Picker */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Quantity Required</label>
                        <div className="relative">
                            <Layers className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="number"
                                min="1"
                                max={asset.quantity_available}
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1.5">Maximum items available right now: {asset.quantity_available} units.</p>
                    </div>

                    {/* Date Time Windows */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Start Allocation</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="datetime-local"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Expected Return</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="datetime-local"
                                    required
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Triggers */}
                    <div className="pt-4 border-t border-gray-50 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all"
                        >
                            Submit Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}