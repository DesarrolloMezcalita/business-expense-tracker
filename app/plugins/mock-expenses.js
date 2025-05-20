// Datos de prueba para gastos según la interfaz Expense
export const mockExpenses = [
  {
    id: 1,
    fecha: '2025-05-15',
    proveedor: 'Restaurante El Buen Sabor',
    subtotal: 750.65,
    descuento: 0,
    impuesto: 120.10,
    total: 870.75,
    comprobante: 'https://example.com/receipts/receipt1.jpg',
    created_at: '2025-05-15T14:30:00Z',
    sucursalId: 1,
    validado: true,
    formaPago: 'Tarjeta de crédito',
    categoriaId: 1 // Alimentación
  },
  {
    id: 2,
    fecha: '2025-05-10',
    proveedor: 'Aerolíneas Nacionales',
    subtotal: 4500.00,
    descuento: 0,
    impuesto: 720.00,
    total: 5220.00,
    comprobante: 'https://example.com/receipts/receipt2.jpg',
    created_at: '2025-05-10T09:15:00Z',
    sucursalId: 1,
    validado: true,
    formaPago: 'Transferencia bancaria',
    categoriaId: 2 // Transporte
  },
  {
    id: 3,
    fecha: '2025-05-11',
    proveedor: 'Hotel Continental',
    subtotal: 2800.00,
    descuento: 280.00,
    impuesto: 403.20,
    total: 2923.20,
    comprobante: 'https://example.com/receipts/receipt3.jpg',
    created_at: '2025-05-11T18:45:00Z',
    sucursalId: 2,
    validado: true,
    formaPago: 'Tarjeta corporativa',
    categoriaId: 3 // Alojamiento
  },
  {
    id: 4,
    fecha: '2025-05-18',
    proveedor: 'Papelería Central',
    subtotal: 388.15,
    descuento: 0,
    impuesto: 62.10,
    total: 450.25,
    comprobante: 'https://example.com/receipts/receipt4.jpg',
    created_at: '2025-05-18T11:20:00Z',
    sucursalId: 1,
    validado: false,
    formaPago: 'Efectivo',
    categoriaId: 4 // Material de oficina
  },
  {
    id: 5,
    fecha: '2025-05-01',
    proveedor: 'Software Solutions Inc.',
    subtotal: 1034.48,
    descuento: 0,
    impuesto: 165.52,
    total: 1200.00,
    comprobante: 'https://example.com/receipts/receipt5.jpg',
    created_at: '2025-05-01T08:30:00Z',
    sucursalId: 1,
    validado: true,
    formaPago: 'Tarjeta de crédito',
    categoriaId: 5 // Software
  },
  {
    id: 6,
    fecha: '2025-05-09',
    proveedor: 'Taxis Unidos',
    subtotal: 301.72,
    descuento: 0,
    impuesto: 48.28,
    total: 350.00,
    comprobante: 'https://example.com/receipts/receipt6.jpg',
    created_at: '2025-05-09T05:45:00Z',
    sucursalId: 2,
    validado: true,
    formaPago: 'Efectivo',
    categoriaId: 2 // Transporte
  },
  {
    id: 7,
    fecha: '2025-05-17',
    proveedor: 'Restaurante La Terraza',
    subtotal: 1078.28,
    descuento: 0,
    impuesto: 172.52,
    total: 1250.80,
    comprobante: 'https://example.com/receipts/receipt7.jpg',
    created_at: '2025-05-17T20:15:00Z',
    sucursalId: 1,
    validado: false,
    formaPago: 'Tarjeta corporativa',
    categoriaId: 1 // Alimentación
  },
  {
    id: 8,
    fecha: '2025-05-05',
    proveedor: 'TechStore',
    subtotal: 3879.31,
    descuento: 0,
    impuesto: 620.69,
    total: 4500.00,
    comprobante: 'https://example.com/receipts/receipt8.jpg',
    created_at: '2025-05-05T14:00:00Z',
    sucursalId: 1,
    validado: false,
    formaPago: 'Transferencia bancaria',
    categoriaId: 6 // Equipamiento
  },
  {
    id: 9,
    fecha: '2025-05-02',
    proveedor: 'Internet Services Co.',
    subtotal: 602.59,
    descuento: 0,
    impuesto: 96.41,
    total: 699.00,
    comprobante: 'https://example.com/receipts/receipt9.jpg',
    created_at: '2025-05-02T10:10:00Z',
    sucursalId: 1,
    validado: true,
    formaPago: 'Domiciliación bancaria',
    categoriaId: 7 // Servicios
  },
  {
    id: 10,
    fecha: '2025-05-08',
    proveedor: 'Digital Marketing Agency',
    subtotal: 2155.17,
    descuento: 0,
    impuesto: 344.83,
    total: 2500.00,
    comprobante: 'https://example.com/receipts/receipt10.jpg',
    created_at: '2025-05-08T13:25:00Z',
    sucursalId: 2,
    validado: false,
    formaPago: 'Transferencia bancaria',
    categoriaId: 8 // Marketing
  }
];

// Plugin de Nuxt (requerido para archivos en la carpeta plugins)
export default defineNuxtPlugin(() => {
  // No necesitamos hacer nada aquí, solo exportar los datos
  return {
    provide: {
      mockExpenses
    }
  };
});