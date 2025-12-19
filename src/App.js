import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginComponent from './components/LoginComponent.tsx';
import {ROUTES} from "./app.router.ts";
import './App.css';
import HomeComponent from './components/HomeComponent.tsx';
import Dashboard from './components/Dashboard.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginComponent />} />
        <Route path="/home/:id" element={<HomeComponent />} />
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
