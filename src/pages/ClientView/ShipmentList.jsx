
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getShipmentStatusText } from '@/lib/shipmentStorage';
import { CURRENCY_FORMAT } from '@/config';
import { ListOrdered, CheckCircle, XCircle, AlertTriangle, MapPin } from 'lucide-react';

const ShipmentList = ({ shipments, onUserAction, onTrackShipment, activeShipmentForTracking }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
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
            {shipments.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((shipment, index) => (
              <motion.div key={shipment.id} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 * index }}>
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
                  <CardFooter className="flex justify-between items-center">
                    <div>
                      {shipment.status === 'PRICE_SUGGESTED_BY_DRIVER' && (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => onUserAction(shipment.id, 'reject')}>
                            <XCircle className="mr-2 h-4 w-4" /> Rechazar
                          </Button>
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => onUserAction(shipment.id, 'accept')}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Aceptar
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      {(shipment.status === 'PICKED_UP' || shipment.status === 'DELIVERED' || shipment.status === 'ACCEPTED_BY_USER' || shipment.status === 'ACCEPTED_BY_DRIVER') && shipment.pickupCoords && shipment.deliveryCoords && (
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white"
                           onClick={() => onTrackShipment(shipment)}
                         >
                           <MapPin className="mr-2 h-4 w-4" /> 
                           {activeShipmentForTracking?.id === shipment.id ? 'Siguiendo...' : 'Seguir Envío'}
                         </Button>
                      )}
                       {(shipment.status === 'PICKED_UP' || shipment.status === 'DELIVERED') && (
                         <span className={`ml-2 flex items-center px-2 py-1 rounded-full text-xs font-medium ${shipment.status === 'DELIVERED' ? 'bg-green-600 text-green-100' : 'bg-blue-600 text-blue-100'}`}>
                           {shipment.status === 'DELIVERED' ? <CheckCircle className="mr-1 h-3 w-3" /> : <AlertTriangle className="mr-1 h-3 w-3" />}
                           {getShipmentStatusText(shipment.status)}
                         </span>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipmentList;
  