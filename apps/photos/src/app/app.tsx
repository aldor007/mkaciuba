import React from 'react';
import { Route, Link, Switch } from 'react-router-dom';
import '../assets/main.css'
import '../assets/photos.css'
import { Home } from './pages/Home'
import { renderRoutes } from 'react-router-config';
import { Routes } from '../routes';


export const App = () => {
  return (
    <Switch>
    {renderRoutes(Routes)}
  </Switch>
  );
};

export default App;
