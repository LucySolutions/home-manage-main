export type UserRole = 'constructora' | 'residente';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  constructoraId?: string;
  residenteId?: string;
}

export interface Constructora {
  id: string;
  name: string;
  rfc: string;
  email: string;
  phone: string;
  address: string;
  plan: 'basico' | 'profesional' | 'empresarial';
  planExpiry: string;
  montoMinimo?: number;
  montoMaximo?: number;
  createdAt: string;
}

export interface Obra {
  id: string;
  name: string;
  address: string;
  startDate: string;
  estimatedEndDate: string;
  status: 'planificacion' | 'en_progreso' | 'pausada' | 'completada';
  budget: number;
  constructoraId: string;
  responsable: string;
  description: string;
}

export interface Residente {
  id: string;
  name: string;
  email: string;
  phone: string;
  obraId: string;
  constructoraId: string;
  position: string;
  createdAt: string;
  status: 'activo' | 'inactivo';
}

export interface Payment {
  id: string;
  constructoraId: string;
  amount: number;
  date: string;
  status: 'completado' | 'pendiente' | 'fallido';
  method: 'tarjeta' | 'transferencia' | 'oxxo' | 'paypal' | 'stripe';
  concept: string;
  reference: string;
}

export interface Report {
  id: string;
  obraId: string;
  residenteId: string;
  title: string;
  description: string;
  date: string;
  type: 'avance' | 'incidente' | 'material' | 'personal';
  status: 'borrador' | 'enviado';
  attachments?: string[];
}

export interface EmailConfig {
  residenteId: string;
  enabled: boolean;
  frequency: 'diario' | 'semanal' | 'quincenal' | 'mensual';
  email: string;
  lastSent?: string;
}

export interface GastoObra {
  id: string;
  obra_id: string;
  residente_id: string;
  fecha: string;
  categoria: string;
  descripcion: string;
  monto_total: number;
  aprobado: boolean;
  factura_url?: string;
  metodo_pago: string;
  proveedor: string;
  aprobado_por?: string;
  comentarios?: string;
}
