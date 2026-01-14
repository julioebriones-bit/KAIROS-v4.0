import React, { Suspense, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ksm } from './stateManager';

/**
 * KAIROS v4.0 Orchestrator - Core Bootloader
 * Bilateral Sports Analysis (LMB, NCAA, NBA)
 * Golden Rule (28-Sep) Compliant
 */

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Fix: Explicitly extending React.Component with typed generic parameters. Added explicit member declarations for state and props to resolve TS errors.
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Declare state and props explicitly to resolve property existence errors in the compiler.
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Fix: State is initialized as a property of the class instance, inheriting from React.Component.
    this.state = {
      hasError: false
    };
  }

  // Standard React lifecycle method for error boundaries to update state from error.
  static getDerivedStateFromError(_: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('KAIROS_CRITICAL_EXCEPTION:', error, errorInfo);
    ksm.logActivity('SYSTEM', `🚨 Critical Exception: ${error.message}`, 'critical');
  }

  render() {
    // Fix: Accessing state and props from the instance (this) which are now properly recognized by the compiler.
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-10 text-center">
          <div className="w-20 h-20 border-2 border-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,0,60,0.4)]">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-4">Neural Link Severed</h1>
          <p className="text-gray-500 font-mono text-sm max-w-md mb-8">
            KAIROS v4.0 has encountered an unrecoverable arbitration error. Reality synchronization failed.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-red-500/10 border border-red-500/30 text-red-500 font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all"
          >
            Re-initiate Protocol
          </button>
        </div>
      );
    }
    return children;
  }
}

const LoadingFallback = () => (
  <div className="h-screen w-screen bg-virtus-bg flex flex-col items-center justify-center">
    <div className="relative">
      <div className="w-24 h-24 border-t-2 border-virtus-aztecCyan rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-virtus-aztecCyan/20 rounded-lg animate-pulse"></div>
      </div>
    </div>
    <div className="mt-8 text-center">
      <div className="text-virtus-aztecCyan font-black tracking-[0.5em] uppercase text-xs mb-2">KAIROS_V4_INITIALIZING</div>
      <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-virtus-aztecCyan animate-progress"></div>
      </div>
    </div>
  </div>
);

const init = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  ksm.logActivity('SYSTEM', 'KAIROS v4.0 Orchestrator Ready.', 'medium');

  const root = createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <App />
        </Suspense>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

init();