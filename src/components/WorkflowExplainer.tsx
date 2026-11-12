import React, { useState } from 'react';
import {
  Shield,
  Smartphone,
  Eye,
  Camera,
  MapPin,
  Volume2,
  MessageSquare,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Lock,
  Radio,
  FileText
} from 'lucide-react';
import { Language } from '../types';
import { sound } from '../utils/audio';

interface WorkflowExplainerProps {
  lang: Language;
  onLaunchLiveTest: () => void;
}

export const WorkflowExplainer: React.FC<WorkflowExplainerProps> = ({
  lang,
  onLaunchLiveTest,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);

  const steps = [
    {
      num: 1,
      titleHi: '1. बैकग्राउंड में सक्रिय निगरानी (Background Guard)',
      titleEn: '1. Background Guard & Device Administrator',
      icon: Lock,
      color: 'from-blue-600 to-indigo-600',
      badgeHi: 'स्क्रीन लॉक स्थिति',
      badgeEn: 'Screen Locked State',
      descHi:
        'जब आप फोन लॉक करते हैं, तो रक्षक ऐप का बैकग्राउंड सर्विस और डिवाइस एडमिनिस्ट्रेटर (Device Admin) सक्रिय रहता है। यह स्क्रीन अनलॉक प्रयासों (Keyguard Password Failures) को लगातार मॉनिटर करता है। फोन को बंद या अनइंस्टॉल करने से भी रोकता है।',
      descEn:
        'When you lock your phone, Rakshak’s background listener and Device Administrator stay continuously vigilant. It hooks into Android’s keyguard failed attempts broadcast receiver without draining battery.',
      techHi: 'तकनीक: Android DevicePolicyManager, Foreground Service, BroadcastReceiver (ACTION_KEYGUARD_LOCKOUT)',
      techEn: 'Tech: Android DevicePolicyManager, Foreground Service, BroadcastReceiver'
    },
    {
      num: 2,
      titleHi: '2. गलत पिन का पता लगाना (Wrong PIN Detection)',
      titleEn: '2. Unauthorized PIN Attempt Detection',
      icon: AlertTriangle,
      color: 'from-amber-600 to-orange-600',
      badgeHi: 'अनधिकृत प्रयास',
      badgeEn: 'Failed Attempt',
      descHi:
        'जैसे ही कोई चोर या अनजान व्यक्ति फोन को अनलॉक करने के लिए गलत पिन, पैटर्न या फिंगरप्रिंट डालता है, ऐप का काउंटर तुरंत सक्रिय हो जाता है (उदा. 1 या 2 गलत प्रयास)।',
      descEn:
        'When an unauthorized person enters an incorrect PIN or pattern, Rakshak instantly detects the failure event and increments the security strike counter.',
      techHi: 'तकनीक: onPasswordFailed() कॉलबैक ट्रिगर, प्रयास सीमा सत्यापन',
      techEn: 'Tech: onPasswordFailed() callback hook & attempt threshold evaluator'
    },
    {
      num: 3,
      titleHi: '3. गुप्त फ्रंट कैमरा कैप्चर (Covert Selfie Capture)',
      titleEn: '3. Silent Front Camera Snapshot',
      icon: Camera,
      color: 'from-red-600 to-rose-600',
      badgeHi: 'गुप्त कैप्चर',
      badgeEn: 'Covert Snapshot',
      descHi:
        'गलत पिन दर्ज होते ही 0.2 सेकंड के भीतर बैकग्राउंड में फ्रंट कैमरा गुप्त रूप से चोर की साफ तस्वीर खींच लेता है। इसमें कोई कैमरा साउंड या फ्लैश नहीं होता (Silent Mode), जिससे चोर को भनक तक नहीं लगती।',
      descEn:
        'Within 200 milliseconds, the front-facing camera triggers in the background to capture a high-resolution face portrait of the intruder without any shutter flash or click sound.',
      techHi: 'तकनीक: Android Camera2 API (Background SurfaceTexture / getUserMedia)',
      techEn: 'Tech: Android Camera2 API with hidden offscreen SurfaceTexture'
    },
    {
      num: 4,
      titleHi: '4. वास्तविक समय GPS व पता रिकॉर्डिंग (Live GPS Coordinates)',
      titleEn: '4. Precision GPS & Cell Location Logging',
      icon: MapPin,
      color: 'from-emerald-600 to-teal-600',
      badgeHi: 'लाइव लोकेशन',
      badgeEn: 'Geo-Coordinates',
      descHi:
        'कैमरा क्लिक होने के साथ ही डिवाइस का हाई-एक्यूरेसी जीपीएस ऑन होता है। अक्षांश (Lat), देशांतर (Lng), ऊंचाई और निकटतम लैंडमार्क का पता फोटो के मेटाडेटा में वाटरमार्क के रूप में दर्ज हो जाता है।',
      descEn:
        'Simultaneously, high-accuracy GPS coordinates (lat/lng, accuracy radius, and street address) are recorded and watermarked directly onto the evidence capture.',
      techHi: 'तकनीक: FusedLocationProviderClient (GPS + Wi-Fi + Cell Triangulation)',
      techEn: 'Tech: FusedLocationProviderClient with sub-10m precision'
    },
    {
      num: 5,
      titleHi: '5. तेज पुलिस सायरन और आपातकालीन अलर्ट (Siren & SMS Dispatch)',
      titleEn: '5. High-Decibel Siren & Emergency Broadcast',
      icon: Volume2,
      color: 'from-purple-600 to-pink-600',
      badgeHi: 'अलार्म व एसएमएस',
      badgeEn: 'Siren & Emergency SMS',
      descHi:
        'यदि सायरन चालू है, तो फोन फुल वॉल्यूम पर पुलिस सायरन बजाना शुरू कर देता है, जिसे केवल आपका 4-अंकीय मास्टर पिन ही बंद कर सकता है। साथ ही आपके आपातकालीन नंबरों (पिता, मित्र) पर फोटो व गूगल मैप्स लिंक का अलर्ट भेज दिया जाता है।',
      descEn:
        'The device sounds an ear-piercing anti-theft police siren at maximum audio gain that can only be disarmed with your master PIN. An automated SMS containing the intruder photo and live Google Maps link is broadcast to your trusted contacts.',
      techHi: 'तकनीक: Web Audio / AudioManager (FORCE_SPEAKER, STREAM_ALARM) + SMS Gateway',
      techEn: 'Tech: AudioManager (STREAM_ALARM at MAX) & SMS Dispatcher'
    },
    {
      num: 6,
      titleHi: '6. जेमिनी एआई फॉरेंसिक विश्लेषण (Gemini AI Threat Analysis)',
      titleEn: '6. Gemini AI Forensic Threat Assessment',
      icon: Sparkles,
      color: 'from-cyan-600 to-blue-600',
      badgeHi: 'एआई विश्लेषण',
      badgeEn: 'Gemini 3.8 Flash',
      descHi:
        'क्लाउड पर जेमिनी एआई (Gemini 3.8 Flash) फोटो, प्रकाश और चेहरे के भावों को स्कैन करता है, खतरे का स्तर (LOW / MEDIUM / HIGH / CRITICAL) तय करता है और ओनर को पुलिस रिपोर्ट दर्ज कराने के लिए सामरिक सिफारिशें देता है।',
      descEn:
        'Gemini 3.8 Flash analyzes the captured photo and ambient context, classifying threat severity, inspecting physical surroundings, and providing actionable tactical recovery steps for police reporting.',
      techHi: 'तकनीक: Google GenAI SDK (Multimodal Vision + Structured Security Schema)',
      techEn: 'Tech: Google GenAI SDK (Multimodal Vision + Structured Security Schema)'
    }
  ];

  const currentStep = steps[activeStepIndex];
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    sound.playKeypadClick();
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    } else {
      setActiveStepIndex(0);
    }
  };

  const handlePrev = () => {
    sound.playKeypadClick();
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'तकनीकी कार्यप्रणाली (Architecture & Lifecycle)' : 'Technical Working & Lifecycle'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {lang === 'hi' ? 'रक्षक एंटी-थेफ्ट कैसे काम करता है?' : 'How Rakshak Anti-Theft Works?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {lang === 'hi'
                ? 'यह प्रणाली बैकग्राउंड गार्ड, हार्डवेयर कैमरा सेंसर, जीपीएस ट्रैकिंग और जेमिनी एआई का उपयोग करके फोन को चोरी होने से बचाती है।'
                : 'A comprehensive 6-stage lifecycle from screen lock background monitoring to silent photo capture, siren alarms, and Gemini AI forensics.'}
            </p>
          </div>

          <button
            onClick={() => {
              sound.playKeypadClick();
              onLaunchLiveTest();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{lang === 'hi' ? 'लाइव टेस्ट करके देखें' : 'Run Live Test Simulator'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Step Navigator Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((st, idx) => {
          const isSelected = activeStepIndex === idx;
          const Icon = st.icon;
          return (
            <button
              key={st.num}
              onClick={() => {
                sound.playKeypadClick();
                setActiveStepIndex(idx);
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {st.num}
                </span>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
              </div>
              <p className={`text-xs font-semibold line-clamp-1 ${
                isSelected ? 'text-white' : 'text-slate-400'
              }`}>
                {lang === 'hi' ? st.titleHi.split('.')[1] : st.titleEn.split('.')[1]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Card */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentStep.color} flex items-center justify-center text-white shadow-lg`}>
              <StepIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400">
                  STAGE 0{currentStep.num} OF 06
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {lang === 'hi' ? currentStep.badgeHi : currentStep.badgeEn}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                {lang === 'hi' ? currentStep.titleHi : currentStep.titleEn}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={activeStepIndex === 0}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              {lang === 'hi' ? 'पिछला' : 'Previous'}
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'hi' ? 'अगला चरण' : 'Next Stage'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="space-y-4">
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            {lang === 'hi' ? currentStep.descHi : currentStep.descEn}
          </p>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>{lang === 'hi' ? currentStep.techHi : currentStep.techEn}</span>
          </div>
        </div>

        {/* Visual Flow Diagram / Architecture Matrix */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {lang === 'hi' ? 'सुरक्षा प्रवाह मैट्रिक्स (Event Flow Matrix)' : 'Event Flow Matrix'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-1.5">
              <span className="text-amber-400 font-bold block flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {lang === 'hi' ? 'ट्रिगर शर्त' : 'Trigger Condition'}
              </span>
              <p className="text-slate-300">
                {lang === 'hi'
                  ? 'स्क्रीन लॉक पर 1, 2 या 3 बार गलत पिन/पासवर्ड दर्ज होना।'
                  : 'Screen locked + 1 to 3 failed keyguard PIN attempts.'}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-1.5">
              <span className="text-emerald-400 font-bold block flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                {lang === 'hi' ? 'हार्डवेयर रिस्पॉन्स' : 'Hardware Response'}
              </span>
              <p className="text-slate-300">
                {lang === 'hi'
                  ? 'फ्रंट कैमरा सेल्फी + GPS अक्षांश/देशांतर + अधिकतम वॉल्यूम पुलिस सायरन।'
                  : 'Front camera frame snapshot + GPS fix + max-volume siren audio.'}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-1.5">
              <span className="text-cyan-400 font-bold block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {lang === 'hi' ? 'क्लाउड व फॉरेंसिक एक्शन' : 'Cloud & Forensic Action'}
              </span>
              <p className="text-slate-300">
                {lang === 'hi'
                  ? 'इमरजेंसी संपर्कों को एसएमएस और जेमिनी एआई द्वारा घुसपैठिए का खतरा मूल्यांकन।'
                  : 'Emergency SMS dispatch with Google Maps link + Gemini 3.8 Flash threat audit.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
