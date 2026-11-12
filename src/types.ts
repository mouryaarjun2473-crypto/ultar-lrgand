export type Language = 'hi' | 'en';

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  pin: string; // 4-digit master PIN
  emergencyContact1: {
    name: string;
    phone: string;
    relation: string;
  };
  emergencyContact2: {
    name: string;
    phone: string;
    relation: string;
  };
  isRegistered: boolean;
  avatarUrl?: string;
}

export interface LinkedDevice {
  id: string;
  model: string;
  manufacturer: string;
  osVersion: string;
  imeiHash: string;
  isLinked: boolean;
  linkedAt: string;
  batteryLevel: number;
  batteryCharging: boolean;
  networkType: '5G' | '4G LTE' | 'Wi-Fi';
  ipAddress: string;
}

export interface PermissionStatus {
  camera: 'granted' | 'denied' | 'prompt';
  location: 'granted' | 'denied' | 'prompt';
  internet: 'granted' | 'denied' | 'prompt';
  backgroundAdmin: 'granted' | 'denied' | 'prompt';
  drawOverApps: 'granted' | 'denied' | 'prompt';
  motionSensor: 'granted' | 'denied' | 'prompt';
  userConsentAccepted: boolean;
  consentTimestamp?: string;
}

export interface AntiTheftConfig {
  isArmed: boolean;
  captureOnWrongPin: boolean;
  maxFailedAttempts: number; // 1, 2, or 3
  sirenAlarm: boolean;
  sirenVolume: number; // 0 to 1
  silentCapture: boolean;
  flashScreenOnAlert: boolean;
  sendSmsAlert: boolean;
  motionDetection: boolean;
  pocketPickAlert: boolean;
}

export interface IntruderIncident {
  id: string;
  timestamp: string;
  imageData: string; // Base64 data URL
  failedAttempts: number;
  enteredPin: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
    address?: string;
  };
  deviceModel: string;
  batteryLevel: number;
  sirenTriggered: boolean;
  smsDispatched: boolean;
  aiAnalysis?: {
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    summary: string;
    surroundings: string;
    recommendedActions: string[];
    confidenceScore: number;
    isAiGenerated: boolean;
  };
}
