import React, { useState } from 'react';
import {
  ShieldAlert,
  Camera,
  MapPin,
  Clock,
  Sparkles,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Language, IntruderIncident } from '../types';
import { t } from '../utils/translations';
import { sound } from '../utils/audio';

interface IntruderVaultProps {
  lang: Language;
  incidents: IntruderIncident[];
  onClearIncidents: () => void;
  onAnalyzeWithGemini: (incidentId: string) => Promise<void>;
  isAnalyzingId: string | null;
}

export const IntruderVault: React.FC<IntruderVaultProps> = ({
  lang,
  incidents,
  onClearIncidents,
  onAnalyzeWithGemini,
  isAnalyzingId,
}) => {
  const dict = t[lang];
  const [selectedIncident, setSelectedIncident] = useState<IntruderIncident | null>(null);

  const handleDownload = (incident: IntruderIncident) => {
    sound.playKeypadClick();
    const link = document.createElement('a');
    link.href = incident.imageData;
    link.download = `RAKSHAK_INTRUDER_${incident.id}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-lg">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {dict.intruderVault}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
                  {incidents.length} {lang === 'hi' ? 'घटनाएं' : 'Incidents'}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {lang === 'hi'
                  ? 'गलत पिन डालने पर खींची गई तस्वीरें, जीपीएस स्थान और जेमिनी एआई विश्लेषण रिपोर्ट'
                  : 'Front camera intruder captures, GPS coordinates, and Gemini AI threat reports'}
              </p>
            </div>
          </div>

          {incidents.length > 0 && (
            <button
              onClick={() => {
                onClearIncidents();
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer self-start sm:self-auto transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'लॉग साफ़ करें' : 'Clear Log'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {incidents.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-white text-base">
            {lang === 'hi' ? 'कोई घुसपैठ नहीं पाई गई' : 'No Intruder Incidents Detected'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            {dict.noIncidents}
          </p>
          <div className="pt-2 text-[11px] text-slate-500 font-mono">
            {lang === 'hi'
              ? 'परीक्षण के लिए: चरण 3 में "लॉक स्क्रीन का परीक्षण करें" पर क्लिक करें और कोई गलत पिन दर्ज करें।'
              : 'To test: Go to Step 3 and click "Test Lock Screen", then enter an incorrect PIN.'}
          </div>
        </div>
      ) : (
        /* Incident Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {incidents.map((inc) => {
            const hasAi = !!inc.aiAnalysis;
            const threatLevel = inc.aiAnalysis?.threatLevel || (inc.failedAttempts >= 3 ? 'HIGH' : 'MEDIUM');

            return (
              <div
                key={inc.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg transition flex flex-col justify-between"
              >
                {/* Photo Header */}
                <div className="relative group cursor-pointer aspect-video bg-black overflow-hidden"
                  onClick={() => setSelectedIncident(inc)}
                >
                  <img
                    src={inc.imageData}
                    alt="Intruder Snapshot"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600/90 text-white font-bold flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {inc.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      threatLevel === 'HIGH' || threatLevel === 'CRITICAL'
                        ? 'bg-red-500/90 text-white animate-pulse'
                        : 'bg-amber-500/90 text-slate-950'
                    }`}>
                      {threatLevel} THREAT
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-semibold flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'बड़ा देखें' : 'Expand'}</span>
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-red-400 font-semibold text-[11px]">
                        {inc.failedAttempts} {dict.failedAttemptsCount}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 text-xs text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="truncate">
                        {inc.location.address || `${inc.location.lat}, ${inc.location.lng}`}
                      </span>
                    </div>

                    {/* AI Assessment Sneak Peek */}
                    {hasAi ? (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                        <div className="flex items-center gap-1 text-cyan-400 font-semibold text-[11px]">
                          <Sparkles className="w-3 h-3" />
                          <span>Gemini AI Assessment</span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2">
                          {inc.aiAnalysis?.summary}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAnalyzeWithGemini(inc.id)}
                        disabled={isAnalyzingId === inc.id}
                        className="w-full py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 text-cyan-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        {isAnalyzingId === inc.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{lang === 'hi' ? 'विश्लेषण हो रहा है...' : 'Analyzing...'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{lang === 'hi' ? 'AI विश्लेषण प्राप्त करें' : 'Run Gemini Threat AI'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <a
                      href={`https://www.google.com/maps?q=${inc.location.lat},${inc.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-medium transition"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{dict.viewOnMap}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    <button
                      onClick={() => handleDownload(inc)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg transition cursor-pointer"
                      title={dict.downloadEvidence}
                    >
                      <Download className="w-3 h-3" />
                      <span>{lang === 'hi' ? 'डाउनलोड' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded Incident Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-white text-base">
                  {lang === 'hi' ? 'घटना विवरण एवं फॉरेंसिक साक्ष्य' : 'Incident Details & Forensic Evidence'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* High-res Image preview */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800">
              <img
                src={selectedIncident.imageData}
                alt="Intruder Photo"
                className="w-full max-h-[380px] object-contain mx-auto"
              />
            </div>

            {/* Key Metadata Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">{dict.incidentAt}</span>
                <span className="font-mono text-white text-[11px]">
                  {new Date(selectedIncident.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">{dict.failedAttemptsCount}</span>
                <span className="font-bold text-red-400 text-sm">
                  {selectedIncident.failedAttempts} Attempts
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">{lang === 'hi' ? 'दर्ज गलत पिन' : 'Attempted PIN'}</span>
                <span className="font-mono text-amber-400 text-sm">
                  {selectedIncident.enteredPin || '****'}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">{lang === 'hi' ? 'सायरन की स्थिति' : 'Siren Triggered'}</span>
                <span className="font-semibold text-white">
                  {selectedIncident.sirenTriggered ? 'YES (Active)' : 'NO (Silent)'}
                </span>
              </div>
            </div>

            {/* Full Gemini AI Analysis Breakdown */}
            {selectedIncident.aiAnalysis && (
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>{dict.aiAnalysis}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedIncident.aiAnalysis.threatLevel === 'HIGH' || selectedIncident.aiAnalysis.threatLevel === 'CRITICAL'
                      ? 'bg-red-500/90 text-white'
                      : 'bg-amber-500/90 text-slate-950'
                  }`}>
                    {dict.threatLevel}: {selectedIncident.aiAnalysis.threatLevel}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {selectedIncident.aiAnalysis.summary}
                </p>

                {selectedIncident.aiAnalysis.surroundings && (
                  <div className="text-xs text-slate-300">
                    <strong className="text-slate-400 block mb-0.5">{dict.surroundings}:</strong>
                    <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      {selectedIncident.aiAnalysis.surroundings}
                    </p>
                  </div>
                )}

                {selectedIncident.aiAnalysis.recommendedActions?.length > 0 && (
                  <div className="text-xs text-slate-300 space-y-1">
                    <strong className="text-emerald-400 block mb-1">{dict.recommendations}:</strong>
                    <ul className="space-y-1.5">
                      {selectedIncident.aiAnalysis.recommendedActions.map((act, i) => (
                        <li key={i} className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-2">
              <a
                href={`https://www.google.com/maps?q=${selectedIncident.location.lat},${selectedIncident.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{dict.viewOnMap} ({selectedIncident.location.lat}, {selectedIncident.location.lng})</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleDownload(selectedIncident)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{dict.downloadEvidence}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
