// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { BarChart3, Check, Layers, AlertCircle, X, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [pendingBookings, setPendingBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState('');

    const token = localStorage.getItem('token');

    // 1. Fetch System Analytics Cards & Chart
    const fetchMetrics = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/analytics/dashboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMetrics(data);
        } catch (err) {
            console.error("Error loading analytics data:", err);
        }
    };

    // 2. Fetch Pending Student Requests Queue
    const fetchPendingRequests = async () => {
        try {
            // Reusing your assets/bookings pool endpoints
            const response = await fetch('http://localhost:5000/api/bookings/requests/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // If fallback endpoint is missing, fetch all bookings to filter
            if (!response.ok) {
                const fallbackRes = await fetch('http://localhost:5000/api/bookings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const allBookings = await fallbackRes.json();
                setPendingBookings(allBookings.filter(b => b.status === 'pending'));
                return;
            }
            const data = await response.json();
            setPendingBookings(data);
        } catch (err) {
            // Graceful fallback to prevent screen crashes if table is empty
            setPendingBookings([]);
        }
    };

    const loadDashboardData = async () => {
        setLoading(true);
        await Promise.all([fetchMetrics(), fetchPendingRequests()]);
        setLoading(false);
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // 3. Handle Admin Click Decisions (Approve / Reject)
    const handleAction = async (bookingId, actionType) => {
        setActionMessage('');
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/${actionType}`, {
                method: 'PATCH', // Matches your backend approval patch paths
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update request state.');
            }

            setActionMessage(`Request successfully ${actionType}ed!`);
            setTimeout(() => setActionMessage(''), 3000);
            
            // Refresh tables and counters instantly
            loadDashboardData();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="text-center py-12 text-sm text-gray-500">Compiling real-time analytics...</div>;
    if (!metrics) return <div className="text-center py-12 text-rose-500">Failed to connect to analytics engine.</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Administration</h1>
                <p className="text-sm text-gray-500 mt-1">Real-time resource utilization and status tracking matrix</p>
            </div>

            {/* Metrics Cards Layout Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Layers className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Bookings</p>
                        <p className="text-2xl font-black text-gray-900">{metrics.summaryCards.active_bookings}</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Check className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Available Stock</p>
                        <p className="text-2xl font-black text-gray-900">{metrics.summaryCards.available_inventory || 0} units</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-lg"><AlertCircle className="w-6 h-6" /></div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Overdue Returns</p>
                        <p className="text-2xl font-black text-gray-900">{metrics.summaryCards.overdue_returns}</p>
                    </div>
                </div>
            </div>

            {actionMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold rounded-xl text-center">
                    {actionMessage}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Pending Booking Request Queue Dashboard Layer */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <h3 className="font-bold text-gray-800 text-lg">Pending Allocation Logs ({pendingBookings.length})</h3>
                    </div>

                    {pendingBookings.length === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-400 bg-gray-50 border border-dashed border-gray-100 rounded-xl">
                            All inbound inventory request chains are currently processed clean.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                            {pendingBookings.map((request) => (
                                <div key={request.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{request.asset_name || `Asset ID: ${request.asset_id}`}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Requested: <strong className="text-gray-700">{request.quantity_requested} units</strong> by User ID: {request.user_id}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Timeline: {new Date(request.start_date).toLocaleDateString()} to {new Date(request.end_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button 
                                            onClick={() => handleAction(request.id, 'approve')}
                                            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm shadow-emerald-50"
                                            title="Approve Request"
                                        >
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => handleAction(request.id, 'reject')}
                                            className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all shadow-sm shadow-rose-50"
                                            title="Reject Request"
                                        >
                                            <ThumbsDown className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Resource Utilization Chart Data Display */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-gray-800 text-lg">Top Utilized Assets</h3>
                    </div>
                    {metrics.utilizationChart.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6">No historical metrics generated yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {metrics.utilizationChart.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]">{item.name}</span>
                                    <span className="text-[11px] font-bold px-2.5 py-1 bg-gray-100 rounded-md text-gray-600 shrink-0">
                                        {item.total_bookings} approved requests
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}