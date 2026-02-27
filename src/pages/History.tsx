import React, { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Order, Operator } from '@/src/types';
import { OPERATOR_DATA } from '@/src/constants';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Search, Clock, CheckCircle, XCircle, Smartphone, Calendar, CreditCard, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

export default function OrderHistory() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length !== 11) {
      toast.error('সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন');
      return;
    }

    setLoading(true);
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
        .eq('mobile_number', mobileNumber)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setSearched(true);
    } catch (error: any) {
      toast.error('হিস্ট্রি লোড করতে সমস্যা হয়েছে: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">অর্ডার হিস্ট্রি</h1>
        <p className="text-slate-500 font-medium">আপনার করা রিচার্জ অনুরোধগুলোর বর্তমান অবস্থা জানুন</p>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-600" />
        <CardHeader>
          <CardTitle className="text-xl font-bold">অর্ডার ট্র্যাক করুন</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                type="tel"
                placeholder="মোবাইল নাম্বার দিন (01XXXXXXXXX)"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                className="pl-14 h-16 text-xl font-bold border-slate-100 bg-slate-50/50 focus:bg-white rounded-2xl"
                required
              />
            </div>
            <Button type="submit" className="h-16 px-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-lg font-black shadow-xl shadow-emerald-100" disabled={loading}>
              {loading ? 'খোঁজা হচ্ছে...' : 'সার্চ করুন'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">সাম্প্রতিক অর্ডারসমূহ</h3>
            <span className="px-4 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
              মোট: {orders.length}
            </span>
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-500 font-bold">এই নাম্বারে কোনো অর্ডার পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={order.id}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-200 transition-all group"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm p-2 group-hover:scale-110 transition-transform">
                      <img 
                        src={OPERATOR_DATA[order.operator as Operator]?.logo} 
                        alt={order.operator} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-xl font-black text-emerald-600">${order.operator[0]}</span>`;
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-2xl text-slate-900">৳{order.amount}</span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                          {order.operator}
                        </span>
                        {order.packages && (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            {order.packages.name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(order.created_at).toLocaleDateString('bn-BD')}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(order.created_at).toLocaleTimeString('bn-BD')}
                        </div>
                        <div className="flex items-center gap-1.5 uppercase tracking-widest text-slate-500">
                          <CreditCard className="w-3.5 h-3.5" />
                          {order.payment_method}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <div className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm font-black shadow-sm",
                      getStatusColor(order.status)
                    )}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status === 'pending' ? 'পেন্ডিং' : order.status === 'completed' ? 'সফল' : 'বাতিল'}</span>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                      ID: {order.transaction_id}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
