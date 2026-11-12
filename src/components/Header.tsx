import React from 'react';
import { Shield, ShieldAlert, Smartphone, Laptop, Globe, VolumeX, Battery, Wifi, Radio } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { sound } from '../utils/audio';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  viewMode: 'mobile' | 'dashboard';
  onToggleViewMode: (mode: 'mobile' | 'dashboard') => void;
  isArmed: boolean;
  batteryLevel: number;
  isSirenActive: boolean;
  onStopSiren: () => void;
  activeStep: number;
  onSelectStep: (step: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  viewMode,
  onToggleViewMode,
  isArmed,
  batteryLevel,
  isSirenActive,
  onStopSiren,
  activeStep,
  onSelectStep,
}) => {
  const dict = t[lang];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
      {/* Top Android-style system bar indicator */}
      <div className="bg-slate-950 px-4 py-1 text-xs text-slate-400 flex items-center justify-between border-b border-slate-800/60 font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>RAKSHAK OS 15.0</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">STATUS: {isArmed ? (lang === 'hi' ? 'सक्रिय' : 'ARMED') : (lang === 'hi' ? 'निष्क्रिय' : 'DISARMED')}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>5G JIO</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-center gap-1">
            <Battery className="w-3.5 h-3.5 text-yellow-400" />
            <span>{batteryLevel}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl transition-all shadow-md ${
            isArmed 
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-500/20' 
              : 'bg-gradient-to-br from-slate-700 to-slate-800'
          }`}>
            {isArmed ? (
              <Shield className="w-6 h-6 text-emerald-100" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg md:text-xl tracking-tight text-white flex items-center gap-1.5">
                {dict.appTitle}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v3.4 PRO
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {dict.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Active Siren Warning Banner */}
          {isSirenActive && (
            <button
              onClick={() => {
                sound.stopAlarmSiren();
                onStopSiren();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold animate-bounce shadow-lg shadow-red-600/40 cursor-pointer"
            >
              <VolumeX className="w-4 h-4" />
              <span>{dict.stopSiren}</span>
            </button>
          )}

          {/* View mode toggle: Android Phone vs Dashboard */}
          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex items-center text-xs">
            <button
              onClick={() => onToggleViewMode('mobile')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                viewMode === 'mobile'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Android Mobile UI Mockup"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{dict.mobileView}</span>
            </button>
            <button
              onClick={() => onToggleViewMode('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                viewMode === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Wide Web Dashboard Console"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{dict.dashboardView}</span>
            </button>
          </div>

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'hi' ? 'English' : 'हिन्दी'}</span>
          </button>
        </div>
      </div>

      {/* 5 Steps Navigation Ribbon */}
      <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between overflow-x-auto gap-2 no-scrollbar">
          {[
            { num: 1, title: dict.step1Title },
            { num: 2, title: dict.step2Title },
            { num: 3, title: dict.step3Title },
            { num: 4, title: lang === 'hi' ? 'फोटो सबूत वॉल्ट' : 'Intruder Vault' },
            { num: 5, title: lang === 'hi' ? 'यह कैसे काम करता है?' : 'How It Works' },
          ].map((step) => {
            const isActive = activeStep === step.num;
            return (
              <button
                key={step.num}
                onClick={() => onSelectStep(step.num)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isActive ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  {step.num}
                </span>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
