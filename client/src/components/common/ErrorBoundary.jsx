import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRecover = () => {
    try {
      // Clear non-essential cached UI data
      const token = localStorage.getItem('sakhawat_admin_token');
      const user = localStorage.getItem('sakhawat_admin_user');
      localStorage.clear();
      if (token) localStorage.setItem('sakhawat_admin_token', token);
      if (user) localStorage.setItem('sakhawat_admin_user', user);
    } catch (e) {}

    this.setState({ hasError: false, error: null });
    window.location.href = '/admin/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900/95 border border-zinc-800 text-center space-y-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto text-xl font-bold">
              ⚡
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-display text-white">System Auto-Recovery</h2>
              <p className="text-xs text-zinc-400">
                {this.state.error?.message || 'A temporary browser display issue was detected.'}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRecover}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Clear Cache & Open Dashboard
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

