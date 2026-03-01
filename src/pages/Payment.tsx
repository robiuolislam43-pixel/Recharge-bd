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

const PAYMENT_METHODS: { id: PaymentMethod; label: string; color: string; bgColor: string; number: string }[] = [
  { id: 'bKash', label: 'বিকাশ', color: 'bg-[#D12053]', bgColor: 'bg-pink-50', number: '01924830869' },
  { id: 'Nagad', label: 'নগদ', color: 'bg-[#F7941D]', bgColor: 'bg-orange-50', number: '01611458634' },
  { id: 'Rocket', label: 'রকেট', color: 'bg-[#8C3494]', bgColor: 'bg-purple-50', number: '01834197950' },
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
      className="max-w-6xl mx-auto space-y-10 pb-20"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 px-4 sm:px-0">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center text-[10px] sm:text-sm font-black text-slate-500 hover:text-emerald-600 transition-all bg-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-x-1"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> ফিরে যান
        </button>
        <div className="flex items-center gap-2 sm:gap-3 text-emerald-600 bg-emerald-50 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-emerald-100 shadow-lg shadow-emerald-100/50">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[8px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">নিরাপদ পেমেন্ট গেটওয়ে</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 px-4 sm:px-0">
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden">
            <div className="h-2 sm:h-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
            <CardHeader className="p-6 sm:p-10 pb-0">
              <CardTitle className="text-xl sm:text-3xl font-black flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                পেমেন্ট সম্পন্ন করুন
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 space-y-8 sm:space-y-10">
              <div className="space-y-3 sm:space-y-4">
                <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">পেমেন্ট মেথড সিলেক্ট করুন</label>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "group relative py-6 sm:py-8 px-2 sm:px-4 rounded-2xl sm:rounded-3xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all border-2 overflow-hidden",
                        paymentMethod === method.id
                          ? `border-slate-900 ${method.color} text-white shadow-2xl shadow-slate-900/20 -translate-y-1`
                          : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white"
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10"
                  >
                    <div className={cn("p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border-4 border-dashed space-y-6", 
                      PAYMENT_METHODS.find(m => m.id === paymentMethod)?.bgColor,
                      "border-slate-100"
                    )}>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200/50">
                          <Info className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-widest">নির্দেশনা:</h4>
                      </div>
                      <ol className="space-y-4">
                        {[
                          { 
                            step: 1, 
                            text: <>আমাদের <strong>{paymentMethod}</strong> নাম্বারে <strong>৳{state.amount}</strong> সেন্ড মানি করুন:</>, 
                            extra: (
                              <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 block tracking-tighter">
                                {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.number}
                              </span>
                            ) 
                          },
                          { step: 2, text: <>পেমেন্ট করার পর ফিরতি মেসেজ থেকে <strong>Transaction ID</strong> টি কপি করুন।</> },
                          { step: 3, text: <>নিচের বক্সে আইডিটি দিয়ে সাবমিট করুন।</> }
                        ].map((item, i) => (
                          <li key={i} className="flex gap-3 sm:gap-4">
                            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white flex items-center justify-center shrink-0 shadow-lg shadow-slate-200/50 font-black text-slate-900 text-sm">{item.step}</span>
                            <div className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed pt-1">
                              {item.text}
                              {item.extra}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                      <div className="space-y-3 sm:space-y-4">
                        <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</label>
                        <div className="relative group">
                          <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-3">
                            <CreditCard className="h-5 w-5 sm:h-7 sm:w-7 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            <div className="h-6 sm:h-8 w-px bg-slate-100" />
                          </div>
                          <Input
                            placeholder="যেমন: 8N2K9X1M"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                            className="pl-12 sm:pl-20 h-16 sm:h-20 text-xl sm:text-2xl font-black border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-2xl sm:rounded-3xl transition-all placeholder:text-slate-200 uppercase tracking-widest"
                            required
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-16 sm:h-20 bg-slate-900 hover:bg-black text-white rounded-2xl sm:rounded-3xl text-lg sm:text-xl font-black shadow-2xl shadow-slate-900/20 transition-all hover:-translate-y-1 group" disabled={loading}>
                        {loading ? 'প্রসেসিং হচ্ছে...' : 'ভেরিফাই ও সাবমিট'}
                        {!loading && <CheckCircle2 className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />}
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 px-4 sm:px-0">
          <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden sticky top-24">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <CardHeader className="p-6 sm:p-10 border-b border-white/5">
              <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-widest text-slate-400">অর্ডারের সারসংক্ষেপ</CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 space-y-8 sm:space-y-10 relative z-10">
              <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-white/5 rounded-2xl sm:rounded-[2rem] border border-white/10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl p-2 sm:p-3">
                  <img 
                    src={OPERATOR_DATA[state.operator as Operator]?.logo} 
                    alt={state.operator} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-xl sm:text-2xl font-black text-emerald-600">${state.operator[0]}</span>`;
                    }}
                  />
                </div>
                <div>
                  <p className="text-[8px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1">মোবাইল নাম্বার</p>
                  <p className="text-2xl sm:text-3xl font-black tracking-tighter">{state.mobileNumber}</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {[
                  { label: 'অপারেটর', value: state.operator, highlight: false },
                  { label: 'প্যাকেজ', value: state.packageName || 'সাধারণ রিচার্জ', highlight: true },
                  { label: 'টাইপ', value: state.type, highlight: false }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                    <span className={cn(
                      "font-black text-xs sm:text-sm uppercase tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl",
                      item.highlight ? "text-emerald-400 bg-emerald-500/10" : "text-white bg-white/5"
                    )}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 sm:pt-10 border-t border-white/5 flex justify-between items-end">
                <div>
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2">মোট পরিমাণ</p>
                  <p className="text-4xl sm:text-6xl font-black text-emerald-400 tracking-tighter">৳{state.amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest">ভ্যাট অন্তর্ভুক্ত</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
