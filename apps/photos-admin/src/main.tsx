import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import store from './app/store';

import App from './app/app';
const StoreContext = React.createContext(null);


ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
