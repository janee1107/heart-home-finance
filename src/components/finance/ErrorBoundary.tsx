import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ZenButton } from './ZenButton';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  private handleClearData = () => {
    if (confirm('確定要清除所有資料嗎？此操作無法復原。')) {
      // Clear all Re:Balance localStorage keys
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('rb_')) {
          localStorage.removeItem(key);
        }
      });
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-8">
            <AlertTriangle size={64} className="text-muted-foreground mx-auto mb-4 opacity-50" />
            <h1 className="text-2xl font-bold text-foreground mb-2">發生錯誤</h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
              應用程式遇到問題。請嘗試重新整理，或清除資料重新開始。
            </p>
          </div>
          
          {this.state.error && (
            <div className="bg-card border border-border rounded-2xl p-4 mb-8 max-w-sm w-full">
              <p className="text-xs text-muted-foreground font-mono break-all">
                {this.state.error.message}
              </p>
            </div>
          )}

          <div className="w-full max-w-xs space-y-3">
            <ZenButton onClick={this.handleReset}>
              <RefreshCw size={18} />
              重新整理
            </ZenButton>
            <ZenButton variant="danger" onClick={this.handleClearData}>
              <Trash2 size={18} />
              清除資料並重置
            </ZenButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
