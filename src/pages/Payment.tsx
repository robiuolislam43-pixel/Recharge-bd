import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { PaymentMethod, Operator } from '@/src/types';
import { OPERATOR_DATA } from '@/src/constants';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { CheckCircle2, CreditCard, ArrowLeft, ShieldCheck, Smartphone, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; color: string; bgColor: string }[] = [
  { id: 'bKash', label: 'বিকাশ', color: 'bg-[#D12053]', bgColor: 'bg-pink-50' },
  { id: 'Nagad', label: 'নগদ', color: 'bg-[#F7941D]', bgColor: 'bg-orange-50' },
  { id: 'Rocket', label: 'রকেট', color: 'bg-[#8C3494]', bgColor: 'bg-purple-50' },
];

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    mobileNumber: string;
    operator: string;
    amount: number;
    packageId?: string;
    packageName?: string;
    type: string;
  };

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!state) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <Info className="w-10 h-10 text-slate-400" />
        </div>
        <p className="text-slate-500 font-bold">পেমেন্টের কোনো তথ্য পাওয়া যায়নি।</p>
        <Button onClick={() => navigate('/')} className="rounded-xl">হোমে ফিরে যান</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      toast.error('অনুগ্রহ করে পেমেন্ট মেথড সিলেক্ট করুন');
      return;
    }
    if (!transactionId.trim()) {
      toast.error('Transaction ID দিন');
      return;
    }

    setLoading(true);
    try {
      const { data: existingTx } = await supabase
        .from('orders')
        .select('id')
        .eq('transaction_id', transactionId)
        .single();

      if (existingTx) {
        toast.error('এই Transaction ID টি ইতিমধ্যে ব্যবহার করা হয়েছে।');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('orders').insert([
        {
          mobile_number: state.mobileNumber,
          operator: state.operator,
          package_id: state.packageId || null,
          amount: state.amount,
          payment_method: paymentMethod,
          transaction_id: transactionId,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      toast.success('অর্ডার সফলভাবে সম্পন্ন হয়েছে!');
    } catch (error: any) {
      toast.error('পেমেন্ট ব্যর্থ হয়েছে: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md mx-auto text-center space-y-8 py-20"
      >
        <div className="relative">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl -z-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">পেমেন্ট সফল হয়েছে!</h2>
          <p className="text-slate-500 font-medium">
            আপনার রিচার্জ অনুরোধটি পেন্ডিং অবস্থায় আছে। অ্যাডমিন ভেরিফাই করার পর রিচার্জ পৌঁছে যাবে।
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button variant="outline" onClick={() => navigate('/')} className="h-14 rounded-2xl font-bold border-2">
            নতুন রিচার্জ
          </Button>
          <Button onClick={() => navigate('/history')} className="h-14 rounded-2xl font-bold bg-emerald-600 shadow-lg shadow-emerald-100">
            হিস্ট্রি দেখুন
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> ফিরে যান
        </button>
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">নিরাপদ পেমেন্ট গেটওয়ে</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-600" />
            <CardHeader>
              <CardTitle className="text-xl font-black">পেমেন্ট সম্পন্ন করুন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">পেমেন্ট মেথড সিলেক্ট করুন</label>
                <div className="grid grid-cols-3 gap-4">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "group relative py-6 px-4 rounded-2xl font-black text-sm transition-all border-2 overflow-hidden",
                        paymentMethod === method.id
                          ? `border-slate-900 ${method.color} text-white shadow-xl`
                          : "border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200"
                      )}
                    >
                      <div className="relative z-10">{method.label}</div>
                      {paymentMethod === method.id && (
                        <motion.div 
                          layoutId="active-bg"
                          className="absolute inset-0 bg-black/10"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {paymentMethod && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-8"
                  >
                    <div className={cn("p-6 rounded-2xl border-2 border-dashed space-y-4", 
                      PAYMENT_METHODS.find(m => m.id === paymentMethod)?.bgColor,
                      "border-slate-200"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Info className="w-5 h-5 text-slate-900" />
                        </div>
                        <h4 className="font-black text-slate-900">নির্দেশনা:</h4>
                      </div>
                      <ol className="space-y-3 text-sm font-bold text-slate-700">
                        <li className="flex gap-3">
                          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">১</span>
                          আমাদের <strong>{paymentMethod}</strong> নাম্বারে <strong>৳{state.amount}</strong> সেন্ড মানি করুন: <br />
                          <span className="text-lg font-black text-slate-900 mt-1 block tracking-widest">01700-000000</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">২</span>
                          পেমেন্ট করার পর ফিরতি মেসেজ থেকে <strong>Transaction ID</strong> টি কপি করুন।
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">৩</span>
                          নিচের বক্সে আইডিটি দিয়ে সাবমিট করুন।
                        </li>
                      </ol>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Transaction ID</label>
                        <div className="relative group">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                          <Input
                            placeholder="যেমন: 8N2K9X1M"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                            className="pl-14 h-16 text-xl font-black border-slate-100 bg-slate-50/50 focus:bg-white rounded-2xl uppercase tracking-widest"
                            required
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-2xl text-xl font-black shadow-xl shadow-slate-200 transition-all hover:-translate-y-1" disabled={loading}>
                        {loading ? 'প্রসেসিং হচ্ছে...' : 'ভেরিফাই ও সাবমিট'}
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden sticky top-24">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-lg font-bold">অর্ডারের সারসংক্ষেপ</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg p-2">
                  <img 
                    src={OPERATOR_DATA[state.operator as Operator]?.logo} 
                    alt={state.operator} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-lg font-black text-emerald-600">${state.operator[0]}</span>`;
                    }}
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">মোবাইল নাম্বার</p>
                  <p className="text-xl font-black">{state.mobileNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50 font-bold uppercase tracking-wider">অপারেটর</span>
                  <span className="font-black bg-white/10 px-3 py-1 rounded-lg">{state.operator}</span>
                </div>
                {state.packageName && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/50 font-bold uppercase tracking-wider">প্যাকেজ</span>
                    <span className="font-black text-emerald-400">{state.packageName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50 font-bold uppercase tracking-wider">টাইপ</span>
                  <span className="font-black">{state.type}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">মোট পরিমাণ</p>
                  <p className="text-4xl font-black text-emerald-400">৳{state.amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">ভ্যাট অন্তর্ভুক্ত</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
