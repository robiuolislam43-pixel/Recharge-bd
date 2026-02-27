import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Order, Operator } from '@/src/types';
import { OPERATOR_DATA } from '@/src/constants';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { LogOut, CheckCircle, XCircle, Clock, DollarSign, ListOrdered, Activity as ActivityIcon, Smartphone, CreditCard, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    pendingCount: 0,
    completedCount: 0,
    rejectedCount: 0,
  });

  useEffect(() => {
    checkUser();
    fetchOrders();
    
    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.email !== 'xmlrifat@gmail.com') {
      if (session) await supabase.auth.signOut();
      navigate('/admin');
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          packages (
            name,
            type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const fetchedOrders = data || [];
      setOrders(fetchedOrders);
      
      const pending = fetchedOrders.filter(o => o.status === 'pending').length;
      const completed = fetchedOrders.filter(o => o.status === 'completed').length;
      const rejected = fetchedOrders.filter(o => o.status === 'rejected').length;
      const income = fetchedOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + Number(o.amount), 0);
        
      setStats({
        totalIncome: income,
        pendingCount: pending,
        completedCount: completed,
        rejectedCount: rejected,
      });
      
    } catch (error: any) {
      toast.error('অর্ডার লোড করতে সমস্যা হয়েছে: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'completed' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`অর্ডারটি ${newStatus === 'completed' ? 'সফল' : 'বাতিল'} করা হয়েছে`);
      fetchOrders();
    } catch (error: any) {
      toast.error('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1.5"><Clock className="w-3 h-3"/> পেন্ডিং</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5"><CheckCircle className="w-3 h-3"/> সফল</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 border border-red-200 flex items-center gap-1.5"><XCircle className="w-3 h-3"/> বাতিল</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh] font-bold text-slate-400">ড্যাশবোর্ড লোড হচ্ছে...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-slate-500 font-medium">রিচার্জ অনুরোধগুলো পরিচালনা করুন এবং আয় দেখুন</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 rounded-xl border-2 font-bold h-12 px-6">
          <LogOut className="w-4 h-4" /> লগআউট
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'মোট আয়', value: `৳${stats.totalIncome.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500', lightColor: 'bg-emerald-50' },
          { label: 'পেন্ডিং অর্ডার', value: stats.pendingCount, icon: Clock, color: 'bg-amber-500', lightColor: 'bg-amber-50' },
          { label: 'সফল অর্ডার', value: stats.completedCount, icon: ListOrdered, color: 'bg-blue-500', lightColor: 'bg-blue-50' },
          { label: 'বাতিল অর্ডার', value: stats.rejectedCount, icon: ActivityIcon, color: 'bg-red-500', lightColor: 'bg-red-50' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
          >
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden group">
              <CardContent className="p-6 flex items-center gap-5">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.lightColor)}>
                  <stat.icon className={cn("w-7 h-7", stat.color.replace('bg-', 'text-'))} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between p-8">
          <CardTitle className="text-xl font-black">সাম্প্রতিক অর্ডারসমূহ</CardTitle>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">লাইভ আপডেট</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-50">
                  <th className="px-8 py-5 font-black">তারিখ ও সময়</th>
                  <th className="px-8 py-5 font-black">গ্রাহক</th>
                  <th className="px-8 py-5 font-black">বিস্তারিত</th>
                  <th className="px-8 py-5 font-black">পেমেন্ট</th>
                  <th className="px-8 py-5 font-black">স্ট্যাটাস</th>
                  <th className="px-8 py-5 font-black text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ListOrdered className="w-12 h-12 text-slate-100" />
                        <p className="text-slate-400 font-bold">এখনো কোনো অর্ডার আসেনি।</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="bg-white hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          <div className="text-xs font-bold text-slate-500">
                            {new Date(order.created_at).toLocaleString('bn-BD')}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center p-1.5 group-hover:scale-110 transition-transform shadow-sm">
                            <img 
                              src={OPERATOR_DATA[order.operator as Operator]?.logo} 
                              alt={order.operator} 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-xs font-black text-emerald-600">${order.operator[0]}</span>`;
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-black text-slate-900">{order.mobile_number}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.operator}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="font-black text-lg text-slate-900">৳{order.amount}</div>
                        {order.packages && (
                          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{order.packages.name}</div>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-3.5 h-3.5 text-slate-300" />
                          <span className="font-black text-slate-900 uppercase text-[10px] tracking-widest">{order.payment_method}</span>
                        </div>
                        <div className="text-[10px] font-mono font-bold text-slate-400">TXN: {order.transaction_id}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        {order.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="success" 
                              onClick={() => handleStatusUpdate(order.id, 'completed')}
                              className="rounded-lg font-bold px-4"
                            >
                              সফল
                            </Button>
                            <Button 
                              size="sm" 
                              variant="danger" 
                              onClick={() => handleStatusUpdate(order.id, 'rejected')}
                              className="rounded-lg font-bold px-4"
                            >
                              বাতিল
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">সম্পন্ন</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
