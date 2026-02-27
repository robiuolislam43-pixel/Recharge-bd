import React from 'react';
import { motion } from 'motion/react';
import { Smartphone } from 'lucide-react';

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 1,
          ease: "easeOut",
          staggerChildren: 0.2
        }}
        className="relative flex flex-col items-center gap-8"
      >
        {/* Logo Icon */}
        <motion.div
          initial={{ y: 20, opacity: 0, rotate: -10 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
          className="w-28 h-28 bg-white rounded-[3rem] flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.4)] relative overflow-hidden group"
        >
          <Smartphone className="w-14 h-14 text-emerald-600 relative z-10" />
          <motion.div 
            animate={{ 
              x: ["-100%", "200%"],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2, 
              ease: "linear",
              repeatDelay: 1
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent skew-x-12"
          />
          <div className="absolute inset-0 rounded-[3rem] border-4 border-emerald-400/20" />
        </motion.div>

        {/* Text Logo */}
        <div className="flex flex-col items-center space-y-2">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center"
          >
            <h1 className="text-5xl font-black tracking-tighter text-white leading-none">
              সহজ রিচার্জ
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-px w-8 bg-emerald-500/50" />
              <span className="text-xl font-black text-emerald-400 tracking-widest uppercase">Fast & Secure</span>
              <div className="h-px w-8 bg-emerald-500/50" />
            </div>
          </motion.div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-[10px] font-black text-white uppercase tracking-[0.5em]"
          >
            Shohoj Recharge
          </motion.span>
        </div>

        {/* Loading Bar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 200, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
          className="h-1 bg-emerald-500/20 rounded-full overflow-hidden mt-4"
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5, 
              ease: "linear" 
            }}
            className="h-full w-1/2 bg-emerald-500"
          />
        </motion.div>
      </motion.div>

      {/* Footer Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 text-[10px] font-black text-white uppercase tracking-[0.2em]"
      >
        Premium Recharge Solution
      </motion.p>
    </motion.div>
  );
}
