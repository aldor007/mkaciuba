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
 * Uses isMounted to avoid hydration mismatches (SSR renders nothing, client waits until after mount)
 */
export class SafeFacebookPage extends React.Component<SafeFacebookPageProps, SafeFacebookPageState> {
  constructor(props: SafeFacebookPageProps) {
    super(props);
    this.state = { hasError: false, isMounted: false };
  }

  componentDidMount() {
    // Only render Facebook component after mounting (after hydration completes)
    this.setState({ isMounted: true });
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
    // Don't render Facebook components during SSR or before client-side mount
    // This ensures SSR and initial client render match (both return null)
    // After hydration completes, isMounted becomes true and Facebook renders
    if (!this.state.isMounted) {
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
