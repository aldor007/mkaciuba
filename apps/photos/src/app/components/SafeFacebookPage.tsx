import React from 'react';
import { FacebookProvider, Page } from 'react-facebook';

interface SafeFacebookPageProps {
  appId: string;
  pageUrl: string;
  tabs?: string;
}

interface SafeFacebookPageState {
  hasError: boolean;
  isMounted: boolean;
}

/**
 * Error boundary wrapper for Facebook Page component
 * Prevents Facebook SDK loading failures from breaking the entire page
 * Uses isMounted to avoid hydration mismatches (SSR renders placeholder, client shows Facebook after mount)
 */
export class SafeFacebookPage extends React.Component<SafeFacebookPageProps, SafeFacebookPageState> {
  private handleUnhandledRejection?: (event: PromiseRejectionEvent) => void;

  constructor(props: SafeFacebookPageProps) {
    super(props);
    this.state = { hasError: false, isMounted: false };
  }

  componentDidMount() {
    // Only render Facebook component after mounting (after hydration completes)
    this.setState({ isMounted: true });

    // Handle unhandled promise rejections from Facebook SDK
    this.handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message && event.reason.message.includes('XFBML')) {
        console.warn('Facebook SDK promise rejection caught:', event.reason.message);
        this.setState({ hasError: true });
        event.preventDefault(); // Prevent the error from appearing in console
      }
    };

    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    if (this.handleUnhandledRejection) {
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  static getDerivedStateFromError(error: Error): Partial<SafeFacebookPageState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console for debugging
    console.warn('Facebook SDK failed to load:', error.message);
    // You can also log to an error reporting service here if needed
  }

  render() {
    // If there was an error loading Facebook SDK, render placeholder to maintain structure
    if (this.state.hasError) {
      return <div style={{ minHeight: '180px' }} aria-label="Facebook feed unavailable" suppressHydrationWarning />;
    }

    // Don't render Facebook components during SSR or before client-side mount
    // Return a placeholder div that will be replaced after mount
    // Use suppressHydrationWarning because this is intentionally different after hydration
    if (!this.state.isMounted) {
      return <div style={{ minHeight: '180px' }} aria-label="Loading Facebook feed" suppressHydrationWarning />;
    }

    try {
      return (
        <div suppressHydrationWarning>
          <FacebookProvider appId={this.props.appId}>
            <Page href={this.props.pageUrl} tabs={this.props.tabs || 'timeline'} />
          </FacebookProvider>
        </div>
      );
    } catch (error) {
      // Catch synchronous errors during render
      console.warn('Facebook component render error:', error);
      return <div style={{ minHeight: '180px' }} aria-label="Facebook feed unavailable" suppressHydrationWarning />;
    }
  }
}
