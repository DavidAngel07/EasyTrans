
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { addShipment, getShipments, updateShipment, getShipmentStatusText } from '@/lib/shipmentStorage';
import { PRICE_PER_KM, CURRENCY_FORMAT } from '@/config';
import { PackagePlus, ListOrdered, CheckCircle, XCircle, AlertTriangle, Edit3, DollarSign } from 'lucide-react';

const ClientView = () => {
  const [shipments, setShipments] = useState([]);
  const [formData, setFormData] = useState({
    weight: '',
    pickupAddress: '',
    deliveryAddress: '',
    distance: '',
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [selectedShipmentForAction, setSelectedShipmentForAction] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    setShipments(getShipments());
  }, []);

  useEffect(() => {
    if (formData.distance) {
      const price = parseFloat(formData.distance) * PRICE_PER_KM;
      setCalculatedPrice(price);
    } else {
      setCalculatedPrice(0);
    }
  }, [formData.distance]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!formData.weight || !formData.pickupAddress || !formData.deliveryAddress || !formData.distance) {
      toast({ title: "Error", description: "Por favor, completa todos los campos.", variant: "destructive" });
      return;
    }
    const newShipmentData = {
      ...formData,
      weight: parseFloat(formData.weight),
      distance: parseFloat(formData.distance),
      originalPrice: calculatedPrice,
      status: 'PENDING_DRIVER_ACTION',
      driverSuggestedPrice: null,
      finalPrice: null,
    };
    const updatedShipments = addShipment(newShipmentData);
    setShipments(updatedShipments);
    toast({ title: "Éxito", description: "Solicitud de carga enviada.", className: "bg-green-500 text-white" });
    setFormData({ weight: '', pickupAddress: '', deliveryAddress: '', distance: '' });
    setCalculatedPrice(0);
  };

  const handleUserActionOnSuggestion = (shipmentId, action) => {
    const shipment = shipments.find(s => s.id === shipmentId);
    if (!shipment || shipment.status !== 'PRICE_SUGGESTED_BY_DRIVER') return;

    let newStatus = '';
    let finalPrice = shipment.finalPrice;
    let toastMessage = '';

    if (action === 'accept') {
      newStatus = 'ACCEPTED_BY_USER';
      finalPrice = shipment.driverSuggestedPrice;
      toastMessage = 'Sugerencia de precio aceptada.';
    } else if (action === 'reject') {
      newStatus = 'REJECTED_BY_USER'; // Or back to PENDING_DRIVER_ACTION if others can bid
      toastMessage = 'Sugerencia de precio rechazada.';
    }
    
    const updatedShipments = updateShipment(shipmentId, { status: newStatus, finalPrice });
    setShipments(updatedShipments);
    toast({ title: "Actualización", description: toastMessage, className: "bg-blue-500 text-white" });
    setSelectedShipmentForAction(null);
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 mt-6"
    >
      <Card className="glassmorphism-card shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-white"><PackagePlus className="mr-2 h-6 w-6 text-pink-400" />Solicitar Nuevo Envío</CardTitle>
          <CardDescription className="text-slate-300">Completa los detalles para tu envío de carga.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight" className="text-slate-200">Peso de la Carga (kg)</Label>
                <Input id="weight" name="weight" type="number" value={formData.weight} onChange={handleInputChange} placeholder="Ej: 500" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" />
              </div>
              <div>
                <Label htmlFor="distance" className="text-slate-200">Distancia (km)</Label>
                <Input id="distance" name="distance" type="number" value={formData.distance} onChange={handleInputChange} placeholder="Ej: 150" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" />
              </div>
            </div>
            <div>
              <Label htmlFor="pickupAddress" className="text-slate-200">Dirección de Recogida</Label>
              <Input id="pickupAddress" name="pickupAddress" value={formData.pickupAddress} onChange={handleInputChange} placeholder="Ej: Calle 10 # 20-30, Bogotá" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" />
            </div>
            <div>
              <Label htmlFor="deliveryAddress" className="text-slate-200">Dirección de Entrega</Label>
              <Input id="deliveryAddress" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleInputChange} placeholder="Ej: Carrera 5 # 15-40, Medellín" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" />
            </div>
            {calculatedPrice > 0 && (
              <p className="text-lg font-semibold text-green-400">Precio Estimado: {CURRENCY_FORMAT.format(calculatedPrice)}</p>
            )}
            <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold">
              Enviar Solicitud
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glassmorphism-card shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-white"><ListOrdered className="mr-2 h-6 w-6 text-teal-400" />Mis Solicitudes</CardTitle>
          <CardDescription className="text-slate-300">Aquí puedes ver el estado de tus envíos.</CardDescription>
        </CardHeader>
        <CardContent>
          {shipments.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No tienes solicitudes activas.</p>
          ) : (
            <div className="space-y-4">
              {shipments.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((shipment) => (
                <motion.div key={shipment.id} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 * shipments.indexOf(shipment) }}>
                  <Card className="bg-slate-800/70 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-sky-400">Solicitud ID: {shipment.id.slice(-6)}</CardTitle>
                      <CardDescription className="text-slate-300">
                        Recogida: {shipment.pickupAddress} <br />
                        Entrega: {shipment.deliveryAddress}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-slate-200">
                      <p>Peso: {shipment.weight} kg, Distancia: {shipment.distance} km</p>
                      <p>Precio Original: {CURRENCY_FORMAT.format(shipment.originalPrice)}</p>
                      {shipment.driverSuggestedPrice && (
                        <p className="text-yellow-400">Precio Sugerido por Conductor: {CURRENCY_FORMAT.format(shipment.driverSuggestedPrice)}</p>
                      )}
                      {shipment.finalPrice && (
                        <p className="text-green-400 font-semibold">Precio Final Acordado: {CURRENCY_FORMAT.format(shipment.finalPrice)}</p>
                      )}
                      <p>Estado: <span className="font-semibold text-amber-400">{getShipmentStatusText(shipment.status)}</span></p>
                    </CardContent>
                    {shipment.status === 'PRICE_SUGGESTED_BY_DRIVER' && (
                      <CardFooter className="flex justify-end space-x-2">
                        <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => handleUserActionOnSuggestion(shipment.id, 'reject')}>
                          <XCircle className="mr-2 h-4 w-4" /> Rechazar Sugerencia
                        </Button>
                        <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleUserActionOnSuggestion(shipment.id, 'accept')}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Aceptar Sugerencia
                        </Button>
                      </CardFooter>
                    )}
                    {(shipment.status === 'PICKED_UP' || shipment.status === 'DELIVERED') && (
                       <CardFooter className="flex justify-end">
                         <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${shipment.status === 'DELIVERED' ? 'bg-green-600 text-green-100' : 'bg-blue-600 text-blue-100'}`}>
                           {shipment.status === 'DELIVERED' ? <CheckCircle className="mr-2 h-4 w-4" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                           {getShipmentStatusText(shipment.status)}
                         </span>
                       </CardFooter>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClientView;
  