import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter}  from 'react-router-dom';
import { loadableReady } from '@loadable/component';
import { HelmetProvider } from 'react-helmet-async';
import './main.css';
import App from './app/app';
import * as Sentry from '@sentry/react';

const mountElement = document.getElementById('root');
// Don't pass client or routes props - let App use defaults
// This matches SSR behavior when we remove those props from SSR too
const app = (
    <BrowserRouter>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </BrowserRouter>
);

if (mountElement.childElementCount === 0) {
    // Client-side render with Sentry
    const appWithSentry = (
        <Sentry.ErrorBoundary fallback={<div>An error has occurred. Please refresh the page.</div>} showDialog>
            {app}
        </Sentry.ErrorBoundary>
    );
    createRoot(mountElement).render(appWithSentry);
} else {
    // Hydrate SSR content - wait for all chunks to load first
    // Don't wrap in Sentry.ErrorBoundary during hydration to match SSR tree
    loadableReady(() => {
        hydrateRoot(mountElement, app);
    });
}
