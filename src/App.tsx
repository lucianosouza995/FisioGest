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

// Adicione este import no topo:
import { DataProvider } from './contexts/DataContext.tsx';

// Modifique a função App:
export default function App() {
  return (
    <AuthProvider>
      <DataProvider> {/* <-- Adicionado aqui */}
        <BrowserRouter>
          <Routes>
            {/* Rota de Login (se tiver) */}
            <Route path="/login" element={<Login />} />

            {/* Dentro das suas rotas protegidas ou do AppLayout */}
            <Route element={<AppLayout />}>
              {/* ADICIONE ESTA LINHA PARA RESOLVER O ERRO: */}
              <Route path="/" element={<Dashboard />} />

              <Route path="/agenda" element={<Agenda />} />
              <Route path="/pacientes" element={<Pacientes />} />
              <Route path="/faturamento" element={<Faturamento />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider> {/* <-- Adicionado aqui */}
    </AuthProvider>
  );
}