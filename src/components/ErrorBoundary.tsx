import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Rakshak App Caught Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-white">
              रक्षक सुरक्षा ऐप पुनः लोड हो रहा है...
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              सिस्टम को पुनर्स्थापित किया जा रहा है। नीचे दिए गए बटन पर क्लिक करके ऐप को पुनः आरंभ करें।
            </p>

            {this.state.error?.message && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-red-300 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-600/30"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ऐप रीसेट एवं पुनः प्रारंभ करें (Reload App)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
