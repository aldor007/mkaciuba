import React from 'react';
import { FacebookProvider, Page } from 'react-facebook';

interface SafeFacebookPageProps {
  appId: string;
  pageUrl: string;
  tabs?: string;
}

interface SafeFacebookPageState {
  hasError: boolean;
}

/**
 * Error boundary wrapper for Facebook Page component
 * Prevents Facebook SDK loading failures from breaking the entire page
 */
export class SafeFacebookPage extends React.Component<SafeFacebookPageProps, SafeFacebookPageState> {
  constructor(props: SafeFacebookPageProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeFacebookPageState {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console for debugging
    console.warn('Facebook SDK failed to load:', error.message);
    // You can also log to an error reporting service here if needed
  }

  render() {
    // Don't render Facebook components during SSR
    if (typeof window === 'undefined') {
      return null;
    }

    // If there was an error loading Facebook SDK, show nothing
    if (this.state.hasError) {
      return null;
    }

    try {
      return (
        <FacebookProvider appId={this.props.appId}>
          <Page href={this.props.pageUrl} tabs={this.props.tabs || 'timeline'} />
        </FacebookProvider>
      );
    } catch (error) {
      // Catch synchronous errors during render
      console.warn('Facebook component render error:', error);
      return null;
    }
  }
}
