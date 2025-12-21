import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {ROUTES} from "./app.router.ts";
import './App.css';
import Dashboard from './components/Dashboard.tsx';

import { ThemeProvider } from './contexts/ThemeContext.tsx';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;