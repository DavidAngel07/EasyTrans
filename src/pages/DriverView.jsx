
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { getShipments, updateShipment, getShipmentStatusText } from '@/lib/shipmentStorage';
import { getCurrentUser } from '@/lib/authStorage';
import { CURRENCY_FORMAT } from '@/config';
import { ClipboardList, CheckCircle, XCircle, Truck, PackageCheck, PackageSearch, DollarSign, TrendingUp, Landmark } from 'lucide-react';

const DriverView = () => {
  const [allShipments, setAllShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const { toast } = useToast();
  const currentUser = getCurrentUser(); 

  useEffect(() => {
    setAllShipments(getShipments());
  }, []);

  const driverShipmentsSummary = useMemo(() => {
    if (!currentUser) return { completedTrips: 0, totalEarnings: 0 };

    const driverDeliveredShipments = allShipments.filter(
      shipment => shipment.status === 'DELIVERED' && shipment.driverId === currentUser.id 
    );
    
    const totalEarnings = driverDeliveredShipments.reduce((sum, shipment) => {
      return sum + (shipment.finalPrice || shipment.originalPrice || 0);
    }, 0);

    return {
      completedTrips: driverDeliveredShipments.length,
      totalEarnings: totalEarnings,
    };
  }, [allShipments, currentUser]);


  const refreshShipments = () => {
    setAllShipments(getShipments());
  };

  const handleAction = (shipmentId, action, newPrice = null) => {
    let statusUpdate = {};
    let toastMessage = "";

    switch (action) {
      case 'accept_original':
        statusUpdate = { status: 'ACCEPTED_BY_DRIVER', finalPrice: selectedShipment.originalPrice, driverId: currentUser?.id };
        toastMessage = "Oferta aceptada con precio original.";
        break;
      case 'deny':
        statusUpdate = { status: 'DENIED_BY_DRIVER', driverId: currentUser?.id };
        toastMessage = "Oferta rechazada.";
        break;
      case 'suggest_price':
        if (!newPrice || isNaN(parseFloat(newPrice))) {
          toast({ title: "Error", description: "Por favor, ingresa un precio válido.", variant: "destructive" });
          return;
        }
        statusUpdate = { status: 'PRICE_SUGGESTED_BY_DRIVER', driverSuggestedPrice: parseFloat(newPrice), driverId: currentUser?.id };
        toastMessage = "Nuevo precio sugerido.";
        break;
      case 'picked_up':
        statusUpdate = { status: 'PICKED_UP' };
        toastMessage = "Carga marcada como recogida.";
        break;
      case 'delivered':
        statusUpdate = { status: 'DELIVERED' };
        toastMessage = "Carga marcada como entregada.";
        break;
      default:
        return;
    }

    const updatedShipments = updateShipment(shipmentId, statusUpdate);
    setAllShipments(updatedShipments);
    toast({ title: "Acción Completada", description: toastMessage, className: "bg-sky-500 text-white" });
    setSelectedShipment(null);
    setSuggestedPrice('');
  };

  const pendingRequests = allShipments.filter(s => s.status === 'PENDING_DRIVER_ACTION' || s.status === 'REJECTED_BY_USER');
  const myActiveShipments = allShipments.filter(s => (s.driverId === currentUser?.id) && ['ACCEPTED_BY_DRIVER', 'ACCEPTED_BY_USER', 'PICKED_UP'].includes(s.status));

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
          <CardTitle className="flex items-center text-2xl text-white"><TrendingUp className="mr-2 h-6 w-6 text-lime-400" />Resumen del Conductor</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
          <motion.div variants={itemVariants} className="bg-slate-800/70 p-4 rounded-lg flex items-center space-x-3">
            <Truck className="h-8 w-8 text-teal-400" />
            <div>
              <p className="text-sm text-slate-400">Viajes Completados</p>
              <p className="text-2xl font-semibold">{driverShipmentsSummary.completedTrips}</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-slate-800/70 p-4 rounded-lg flex items-center space-x-3">
            <Landmark className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-slate-400">Ganancias Totales</p>
              <p className="text-2xl font-semibold">{CURRENCY_FORMAT.format(driverShipmentsSummary.totalEarnings)}</p>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      <Card className="glassmorphism-card shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-white"><PackageSearch className="mr-2 h-6 w-6 text-yellow-400" />Nuevas Ofertas de Carga</CardTitle>
          <CardDescription className="text-slate-300">Revisa y gestiona las solicitudes de envío pendientes.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No hay nuevas ofertas de carga disponibles.</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((shipment, index) => (
                <motion.div key={shipment.id} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 * index }}>
                  <Card className="bg-slate-800/70 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-sky-400">Oferta ID: {shipment.id.slice(-6)}</CardTitle>
                      <CardDescription className="text-slate-300">
                        Recogida: {shipment.pickupAddress} <br/>
                        Entrega: {shipment.deliveryAddress}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1 text-slate-200">
                      <p>Peso: {shipment.weight} kg, Distancia: {shipment.distance} km</p>
                      <p>Precio Ofrecido: {CURRENCY_FORMAT.format(shipment.originalPrice)}</p>
                      <p>Estado: <span className="font-semibold text-amber-400">{getShipmentStatusText(shipment.status)}</span></p>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                       <Dialog onOpenChange={(open) => { if(open) setSelectedShipment(shipment); else setSelectedShipment(null); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">Gestionar Oferta</Button>
                        </DialogTrigger>
                        {selectedShipment && selectedShipment.id === shipment.id && (
                          <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
                            <DialogHeader>
                              <DialogTitle className="text-sky-400">Gestionar Oferta ID: {selectedShipment.id.slice(-6)}</DialogTitle>
                              <DialogDescription className="text-slate-300">
                                Acepta, rechaza o sugiere un nuevo precio para esta oferta.
                                <br/>Recogida: {selectedShipment.pickupAddress}
                                <br/>Entrega: {selectedShipment.deliveryAddress}
                                <br/>Peso: {selectedShipment.weight} kg, Distancia: {selectedShipment.distance} km
                                <br/>Precio Ofrecido: {CURRENCY_FORMAT.format(selectedShipment.originalPrice)}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="items-center gap-4">
                                <Label htmlFor="suggestedPrice" className="text-right text-slate-200">
                                  Sugerir Nuevo Precio (COP)
                                </Label>
                                <Input
                                  id="suggestedPrice"
                                  type="number"
                                  value={suggestedPrice}
                                  onChange={(e) => setSuggestedPrice(e.target.value)}
                                  className="col-span-3 bg-slate-700 border-slate-600 text-white"
                                  placeholder="Ej: 120000"
                                />
                              </div>
                            </div>
                            <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                               <DialogClose asChild>
                                <Button type="button" variant="outline" className="border-slate-500 text-slate-300 hover:bg-slate-600 hover:text-white">Cancelar</Button>
                               </DialogClose>
                               <DialogClose asChild>
                                <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleAction(selectedShipment.id, 'deny')}>
                                  <XCircle className="mr-2 h-4 w-4" /> Rechazar
                                </Button>
                               </DialogClose>
                               <DialogClose asChild>
                                <Button type="button" className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => handleAction(selectedShipment.id, 'suggest_price', suggestedPrice)} disabled={!suggestedPrice}>
                                  <DollarSign className="mr-2 h-4 w-4" /> Sugerir Precio
                                </Button>
                               </DialogClose>
                               <DialogClose asChild>
                                <Button type="button" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(selectedShipment.id, 'accept_original')}>
                                  <CheckCircle className="mr-2 h-4 w-4" /> Aceptar Original
                                </Button>
                               </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glassmorphism-card shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-white"><Truck className="mr-2 h-6 w-6 text-green-400" />Mis Envíos Activos</CardTitle>
          <CardDescription className="text-slate-300">Gestiona los envíos que has aceptado.</CardDescription>
        </CardHeader>
        <CardContent>
          {myActiveShipments.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No tienes envíos activos.</p>
          ) : (
            <div className="space-y-4">
              {myActiveShipments.map((shipment, index) => (
                <motion.div key={shipment.id} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 * index }}>
                  <Card className="bg-slate-800/70 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-sky-400">Envío ID: {shipment.id.slice(-6)}</CardTitle>
                      <CardDescription className="text-slate-300">
                        Recogida: {shipment.pickupAddress} <br/>
                        Entrega: {shipment.deliveryAddress}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1 text-slate-200">
                      <p>Peso: {shipment.weight} kg, Distancia: {shipment.distance} km</p>
                      <p>Precio Acordado: {CURRENCY_FORMAT.format(shipment.finalPrice || shipment.originalPrice)}</p>
                      <p>Estado: <span className="font-semibold text-amber-400">{getShipmentStatusText(shipment.status)}</span></p>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      {shipment.status === 'ACCEPTED_BY_DRIVER' || shipment.status === 'ACCEPTED_BY_USER' ? (
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleAction(shipment.id, 'picked_up')}>
                          <PackageCheck className="mr-2 h-4 w-4" /> Marcar Recogido
                        </Button>
                      ) : shipment.status === 'PICKED_UP' ? (
                        <Button className="bg-teal-500 hover:bg-teal-600 text-white" onClick={() => handleAction(shipment.id, 'delivered')}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Marcar Entregado
                        </Button>
                      ) : null}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Button onClick={refreshShipments} variant="outline" className="mt-4 border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white self-center">
        Refrescar Listas
      </Button>
    </motion.div>
  );
};

export default DriverView;
  