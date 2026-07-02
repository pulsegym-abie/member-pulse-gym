import React from 'react';
import { motion } from 'motion/react';
import { GymRegistration, MembershipPackage } from '../types';
import { MEMBERSHIP_PACKAGES } from '../data';
import { Dumbbell, ShieldCheck, QrCode, Calendar, Sparkles, Smartphone } from 'lucide-react';

interface MembershipCardViewProps {
  registration: GymRegistration;
  className?: string;
}

export const MembershipCardView: React.FC<MembershipCardViewProps> = ({
  registration,
  className = ''
}) => {
  const pkg = MEMBERSHIP_PACKAGES.find(p => p.id === registration.packageId) || MEMBERSHIP_PACKAGES[0];

  // Formatting dates to beautiful readable format in English
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Get specific gradients/styles for the Apple Wallet look
  const getCardTheme = (pkgId: string) => {
    switch (pkgId) {
      case 'day_pass':
        return {
          gradient: 'from-sky-500 via-sky-600 to-sky-800',
          accentColor: 'text-sky-200',
          badgeText: 'DAY PASS',
          textContrast: 'text-sky-100',
          glow: 'shadow-sky-500/20'
        };
      case 'three_day_passes':
        return {
          gradient: 'from-indigo-500 via-indigo-600 to-indigo-800',
          accentColor: 'text-indigo-200',
          badgeText: '3-DAY PASS',
          textContrast: 'text-indigo-100',
          glow: 'shadow-indigo-500/20'
        };
      case 'one_week':
        return {
          gradient: 'from-emerald-500 via-emerald-600 to-emerald-800',
          accentColor: 'text-emerald-200',
          badgeText: 'WEEKLY MEMBER',
          textContrast: 'text-emerald-100',
          glow: 'shadow-emerald-500/20'
        };
      case 'two_weeks':
        return {
          gradient: 'from-purple-500 via-purple-600 to-purple-800',
          accentColor: 'text-purple-200',
          badgeText: 'BI-WEEKLY',
          textContrast: 'text-purple-100',
          glow: 'shadow-purple-500/20'
        };
      case 'four_weeks':
      default:
        return {
          gradient: 'from-amber-500 via-orange-600 to-amber-800',
          accentColor: 'text-amber-200',
          badgeText: '4-WEEK MEMBER',
          textContrast: 'text-amber-100',
          glow: 'shadow-amber-500/30'
        };
    }
  };

  const cardTheme = getCardTheme(registration.packageId);

  // Generate an array of heights for an authentic looking barcode
  const barcodeBars = [
    2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 2, 3, 2, 1, 4, 3, 2, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2
  ];

  return (
    <div className={`relative flex flex-col items-center justify-center w-full max-w-md mx-auto py-4 ${className}`}>
      {/* Light shine reflection effect on the card */}
      <motion.div
        initial={{ y: 50, opacity: 0, rotateX: 15 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
        className={`
          relative w-full aspect-[1.58/1] bg-gradient-to-br ${cardTheme.gradient}
          rounded-[24px] p-6 text-white shadow-2xl ${cardTheme.glow}
          flex flex-col justify-between overflow-hidden border border-white/10
          backface-hidden transform-gpu
        `}
      >
        {/* Shine Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/10 to-transparent rotate-12 blur-xl pointer-events-none" />

        {/* Top bar of pass */}
        <div className="flex items-start justify-between z-10">
          <div className="flex items-center space-x-2.5">
            <div className="bg-white/15 p-2 rounded-xl backdrop-blur-md border border-white/10">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-widest text-white">PULSE POWERHUB</h3>
              <p className="text-[10px] tracking-wider text-white/70 font-semibold uppercase">Premium Kiosk</p>
            </div>
          </div>
          
          <div className="bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span className="text-[10px] font-extrabold tracking-wider uppercase">
              {cardTheme.badgeText}
            </span>
          </div>
        </div>

        {/* Middle bar of pass */}
        <div className="my-3 z-10">
          <p className="text-[10px] font-bold tracking-widest text-white/60 uppercase">MEMBER NAME</p>
          <h2 className="text-lg md:text-xl font-extrabold tracking-tight mt-0.5 truncate uppercase">
            {registration.name}
          </h2>
        </div>

        {/* Bottom bar of pass */}
        <div className="grid grid-cols-3 gap-2 border-t border-white/15 pt-3 z-10">
          <div>
            <p className="text-[9px] font-bold tracking-wider text-white/50 uppercase">MEMBER ID</p>
            <p className="text-xs font-mono font-bold mt-0.5 tracking-wider truncate">
              {registration.id}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold tracking-wider text-white/50 uppercase">JOINED</p>
            <p className="text-xs font-bold mt-0.5 truncate">
              {formatDate(registration.registrationDate)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold tracking-wider text-white/50 uppercase">EXPIRES</p>
            <p className="text-xs font-bold mt-0.5 text-yellow-200 truncate">
              {formatDate(registration.expirationDate)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Barcode/QR Code Ticket Section - typical Apple Wallet back attachment */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-[90%] -mt-6 bg-white rounded-b-2xl border-x border-b border-slate-100 shadow-lg px-6 pt-8 pb-4 flex flex-col items-center space-y-3 text-center z-0"
      >
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          SCAN QR CODE TO VISIT WEBSITE
        </p>

        {/* Dynamic QR Code Design */}
        <div className="flex flex-col items-center space-y-1.5 w-full">
          <a 
            href="https://pulsepowerhub.id" 
            target="_blank" 
            referrerPolicy="no-referrer"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center justify-center p-2.5 bg-slate-50 hover:bg-[#007AFF]/5 rounded-2xl transition border border-slate-100 hover:border-[#007AFF]/20 shadow-sm cursor-pointer"
            title="Click to visit pulsepowerhub.id"
          >
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fpulsepowerhub.id" 
              alt="https://pulsepowerhub.id" 
              className="w-24 h-24 md:w-28 md:h-28 object-contain rounded-lg transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white text-[10px] font-extrabold tracking-wider bg-[#007AFF] px-2.5 py-1.5 rounded-full shadow-md flex items-center space-x-1">
                <span>Visit Site</span>
                <Sparkles className="w-3 h-3" />
              </span>
            </div>
          </a>
          <span className="font-mono text-[9px] tracking-wider text-slate-400 font-bold">
            https://pulsepowerhub.id
          </span>
        </div>

        <div className="flex items-center justify-center space-x-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>STATUS: ACTIVE & VERIFIED</span>
        </div>
      </motion.div>
    </div>
  );
};
