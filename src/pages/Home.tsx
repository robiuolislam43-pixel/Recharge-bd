import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { detectOperator, cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';
import { Package, Operator, RechargeType } from '@/src/types';
import { OPERATOR_DATA } from '@/src/constants';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Smartphone, Wifi, PhoneCall, Package as PackageIcon, Zap, ArrowRight, ShieldCheck, Clock, CreditCard, History as HistoryIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const RECHARGE_TYPES: { id: RechargeType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'Regular', label: 'সাধারণ', icon: Zap, color: 'text-amber-500 bg-amber-50' },
  { id: 'Internet', label: 'ইন্টারনেট', icon: Wifi, color: 'text-blue-500 bg-blue-50' },
  { id: 'Minute', label: 'মিনিট', icon: PhoneCall, color: 'text-emerald-500 bg-emerald-50' },
  { id: 'Bundle', label: 'বান্ডেল', icon: PackageIcon, color: 'text-purple-500 bg-purple-50' },
];

export default function Home() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [operator, setOperator] = useState<Operator | null>(null);
  const [rechargeType, setRechargeType] = useState<RechargeType>('Regular');
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [regularAmount, setRegularAmount] = useState('');

  useEffect(() => {
    const detected = detectOperator(mobileNumber);
    setOperator(detected as Operator | null);
  }, [mobileNumber]);

  useEffect(() => {
    if (operator && rechargeType !== 'Regular') {
      fetchPackages();
    }
  }, [operator, rechargeType]);

  const fetchPackages = async () => {
    if (!operator) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('operator', operator)
        .eq('type', rechargeType);

      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      toast.error('প্যাকেজ লোড করতে সমস্যা হয়েছে: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedRegular = () => {
    if (mobileNumber.length !== 11) {
      toast.error('সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন');
      return;
    }
    if (!operator) {
      toast.error('অপারেটর খুঁজে পাওয়া যায়নি');
      return;
    }
    const amount = Number(regularAmount);
    if (!amount || amount < 10) {
      toast.error('সর্বনিম্ন রিচার্জ ১০ টাকা');
      return;
    }

    navigate('/payment', {
      state: {
        mobileNumber,
        operator,
        amount,
        type: 'Regular',
      },
    });
  };

  const handleBuyPackage = (pkg: Package) => {
    if (mobileNumber.length !== 11) {
      toast.error('সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন');
      return;
    }
    navigate('/payment', {
      state: {
        mobileNumber,
        operator,
        amount: pkg.price,
        packageId: pkg.id,
        packageName: pkg.name,
        type: pkg.type,
      },
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <section className="text-center space-y-6 py-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest rounded-full border border-emerald-100">
            দ্রুততম রিচার্জ সেবা
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mt-4 leading-tight">
            মুহূর্তেই রিচার্জ করুন <br />
            <span className="text-emerald-600">যেকোনো অপারেটরে</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto mt-6">
            বিকাশ, নগদ বা রকেটের মাধ্যমে বাংলাদেশের যেকোনো মোবাইল নাম্বারে রিচার্জ করুন নিরাপদে এবং দ্রুত।
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 pt-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-semibold">১০০% নিরাপদ</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-semibold">তাৎক্ষণিক রিচার্জ</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-semibold">সহজ পেমেন্ট</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <Card className="lg:col-span-3 border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              রিচার্জের তথ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">মোবাইল নাম্বার</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Smartphone className="h-6 w-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <span className="text-slate-300">|</span>
                </div>
                <Input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="pl-16 h-16 text-2xl font-bold border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-emerald-500/20 rounded-2xl transition-all"
                />
                {operator && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shadow-sm bg-white p-1 flex items-center justify-center">
                      <img 
                        src={OPERATOR_DATA[operator].logo} 
                        alt={operator} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-[10px] font-black text-emerald-600">${operator[0]}</span>`;
                        }}
                      />
                    </div>
                    <span className={cn(
                      "px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg",
                      OPERATOR_DATA[operator].bg
                    )}>
                      {operator}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">রিচার্জের ধরণ</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {RECHARGE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isActive = rechargeType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setRechargeType(type.id)}
                      className={cn(
                        "group flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300",
                        isActive
                          ? "border-emerald-600 bg-emerald-50/50 text-emerald-700 shadow-lg shadow-emerald-100"
                          : "border-slate-50 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110",
                        isActive ? "bg-emerald-600 text-white" : type.color
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {rechargeType === 'Regular' ? (
                <motion.div 
                  key="regular"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 pt-6 border-t border-slate-100"
                >
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">টাকার পরিমাণ (৳)</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-300">৳</span>
                      <Input
                        type="number"
                        placeholder="পরিমাণ লিখুন"
                        value={regularAmount}
                        onChange={(e) => setRegularAmount(e.target.value)}
                        className="pl-10 h-16 text-2xl font-bold border-slate-100 bg-slate-50/50 focus:bg-white rounded-2xl"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {[20, 50, 100, 200, 500].map(amt => (
                        <button 
                          key={amt}
                          onClick={() => setRegularAmount(amt.toString())}
                          className="px-4 py-2 rounded-xl border border-slate-100 bg-white text-sm font-bold text-slate-500 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                        >
                          ৳{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xl font-black shadow-xl shadow-emerald-200 transition-all hover:-translate-y-1" onClick={handleProceedRegular}>
                    পেমেন্ট করুন <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  key="packages"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 pt-6 border-t border-slate-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900">উপলব্ধ প্যাকেজসমূহ</h3>
                    {operator && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{operator}</span>}
                  </div>
                  
                  {!operator ? (
                    <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                      <Smartphone className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-400">প্যাকেজ দেখতে মোবাইল নাম্বার দিন</p>
                    </div>
                  ) : loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />
                      ))}
                    </div>
                  ) : packages.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                      <p className="text-sm font-bold text-slate-400">এই ক্যাটাগরিতে কোনো প্যাকেজ পাওয়া যায়নি</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {packages.map((pkg) => (
                        <motion.div 
                          whileHover={{ scale: 1.01 }}
                          key={pkg.id} 
                          className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all"
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 text-lg">{pkg.name}</h4>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> মেয়াদ: {pkg.validity}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="font-black text-2xl text-slate-900">৳{pkg.price}</span>
                            <Button 
                              onClick={() => handleBuyPackage(pkg)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-6 h-12 shadow-lg shadow-emerald-100"
                            >
                              কিনুন
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/20 rounded-full -ml-12 -mb-12 blur-xl" />
            <CardHeader>
              <CardTitle className="text-xl font-black">কেন আমাদের বেছে নিবেন?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold">সুপার ফাস্ট</h4>
                  <p className="text-emerald-50/80 text-sm">অর্ডার করার কয়েক মিনিটের মধ্যেই রিচার্জ পৌঁছে যাবে আপনার ফোনে।</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold">নিরাপদ পেমেন্ট</h4>
                  <p className="text-emerald-50/80 text-sm">বিকাশ, নগদ এবং রকেটের মাধ্যমে পেমেন্ট করুন নিশ্চিন্তে।</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <HistoryIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold">অর্ডার ট্র্যাকিং</h4>
                  <p className="text-emerald-50/80 text-sm">আপনার প্রতিটি অর্ডারের স্ট্যাটাস চেক করুন যেকোনো সময়।</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">অপারেটরসমূহ</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(OPERATOR_DATA) as Operator[]).map(op => (
                  <div key={op} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all group">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center p-1.5 group-hover:scale-110 transition-transform">
                      <img 
                        src={OPERATOR_DATA[op].logo} 
                        alt={op} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-xs font-black text-emerald-600">${op[0]}</span>`;
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{OPERATOR_DATA[op].name || op}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
