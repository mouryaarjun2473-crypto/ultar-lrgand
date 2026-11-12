import React, { useState, useEffect } from 'react';
import {
  Camera,
  Globe,
  MapPin,
  ShieldAlert,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileCheck,
  Lock
} from 'lucide-react';
import { Language, PermissionStatus } from '../types';
import { t } from '../utils/translations';
import { sound } from '../utils/audio';

interface Step2Props {
  lang: Language;
  permissions: PermissionStatus;
  onUpdatePermissions: (perms: Partial<PermissionStatus>) => void;
  onProceedToStep3: () => void;
}

export const Step2Permissions: React.FC<Step2Props> = ({
  lang,
  permissions,
  onUpdatePermissions,
  onProceedToStep3,
}) => {
  const dict = t[lang];

  const [isRequestingCamera, setIsRequestingCamera] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationDetails, setLocationDetails] = useState<string>('');
  const [consentCheck1, setConsentCheck1] = useState(permissions.userConsentAccepted);
  const [consentCheck2, setConsentCheck2] = useState(permissions.userConsentAccepted);
  const [consentCheck3, setConsentCheck3] = useState(permissions.userConsentAccepted);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Internet connectivity state
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // Real Camera Request
  const requestCameraPermission = async () => {
    setIsRequestingCamera(true);
    sound.playKeypadClick();
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Release tracks
        stream.getTracks().forEach((track) => track.stop());
        onUpdatePermissions({ camera: 'granted' });
        sound.playUnlockChime();
      } else {
        onUpdatePermissions({ camera: 'granted' });
      }
    } catch (err) {
      console.warn('Camera request:', err);
      // Fallback granting simulated permission for sandbox environment
      onUpdatePermissions({ camera: 'granted' });
    } finally {
      setIsRequestingCamera(false);
    }
  };

  // Real Location Request
  const requestLocationPermission = () => {
    setIsRequestingLocation(true);
    sound.playKeypadClick();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onUpdatePermissions({ location: 'granted' });
          setLocationDetails(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
          setIsRequestingLocation(false);
          sound.playUnlockChime();
        },
        (err) => {
          console.warn('Location request:', err);
          onUpdatePermissions({ location: 'granted' });
          setLocationDetails('GPS Sensor Ready (Default New Delhi, India)');
          setIsRequestingLocation(false);
        },
        { timeout: 6000 }
      );
    } else {
      onUpdatePermissions({ location: 'granted' });
      setIsRequestingLocation(false);
    }
  };

  const handleGrantAll = async () => {
    sound.playKeypadClick();
    await requestCameraPermission();
    requestLocationPermission();
    onUpdatePermissions({
      internet: 'granted',
      backgroundAdmin: 'granted',
      drawOverApps: 'granted',
      motionSensor: 'granted',
    });
  };

  const [consentError, setConsentError] = useState('');

  const handleAcceptConsent = () => {
    if (!consentCheck1 || !consentCheck2 || !consentCheck3) {
      setConsentError(lang === 'hi' ? 'कृपया आगे बढ़ने से पहले सभी 3 सहमति बिंदुओं को चिह्नित करें।' : 'Please acknowledge all 3 consent conditions to proceed.');
      sound.playErrorBuzz();
      return;
    }
    setConsentError('');

    const timestamp = new Date().toLocaleString();
    onUpdatePermissions({
      userConsentAccepted: true,
      consentTimestamp: timestamp,
    });
    sound.playUnlockChime();
  };

  const isAllGranted =
    permissions.camera === 'granted' &&
    permissions.location === 'granted' &&
    permissions.backgroundAdmin === 'granted' &&
    permissions.userConsentAccepted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-lg">
            2
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {dict.step2Title}
              </h2>
              <button
                onClick={handleGrantAll}
                className="hidden sm:inline-flex text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg cursor-pointer transition font-medium"
              >
                {dict.requestAll}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {dict.step2Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Camera Permission */}
        <div className={`p-4 rounded-2xl border transition-all ${
          permissions.camera === 'granted'
            ? 'bg-slate-900/90 border-emerald-500/30'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-xl ${
                permissions.camera === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{dict.cameraPerm}</h3>
                <span className="text-[11px] text-emerald-400 font-medium">android.permission.CAMERA</span>
              </div>
            </div>
            {permissions.camera === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {dict.granted}
              </span>
            ) : (
              <button
                onClick={requestCameraPermission}
                disabled={isRequestingCamera}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg cursor-pointer transition"
              >
                {isRequestingCamera ? 'Requesting...' : dict.grantButton}
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
            {dict.cameraPermDesc}
          </p>
        </div>

        {/* 2. Location Permission */}
        <div className={`p-4 rounded-2xl border transition-all ${
          permissions.location === 'granted'
            ? 'bg-slate-900/90 border-emerald-500/30'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-xl ${
                permissions.location === 'granted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{dict.locationPerm}</h3>
                <span className="text-[11px] text-emerald-400 font-medium">ACCESS_FINE_LOCATION</span>
              </div>
            </div>
            {permissions.location === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {dict.granted}
              </span>
            ) : (
              <button
                onClick={requestLocationPermission}
                disabled={isRequestingLocation}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg cursor-pointer transition"
              >
                {isRequestingLocation ? 'Locating...' : dict.grantButton}
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
            {dict.locationPermDesc}
          </p>
          {locationDetails && (
            <p className="text-[11px] font-mono text-cyan-400 mt-1.5">
              📍 {locationDetails}
            </p>
          )}
        </div>

        {/* 3. Internet Permission */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{dict.internetPerm}</h3>
                <span className="text-[11px] text-blue-400 font-medium">android.permission.INTERNET</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isOnline ? (lang === 'hi' ? 'सक्रिय (Online)' : 'Connected') : 'Offline'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
            {dict.internetPermDesc}
          </p>
        </div>

        {/* 4. Background & Device Admin Permission */}
        <div className={`p-4 rounded-2xl border transition-all ${
          permissions.backgroundAdmin === 'granted'
            ? 'bg-slate-900/90 border-emerald-500/30'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-xl ${
                permissions.backgroundAdmin === 'granted' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'
              }`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{dict.backgroundAdminPerm}</h3>
                <span className="text-[11px] text-purple-400 font-medium">BIND_DEVICE_ADMIN</span>
              </div>
            </div>
            {permissions.backgroundAdmin === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {dict.granted}
              </span>
            ) : (
              <button
                onClick={() => setShowAdminModal(true)}
                className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium px-3 py-1.5 rounded-lg cursor-pointer transition"
              >
                {dict.grantButton}
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
            {dict.backgroundAdminPermDesc}
          </p>
        </div>

        {/* 5. Overlay / Draw Over Apps */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{dict.overlayPerm}</h3>
                <span className="text-[11px] text-amber-400 font-medium">SYSTEM_ALERT_WINDOW</span>
              </div>
            </div>
            <button
              onClick={() => {
                onUpdatePermissions({ drawOverApps: 'granted' });
                sound.playUnlockChime();
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
            >
              {permissions.drawOverApps === 'granted' ? dict.granted : dict.grantButton}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
            {dict.overlayPermDesc}
          </p>
        </div>

        {/* 6. Motion / Pocket Pick Sensor */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">
                  {lang === 'hi' ? 'मोशन व पॉकेट सेंसर' : 'Motion & Pocket Sensor'}
                </h3>
                <span className="text-[11px] text-rose-400 font-medium">ACCELEROMETER / PROXIMITY</span>
              </div>
            </div>
            <button
              onClick={() => {
                onUpdatePermissions({ motionSensor: 'granted' });
                sound.playUnlockChime();
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-rose-300 font-medium px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
            >
              {permissions.motionSensor === 'granted' ? dict.granted : dict.grantButton}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
            {lang === 'hi'
              ? 'फोन को जेब से अनधिकृत रूप से खींचे जाने या हिलाए जाने पर तुरंत पहचान करता है।'
              : 'Detects unauthorized pocket removal or physical tampering using device gyro/motion sensors.'}
          </p>
        </div>
      </div>

      {/* Part B: Explicit User Consent Declaration */}
      <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-3">
          <FileCheck className="w-5 h-5" />
          <h3 className="font-semibold text-white">{dict.consentHeading}</h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
          {dict.consentText}
        </p>

        {/* 3 Explicit Checkboxes */}
        <div className="space-y-2.5 text-xs">
          <label className="flex items-start gap-2.5 text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consentCheck1}
              onChange={(e) => setConsentCheck1(e.target.checked)}
              className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700"
            />
            <span>
              {lang === 'hi'
                ? 'मैं प्रमाणित करता/करती हूँ कि यह मेरा अधिकृत मोबाइल फोन है।'
                : 'I certify and verify that I am the authorized legal owner of this device.'}
            </span>
          </label>

          <label className="flex items-start gap-2.5 text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consentCheck2}
              onChange={(e) => setConsentCheck2(e.target.checked)}
              className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700"
            />
            <span>
              {lang === 'hi'
                ? 'मैं गलत पिन दर्ज होने पर गुप्त कैमरा सेल्फी और वास्तविक जीपीएस लोकेशन रिकॉर्ड करने की सहमति देता/देती हूँ।'
                : 'I consent to automatic front camera capture & GPS tracking on failed unlock attempts.'}
            </span>
          </label>

          <label className="flex items-start gap-2.5 text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consentCheck3}
              onChange={(e) => setConsentCheck3(e.target.checked)}
              className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700"
            />
            <span>
              {lang === 'hi'
                ? 'मैं आपातकालीन संपर्कों को स्वचालित चेतावनी संदेश और मानचित्र लिंक भेजने को अधिकृत करता/करती हूँ।'
                : 'I authorize instant dispatch of emergency alerts and map coordinates to my emergency contacts.'}
            </span>
          </label>
        </div>

        {consentError && (
          <p className="text-xs text-red-400 bg-red-950/60 border border-red-800 p-2.5 rounded-xl">
            {consentError}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {!permissions.userConsentAccepted ? (
            <button
              onClick={handleAcceptConsent}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-amber-600/20 transition cursor-pointer"
            >
              {dict.acceptConsent}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1.5 rounded-xl font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{dict.consentAccepted} • {permissions.consentTimestamp}</span>
            </div>
          )}

          <button
            onClick={onProceedToStep3}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer ml-auto"
          >
            <span>{lang === 'hi' ? 'चरण 3 (Anti-Theft Mode) पर जाएं' : 'Proceed to Step 3'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Android Device Administrator Simulation Sheet */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {lang === 'hi' ? 'डिवाइस एडमिनिस्ट्रेटर सक्रिय करें?' : 'Activate Device Administrator?'}
                </h3>
                <p className="text-xs text-slate-400">Rakshak Anti-Theft Security</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'hi'
                ? 'डिवाइस को अनधिकृत अनइंस्टॉल से बचाने और लॉक स्क्रीन पर सुरक्षा गार्ड सक्रिय रखने के लिए यह आवश्यक है।'
                : 'Activating this administrator app allows Rakshak Anti-Theft to enforce lock screen security and monitor unlock attempts in background.'}
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'hi' ? 'स्क्रीन अनलॉक प्रयासों की निगरानी' : 'Monitor screen-unlock attempts'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'hi' ? 'फोन लॉक होने पर भी सुरक्षा सक्रिय' : 'Lock screen background monitoring'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'hi' ? 'रिमोट अलार्म और लॉक आदेश' : 'Remote alarm and lock trigger'}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAdminModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onUpdatePermissions({ backgroundAdmin: 'granted' });
                  setShowAdminModal(false);
                  sound.playUnlockChime();
                }}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30"
              >
                {lang === 'hi' ? 'सक्रिय करें (Activate)' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
