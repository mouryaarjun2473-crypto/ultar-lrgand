import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Step1Setup } from './components/Step1Setup';
import { Step2Permissions } from './components/Step2Permissions';
import { Step3AntiTheft } from './components/Step3AntiTheft';
import { LockScreenSimulator } from './components/LockScreenSimulator';
import { IntruderVault } from './components/IntruderVault';
import { AndroidPhoneFrame } from './components/AndroidPhoneFrame';
import { WorkflowExplainer } from './components/WorkflowExplainer';
import {
  Language,
  UserProfile,
  LinkedDevice,
  PermissionStatus,
  AntiTheftConfig,
  IntruderIncident
} from './types';
import { t } from './utils/translations';
import { sound } from './utils/audio';
import { capturePhotoFromCamera, getCurrentDeviceLocation, generateSimulatedIntruderPhoto } from './utils/camera';
import { Shield, Sparkles, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function App() {
  // Language (Hindi default per user's prompt, switchable to English)
  const [lang, setLang] = useState<Language>('hi');
  const [viewMode, setViewMode] = useState<'mobile' | 'dashboard'>('mobile');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isLockScreenOpen, setIsLockScreenOpen] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isAnalyzingId, setIsAnalyzingId] = useState<string | null>(null);
  const [quickTestNotification, setQuickTestNotification] = useState<string | null>(null);

  // User Profile State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('rakshak_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      name: 'Arjun Maurya',
      phone: '+91 9876543210',
      email: 'mouryaarjun2473@gmail.com',
      pin: '7890',
      emergencyContact1: {
        name: 'Ramesh Maurya',
        phone: '+91 9811122233',
        relation: 'पिता (Father)',
      },
      emergencyContact2: {
        name: 'Priya Maurya',
        phone: '+91 9844455566',
        relation: 'बहन (Sister)',
      },
      isRegistered: true,
    };
  });

  // Linked Device State
  const [device, setDevice] = useState<LinkedDevice>(() => {
    const saved = localStorage.getItem('rakshak_device');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      id: 'DEV-SM-S928B',
      model: 'Samsung Galaxy S24 Ultra',
      manufacturer: 'Samsung',
      osVersion: 'Android 15.0 (One UI 7.0)',
      imeiHash: '864209051938271',
      isLinked: true,
      linkedAt: '10:45 AM',
      batteryLevel: 92,
      batteryCharging: false,
      networkType: '5G',
      ipAddress: '157.34.120.48',
    };
  });

  // Permission Status
  const [permissions, setPermissions] = useState<PermissionStatus>(() => {
    const saved = localStorage.getItem('rakshak_permissions');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      camera: 'granted',
      location: 'granted',
      internet: 'granted',
      backgroundAdmin: 'granted',
      drawOverApps: 'granted',
      motionSensor: 'granted',
      userConsentAccepted: true,
      consentTimestamp: new Date().toLocaleDateString(),
    };
  });

  // Anti-Theft Config
  const [config, setConfig] = useState<AntiTheftConfig>(() => {
    const saved = localStorage.getItem('rakshak_config');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      isArmed: true,
      captureOnWrongPin: true,
      maxFailedAttempts: 2,
      sirenAlarm: true,
      sirenVolume: 0.85,
      silentCapture: false,
      flashScreenOnAlert: true,
      sendSmsAlert: true,
      motionDetection: true,
      pocketPickAlert: true,
    };
  });

  // Intruder Incidents
  const [incidents, setIncidents] = useState<IntruderIncident[]>(() => {
    const saved = localStorage.getItem('rakshak_incidents');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    // Initial sample incident for immediate demonstration
    const sampleImg = generateSimulatedIntruderPhoto();
    return [
      {
        id: 'INC-748921',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        imageData: sampleImg,
        failedAttempts: 2,
        enteredPin: '1234',
        location: {
          lat: 28.6139,
          lng: 77.209,
          accuracy: 8,
          address: 'Connaught Place, New Delhi, Delhi 110001, India',
        },
        deviceModel: 'Samsung Galaxy S24 Ultra',
        batteryLevel: 94,
        sirenTriggered: true,
        smsDispatched: true,
        aiAnalysis: {
          threatLevel: 'HIGH',
          summary: 'अनधिकृत व्यक्ति द्वारा लगातार 2 बार गलत पिन (1234) दर्ज किया गया। फ्रंट कैमरे द्वारा स्पष्ट मुखाकृति और पृष्ठभूमि दर्ज की गई।',
          surroundings: 'कम रोशनी वाला इनडोर परिवेश। चेहरे का कोण लगभग 45 सेंटीमीटर की दूरी पर सीधा है।',
          recommendedActions: [
            'आपातकालीन संपर्कों (+91 9811122233) को भेजा गया अलर्ट सत्यापित करें।',
            'लाइव जीपीएस स्थिति की निगरानी जारी रखें।',
            'डिवाइस को दूरस्थ रूप से लॉक स्थिति में रखें।'
          ],
          confidenceScore: 0.95,
          isAiGenerated: true,
        },
      },
    ];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('rakshak_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('rakshak_device', JSON.stringify(device));
  }, [device]);

  useEffect(() => {
    localStorage.setItem('rakshak_permissions', JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem('rakshak_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('rakshak_incidents', JSON.stringify(incidents));
  }, [incidents]);

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateDevice = (updated: Partial<LinkedDevice>) => {
    setDevice((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdatePermissions = (updated: Partial<PermissionStatus>) => {
    setPermissions((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateConfig = (updated: Partial<AntiTheftConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleIntruderCaptured = (incident: IntruderIncident) => {
    setIncidents((prev) => [incident, ...prev]);
  };

  const handleClearIncidents = () => {
    setIncidents([]);
    sound.playKeypadClick();
  };

  const handleToggleSiren = () => {
    if (isSirenActive) {
      sound.stopAlarmSiren();
      setIsSirenActive(false);
    } else {
      sound.startAlarmSiren(config.sirenVolume);
      setIsSirenActive(true);
    }
  };

  const handleQuickCaptureTest = async () => {
    sound.playShutterSound();
    setQuickTestNotification(lang === 'hi' ? 'कैमरा कैप्चर किया जा रहा है...' : 'Capturing front camera photo...');
    const photo = await capturePhotoFromCamera();
    const loc = await getCurrentDeviceLocation();

    const newInc: IntruderIncident = {
      id: 'TEST-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toISOString(),
      imageData: photo,
      failedAttempts: 1,
      enteredPin: '0000',
      location: loc,
      deviceModel: device.model,
      batteryLevel: device.batteryLevel,
      sirenTriggered: false,
      smsDispatched: true,
    };

    setIncidents((prev) => [newInc, ...prev]);
    sound.playUnlockChime();
    setQuickTestNotification(lang === 'hi' ? '✅ फोटो कैप्चर सफल! वॉल्ट में सहेज ली गई।' : '✅ Photo captured & added to vault!');
    setTimeout(() => setQuickTestNotification(null), 3500);
    setActiveStep(4);
  };

  const handleAnalyzeWithGemini = async (incidentId: string) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    setIsAnalyzingId(incidentId);
    try {
      const res = await fetch('/api/gemini/analyze-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: inc.imageData,
          deviceModel: device.model,
          failedAttempts: inc.failedAttempts,
          timestamp: inc.timestamp,
          location: inc.location,
          language: lang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIncidents((prev) =>
          prev.map((item) => (item.id === incidentId ? { ...item, aiAnalysis: data } : item))
        );
        sound.playUnlockChime();
      }
    } catch (e) {
      console.error('Failed to analyze:', e);
    } finally {
      setIsAnalyzingId(null);
    }
  };

  // Render Step Content
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <Step1Setup
            lang={lang}
            user={user}
            device={device}
            onUpdateUser={handleUpdateUser}
            onUpdateDevice={handleUpdateDevice}
            onProceedToStep2={() => {
              setActiveStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      case 2:
        return (
          <Step2Permissions
            lang={lang}
            permissions={permissions}
            onUpdatePermissions={handleUpdatePermissions}
            onProceedToStep3={() => {
              setActiveStep(3);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      case 3:
        return (
          <Step3AntiTheft
            lang={lang}
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onLaunchLockScreen={() => setIsLockScreenOpen(true)}
            onQuickCaptureTest={handleQuickCaptureTest}
            isSirenActive={isSirenActive}
            onToggleSiren={handleToggleSiren}
            onViewVault={() => setActiveStep(4)}
            onViewHowItWorks={() => setActiveStep(5)}
            hasIntruderEvents={incidents.length > 0}
          />
        );
      case 4:
        return (
          <IntruderVault
            lang={lang}
            incidents={incidents}
            onClearIncidents={handleClearIncidents}
            onAnalyzeWithGemini={handleAnalyzeWithGemini}
            isAnalyzingId={isAnalyzingId}
          />
        );
      case 5:
        return (
          <WorkflowExplainer
            lang={lang}
            onLaunchLiveTest={() => setIsLockScreenOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <Header
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'hi' ? 'en' : 'hi'))}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        isArmed={config.isArmed}
        batteryLevel={device.batteryLevel}
        isSirenActive={isSirenActive}
        onStopSiren={handleToggleSiren}
        activeStep={activeStep}
        onSelectStep={setActiveStep}
      />

      {/* Floating Notification */}
      {quickTestNotification && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-950/80 border border-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{quickTestNotification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {viewMode === 'mobile' ? (
          <AndroidPhoneFrame
            isArmed={config.isArmed}
            batteryLevel={device.batteryLevel}
          >
            {renderStepContent()}
          </AndroidPhoneFrame>
        ) : (
          <div className="space-y-6">
            {renderStepContent()}
          </div>
        )}
      </main>

      {/* Interactive Android Lock Screen Simulator */}
      <LockScreenSimulator
        lang={lang}
        user={user}
        device={device}
        config={config}
        isOpen={isLockScreenOpen}
        onClose={() => setIsLockScreenOpen(false)}
        onIntruderCaptured={handleIntruderCaptured}
        isSirenActive={isSirenActive}
        onToggleSiren={handleToggleSiren}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">
              {lang === 'hi' ? 'रक्षक एंटी-थेफ्ट सुरक्षा प्रणाली' : 'Rakshak Anti-Theft Security'}
            </span>
          </div>
          <p className="text-slate-400">
            {lang === 'hi'
              ? 'चरण 1 (सेटअप) • चरण 2 (अनुमतियां) • चरण 3 (एंटी-थेफ्ट मोड) पूर्ण रूप से कार्यान्वित'
              : 'Step 1 (Setup) • Step 2 (Permissions) • Step 3 (Anti-Theft Mode) Fully Operational'}
          </p>
          <div className="text-slate-400">
            <span>Owner PIN: </span>
            <strong className="text-amber-400 font-mono">{user.pin}</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
