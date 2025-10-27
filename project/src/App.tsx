import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { BarChart3, BookOpen, Settings, PlusCircle, History, Wallet, Menu, X, LogOut, FileText, Activity, Clock } from 'lucide-react';
import Dashboard from './components/Dashboard';
import NovaAposta from './components/NovaAposta';
import NovoMetodo from './components/NovoMetodo';
import Metodos from './components/Metodos';
import MetodoDetalhes from './components/MetodoDetalhes';
import GestaoFinanceira from './components/GestaoFinanceira';
import Configuracoes from './components/Configuracoes';
import Historico from './components/Historico';
import Login from './components/Login';
import Termos from './components/Termos';
import ProtectedRoute from './components/ProtectedRoute';
import JogosAoVivo from './components/JogosAoVivo';
import PreJogos from './components/PreJogos';
import useBancaStore from './store/bancaStore';
import useAuthStore from './store/authStore';

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuthStore();

  const isActive = (path: string) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
      : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800";
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative w-64 h-full bg-white dark:bg-gray-900 shadow-lg transition-transform duration-200 ease-in-out z-20`}
      >
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">BancaPro</h1>
        </div>
        <nav className="mt-4">
          <Link
            to="/"
            className={`flex items-center px-4 py-3 ${isActive('/')}`}
            onClick={() => setIsOpen(false)}
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link
            to="/ao-vivo"
            className={`flex items-center px-4 py-3 ${isActive('/ao-vivo')}`}
            onClick={() => setIsOpen(false)}
          >
            <Activity className="w-5 h-5 mr-3" />
            Jogos ao vivo
          </Link>
          <Link
            to="/pre-jogos"
            className={`flex items-center px-4 py-3 ${isActive('/pre-jogos')}`}
            onClick={() => setIsOpen(false)}
          >
            <Clock className="w-5 h-5 mr-3" />
            Pré-jogos
          </Link>
          <Link
            to="/metodos"
            className={`flex items-center px-4 py-3 ${isActive('/metodos')}`}
            onClick={() => setIsOpen(false)}
          >
            <BookOpen className="w-5 h-5 mr-3" />
            Métodos
          </Link>
          <Link
            to="/nova-aposta"
            className={`flex items-center px-4 py-3 ${isActive('/nova-aposta')}`}
            onClick={() => setIsOpen(false)}
          >
            <PlusCircle className="w-5 h-5 mr-3" />
            Nova Aposta
          </Link>
          <Link
            to="/historico"
            className={`flex items-center px-4 py-3 ${isActive('/historico')}`}
            onClick={() => setIsOpen(false)}
          >
            <History className="w-5 h-5 mr-3" />
            Histórico
          </Link>
          <Link
            to="/banca"
            className={`flex items-center px-4 py-3 ${isActive('/banca')}`}
            onClick={() => setIsOpen(false)}
          >
            <Wallet className="w-5 h-5 mr-3" />
            Banca
          </Link>
          <Link
            to="/configuracoes"
            className={`flex items-center px-4 py-3 ${isActive('/configuracoes')}`}
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-5 h-5 mr-3" />
            Configurações
          </Link>
          <Link
            to="/termos"
            className={`flex items-center px-4 py-3 ${isActive('/termos')}`}
            onClick={() => setIsOpen(false)}
          >
            <FileText className="w-5 h-5 mr-3" />
            Termos e Licença
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 w-full text-left text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </button>
        </nav>
      </aside>
    </>
  );
}

function App() {
  const { configuracoes } = useBancaStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (configuracoes.tema === 'escuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [configuracoes.tema]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 p-4 lg:p-8 ${isAuthenticated ? 'pt-16 lg:pt-8' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/termos" element={<Termos />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ao-vivo"
              element={
                <ProtectedRoute>
                  <JogosAoVivo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pre-jogos"
              element={
                <ProtectedRoute>
                  <PreJogos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/metodos"
              element={
                <ProtectedRoute>
                  <Metodos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/metodos/:id"
              element={
                <ProtectedRoute>
                  <MetodoDetalhes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nova-aposta"
              element={
                <ProtectedRoute>
                  <NovaAposta />
                </ProtectedRoute>
              }
            />
            <Route
              path="/novo-metodo"
              element={
                <ProtectedRoute>
                  <NovoMetodo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/banca"
              element={
                <ProtectedRoute>
                  <GestaoFinanceira />
                </ProtectedRoute>
              }
            />
            <Route
              path="/historico"
              element={
                <ProtectedRoute>
                  <Historico />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;