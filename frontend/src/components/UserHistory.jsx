// src/components/UserHistory.jsx
import React, { useState, useEffect } from 'react';
import { Bookmark, Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react';

export default function UserHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        const fetchMyHistory = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:5000/api/bookings/my-history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    setHistory(data);
                } else {
                    setServerError(data.error || "Unexpected data response from backend pipeline.");
                }
                setLoading(false);
            } catch (err) {
                console.error("Error connecting to personal database string:", err);
                setServerError("Failed to communicate with reservation database server endpoint.");
                setLoading(false);
            }
        };
        fetchMyHistory();
    }, []);

    if (loading) return <div className="text-center py-12 text-sm text-gray-500">Compiling personal allocation ledger...</div>;
    
    if (serverError) return <div className="text-center py-12 text-sm text-rose-500 font-semibold bg-rose-50 border border-rose-100 rounded-xl max-w-xl mx-auto mt-6">{serverError}</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">My Borrowing Workspace</h2>
                <p className="text-xs text-gray-500 mt-0.5">Track, monitor, and audit your shared resource utilization timeline</p>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-12 text-sm text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
                    You have not logged any historical reservation chains on this profile yet.
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-gray-100">
                                <th className="p-4">Resource Allocation Details</th>
                                <th className="p-4">Quantity</th>
                                <th className="p-4">Duration Timeline</th>
                                <th className="p-4">Verification State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                            {history.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500"><Bookmark className="w-4 h-4" /></div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{log.asset_name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{log.asset_category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">{log.quantity_requested} units</td>
                                    <td className="p-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            <span>{new Date(log.start_date).toLocaleDateString()} – {new Date(log.end_date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase border ${
                                            log.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                            log.status === 'rejected' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                            'bg-amber-50 border-amber-100 text-amber-600'
                                        }`}>
                                            {log.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                                            {log.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                            {log.status === 'pending' && <Clock className="w-3 h-3" />}
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}