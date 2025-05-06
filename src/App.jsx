
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClientView from '@/pages/ClientView';
import DriverView from '@/pages/DriverView';
import { Truck, User } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col items-center p-4 sm:p-8">
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
          EasyTrans MVP
        </h1>
        <p className="text-lg text-slate-300 mt-2">Tu solución de transporte de carga al instante.</p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-4xl"
      >
        <Tabs defaultValue="client" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <TabsTrigger value="client" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="mr-2 h-5 w-5" /> Soy Cliente
            </TabsTrigger>
            <TabsTrigger value="driver" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Truck className="mr-2 h-5 w-5" /> Soy Conductor
            </TabsTrigger>
          </TabsList>
          <TabsContent value="client">
            <ClientView />
          </TabsContent>
          <TabsContent value="driver">
            <DriverView />
          </TabsContent>
        </Tabs>
      </motion.div>
      <Toaster />
    </div>
  );
}

export default App;
  