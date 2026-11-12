import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  Lock,
  Volume2,
  VolumeX,
  Camera,
  MessageSquare,
  Activity,
  Sliders,
  Play,
  Sparkles,
  Smartphone,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Language, AntiTheftConfig } from '../types';
import { t } from '../utils/translations';
import { sound } from '../utils/audio';

interface Step3Props {
  lang: Language;
  config: AntiTheftConfig;
  onUpdateConfig: (config: Partial<AntiTheftConfig>) => void;
  onLaunchLockScreen: () => void;
  onQuickCaptureTest: () => void;
  isSirenActive: boolean;
  onToggleSiren: () => void;
  onViewVault: () => void;
  onViewHowItWorks?: () => void;
  hasIntruderEvents: boolean;
}

export const Step3AntiTheft: React.FC<Step3Props> = ({
  lang,
  config,
  onUpdateConfig,
  onLaunchLockScreen,
  onQuickCaptureTest,
  isSirenActive,
  onToggleSiren,
  onViewVault,
  onViewHowItWorks,
  hasIntruderEvents,
}) => {
  const dict = t[lang];

  const handleArmToggle = () => {
    const nextState = !config.isArmed;
    onUpdateConfig({ isArmed: nextState });
    if (nextState) {
      sound.playUnlockChime();
    } else {
      sound.playErrorBuzz();
      if (isSirenActive) {
        onToggleSiren();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Master Anti-Theft Arm / Disarm Panel */}
      <div className={`relative overflow-hidden rounded-3xl p-6 md:p-8 border transition-all shadow-xl ${
        config.isArmed
          ? 'bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 border-emerald-500/50 shadow-emerald-950/40'
          : 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 border-amber-500/40 shadow-slate-950'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all shadow-inner ${
              config.isArmed
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 ring-8 ring-emerald-500/10 animate-pulse'
                : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}>
              {config.isArmed ? (
                <Shield className="w-10 h-10" />
              ) : (
                <ShieldAlert className="w-10 h-10" />
              )}
            </div>

            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                  config.isArmed ? 'bg-emerald-400 animate-ping' : 'bg-amber-500'
                }`} />
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-400">
                  {dict.antiTheftMode}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {config.isArmed ? dict.armed : dict.disarmed}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
                {config.isArmed
                  ? (lang === 'hi' 
                      ? 'सुरक्षा गार्ड सक्रिय है। फोन लॉक होने पर गलत पिन दर्ज करने पर गुप्त फोटो व जीपीएस खींचा जाएगा।'
                      : 'Anti-Theft shield is live. Background intruder capture and siren are active.')
                  : (lang === 'hi'
                      ? 'सुरक्षा निष्क्रिय है। फोन को चोरी व घुसपैठ से बचाने के लिए सुरक्षा मोड चालू करें।'
                      : 'Anti-theft mode is disabled. Arm the shield to safeguard your device.')}
              </p>
            </div>
          </div>

          {/* Master Big Switch Button */}
          <button
            onClick={handleArmToggle}
            className={`px-8 py-4 rounded-2xl font-bold text-sm md:text-base flex items-center gap-3 transition-all transform active:scale-95 shadow-xl cursor-pointer ${
              config.isArmed
                ? 'bg-red-600/90 hover:bg-red-600 text-white shadow-red-600/30 border border-red-500/40'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/40 border border-emerald-400/30'
            }`}
          >
            {config.isArmed ? (
              <>
                <ShieldAlert className="w-5 h-5" />
                <span>{dict.turnOffShield}</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>{dict.turnOnShield}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Testing Launchpad */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white">
              {lang === 'hi' ? 'सुरक्षा मोड परीक्षण एवं सिम्युलेटर' : 'Live Security Simulator & Tests'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {onViewHowItWorks && (
              <button
                onClick={onViewHowItWorks}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold underline cursor-pointer"
              >
                <span>{lang === 'hi' ? '❓ यह कैसे काम करता है?' : '❓ How It Works'}</span>
              </button>
            )}
            {hasIntruderEvents && (
              <button
                onClick={onViewVault}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold underline cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'फोटो सबूत देखें' : 'View Captured Photos'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Test 1: Simulate Lock Screen */}
          <button
            onClick={onLaunchLockScreen}
            className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-950 border border-indigo-500/30 hover:border-indigo-500/60 transition flex flex-col items-start gap-2 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">{dict.simulateLockScreen}</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'hi' ? 'लॉक स्क्रीन पर गलत पिन डालकर फोटो कैप्चर और सायरन ट्रिगर करें।' : 'Test lock screen PIN failure and silent photo capture.'}
              </p>
            </div>
          </button>

          {/* Test 2: Quick Camera Test */}
          <button
            onClick={onQuickCaptureTest}
            className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/60 to-slate-950 border border-cyan-500/30 hover:border-cyan-500/60 transition flex flex-col items-start gap-2 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-105 transition">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">{dict.testCaptureNow}</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'hi' ? 'फ्रंट कैमरे से तुरंत एक फोटो लेकर टेस्ट करें।' : 'Immediately capture a live front selfie snapshot.'}
              </p>
            </div>
          </button>

          {/* Test 3: Siren Test */}
          <button
            onClick={onToggleSiren}
            className={`p-4 rounded-xl border transition flex flex-col items-start gap-2 text-left group cursor-pointer ${
              isSirenActive
                ? 'bg-red-950/80 border-red-500 animate-pulse text-white'
                : 'bg-gradient-to-br from-red-950/40 to-slate-950 border-red-500/30 hover:border-red-500/60'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center group-hover:scale-105 transition">
              {isSirenActive ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-red-400" />}
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">
                {isSirenActive ? dict.stopSiren : (lang === 'hi' ? 'सायरन टेस्ट (Test Siren)' : 'Test Alarm Siren')}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'hi' ? 'उच्च-आवृत्ति पुलिस अलार्म सायरन चालू या बंद करें।' : 'Toggle high-decibel anti-theft police alarm.'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Security Rule Parameters & Features */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white">
            {lang === 'hi' ? 'सुरक्षा नियम एवं कॉन्फ़िगरेशन' : 'Anti-Theft Rules & Configuration'}
          </h3>
        </div>

        <div className="space-y-4">
          {/* Rule 1: Failed PIN Trigger Threshold */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-medium text-white text-xs sm:text-sm">{dict.triggerThreshold}</h4>
              <p className="text-xs text-slate-400">
                {lang === 'hi'
                  ? 'इतने गलत पिन प्रयासों के बाद कैमरा अपने आप फोटो खींच लेगा।'
                  : 'Number of consecutive wrong unlock attempts before capturing intruder photo.'}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => onUpdateConfig({ maxFailedAttempts: num })}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    config.maxFailedAttempts === num
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {num} {lang === 'hi' ? 'प्रयास' : 'Attempt'}
                </button>
              ))}
            </div>
          </div>

          {/* Rule 2: Lock Screen Background Guard */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-white text-xs sm:text-sm">{dict.lockScreenGuard}</h4>
                <p className="text-xs text-slate-400">{dict.lockScreenGuardDesc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.captureOnWrongPin}
                onChange={(e) => onUpdateConfig({ captureOnWrongPin: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Rule 3: High-Decibel Siren Alarm */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400 mt-0.5">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-white text-xs sm:text-sm">{dict.sirenAlarm}</h4>
                <p className="text-xs text-slate-400">{dict.sirenAlarmDesc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.sirenAlarm}
                onChange={(e) => onUpdateConfig({ sirenAlarm: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
            </label>
          </div>

          {/* Rule 4: Silent Capture Mode */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-white text-xs sm:text-sm">{dict.silentCapture}</h4>
                <p className="text-xs text-slate-400">{dict.silentCaptureDesc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.silentCapture}
                onChange={(e) => onUpdateConfig({ silentCapture: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
            </label>
          </div>

          {/* Rule 5: Emergency SMS Dispatch */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-white text-xs sm:text-sm">{dict.smsDispatch}</h4>
                <p className="text-xs text-slate-400">{dict.smsDispatchDesc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.sendSmsAlert}
                onChange={(e) => onUpdateConfig({ sendSmsAlert: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600" />
            </label>
          </div>

          {/* Rule 6: Pocket Pick & Motion Sensor */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-white text-xs sm:text-sm">{dict.pocketSensor}</h4>
                <p className="text-xs text-slate-400">{dict.pocketSensorDesc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.pocketPickAlert}
                onChange={(e) => onUpdateConfig({ pocketPickAlert: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
