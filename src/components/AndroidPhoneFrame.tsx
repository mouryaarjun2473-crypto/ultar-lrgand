import React from 'react';
import { Wifi, Battery, Radio, Shield } from 'lucide-react';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  isArmed: boolean;
  batteryLevel: number;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  children,
  isArmed,
  batteryLevel,
}) => {
  return (
    <div className="flex justify-center items-center py-6 px-2 sm:px-4">
      {/* Outer Phone Bezel */}
      <div className="relative w-full max-w-[420px] rounded-[52px] bg-slate-950 p-3 sm:p-4 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800">
        {/* Hardware buttons simulation */}
        {/* Volume buttons */}
        <div className="absolute -left-1.5 top-28 w-1 h-12 bg-slate-600 rounded-l" />
        <div className="absolute -left-1.5 top-44 w-1 h-12 bg-slate-600 rounded-l" />
        {/* Power button */}
        <div className="absolute -right-1.5 top-36 w-1 h-14 bg-emerald-600 rounded-r" />

        {/* Screen Bezel / Glass */}
        <div className="relative overflow-hidden rounded-[40px] bg-slate-950 border border-slate-800 flex flex-col min-h-[780px] max-h-[860px]">
          {/* Top Status Bar */}
          <div className="bg-slate-950/90 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-300 font-mono z-20 shrink-0 border-b border-slate-900">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

            {/* Front Camera Punch-hole */}
            <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-950" />
            </div>

            <div className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-cyan-400" />
              <Wifi className="w-3 h-3 text-emerald-400" />
              <div className="flex items-center gap-0.5">
                <Battery className="w-3.5 h-3.5 text-yellow-400" />
                <span>{batteryLevel}%</span>
              </div>
            </div>
          </div>

          {/* Phone Scrollable App Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 no-scrollbar space-y-4">
            {children}
          </div>

          {/* Android Gesture Bar */}
          <div className="bg-slate-950 py-2 flex items-center justify-center shrink-0 border-t border-slate-900">
            <div className="w-32 h-1 rounded-full bg-slate-600/70" />
          </div>
        </div>
      </div>
    </div>
  );
};
