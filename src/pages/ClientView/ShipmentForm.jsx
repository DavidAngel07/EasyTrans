
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PRICE_PER_KM, CURRENCY_FORMAT } from '@/config';
import { PackagePlus, LocateFixed } from 'lucide-react';
import MapDisplay from '@/components/MapDisplay';

const ShipmentForm = ({ onShipmentRequest }) => {
  const [formData, setFormData] = useState({
    weight: '',
    pickupAddress: '',
    deliveryAddress: '',
    distance: '',
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const [selectingMode, setSelectingMode] = useState('pickup');
  const [mapDisplayKey, setMapDisplayKey] = useState(`map-${Date.now()}`);

  const { toast } = useToast();

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error("Error en reverse geocoding:", error);
      return null;
    }
  }, []);

  const handleMapClick = useCallback(async (e) => {
    const { lat, lng } = e.latlng;
    const address = await reverseGeocode(lat, lng);

    if (selectingMode === 'pickup') {
      setPickupCoords({ lat, lng });
      setFormData(prev => ({ ...prev, pickupAddress: address || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}` }));
      setSelectingMode('delivery'); 
      toast({ title: "Punto de Recogida Seleccionado", description: "Ahora selecciona el punto de entrega.", className: "bg-sky-500 text-white" });
    } else if (selectingMode === 'delivery') {
      setDeliveryCoords({ lat, lng });
      setFormData(prev => ({ ...prev, deliveryAddress: address || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}` }));
      setSelectingMode('done'); 
      toast({ title: "Punto de Entrega Seleccionado", description: "Ambos puntos seleccionados.", className: "bg-green-500 text-white" });
    }
  }, [selectingMode, toast, reverseGeocode]);

  const deg2rad = (deg) => deg * (Math.PI / 180);

  useEffect(() => {
    if (pickupCoords && deliveryCoords) {
      const R = 6371; 
      const dLat = deg2rad(deliveryCoords.lat - pickupCoords.lat);
      const dLon = deg2rad(deliveryCoords.lng - pickupCoords.lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(pickupCoords.lat)) * Math.cos(deg2rad(deliveryCoords.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; 
      setFormData(prev => ({ ...prev, distance: distance.toFixed(2) }));
    } else {
        setFormData(prev => ({...prev, distance: ''}));
    }
  }, [pickupCoords, deliveryCoords]);

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
    if (!formData.weight || !formData.pickupAddress || !formData.deliveryAddress || !formData.distance || !pickupCoords || !deliveryCoords) {
      toast({ title: "Error", description: "Por favor, completa todos los campos y selecciona los puntos en el mapa.", variant: "destructive" });
      return;
    }
    const newShipmentData = {
      ...formData,
      weight: parseFloat(formData.weight),
      distance: parseFloat(formData.distance),
      originalPrice: calculatedPrice,
      pickupCoords,
      deliveryCoords,
    };
    onShipmentRequest(newShipmentData);
    setFormData({ weight: '', pickupAddress: '', deliveryAddress: '', distance: '' });
    setPickupCoords(null);
    setDeliveryCoords(null);
    setCalculatedPrice(0);
    setSelectingMode('pickup');
    setMapDisplayKey(`map-${Date.now()}`); 
  };

  const resetPickup = () => {
    setPickupCoords(null);
    setFormData(p => ({...p, pickupAddress: '', distance: ''}));
    setSelectingMode('pickup');
    setMapDisplayKey(`map-pickup-reset-${Date.now()}`);
  };

  const resetDelivery = () => {
    setDeliveryCoords(null);
    setFormData(p => ({...p, deliveryAddress: '', distance: ''}));
    setSelectingMode(pickupCoords ? 'delivery' : 'pickup');
    setMapDisplayKey(`map-delivery-reset-${Date.now()}`);
  };

  return (
    <Card className="glassmorphism-card shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-white"><PackagePlus className="mr-2 h-6 w-6 text-pink-400" />Solicitar Nuevo Envío</CardTitle>
        <CardDescription className="text-slate-300">
          {selectingMode === 'pickup' && "Haz clic en el mapa para seleccionar el PUNTO DE RECOGIDA."}
          {selectingMode === 'delivery' && "Haz clic en el mapa para seleccionar el PUNTO DE ENTREGA."}
          {selectingMode === 'done' && "Puntos seleccionados. Completa los detalles del envío."}
          {!['pickup', 'delivery', 'done'].includes(selectingMode) && "Completa los detalles para tu envío."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MapDisplay 
          mapKey={mapDisplayKey}
          onMapClick={handleMapClick} 
          pickupCoords={pickupCoords} 
          deliveryCoords={deliveryCoords}
          isInteractive={selectingMode === 'pickup' || selectingMode === 'delivery'}
          mapHeight="300px"
        />
        <div className="flex justify-end space-x-2 mt-2">
          <Button variant="outline" size="sm" onClick={resetPickup} className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white">
            <LocateFixed className="mr-2 h-4 w-4" /> Reiniciar Recogida
          </Button>
          <Button variant="outline" size="sm" onClick={resetDelivery} className="border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white">
            <LocateFixed className="mr-2 h-4 w-4" /> Reiniciar Entrega
          </Button>
        </div>

        <form onSubmit={handleSubmitRequest} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickupAddress" className="text-slate-200">Dirección de Recogida</Label>
              <Input id="pickupAddress" name="pickupAddress" value={formData.pickupAddress} onChange={handleInputChange} placeholder="Selecciona en el mapa o ingresa" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" />
            </div>
            <div>
              <Label htmlFor="deliveryAddress" className="text-slate-200">Dirección de Entrega</Label>
              <Input id="deliveryAddress" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleInputChange} placeholder="Selecciona en el mapa o ingresa" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight" className="text-slate-200">Peso de la Carga (kg)</Label>
              <Input id="weight" name="weight" type="number" value={formData.weight} onChange={handleInputChange} placeholder="Ej: 500" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" />
            </div>
            <div>
              <Label htmlFor="distance" className="text-slate-200">Distancia (km)</Label>
              <Input id="distance" name="distance" type="number" value={formData.distance} onChange={handleInputChange} placeholder="Calculada por el mapa" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400" readOnly />
            </div>
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
  );
};

export default ShipmentForm;
  