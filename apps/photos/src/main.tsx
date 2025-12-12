import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter}  from 'react-router-dom';
import { loadableReady } from '@loadable/component';
import './main.css';
import App from './app/app';
import * as Sentry from '@sentry/react';

const mountElement = document.getElementById('root');
const app = (
    <Sentry.ErrorBoundary fallback={<div>An error has occurred. Please refresh the page.</div>} showDialog>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Sentry.ErrorBoundary>
);

if (mountElement.childElementCount === 0) {
    // Client-side render
    createRoot(mountElement).render(app);
} else {
    // Hydrate SSR content - wait for all chunks to load first
    loadableReady(() => {
        hydrateRoot(mountElement, app);
    });
}
