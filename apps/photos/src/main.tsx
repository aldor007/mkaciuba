import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter}  from 'react-router-dom';
import './main.css';
import App from './app/app';
import * as Sentry from '@sentry/react';

const mountElement = document.getElementById('root');
const reactMountFn = (mountElement.childElementCount === 0)
    ? ReactDOM.render
    : ReactDOM.hydrate;

reactMountFn(
    <Sentry.ErrorBoundary fallback={<div>An error has occurred. Please refresh the page.</div>} showDialog>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Sentry.ErrorBoundary>,
    document.getElementById('root')
  );
