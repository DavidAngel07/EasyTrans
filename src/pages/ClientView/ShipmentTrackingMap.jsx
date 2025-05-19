
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getShipmentStatusText } from '@/lib/shipmentStorage';
import { MapPin } from 'lucide-react';
import MapDisplay from '@/components/MapDisplay';

const ShipmentTrackingMap = ({ shipment, onClose }) => {
  if (!shipment) return null;

  return (
    <Card className="glassmorphism-card shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-white"><MapPin className="mr-2 h-6 w-6 text-green-400" />Seguimiento de Envío: {shipment.id.slice(-6)}</CardTitle>
        <CardDescription className="text-slate-300">Estado: {getShipmentStatusText(shipment.status)}</CardDescription>
      </CardHeader>
      <CardContent>
        <MapDisplay
          pickupCoords={shipment.pickupCoords}
          deliveryCoords={shipment.deliveryCoords}
          driverLocation={shipment.driverCurrentLocation}
          isInteractive={false}
          showRoute={true}
          mapHeight="350px"
          mapKey={`tracking-${shipment.id}`}
        />
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onClose} className="border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white">Cerrar Seguimiento</Button>
      </CardFooter>
    </Card>
  );
};

export default ShipmentTrackingMap;
  