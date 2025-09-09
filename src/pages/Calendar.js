import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importe o locale aqui
import { toast } from 'react-hot-toast';
import {
  Plus,
  Clock,
  BookOpen,
  Edit,
  Trash2,
  X,
  Tag
} from 'lucide-react';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dados mock para demonstração
  const mockEvents = [
    {
      id: 1,
      title: 'Prova de Cálculo I',
      description: 'Prova sobre limites e derivadas',
      event_date: '2025-09-15',
      event_time: '14:00',
      event_type: { id: 1, name: 'Prova', color: '#EF4444' },
      subject: { id: 1, name: 'Cálculo I', period: 2 },
      reminder_days: 7
    },
    {
      id: 2,
      title: 'Entrega do Projeto Final',
      description: 'Sistema de gerenciamento de biblioteca',
      event_date: '2025-09-20',
      event_time: '23:59',
      event_type: { id: 2, name: 'Entrega', color: '#F59E0B' },
      subject: { id: 2, name: 'Programação', period: 3 },
      reminder_days: 3
    },
    {
      id: 3,
      title: 'Renovação da biblioteca',
      description: 'Renovar livros emprestados',
      event_date: '2025-09-10',
      event_time: '16:00',
      event_type: { id: 3, name: 'Renovação', color: '#10B981' },
      subject: null,
      reminder_days: 2
    }
  ];
  const mockEventTypes = [
    { id: 1, name: 'Prova', color: '#EF4444', default_reminder_days: 7 },
    { id: 2, name: 'Entrega', color: '#F59E0B', default_reminder_days: 3 },
    { id: 3, name: 'Renovação', color: '#10B981', default_reminder_days: 2 },
    { id: 4, name: 'Compromisso', color: '#8B5CF6', default_reminder_days: 1 }
  ];
  const mockSubjects = [
    { id: 1, name: 'Cálculo I', period: 2, color: '#3B82F6' },
    { id: 2, name: 'Programação', period: 3, color: '#10B981' },
    { id: 3, name: 'Física I', period: 2, color: '#F59E0B' },
    { id: 4, name: 'Estrutura de Dados', period: 3, color: '#8B5CF6' }
  ];

  useEffect(() => {
    // Carregar dados iniciais (substituir por chamadas de API)
    setEvents(mockEvents);
    setEventTypes(mockEventTypes);
    setSubjects(mockSubjects);
  }, []);

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    event_time: '',
    event_type_id: '',
    subject_id: '',
    reminder_days: 1
  });

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.event_date === dateStr);
  };

  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayEvents = getEventsForDate(date);
      if (dayEvents.length > 0) {
        return (
          <div className="flex justify-center items-center absolute bottom-1.5 left-0 right-0 space-x-1">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={index}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: event.event_type.color }}
              />
            ))}
          </div>
        );
      }
    }
    return null;
  };

  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));

    if (name === 'event_type_id') {
      const eventType = eventTypes.find(type => type.id === parseInt(value));
      if (eventType) {
        setEventForm(prev => ({ ...prev, reminder_days: eventType.default_reminder_days }));
      }
    }
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setEventForm({
      title: '',
      description: '',
      event_date: format(selectedDate, 'yyyy-MM-dd'),
      event_time: '',
      event_type_id: '',
      subject_id: '',
      reminder_days: 1
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_time: event.event_time || '',
      event_type_id: event.event_type.id,
      subject_id: event.subject?.id || '',
      reminder_days: event.reminder_days
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulação de chamada à API
      await new Promise(res => setTimeout(res, 1000));
      if (selectedEvent) {
        toast.success('Evento atualizado com sucesso!');
      } else {
        toast.success('Evento criado com sucesso!');
      }
      setShowEventModal(false);
    } catch (error) {
      toast.error('Erro ao salvar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        await new Promise(res => setTimeout(res, 500));
        toast.success('Evento excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir evento');
      }
    }
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col h-screen">
      <header className="flex justify-between items-center mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-800">Calendário</h1>
        <button
          onClick={handleCreateEvent}
          className="btn-primary"
        >
          <Plus size={20} className="mr-2" />
          Novo Evento
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow min-h-0">
        <div className="lg:col-span-2 card flex flex-col">
           <div className="card-body flex-grow flex">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={getTileContent}
                className="w-full h-full border-0"
                locale="pt-BR"
              />
           </div>
        </div>

        <div className="lg:col-span-1 card flex flex-col">
          <div className="card-header">
            <h2 className="text-lg font-bold">Eventos para</h2>
            {/* A linha abaixo foi corrigida para usar o locale importado */}
            <p className="text-blue-600 font-semibold">{format(selectedDate, 'PPPP', { locale: ptBR })}</p>
          </div>
          <div className="card-body overflow-y-auto">
            {selectedDateEvents.length > 0 ? (
              <ul className="space-y-4">
                {selectedDateEvents.map(event => (
                  <li key={event.id} className="p-4 rounded-lg border" style={{ borderColor: event.event_type.color }}>
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-gray-800">{event.title}</p>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleEditEvent(event)} className="text-gray-400 hover:text-blue-600">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteEvent(event.id)} className="text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-600 mt-2">
                      <Clock size={14} className="mr-2" />
                      {event.event_time}
                    </div>
                    {event.subject && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <BookOpen size={14} className="mr-2" />
                        {event.subject.name} (Período {event.subject.period})
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                       <Tag size={14} className="mr-2" />
                       <span className="px-2 py-0.5 text-xs font-semibold text-white rounded-full" style={{ backgroundColor: event.event_type.color }}>
                         {event.event_type.name}
                       </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Nenhum evento para este dia.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showEventModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
             <form onSubmit={handleSaveEvent}>
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold">{selectedEvent ? 'Editar Evento' : 'Novo Evento'}</h2>
                 <button type="button" onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
               </div>
               
               <div className="space-y-4">
                  <div>
                     <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                     <input type="text" name="title" id="title" value={eventForm.title} onChange={handleEventFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                  </div>
                  <div>
                     <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                     <textarea name="description" id="description" value={eventForm.description} onChange={handleEventFormChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="event_date" className="block text-sm font-medium text-gray-700">Data</label>
                        <input type="date" name="event_date" id="event_date" value={eventForm.event_date} onChange={handleEventFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                     </div>
                     <div>
                        <label htmlFor="event_time" className="block text-sm font-medium text-gray-700">Hora</label>
                        <input type="time" name="event_time" id="event_time" value={eventForm.event_time} onChange={handleEventFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                     </div>
                  </div>
                   <div>
                     <label htmlFor="event_type_id" className="block text-sm font-medium text-gray-700">Tipo de Evento</label>
                     <select name="event_type_id" id="event_type_id" value={eventForm.event_type_id} onChange={handleEventFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required>
                        <option value="">Selecione um tipo</option>
                        {eventTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                     </select>
                  </div>
                   <div>
                     <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700">Matéria (Opcional)</label>
                     <select name="subject_id" id="subject_id" value={eventForm.subject_id} onChange={handleEventFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                        <option value="">Nenhuma</option>
                        {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name} - {subject.period}º Período</option>)}
                     </select>
                  </div>
                   <div>
                     <label htmlFor="reminder_days" className="block text-sm font-medium text-gray-700">Lembrete (dias antes)</label>
                     <input type="number" name="reminder_days" id="reminder_days" value={eventForm.reminder_days} onChange={handleEventFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" min="0" />
                  </div>
               </div>

               <div className="flex justify-end mt-8">
                 <button type="button" onClick={() => setShowEventModal(false)} className="btn-secondary mr-4">Cancelar</button>
                 <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
               </div>
             </form>
           </div>
         </div>
      )}

    </div>
  );
};

export default CalendarPage;

