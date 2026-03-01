import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Order, Operator, Package, RechargeType } from '@/src/types';
import { OPERATOR_DATA } from '@/src/constants';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { LogOut, CheckCircle, XCircle, Clock, DollarSign, ListOrdered, Activity as ActivityIcon, Smartphone, CreditCard, Calendar, Plus, Trash2, Package as PackageIcon, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const tableRef = React.useRef<HTMLDivElement>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'packages'>('orders');
  
  // New Package Form State
  const [newPkg, setNewPkg] = useState({
    operator: 'Grameenphone' as Operator,
    type: 'Internet' as RechargeType,
    name: '',
    price: '',
    validity: ''
  });

  const [stats, setStats] = useState({
    totalIncome: 0,
    pendingCount: 0,
    completedCount: 0,
    rejectedCount: 0,
  });

  useEffect(() => {
    checkUser();
    fetchData();
    
    const ordersSub = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        fetchOrders();
      })
      .subscribe();

    const packagesSub = supabase
      .channel('public:packages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packages' }, payload => {
        fetchPackages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSub);
      supabase.removeChannel(packagesSub);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchOrders(), fetchPackages()]);
    setLoading(false);
  };

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

  const downloadPDF = async () => {
    if (orders.length === 0) {
      toast.error('ডাউনলোড করার মতো কোনো তথ্য নেই');
      return;
    }
    
    const loadingToast = toast.loading('পিডিএফ তৈরি হচ্ছে...');
    try {
      // Create a container for the report
      const reportContainer = document.createElement('div');
      reportContainer.style.position = 'absolute';
      reportContainer.style.top = '-9999px'; // Move far off-screen
      reportContainer.style.left = '0';
      reportContainer.style.width = '1000px';
      reportContainer.style.backgroundColor = '#ffffff';
      reportContainer.style.padding = '40px';
      reportContainer.style.color = '#000000';
      reportContainer.style.zIndex = '-1000';
      
      // Use standard fonts and simple styles for better capture compatibility
      reportContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; width: 100%; background: white;">
          <div style="border-bottom: 5px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="font-size: 40px; font-weight: bold; color: #0f172a; margin: 0;">সহজ রিচার্জ</h1>
              <p style="font-size: 16px; color: #10b981; font-weight: bold; margin: 5px 0 0 0;">অ্যাডমিন রিপোর্ট - রিচার্জ হিস্ট্রি</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 14px; color: #64748b; margin: 0;">রিপোর্ট জেনারেট হয়েছে:</p>
              <p style="font-size: 16px; color: #0f172a; font-weight: bold; margin: 5px 0 0 0;">${new Date().toLocaleString('bn-BD')}</p>
            </div>
          </div>

          <div style="display: flex; gap: 20px; margin-bottom: 30px;">
            <div style="flex: 1; background: #f8fafc; padding: 20px; border-radius: 15px; border: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: bold;">মোট আয়</p>
              <p style="font-size: 24px; color: #0f172a; font-weight: bold; margin: 5px 0 0 0;">৳${stats.totalIncome.toLocaleString()}</p>
            </div>
            <div style="flex: 1; background: #ecfdf5; padding: 20px; border-radius: 15px; border: 1px solid #d1fae5; text-align: center;">
              <p style="font-size: 12px; color: #047857; margin: 0; font-weight: bold;">সফল অর্ডার</p>
              <p style="font-size: 24px; color: #065f46; font-weight: bold; margin: 5px 0 0 0;">${stats.completedCount}</p>
            </div>
            <div style="flex: 1; background: #fef3c7; padding: 20px; border-radius: 15px; border: 1px solid #fef3c7; text-align: center;">
              <p style="font-size: 12px; color: #b45309; margin: 0; font-weight: bold;">পেন্ডিং</p>
              <p style="font-size: 24px; color: #92400e; font-weight: bold; margin: 5px 0 0 0;">${stats.pendingCount}</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #0f172a; color: #ffffff;">
                <th style="padding: 15px; text-align: left; font-size: 14px; border: 1px solid #0f172a;">তারিখ</th>
                <th style="padding: 15px; text-align: left; font-size: 14px; border: 1px solid #0f172a;">নাম্বার</th>
                <th style="padding: 15px; text-align: left; font-size: 14px; border: 1px solid #0f172a;">অপারেটর</th>
                <th style="padding: 15px; text-align: left; font-size: 14px; border: 1px solid #0f172a;">পরিমাণ</th>
                <th style="padding: 15px; text-align: left; font-size: 14px; border: 1px solid #0f172a;">মেথড</th>
                <th style="padding: 15px; text-align: left; font-size: 14px; border: 1px solid #0f172a;">ট্রানজেকশন আইডি</th>
                <th style="padding: 15px; text-align: center; font-size: 14px; border: 1px solid #0f172a;">অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map((order, i) => `
                <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 12px;">${new Date(order.created_at).toLocaleDateString('bn-BD')}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 13px; font-weight: bold;">${order.mobile_number}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 12px;">${order.operator}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 14px; font-weight: bold;">৳${order.amount}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 12px;">${order.payment_method}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 11px; font-family: monospace;">${order.transaction_id}</td>
                  <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center; font-size: 12px; font-weight: bold;">
                    ${order.status === 'completed' ? 'সফল' : order.status === 'pending' ? 'পেন্ডিং' : 'বাতিল'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 50px; border-top: 2px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8;">
            <p>© ${new Date().getFullYear()} Shohoj Recharge BD</p>
            <p>System Generated Official Report</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(reportContainer);
      
      // Give it time to render
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const canvas = await html2canvas(reportContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1000,
        height: reportContainer.offsetHeight
      });
      
      document.body.removeChild(reportContainer);
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages if necessary
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`SR-Report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('রিপোর্ট ডাউনলোড সফল হয়েছে', { id: loadingToast });
    } catch (error) {
      console.error('PDF Error:', error);
      toast.error('রিপোর্ট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', { id: loadingToast });
      
      // Cleanup if error occurs
      const existing = document.getElementById('pdf-report-container');
      if (existing) document.body.removeChild(existing);
    }
  };

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('operator', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      toast.error('প্যাকেজ লোড করতে সমস্যা হয়েছে: ' + error.message);
    }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkg.name || !newPkg.price || !newPkg.validity) {
      toast.error('সবগুলো ঘর পূরণ করুন');
      return;
    }

    try {
      const { error } = await supabase
        .from('packages')
        .insert([{
          operator: newPkg.operator,
          type: newPkg.type,
          name: newPkg.name,
          price: Number(newPkg.price),
          validity: newPkg.validity
        }]);

      if (error) throw error;
      toast.success('নতুন প্যাকেজ যোগ করা হয়েছে');
      setNewPkg({
        operator: 'Grameenphone',
        type: 'Internet',
        name: '',
        price: '',
        validity: ''
      });
      fetchPackages();
    } catch (error: any) {
      toast.error('প্যাকেজ যোগ করতে সমস্যা হয়েছে: ' + error.message);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই প্যাকেজটি মুছে ফেলতে চান?')) return;

    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('প্যাকেজ মুছে ফেলা হয়েছে');
      fetchPackages();
    } catch (error: any) {
      toast.error('প্যাকেজ মুছতে সমস্যা হয়েছে: ' + error.message);
    }
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 sm:px-0">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">রিচার্জ অনুরোধগুলো পরিচালনা করুন এবং প্যাকেজ ম্যানেজ করুন</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={cn(
                "flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'orders' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-900"
              )}
            >
              অর্ডার
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={cn(
                "flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'packages' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-900"
              )}
            >
              প্যাকেজ
            </button>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center justify-center gap-2 rounded-xl border-2 font-black h-12 px-6 w-full sm:w-auto">
            <LogOut className="w-4 h-4" /> লগআউট
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
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
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden group rounded-2xl sm:rounded-3xl">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-5 text-center sm:text-left">
                <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.lightColor)}>
                  <stat.icon className={cn("w-6 h-6 sm:w-7 sm:h-7", stat.color.replace('bg-', 'text-'))} />
                </div>
                <div>
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-lg sm:text-2xl font-black text-slate-900">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {activeTab === 'orders' ? (
        <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden mx-4 sm:mx-0">
          <CardHeader className="border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-widest text-slate-400">সাম্প্রতিক অর্ডারসমূহ</CardTitle>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">লাইভ আপডেট</span>
              </div>
            </div>
            <Button 
              onClick={downloadPDF}
              variant="outline"
              className="flex items-center gap-2 rounded-xl border-2 font-black text-[10px] sm:text-xs uppercase tracking-widest h-10 sm:h-12 px-4 sm:px-6 hover:bg-slate-900 hover:text-white transition-all"
            >
              <Download className="w-4 h-4" /> রিপোর্ট ডাউনলোড
            </Button>
          </CardHeader>
          <CardContent className="p-0" ref={tableRef}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-50">
                    <th className="px-4 sm:px-8 py-4 sm:py-5 font-black">তারিখ ও সময়</th>
                    <th className="px-4 sm:px-8 py-4 sm:py-5 font-black">গ্রাহক</th>
                    <th className="px-4 sm:px-8 py-4 sm:py-5 font-black">বিস্তারিত</th>
                    <th className="px-4 sm:px-8 py-4 sm:py-5 font-black">পেমেন্ট</th>
                    <th className="px-4 sm:px-8 py-4 sm:py-5 font-black">স্ট্যাটাস</th>
                    <th className="px-4 sm:px-8 py-4 sm:py-5 font-black text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 sm:px-8 py-16 sm:py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <ListOrdered className="w-10 h-10 sm:w-12 sm:h-12 text-slate-100" />
                          <p className="text-xs sm:text-sm text-slate-400 font-black uppercase tracking-widest">এখনো কোনো অর্ডার আসেনি</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="bg-white hover:bg-slate-50 transition-colors group">
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
                            <div className="text-[10px] sm:text-xs font-bold text-slate-500">
                              {new Date(order.created_at).toLocaleString('bn-BD')}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-slate-100 rounded-lg sm:rounded-xl flex items-center justify-center p-1 sm:p-1.5 group-hover:scale-110 transition-transform shadow-sm">
                              <img 
                                src={OPERATOR_DATA[order.operator as Operator]?.logo} 
                                alt={order.operator} 
                                className="w-full h-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <div className="font-black text-sm sm:text-base text-slate-900 tracking-tighter">{order.mobile_number}</div>
                              <div className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.operator}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <div className="font-black text-base sm:text-lg text-slate-900 tracking-tighter">৳{order.amount}</div>
                          {order.packages && (
                            <div className="text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest">{order.packages.name}</div>
                          )}
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                            <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300" />
                            <span className="font-black text-slate-900 uppercase text-[8px] sm:text-[10px] tracking-widest">{order.payment_method}</span>
                          </div>
                          <div className="text-[8px] sm:text-[10px] font-mono font-bold text-slate-400">TXN: {order.transaction_id}</div>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap text-right">
                          {order.status === 'pending' ? (
                            <div className="flex justify-end gap-1.5 sm:gap-2">
                              <Button 
                                size="sm" 
                                variant="success" 
                                onClick={() => handleStatusUpdate(order.id, 'completed')}
                                className="rounded-lg font-black text-[10px] sm:text-xs px-2 sm:px-4 h-8 sm:h-9"
                              >
                                সফল
                              </Button>
                              <Button 
                                size="sm" 
                                variant="danger" 
                                onClick={() => handleStatusUpdate(order.id, 'rejected')}
                                className="rounded-lg font-black text-[10px] sm:text-xs px-2 sm:px-4 h-8 sm:h-9"
                              >
                                বাতিল
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest">সম্পন্ন</span>
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-0">
          {/* Add Package Form */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden h-fit">
            <div className="h-2 bg-emerald-500" />
            <CardHeader className="p-6 sm:p-8 pb-0">
              <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-2 uppercase tracking-widest text-slate-400">
                <Plus className="w-5 h-5 text-emerald-600" />
                নতুন প্যাকেজ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleAddPackage} className="space-y-5 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">অপারেটর</label>
                  <select 
                    value={newPkg.operator}
                    onChange={(e) => setNewPkg({...newPkg, operator: e.target.value as Operator})}
                    className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 font-black text-xs focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  >
                    {(Object.keys(OPERATOR_DATA) as Operator[]).map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">টাইপ</label>
                  <select 
                    value={newPkg.type}
                    onChange={(e) => setNewPkg({...newPkg, type: e.target.value as RechargeType})}
                    className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 font-black text-xs focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  >
                    <option value="Internet">Internet</option>
                    <option value="Minute">Minute</option>
                    <option value="Bundle">Bundle</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">প্যাকেজের নাম</label>
                  <Input 
                    placeholder="যেমন: 1 GB Internet"
                    value={newPkg.name}
                    onChange={(e) => setNewPkg({...newPkg, name: e.target.value})}
                    className="h-12 rounded-xl font-black text-xs border-slate-100 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">মূল্য (৳)</label>
                    <Input 
                      type="number"
                      placeholder="৳"
                      value={newPkg.price}
                      onChange={(e) => setNewPkg({...newPkg, price: e.target.value})}
                      className="h-12 rounded-xl font-black text-xs border-slate-100 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">মেয়াদ</label>
                    <Input 
                      placeholder="যেমন: 7 Days"
                      value={newPkg.validity}
                      onChange={(e) => setNewPkg({...newPkg, validity: e.target.value})}
                      className="h-12 rounded-xl font-black text-xs border-slate-100 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-xl font-black shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-1">
                  প্যাকেজ যোগ করুন
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Package List */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-6 sm:p-8">
                <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-2 uppercase tracking-widest text-slate-400">
                  <PackageIcon className="w-5 h-5 text-emerald-600" />
                  বর্তমান প্যাকেজসমূহ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-50">
                        <th className="px-4 sm:px-8 py-4 sm:py-5 font-black">অপারেটর</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-5 font-black">প্যাকেজ</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-5 font-black">মূল্য</th>
                        <th className="px-4 sm:px-8 py-4 sm:py-5 font-black text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {packages.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 sm:px-8 py-16 sm:py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
                            কোনো প্যাকেজ পাওয়া যায়নি
                          </td>
                        </tr>
                      ) : (
                        packages.map((pkg) => (
                          <tr key={pkg.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-slate-100 rounded-lg sm:rounded-xl flex items-center justify-center p-1 sm:p-1.5 shadow-sm">
                                  <img 
                                    src={OPERATOR_DATA[pkg.operator]?.logo} 
                                    alt={pkg.operator} 
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <span className="font-black text-slate-900 text-xs sm:text-sm tracking-tighter">{pkg.operator}</span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <div className="font-black text-slate-900 text-xs sm:text-sm tracking-tighter">{pkg.name}</div>
                              <div className="text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest">{pkg.type} • {pkg.validity}</div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                              <span className="font-black text-base sm:text-lg text-slate-900 tracking-tighter">৳{pkg.price}</span>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap text-right">
                              <button 
                                onClick={() => handleDeletePackage(pkg.id)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  );
}
