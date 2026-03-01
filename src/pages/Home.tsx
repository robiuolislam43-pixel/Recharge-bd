import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { detectOperator, cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';
import { Package, Operator, RechargeType } from '@/src/types';
import { OPERATOR_DATA } from '@/src/constants';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Smartphone, Wifi, PhoneCall, Package as PackageIcon, Zap, ArrowRight, ShieldCheck, Clock, CreditCard, History as HistoryIcon, Wallet, Gift, Headset, Star, TrendingUp, Bell } from 'lucide-react';
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
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

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
      className="max-w-6xl mx-auto space-y-10 pb-20"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl sm:rounded-[3rem] bg-slate-900 p-6 sm:p-12 md:p-16 text-white shadow-2xl shadow-slate-900/40">
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-500/20 rounded-full blur-[80px] sm:blur-[120px] -mr-32 sm:-mr-64 -mt-32 sm:-mt-64" />
        <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-blue-500/10 rounded-full blur-[60px] sm:blur-[100px] -ml-20 sm:-ml-32 -mb-20 sm:-mb-32" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-emerald-500/10 text-emerald-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-full border border-emerald-500/20">
                Premium Recharge Solution
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mt-4 sm:mt-6 leading-[0.9]">
                সহজ রিচার্জ <br />
                <span className="text-emerald-400">Shohoj Recharge</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-lg font-medium mt-6 sm:mt-8 leading-relaxed max-w-md">
                বাংলাদেশের সব অপারেটরের জন্য দ্রুততম এবং সবচেয়ে নিরাপদ রিচার্জ প্ল্যাটফর্ম। আপনার প্রতিটি রিচার্জ হোক সহজ।
              </p>
            </motion.div>

            <div className="flex flex-wrap gap-3 sm:gap-6 pt-2 sm:pt-4">
              <div className="flex items-center gap-2 sm:gap-3 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest">১০০% নিরাপদ</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest">তাৎক্ষণিক</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Recharge Form */}
        <div className="lg:col-span-8 space-y-10">
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden">
            <div className="h-2 sm:h-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
            <CardHeader className="p-6 sm:p-10 pb-0">
              <CardTitle className="text-xl sm:text-2xl font-black flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
                রিচার্জ করুন
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 space-y-8 sm:space-y-10">
              {/* Mobile Number Input */}
              <div className="space-y-3 sm:space-y-4">
                <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">মোবাইল নাম্বার</label>
                <div className="relative group">
                  <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-3">
                    <Smartphone className="h-5 w-5 sm:h-7 sm:w-7 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <div className="h-6 sm:h-8 w-px bg-slate-100" />
                  </div>
                  <Input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className="pl-14 sm:pl-20 h-16 sm:h-20 text-xl sm:text-3xl font-black border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-2xl sm:rounded-3xl transition-all placeholder:text-slate-200"
                  />
                  {operator && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-3"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 shadow-xl bg-white p-1.5 sm:p-2 flex items-center justify-center">
                        <img 
                          src={OPERATOR_DATA[operator].logo} 
                          alt={operator} 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Recharge Types */}
              <div className="space-y-3 sm:space-y-4">
                <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">রিচার্জের ধরণ</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {RECHARGE_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isActive = rechargeType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setRechargeType(type.id)}
                        className={cn(
                          "group flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all duration-500",
                          isActive
                            ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-xl shadow-emerald-100/50 -translate-y-1"
                            : "border-slate-50 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 transition-all duration-500",
                          isActive ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 rotate-6" : type.color
                        )}>
                          <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Content: Regular or Packages */}
              <AnimatePresence mode="wait">
                {rechargeType === 'Regular' ? (
                  <motion.div 
                    key="regular"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6 sm:space-y-8 pt-8 sm:pt-10 border-t border-slate-50"
                  >
                    <div className="space-y-3 sm:space-y-4">
                      <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">টাকার পরিমাণ (৳)</label>
                      <div className="relative group">
                        <span className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-black text-slate-200">৳</span>
                        <Input
                          type="number"
                          placeholder="পরিমাণ লিখুন"
                          value={regularAmount}
                          onChange={(e) => setRegularAmount(e.target.value)}
                          className="pl-10 sm:pl-14 h-16 sm:h-20 text-2xl sm:text-3xl font-black border-slate-100 bg-slate-50/50 focus:bg-white rounded-2xl sm:rounded-3xl"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                        {[20, 50, 100, 200, 500].map(amt => (
                          <button 
                            key={amt}
                            onClick={() => setRegularAmount(amt.toString())}
                            className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-100 bg-white text-xs sm:text-sm font-black text-slate-500 hover:border-emerald-500 hover:text-emerald-600 hover:shadow-lg hover:shadow-emerald-100 transition-all"
                          >
                            ৳{amt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full h-16 sm:h-20 bg-slate-900 hover:bg-black text-white rounded-2xl sm:rounded-3xl text-lg sm:text-xl font-black shadow-2xl shadow-slate-900/20 transition-all hover:-translate-y-1 group" onClick={handleProceedRegular}>
                      পেমেন্ট করুন 
                      <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="packages"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6 pt-10 border-t border-slate-50"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">উপলব্ধ প্যাকেজসমূহ</h3>
                      {operator && (
                        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                          <div className="w-5 h-5 rounded-lg overflow-hidden border border-emerald-100 bg-white p-0.5">
                            <img 
                              src={OPERATOR_DATA[operator].logo} 
                              alt={operator} 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{operator}</span>
                        </div>
                      )}
                    </div>
                    
                    {!operator ? (
                      <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border-4 border-dashed border-slate-100">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                          <Smartphone className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">প্যাকেজ দেখতে মোবাইল নাম্বার দিন</p>
                      </div>
                    ) : loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-3xl" />
                        ))}
                      </div>
                    ) : packages.length === 0 ? (
                      <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border-4 border-dashed border-slate-100">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">এই ক্যাটাগরিতে কোনো প্যাকেজ পাওয়া যায়নি</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
                        {packages.map((pkg) => (
                          <motion.div 
                            whileHover={{ scale: 1.01, y: -2 }}
                            key={pkg.id} 
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 rounded-3xl sm:rounded-[2rem] border border-slate-100 bg-white hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-100 transition-all group relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                            
                            <div className="space-y-3 sm:space-y-2 w-full sm:w-auto relative z-10">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                                </div>
                                <div>
                                  <h4 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">{pkg.name}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest">{pkg.type}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-4 h-4 rounded-md overflow-hidden border border-slate-100 bg-white p-0.5">
                                        <img 
                                          src={OPERATOR_DATA[pkg.operator as Operator].logo} 
                                          alt={pkg.operator} 
                                          className="w-full h-full object-contain"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                      <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{pkg.operator}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 sm:gap-4">
                                <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                  <Clock className="w-3 h-3 text-emerald-500" /> {pkg.validity}
                                </span>
                                <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                  <TrendingUp className="w-3 h-3" /> বেস্ট সেলার
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50 mt-4 sm:mt-0 relative z-10">
                              <div className="flex flex-col sm:items-end">
                                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">মূল্য</span>
                                <span className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tighter leading-none">৳{pkg.price}</span>
                              </div>
                              <Button 
                                onClick={() => handleBuyPackage(pkg)}
                                className="bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest px-6 sm:px-8 h-12 sm:h-14 shadow-xl shadow-slate-900/10 transition-all group-hover:-translate-y-1 flex items-center gap-2"
                              >
                                কিনুন
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
        </div>

        {/* Right Column: Widgets */}
        <div className="lg:col-span-4 space-y-10">
          {/* Support Widget */}
          <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden border border-slate-100">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Headset className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">সাহায্য প্রয়োজন?</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">২৪/৭ কাস্টমার সাপোর্ট</p>
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">যেকোনো রিচার্জ বা পেমেন্ট সংক্রান্ত সমস্যায় আমাদের সাপোর্ট টিমের সাথে সরাসরি কথা বলুন।</p>
              <Button 
                onClick={() => window.open('https://wa.me/8801924830869', '_blank')}
                variant="outline" 
                className="w-full border-slate-100 hover:bg-slate-50 hover:border-blue-500 hover:text-blue-600 rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest transition-all"
              >
                সাপোর্ট টিমের সাথে চ্যাট করুন
              </Button>
            </CardContent>
          </Card>

          {/* Operators List */}
          <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden border border-slate-100">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-400">অপারেটরসমূহ</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(OPERATOR_DATA) as Operator[]).map(op => (
                  <div key={op} className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-white transition-all group">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                      <img 
                        src={OPERATOR_DATA[op].logo} 
                        alt={op} 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{OPERATOR_DATA[op].name || op}</span>
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
