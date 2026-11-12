import React, { useState, useEffect } from 'react';
import {
  Phone,
  ShieldCheck,
  User,
  Mail,
  KeyRound,
  Users,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Link2,
  ArrowRight
} from 'lucide-react';
import { Language, UserProfile, LinkedDevice } from '../types';
import { t } from '../utils/translations';
import { sound } from '../utils/audio';

interface Step1Props {
  lang: Language;
  user: UserProfile;
  device: LinkedDevice;
  onUpdateUser: (user: Partial<UserProfile>) => void;
  onUpdateDevice: (device: Partial<LinkedDevice>) => void;
  onProceedToStep2: () => void;
}

export const Step1Setup: React.FC<Step1Props> = ({
  lang,
  user,
  device,
  onUpdateUser,
  onUpdateDevice,
  onProceedToStep2,
}) => {
  const dict = t[lang];

  // Auth flow states
  const [phoneNumber, setPhoneNumber] = useState(user.phone || '9876543210');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [authError, setAuthError] = useState('');
  const [saveToast, setSaveToast] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  // Form states for profile
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [pin, setPin] = useState(user.pin);
  const [showPin, setShowPin] = useState(false);
  const [contact1Name, setContact1Name] = useState(user.emergencyContact1.name);
  const [contact1Phone, setContact1Phone] = useState(user.emergencyContact1.phone);
  const [contact1Rel, setContact1Rel] = useState(user.emergencyContact1.relation);

  const [contact2Name, setContact2Name] = useState(user.emergencyContact2.name);
  const [contact2Phone, setContact2Phone] = useState(user.emergencyContact2.phone);
  const [contact2Rel, setContact2Rel] = useState(user.emergencyContact2.relation);

  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setAuthError(lang === 'hi' ? 'कृपया मान्य 10-अंकीय मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    setAuthError('');
    setOtpSent(true);
    setOtpTimer(30);
    sound.playKeypadClick();
  };

  const handleVerifyOtp = (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (code === '123456' || code.length === 6) {
      sound.playUnlockChime();
      onUpdateUser({
        phone: `${countryCode} ${phoneNumber}`,
        isRegistered: true,
      });
      setOtpSent(false);
      setAuthError('');
    } else {
      sound.playErrorBuzz();
      setAuthError(lang === 'hi' ? 'अमान्य ओटीपी कोड। कृपया 123456 दर्ज करें।' : 'Invalid OTP. Try demo code 123456');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      alert(lang === 'hi' ? 'सुरक्षा पिन ठीक 4 अंकों का होना चाहिए' : 'PIN must be exactly 4 digits');
      return;
    }

    onUpdateUser({
      name: fullName,
      email,
      pin,
      emergencyContact1: {
        name: contact1Name,
        phone: contact1Phone,
        relation: contact1Rel,
      },
      emergencyContact2: {
        name: contact2Name,
        phone: contact2Phone,
        relation: contact2Rel,
      },
    });

    sound.playUnlockChime();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleLinkDevice = () => {
    setIsLinking(true);
    sound.playKeypadClick();
    setTimeout(() => {
      onUpdateDevice({
        isLinked: true,
        linkedAt: new Date().toLocaleTimeString(),
      });
      setIsLinking(false);
      sound.playUnlockChime();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
            1
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {dict.step1Title}
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                {user.isRegistered ? (lang === 'hi' ? 'सत्यापित' : 'Verified') : (lang === 'hi' ? 'लंबित' : 'Pending')}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {dict.step1Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Part A: Mobile Number Registration & Login */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">
              {lang === 'hi' ? 'मोबाइल नंबर से रजिस्ट्रेशन और लॉगिन' : 'Mobile Number Registration & Login'}
            </h3>
          </div>
          {user.isRegistered && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {dict.loginSuccess}
            </span>
          )}
        </div>

        {!user.isRegistered ? (
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {dict.mobileNumber}
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                >
                  <option value="+91">🇮🇳 +91 (IN)</option>
                  <option value="+1">🇺🇸 +1 (US)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+971">🇦🇪 +971 (UAE)</option>
                </select>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-xl px-4 py-2.5 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    {dict.sendOtp}
                  </button>
                ) : (
                  <button
                    disabled={otpTimer > 0}
                    onClick={handleSendOtp}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs px-3 py-2.5 rounded-xl border border-slate-700 cursor-pointer"
                  >
                    {otpTimer > 0 ? `${otpTimer}s` : dict.resendOtp}
                  </button>
                )}
              </div>
            </div>

            {otpSent && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {dict.otpSentTo} <strong className="text-emerald-400">{countryCode} {phoneNumber}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setOtpCode('123456');
                      handleVerifyOtp('123456');
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    {dict.demoOtpHint}
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="flex-1 bg-slate-900 border border-slate-700 text-center tracking-widest text-lg font-mono text-emerald-400 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleVerifyOtp()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-5 py-2 rounded-xl transition cursor-pointer"
                  >
                    {dict.verifyOtp}
                  </button>
                </div>
              </div>
            )}

            {authError && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 p-2.5 rounded-lg">
                {authError}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{user.name}</p>
                <p className="text-xs text-slate-400 font-mono">{user.phone} • {user.email}</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateUser({ isRegistered: false })}
              className="text-xs text-slate-400 hover:text-red-400 transition cursor-pointer"
            >
              {dict.logout}
            </button>
          </div>
        )}
      </div>

      {/* Part B: User Profile & Emergency Contacts */}
      <form onSubmit={handleSaveProfile} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">{dict.userProfile}</h3>
          </div>
          {saveToast && (
            <span className="text-xs text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-3 py-1 rounded-full animate-fade-in">
              {dict.profileSaved}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {dict.fullName}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Arjun Maurya"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {dict.emailAddress}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mouryaarjun2473@gmail.com"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* 4-digit Master Security PIN */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-400" />
              {dict.securityPin}
            </label>
            <span className="text-[11px] text-amber-400/90 font-mono">
              {dict.pinHint}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type={showPin ? 'text' : 'password'}
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="7890"
              className="w-36 bg-slate-900 border border-amber-500/40 text-center tracking-widest text-xl font-mono text-amber-400 rounded-xl px-4 py-2 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              {showPin ? (lang === 'hi' ? 'छिपाएं' : 'Hide') : (lang === 'hi' ? 'दिखाएं' : 'Show')}
            </button>
            <span className="text-xs text-slate-500">
              {lang === 'hi' ? 'वर्तमान पिन: ' : 'Active PIN: '}
              <strong className="text-amber-300 font-mono">{pin}</strong>
            </span>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              {lang === 'hi' ? 'आपातकालीन संपर्क (Emergency Alert Contacts)' : 'Emergency Alert Contacts'}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact 1 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-emerald-400">{dict.emergencyContact1}</p>
              <input
                type="text"
                placeholder={dict.contactName}
                value={contact1Name}
                onChange={(e) => setContact1Name(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-200"
              />
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="+91 9811122233"
                  value={contact1Phone}
                  onChange={(e) => setContact1Phone(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-200"
                />
                <input
                  type="text"
                  placeholder={dict.relation}
                  value={contact1Rel}
                  onChange={(e) => setContact1Rel(e.target.value)}
                  className="w-28 bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            {/* Contact 2 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-cyan-400">{dict.emergencyContact2}</p>
              <input
                type="text"
                placeholder={dict.contactName}
                value={contact2Name}
                onChange={(e) => setContact2Name(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-200"
              />
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="+91 9844455566"
                  value={contact2Phone}
                  onChange={(e) => setContact2Phone(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-200"
                />
                <input
                  type="text"
                  placeholder={dict.relation}
                  value={contact2Rel}
                  onChange={(e) => setContact2Rel(e.target.value)}
                  className="w-28 bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm px-6 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
        >
          {dict.saveProfile}
        </button>
      </form>

      {/* Part C: Mobile Device Linking */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white">{dict.linkedDevice}</h3>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
            device.isLinked 
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' 
              : 'bg-amber-950/80 text-amber-400 border border-amber-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${device.isLinked ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {device.isLinked ? dict.statusGuarded : (lang === 'hi' ? 'लिंक प्रतीक्षारत' : 'Pending Link')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block mb-1">{dict.deviceModel}</span>
            <span className="font-semibold text-white">{device.model}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block mb-1">{dict.imeiHash}</span>
            <span className="font-mono text-slate-300 text-[11px] truncate block">{device.imeiHash}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block mb-1">{dict.osVersion}</span>
            <span className="font-medium text-slate-300">{device.osVersion}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block mb-1">{dict.battery}</span>
            <span className="font-medium text-emerald-400">{device.batteryLevel}% (Optimized)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleLinkDevice}
            disabled={isLinking}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl transition cursor-pointer"
          >
            {isLinking ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            <span>{dict.linkThisDevice}</span>
          </button>

          <button
            onClick={onProceedToStep2}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer ml-auto"
          >
            <span>{lang === 'hi' ? 'चरण 2 (Permissions) पर जाएं' : 'Proceed to Step 2'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
