export type Area = 'barberia' | 'estetica';

export interface Service {
  id: string;
  area: Area;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface Professional {
  id: string;
  name: string;
  area: Area;
}

export interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface BookingState {
  area: Area | null;
  service: Service | null;
  professional: Professional | null;
  date: string | null;
  time: string | null;
  customerData: CustomerData | null;
}
