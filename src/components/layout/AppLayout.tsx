import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.tsx';
import Sidebar from './Sidebar.tsx';
import BottomNavigation from './BottomNavigation.tsx';
import { GlobalActions } from './GlobalActions.tsx'; // <-- Importe aqui

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Header />

      <div className="flex-1 flex max-w-6xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 w-full px-4 py-4 sm:py-6 pb-28 md:pb-10 max-w-4xl mx-auto">
          <Outlet />
        </main>
      </div>

      <GlobalActions /> {/* <-- Coloque o botão flutuante aqui */}
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;