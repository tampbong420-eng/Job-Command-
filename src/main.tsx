import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { App } from '@/App';
import { FieldPortal } from '@/components/FieldPortal';
import { StoreProvider } from '@/lib/store';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/crew/:token" element={<FieldPortal />} />
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
);
