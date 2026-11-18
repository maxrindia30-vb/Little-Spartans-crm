import React from 'react';
import { AlertCircle, RefreshCw, Home, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Captured in ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[360px] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#172B501A] shadow-xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFF4E8] text-[#F4510B] border border-[#F4510B25] flex items-center justify-center shadow-xs">
              <AlertCircle className="w-8 h-8 text-[#F4510B]" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-[#172B50] tracking-tight">
                {this.props.title || 'Something went wrong in this view'}
              </h3>
              <p className="text-xs text-[#172B50] opacity-75 mt-1 leading-relaxed">
                {this.props.message ||
                  'An unexpected error occurred while rendering this section. Click below to refresh or return to the dashboard.'}
              </p>
            </div>

            {this.state.error?.message && (
              <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 max-h-28 overflow-y-auto">
                <span className="font-bold text-rose-600 block mb-0.5">Error Details:</span>
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#F4510B] text-white hover:bg-[#E04505] transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry View</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FFF4E8] text-[#172B50] border border-[#172B5020] hover:bg-[#FFE8D6] transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#F4510B]" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
