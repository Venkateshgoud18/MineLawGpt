import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#f5f5f7', fontFamily: 'monospace', background: '#1c1c1e', minHeight: '100vh' }}>
          <h2 style={{ color: '#ff453a', marginBottom: '16px' }}>Something went wrong</h2>
          <pre style={{ background: '#000', padding: '16px', borderRadius: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#ff9f0a' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: '24px', padding: '10px 20px', background: '#2997ff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
