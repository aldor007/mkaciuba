import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter}  from 'react-router-dom';
import './main.css';
import App from './app/app';

const mountElement = document.getElementById('root');
const reactMountFn = (mountElement.childElementCount === 0)
    ? ReactDOM.render
    : ReactDOM.hydrate;

reactMountFn(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('root')
  );
