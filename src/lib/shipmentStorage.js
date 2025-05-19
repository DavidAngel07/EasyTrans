
const SHIPMENTS_KEY = 'cargaExpressShipments_v1';

export const getShipments = () => {
  try {
    const shipments = localStorage.getItem(SHIPMENTS_KEY);
    return shipments ? JSON.parse(shipments) : [];
  } catch (error) {
    console.error("Error retrieving shipments from localStorage:", error);
    return [];
  }
};

export const saveShipments = (shipments) => {
  try {
    localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(shipments));
  } catch (error) {
    console.error("Error saving shipments to localStorage:", error);
  }
};

export const addShipment = (newShipment) => {
  const shipments = getShipments();
  const updatedShipments = [...shipments, { ...newShipment, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
  saveShipments(updatedShipments);
  return updatedShipments;
};

export const updateShipment = (shipmentId, updates) => {
  const shipments = getShipments();
  const updatedShipments = shipments.map(shipment =>
    shipment.id === shipmentId ? { ...shipment, ...updates, updatedAt: new Date().toISOString() } : shipment
  );
  saveShipments(updatedShipments);
  return updatedShipments;
};

export const getShipmentStatusText = (status) => {
  const statusMap = {
    PENDING_DRIVER_ACTION: 'Esperando Conductor',
    PRICE_SUGGESTED_BY_DRIVER: 'Precio Sugerido por Conductor',
    ACCEPTED_BY_USER: 'Aceptado por Cliente',
    ACCEPTED_BY_DRIVER: 'Aceptado por Conductor',
    REJECTED_BY_USER: 'Sugerencia Rechazada por Cliente',
    DENIED_BY_DRIVER: 'Rechazado por Conductor',
    PICKED_UP: 'Carga Recogida',
    DELIVERED: 'Carga Entregada',
    CANCELLED_BY_USER: 'Cancelado por Cliente',
  };
  return statusMap[status] || status;
};
  