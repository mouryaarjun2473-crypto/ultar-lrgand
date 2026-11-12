import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  AlertTriangle,
  Camera,
  MapPin,
  Delete,
  X,
  Volume2,
  VolumeX,
  ShieldAlert,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Language, UserProfile, AntiTheftConfig, IntruderIncident, LinkedDevice } from '../types';
import { t } from '../utils/translations';
import { sound } from '../utils/audio';
import { capturePhotoFromCamera, getCurrentDeviceLocation } from '../utils/camera';

interface LockScreenSimulatorProps {
  lang: Language;
  user: UserProfile;
  device: LinkedDevice;
  config: AntiTheftConfig;
  isOpen: boolean;
  onClose: () => void;
  onIntruderCaptured: (incident: IntruderIncident) => void;
  isSirenActive: boolean;
  onToggleSiren: () => void;
}

export const LockScreenSimulator: React.FC<LockScreenSimulatorProps> = ({
  lang,
  user,
  device,
  config,
  isOpen,
  onClose,
  onIntruderCaptured,
  isSirenActive,
  onToggleSiren,
}) => {
  const dict = t[lang];

  const [enteredPin, setEnteredPin] = useState('');
  const [failedCount, setFailedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCapturing, setIsCapturing] = useState(false);
  const [intruderAlertBanner, setIntruderAlertBanner] = useState<string | null>(null);
  const [lastCapturedPhoto, setLastCapturedPhoto] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize hidden video stream for silent camera capture if enabled
  useEffect(() => {
    if (isOpen) {
      setEnteredPin('');
      setErrorMessage('');
      setIntruderAlertBanner(null);
      setLastCapturedPhoto(null);

      // Start front camera stream if available for live fast capture
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'user' } })
          .then((stream) => {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.warn('Live preview camera permission not granted or available:', err);
          });
      }
    } else {
      // Clean up stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      sound.playKeypadClick();
      const newPin = enteredPin + num;
      setEnteredPin(newPin);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    sound.playKeypadClick();
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const verifyPin = async (pinToTest: string) => {
    const correctPin = user.pin || '7890';

    if (pinToTest === correctPin) {
      sound.playUnlockChime();
      if (isSirenActive) {
        sound.stopAlarmSiren();
        onToggleSiren();
      }
      setErrorMessage('');
      setFailedCount(0);
      onClose();
      return;
    }

    // Wrong PIN entered!
    sound.playErrorBuzz();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    const newFailedCount = failedCount + 1;
    setFailedCount(newFailedCount);
    setEnteredPin('');

    const maxAttempts = config.maxFailedAttempts || 2;
    const isThresholdMet = newFailedCount >= maxAttempts;

    setErrorMessage(
      lang === 'hi'
        ? `गलत पिन! (प्रयास ${newFailedCount}/${maxAttempts})`
        : `Wrong PIN! (Attempt ${newFailedCount}/${maxAttempts})`
    );

    // If threshold met and anti-theft is armed, capture intruder!
    if (config.isArmed && isThresholdMet) {
      await executeIntruderLockdown(newFailedCount, pinToTest);
    }
  };

  const executeIntruderLockdown = async (attempts: number, wrongPin: string) => {
    setIsCapturing(true);

    if (!config.silentCapture) {
      sound.playShutterSound();
    }

    // 1. Take photo snapshot
    const photoData = await capturePhotoFromCamera(videoRef.current);
    setLastCapturedPhoto(photoData);

    // 2. Fetch real GPS
    const location = await getCurrentDeviceLocation();

    // 3. Siren Alarm if enabled
    let sirenTriggered = false;
    if (config.sirenAlarm) {
      sound.startAlarmSiren(config.sirenVolume || 0.85);
      sirenTriggered = true;
      if (!isSirenActive) {
        onToggleSiren();
      }
    }

    // 4. Create incident record
    const incident: IntruderIncident = {
      id: 'INC-' + Date.now().toString().slice(-6),
      timestamp: new Date().toISOString(),
      imageData: photoData,
      failedAttempts: attempts,
      enteredPin: wrongPin,
      location,
      deviceModel: device.model,
      batteryLevel: device.batteryLevel,
      sirenTriggered,
      smsDispatched: config.sendSmsAlert,
    };

    // 5. Emergency SMS simulation dispatch
    if (config.sendSmsAlert) {
      try {
        await fetch('/api/security/dispatch-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contacts: [user.emergencyContact1, user.emergencyContact2],
            intruderEvent: incident,
            deviceName: device.model,
          }),
        });
      } catch (err) {
        console.warn('Alert dispatch API error:', err);
      }
    }

    // 6. Request AI Incident threat analysis from Gemini server route
    try {
      const geminiRes = await fetch('/api/gemini/analyze-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: photoData,
          deviceModel: device.model,
          failedAttempts: attempts,
          timestamp: incident.timestamp,
          location,
          language: lang,
        }),
      });
      if (geminiRes.ok) {
        const analysis = await geminiRes.json();
        incident.aiAnalysis = analysis;
      }
    } catch (e) {
      console.warn('Gemini AI analysis error:', e);
    }

    onIntruderCaptured(incident);
    setIsCapturing(false);

    setIntruderAlertBanner(
      lang === 'hi'
        ? `🚨 सुरक्षा उल्लंघन! ${attempts} बार गलत पिन। घुसपैठिए की फोटो वॉल्ट में सहेज ली गई है।`
        : `🚨 SECURITY BREACH! ${attempts} failed PIN attempts. Intruder photo captured & sent to vault!`
    );
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      {/* Hidden front camera video stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      {/* Screen Frame Container */}
      <div className="w-full max-w-sm h-full max-h-[760px] bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-[40px] border-4 border-slate-800 shadow-2xl flex flex-col justify-between p-6 relative overflow-hidden">
        {/* Android Punch Hole Camera */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center z-30">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-900/60" />
        </div>

        {/* Top Status & Close simulator button */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 z-20">
          <div className="flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>RAKSHAK LOCK</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Exit Simulator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Intruder Alert Flash Banner */}
        {intruderAlertBanner && (
          <div className="z-30 p-3 rounded-2xl bg-red-600/90 text-white border border-red-400 animate-bounce text-xs font-bold text-center shadow-lg shadow-red-600/40">
            {intruderAlertBanner}
          </div>
        )}

        {/* Clock & Lock Status */}
        <div className="text-center space-y-1 my-auto">
          <p className="text-5xl font-extralight tracking-tight text-white font-mono">
            {formattedTime}
          </p>
          <p className="text-xs text-slate-400 capitalize">
            {formattedDate}
          </p>

          <div className="pt-4 flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              failedCount > 0 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800/80 text-slate-300'
            }`}>
              <Lock className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {dict.enterPinToUnlock}
            </p>
          </div>

          {/* 4 PIN Dots */}
          <div className={`flex justify-center items-center gap-3 pt-3 ${isShaking ? 'animate-wiggle' : ''}`}>
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = enteredPin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    isFilled
                      ? errorMessage
                        ? 'bg-red-500 border-red-400 scale-110'
                        : 'bg-emerald-400 border-emerald-300 scale-110 shadow-sm shadow-emerald-400/50'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                />
              );
            })}
          </div>

          {errorMessage && (
            <p className="text-xs text-red-400 font-semibold pt-2 animate-pulse">
              {errorMessage}
            </p>
          )}

          {/* Captured intruder preview thumbnail when triggered */}
          {lastCapturedPhoto && (
            <div className="mt-3 p-2 rounded-xl bg-slate-950 border border-red-500/40 flex items-center gap-3">
              <img
                src={lastCapturedPhoto}
                alt="Intruder Snapshot"
                className="w-12 h-12 rounded-lg object-cover border border-red-400"
              />
              <div className="text-left text-[11px]">
                <p className="font-bold text-red-400 flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  {lang === 'hi' ? 'फोटो कैप्चर दर्ज हुई' : 'Intruder Photo Captured'}
                </p>
                <p className="text-slate-400">{new Date().toLocaleTimeString()} • GPS Logged</p>
              </div>
            </div>
          )}
        </div>

        {/* Android Numeric Keypad (1 - 9, 0, Backspace) */}
        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto pb-4 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="w-16 h-16 rounded-full bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 text-white font-semibold text-xl flex items-center justify-center transition cursor-pointer mx-auto shadow-sm"
            >
              {digit}
            </button>
          ))}
          <div className="flex items-center justify-center">
            {/* Owner Hint */}
            <span className="text-[10px] text-slate-600 font-mono">
              PIN: {user.pin}
            </span>
          </div>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 text-white font-semibold text-xl flex items-center justify-center transition cursor-pointer mx-auto shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-slate-800/50 hover:bg-slate-700/60 active:bg-slate-600 text-slate-300 flex items-center justify-center transition cursor-pointer mx-auto"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Helper Bar */}
        <div className="text-center text-[11px] text-slate-500 border-t border-slate-900 pt-2 flex items-center justify-between">
          <span>{lang === 'hi' ? 'मास्टर पिन: 7890' : 'Master PIN: 7890'}</span>
          <span className="text-emerald-400">
            {config.isArmed ? (lang === 'hi' ? 'सुरक्षा सक्रिय' : 'Guard Armed') : 'Disarmed'}
          </span>
        </div>
      </div>
    </div>
  );
};
