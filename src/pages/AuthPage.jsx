
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { registerUser, loginUser } from '@/lib/authStorage';
import { LogIn, UserPlus, Briefcase, Users } from 'lucide-react';

const AuthPage = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); // 'client' or 'driver'
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Correo y contraseña son requeridos.", variant: "destructive" });
      return;
    }

    if (isLoginView) {
      const result = loginUser(email, password);
      if (result.success) {
        toast({ title: "Éxito", description: "Inicio de sesión exitoso.", className: "bg-green-500 text-white" });
        onLoginSuccess(result.user);
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } else {
      const result = registerUser(email, password, role);
      if (result.success) {
        toast({ title: "Éxito", description: result.message, className: "bg-green-500 text-white" });
        setIsLoginView(true); // Switch to login view after successful registration
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center items-center min-h-screen p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      <Card className="w-full max-w-md glassmorphism-card shadow-2xl">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="mx-auto bg-gradient-to-r from-pink-500 to-orange-500 p-3 rounded-full inline-block mb-4"
          >
            {isLoginView ? <LogIn className="h-8 w-8 text-white" /> : <UserPlus className="h-8 w-8 text-white" />}
          </motion.div>
          <CardTitle className="text-3xl font-bold text-white">{isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}</CardTitle>
          <CardDescription className="text-slate-300">
            {isLoginView ? 'Ingresa a tu cuenta de EasyTrans.' : 'Únete a la plataforma como cliente o conductor.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                required
              />
            </div>
            {!isLoginView && (
              <div className="space-y-2">
                <Label className="text-slate-200">Soy un:</Label>
                <RadioGroup defaultValue="client" value={role} onValueChange={setRole} className="flex space-x-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="role-client" className="text-pink-400 border-pink-400 focus:ring-pink-500" />
                    <Label htmlFor="role-client" className="text-slate-200 flex items-center"><Users className="mr-2 h-4 w-4 text-pink-400" /> Cliente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="driver" id="role-driver" className="text-teal-400 border-teal-400 focus:ring-teal-500" />
                    <Label htmlFor="role-driver" className="text-slate-200 flex items-center"><Briefcase className="mr-2 h-4 w-4 text-teal-400" /> Conductor</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-lg py-3">
              {isLoginView ? 'Ingresar' : 'Registrarme'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => setIsLoginView(!isLoginView)} className="text-slate-300 hover:text-white">
            {isLoginView ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AuthPage;
  