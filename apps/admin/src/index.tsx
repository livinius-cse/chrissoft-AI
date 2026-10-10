import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
