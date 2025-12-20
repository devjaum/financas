import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginComponent from './components/LoginComponent.tsx';
import {ROUTES} from "./app.router.ts";
import './App.css';
import HomeComponent from './components/HomeComponent.tsx';
import Dashboard from './components/Dashboard.tsx';
import SetupAccount from './components/SetupAccount.tsx';
import AddTransaction from './components/AddTransaction.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginComponent />} />
          <Route path="/home/:id" element={<HomeComponent />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.SETUP_ACCOUNT} element={<SetupAccount />} />
          <Route path={ROUTES.ADD_TRANSACTION} element={<AddTransaction />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;