import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        if (data.user.email !== 'xmlrifat@gmail.com') {
          await supabase.auth.signOut();
          toast.error('আপনি এই প্যানেলে প্রবেশের জন্য অনুমোদিত নন।');
          return;
        }
        toast.success('অ্যাডমিন লগইন সফল হয়েছে!');
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      toast.error('লগইন ব্যর্থ হয়েছে: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[80vh] flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md border-none shadow-2xl bg-slate-900 text-white overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-2 border border-white/10 shadow-inner">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight">অ্যাডমিন লগইন</CardTitle>
            <p className="text-slate-400 font-medium">স্মার্ট রিচার্জ ড্যাশবোর্ডে নিরাপদ প্রবেশ</p>
          </div>
        </CardHeader>
        <CardContent className="p-10 pt-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ইমেইল ঠিকানা</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-2xl text-white placeholder:text-slate-600"
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">পাসওয়ার্ড</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-2xl text-white placeholder:text-slate-600"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-2xl text-lg font-black shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1" disabled={loading}>
              {loading ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন'}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              শুধুমাত্র অনুমোদিত অ্যাডমিনদের জন্য
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
