'use client';

import { useState, useEffect } from 'react';
import { Area, Service, Professional, CustomerData, BookingState } from '@/types/booking';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Mock data removed. Data is fetched from API.

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<BookingState>({
    area: null,
    service: null,
    professional: null,
    date: null,
    time: null,
    customerData: null,
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('528341656549');
  const [closedDays, setClosedDays] = useState<number[]>([]);

  const setArea = (area: Area) => {
    setState(prev => ({ ...prev, area, service: null, professional: null, date: null, time: null }));
    setStep(2);
  };
  
  useEffect(() => {
    async function fetchCatalogs() {
      try {
        const [servRes, profRes, settingsRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/professionals'),
          fetch(`/api/business-settings?t=${Date.now()}`)
        ]);
        const servData = await servRes.json();
        const profData = await profRes.json();
        const settingsData = await settingsRes.json();
        if (servData.services) setServices(servData.services);
        if (profData.professionals) setProfessionals(profData.professionals);
        if (settingsData.settings?.whatsappNumber) {
          setWhatsappNumber(settingsData.settings.whatsappNumber.replace(/\D/g, ''));
        }
        if (settingsData.settings?.closedDays) {
          setClosedDays(settingsData.settings.closedDays);
        }
      } catch (err) {
        console.error('Error fetching catalogs and settings', err);
      }
    }
    void fetchCatalogs();
  }, []);
  
  const setService = (service: Service) => {
    setState(prev => ({ ...prev, service, professional: null, date: null, time: null }));
    setStep(3);
  };

  const setProfessional = (professional: Professional) => {
    setState(prev => ({ ...prev, professional, date: null, time: null }));
    setStep(4);
  };

  const setDate = async (date: string) => {
    setState(prev => ({ ...prev, date, time: null }));
    setStep(5);
    setIsLoading(true);
    setErrorMsg('');
    
    // FETCH REAL AVAILABILITY FROM API
    try {
      const res = await fetch(`/api/availability?date=${date}&professionalId=${state.professional!.id}&serviceId=${state.service!.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAvailableSlots(data.slots || []);
    } catch (err: any) {
      setErrorMsg(err.message);
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const setTime = (time: string) => {
    setState(prev => ({ ...prev, time }));
    setStep(6);
  };

  const submitCustomerData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    const formData = new FormData(e.currentTarget);
    const customerData: CustomerData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      notes: formData.get('notes') as string,
    };
    
    // SEND RESERVATION TO API (WITH runTransaction)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerData.name,
          customerPhone: customerData.phone,
          customerEmail: customerData.email,
          notes: customerData.notes,
          date: state.date,
          startTime: state.time,
          serviceId: state.service!.id,
          professionalId: state.professional!.id,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setState(prev => ({ ...prev, customerData }));
      setStep(7);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter(s => s.area === state.area);
  const filteredProfessionals = professionals.filter(p => p.area === state.area);

  // Generate next 7 days starting from local Mexico City "today"
  const todayMexicoStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
  const [ty, tm, td] = todayMexicoStr.split('-').map(Number);
  const todayLocal = new Date(ty, tm - 1, td);
  const nextDays = Array.from({ length: 7 }).map((_, i) => format(addDays(todayLocal, i), 'yyyy-MM-dd'));

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-dark-800 rounded-xl border border-white/10 shadow-2xl relative">
      {/* ERROR TOAST */}
      {errorMsg && (
        <div className="absolute -top-16 left-0 right-0 bg-red-500/90 text-white p-3 rounded-lg text-center animate-in fade-in zoom-in slide-in-from-top-4 shadow-lg">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* OVERLAY LOADING */}
      {isLoading && (
        <div className="absolute inset-0 bg-dark-900/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
          <div className="animate-spin w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Reservar Cita</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(s => (
            <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-gold-500' : 'bg-dark-700'}`} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-xl text-gray-200 font-medium mb-4">¿Qué área buscas?</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setArea('barberia')} className="p-6 bg-dark-700 border-2 border-transparent hover:border-gold-500 rounded-lg text-lg font-bold">Barbería</button>
            <button onClick={() => setArea('estetica')} className="p-6 bg-dark-700 border-2 border-transparent hover:border-gold-500 rounded-lg text-lg font-bold">Estética</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-xl text-gray-200 font-medium mb-4">Selecciona el Servicio</h3>
          <div className="grid gap-3">
            {filteredServices.map(service => (
              <button 
                key={service.id} 
                onClick={() => setService(service)}
                className="flex justify-between items-center p-4 bg-dark-700 border border-white/5 hover:border-gold-500 rounded-lg"
              >
                <div className="text-left">
                  <p className="font-bold text-white">{service.name}</p>
                  <p className="text-sm text-gray-400">{service.durationMinutes} min</p>
                </div>
                <div className="font-bold text-gold-500">${service.price}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="mt-4 text-sm text-gray-400 hover:text-white">← Volver</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-xl text-gray-200 font-medium mb-4">¿Con quién te gustaría agendar?</h3>
          <div className="grid grid-cols-2 gap-4">
            {filteredProfessionals.map(prof => (
              <button 
                key={prof.id} 
                onClick={() => setProfessional(prof)}
                className="p-6 bg-dark-700 border-2 border-transparent hover:border-gold-500 rounded-lg text-lg font-bold"
              >
                {prof.name}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} className="mt-4 text-sm text-gray-400 hover:text-white">← Volver</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-xl text-gray-200 font-medium mb-4">Selecciona el Día</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {nextDays.map(date => {
              const dateObj = new Date(date + 'T00:00:00');
              const dayOfWeek = dateObj.getDay();
              const isClosed = closedDays.includes(dayOfWeek);
              return (
                <button 
                  key={date} 
                  disabled={isClosed}
                  onClick={() => setDate(date)}
                  className={`p-3 border rounded-lg flex flex-col items-center transition-colors ${
                    isClosed
                      ? 'bg-dark-900 border-white/5 opacity-40 cursor-not-allowed text-gray-500'
                      : 'bg-dark-700 border-white/5 hover:border-gold-500'
                  }`}
                >
                  <span className="text-xs text-gray-400 uppercase">{format(dateObj, 'EEE', { locale: es })}</span>
                  <span className="text-lg font-bold text-white">{format(dateObj, 'dd')}</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => setStep(3)} className="mt-4 text-sm text-gray-400 hover:text-white">← Volver</button>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h3 className="text-xl text-gray-200 font-medium mb-4">Horarios Disponibles</h3>
          <p className="text-sm text-gray-400 mb-4">Mostrando disponibilidad para {state.date} con {state.professional?.name}</p>
          
          {availableSlots.length === 0 ? (
             <div className="p-4 bg-dark-900 rounded-lg text-center text-gray-400">
               No hay horarios disponibles para este día.
             </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.map(time => (
                <button 
                  key={time} 
                  onClick={() => setTime(time)}
                  className="p-3 bg-dark-700 border border-white/5 hover:border-gold-500 rounded-lg text-white font-bold"
                >
                  {time}
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setStep(4)} className="mt-4 text-sm text-gray-400 hover:text-white">← Volver</button>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4">
          <h3 className="text-xl text-gray-200 font-medium mb-4">Tus Datos</h3>
          <form onSubmit={submitCustomerData} className="space-y-4">
            <input required name="name" type="text" className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500" placeholder="Nombre Completo" />
            <input required name="phone" type="tel" className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500" placeholder="Teléfono" />
            <input name="email" type="email" className="w-full bg-dark-900 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500" placeholder="Correo (Opcional)" />
            <div className="pt-4 flex gap-4">
              <button type="button" onClick={() => setStep(5)} className="px-6 py-3 border border-white/10 rounded-lg text-white">Volver</button>
              <button type="submit" className="flex-1 px-6 py-3 bg-gold-500 text-dark-900 font-bold rounded-lg">Confirmar Reserva</button>
            </div>
          </form>
        </div>
      )}

      {step === 7 && (
        <div className="space-y-6 text-center py-8">
          <h3 className="text-3xl font-bold text-white mb-2">¡Cita Confirmada! ✅</h3>
          <p className="text-gray-400 mb-4">Reserva para {state.date} a las {state.time}</p>
          <div className="flex flex-col gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                `Hola, acabo de reservar una cita:\n` +
                `📅 Fecha: ${state.date}\n` +
                `🕐 Hora: ${state.time}\n` +
                `💈 Servicio: ${state.service?.name || ''}\n` +
                `👤 Profesional: ${state.professional?.name || ''}\n` +
                `Quedo atento a la confirmación.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-6 py-4 bg-[#25D366] text-white font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-[#1da851] transition-colors"
            >
              Confirmar por WhatsApp
            </a>
            
            <a
              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Cita en YAYA Barbería: ${state.service?.name}`)}&dates=${
                state.date && state.time 
                  ? new Date(`${state.date}T${state.time}:00`).toISOString().replace(/-|:|\.\d\d\d/g, '') + '/' + new Date(new Date(`${state.date}T${state.time}:00`).getTime() + (state.service?.durationMinutes || 60) * 60000).toISOString().replace(/-|:|\.\d\d\d/g, '')
                  : ''
              }&details=${encodeURIComponent(`Servicio: ${state.service?.name}\nProfesional: ${state.professional?.name}`)}&location=${encodeURIComponent('YAYA Barbería')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-6 py-4 bg-white text-dark-900 font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              📅 Agregar a Google Calendar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
