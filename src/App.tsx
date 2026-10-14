import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AppLayout from './components/layout/AppLayout.tsx';

// Public Views
import LandingPage from './pages/public/LandingPage.tsx';
import Login from './pages/public/Login.tsx';

// Admin Views
import Dashboard from './pages/admin/Dashboard.tsx';
import Agenda from './pages/admin/Agenda.tsx';
import Pacientes from './pages/admin/Pacientes.tsx';
import Faturamento from './pages/admin/Faturamento.tsx';

import { DataProvider } from './contexts/DataContext.tsx';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* ROTAS PÚBLICAS (Acesso Livre) */}
            <Route path="/login" element={<Login />} />

            {/* ROTAS PROTEGIDAS (Exigem Autenticação) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/pacientes" element={<Pacientes />} />
                <Route path="/faturamento" element={<Faturamento />} />
              </Route>
            </Route>

            {/* FALLBACK: Redireciona qualquer URL inexistente para o Login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}