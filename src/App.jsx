
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import ClientView from '@/pages/ClientView';
import DriverView from '@/pages/DriverView';
import AuthPage from '@/pages/AuthPage';
import { getCurrentUser, logoutUser } from '@/lib/authStorage';
import { Truck, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex justify-center items-center">
        <p className="text-2xl">Cargando EasyTrans...</p>
      </div>
    );
  }

  const MainLayout = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col items-center p-4 sm:p-8">
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mb-8 flex justify-between items-center"
      >
        <div className="text-left">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
            EasyTrans
          </h1>
          <p className="text-md sm:text-lg text-slate-300 mt-1">
            {currentUser?.role === 'client' ? 'Portal del Cliente' : 'Portal del Conductor'}
          </p>
        </div>
        {currentUser && (
          <Button onClick={handleLogout} variant="outline" className="bg-slate-800/50 border-slate-700 hover:bg-red-600 hover:text-white text-slate-200">
            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
          </Button>
        )}
      </motion.header>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-4xl"
      >
        {children}
      </motion.div>
      <Toaster />
    </div>
  );

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/auth"
            element={
              currentUser ? (
                <Navigate to="/" replace />
              ) : (
                <AuthPage onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/"
            element={
              currentUser ? (
                <MainLayout>
                  {currentUser.role === 'client' && <ClientView />}
                  {currentUser.role === 'driver' && <DriverView />}
                </MainLayout>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to={currentUser ? "/" : "/auth"} replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
  