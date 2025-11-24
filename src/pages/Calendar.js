import React, { useState, useEffect } from 'react';
import CalendarWidget from 'react-calendar'; 
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import {
  Plus, 
  Clock, 
  BookOpen, 
  Edit, 
  Trash2, 
  X, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon 
} from 'lucide-react';
import { calendarService } from '../services/calendar';
import { notesService } from '../services/notes';
import 'react-calendar/dist/Calendar.css';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    event_time: '',
    event_type_id: '',
    subject_id: '',
    reminder_days: 1
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [eventsData, typesData, subjectsData] = await Promise.all([
        calendarService.getEvents(),
        calendarService.getEventTypes(),
        notesService.getSubjects()
      ]);

      setEvents(eventsData);
      setEventTypes(typesData);
      setSubjects(subjectsData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.event_date === dateStr);
  };

  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayEvents = getEventsForDate(date);
      if (dayEvents.length > 0) {
        return (
          <div className="flex justify-center items-center gap-1 mt-1">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={index}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: event.event_type.color }}
              />
            ))}
            {dayEvents.length > 3 && (
              <span className="text-xs text-gray-600">+{dayEvents.length - 3}</span>
            )}
          </div>
        );
      }
    }
    return null;
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const selectedStr = format(selectedDate, 'yyyy-MM-dd');
      const hasEvents = events.some(event => event.event_date === dateStr);

      let classes = 'calendar-tile';
      
      if (dateStr === todayStr) {
        classes += ' calendar-tile-today';
      }
      
      if (dateStr === selectedStr) {
        classes += ' calendar-tile-selected';
      }
      
      if (hasEvents) {
        classes += ' calendar-tile-has-events';
      }

      return classes;
    }
    return null;
  };

  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));

    if (name === 'event_type_id') {
      const eventType = eventTypes.find(type => type.id === parseInt(value));
      if (eventType) {
        setEventForm(prev => ({ 
          ...prev, 
          reminder_days: eventType.default_reminder_days 
        }));
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
      const eventData = {
        ...eventForm,
        event_type_id: parseInt(eventForm.event_type_id),
        subject_id: eventForm.subject_id ? parseInt(eventForm.subject_id) : null,
        reminder_days: parseInt(eventForm.reminder_days)
      };

      if (selectedEvent) {
        await calendarService.updateEvent(selectedEvent.id, eventData);
        toast.success('Evento atualizado com sucesso!');
      } else {
        await calendarService.createEvent(eventData);
        toast.success('Evento criado com sucesso!');
      }

      setShowEventModal(false);
      loadInitialData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar evento');
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        await calendarService.deleteEvent(eventId);
        toast.success('Evento excluído com sucesso!');
        loadInitialData();
      } catch (error) {
        toast.error('Erro ao excluir evento');
        console.error('Error deleting event:', error);
      }
    }
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-600 mt-1">Organize seus compromissos e eventos</p>
        </div>
        <button onClick={handleCreateEvent} className="btn-primary shadow-lg hover:shadow-xl transition-shadow">
          <Plus size={20} className="mr-2" />
          Novo Evento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <style>{`
              /* Força o container principal */
              .react-calendar {
                width: 100% !important;
                background: white;
                font-family: inherit;
                border: none;
                line-height: 1.125em;
                padding: 1rem;
              }
            
              /* MANTÉM O GRID RÍGIDO (Isso conserta a lista vertical) */
              .react-calendar__month-view__days {
                display: grid !important;
                grid-template-columns: repeat(7, 1fr) !important;
              }
            
              .react-calendar__month-view__weekdays {
                display: grid !important;
                grid-template-columns: repeat(7, 1fr) !important;
                text-align: center;
                font-size: 0.8rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
              }
              
              /* CORREÇÃO DO TAMANHO (Isso conserta a altura gigante) */
              .react-calendar__tile {
                max-width: initial !important;
                flex: none !important; 
                width: auto !important;
                min-width: 0 !important;
                
                /* Define uma altura fixa razoável em vez de usar aspect-ratio */
                height: 5rem !important; /* Aproximadamente 80px, cabe bem na tela */
                
                display: flex !important;
                flex-direction: column !important;
                justify-content: flex-start !important;
                align-items: center !important;
                padding: 0.5rem !important;
                background: none;
                margin: 0 !important;
                border-radius: 8px;
              }
            
              /* Remove sublinhado de textos abreviados */
              .react-calendar__month-view__weekdays__weekday abbr {
                text-decoration: none;
                cursor: default;
              }
            
              /* Estados dos botões */
              .react-calendar__tile:enabled:hover {
                background-color: #f3f4f6;
              }
            
              /* Dia atual */
              .react-calendar__tile--now {
                background-color: #dbeafe !important;
                color: #1e40af !important;
              }
            
              /* Dia selecionado */
              .react-calendar__tile--active {
                background-color: #3b82f6 !important;
                color: white !important;
              }
            
              .react-calendar__tile--active:enabled:hover {
                background-color: #2563eb !important;
              }
            
              /* Navegação (setinhas) */
              .react-calendar__navigation {
                display: flex;
                height: 44px;
                margin-bottom: 1rem;
              }
              .react-calendar__navigation button {
                min-width: 44px;
                background: none;
                padding: 0.5rem;
              }
              .react-calendar__navigation button:enabled:hover {
                background-color: #f3f4f6;
                border-radius: 0.5rem;
              }
            `}</style>
            
            {/* Usamos CalendarWidget aqui */}
            <CalendarWidget
              onChange={setSelectedDate}
              value={selectedDate}
              locale="pt-BR"
              tileContent={getTileContent}
              tileClassName={getTileClassName}
              prevLabel={<ChevronLeft size={20} />}
              nextLabel={<ChevronRight size={20} />}
              prev2Label={null}
              next2Label={null}
            />
          </div>
        </div>

        {/* Lista de Eventos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md h-full"> {/* h-full para alinhar alturas se desejar */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Eventos para</h2>
              <p className="text-blue-600 font-semibold mt-1">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
            
            <div className="p-6">
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">{selectedDateEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="group p-4 rounded-lg border-l-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      style={{ borderLeftColor: event.event_type.color }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 text-base">{event.title}</h3>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditEvent(event)} 
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(event.id)} 
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                      )}

                      <div className="space-y-2">
                        {event.event_time && (
                          <div className="flex items-center text-sm text-gray-700">
                            <Clock size={14} className="mr-2 text-gray-400" />
                            <span>{event.event_time}</span>
                          </div>
                        )}

                        {event.subject && (
                          <div className="flex items-center text-sm text-gray-700">
                            <BookOpen size={14} className="mr-2 text-gray-400" />
                            <span>{event.subject.name} ({event.subject.period}º período)</span>
                          </div>
                        )}

                        <div className="flex items-center">
                          <Tag size={14} className="mr-2 text-gray-400" />
                          <span 
                            className="px-2 py-1 text-xs font-semibold text-white rounded-full" 
                            style={{ backgroundColor: event.event_type.color }}
                          >
                            {event.event_type.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {/* Usamos CalendarIcon aqui */}
                    <CalendarIcon size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Nenhum evento para este dia</p>
                  <button 
                    onClick={handleCreateEvent}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Criar evento
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Criar/Editar Evento */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <form onSubmit={handleSaveEvent}>
              {/* Header do Modal */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedEvent ? 'Editar Evento' : 'Novo Evento'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {format(new Date(eventForm.event_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowEventModal(false)} 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
               
              {/* Corpo do Modal */}
              <div className="p-6 space-y-4 max-h-[calc(90vh-180px)] overflow-y-auto">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Título *
                  </label>
                  <input 
                    type="text" 
                    name="title" 
                    id="title" 
                    value={eventForm.title} 
                    onChange={handleEventFormChange} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    placeholder="Ex: Prova de Cálculo"
                    required 
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea 
                    name="description" 
                    id="description" 
                    value={eventForm.description} 
                    onChange={handleEventFormChange} 
                    rows="3" 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Adicione detalhes sobre o evento..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event_date" className="block text-sm font-semibold text-gray-700 mb-2">
                      Data *
                    </label>
                    <input 
                      type="date" 
                      name="event_date" 
                      id="event_date" 
                      value={eventForm.event_date} 
                      onChange={handleEventFormChange} 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="event_time" className="block text-sm font-semibold text-gray-700 mb-2">
                      Hora
                    </label>
                    <input 
                      type="time" 
                      name="event_time" 
                      id="event_time" 
                      value={eventForm.event_time} 
                      onChange={handleEventFormChange} 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="event_type_id" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Evento *
                  </label>
                  <select 
                    name="event_type_id" 
                    id="event_type_id" 
                    value={eventForm.event_type_id} 
                    onChange={handleEventFormChange} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    required
                  >
                    <option value="">Selecione um tipo</option>
                    {eventTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subject_id" className="block text-sm font-semibold text-gray-700 mb-2">
                    Matéria (Opcional)
                  </label>
                  <select 
                    name="subject_id" 
                    id="subject_id" 
                    value={eventForm.subject_id} 
                    onChange={handleEventFormChange} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Nenhuma</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} - {subject.period}º Período
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="reminder_days" className="block text-sm font-semibold text-gray-700 mb-2">
                    Lembrete (dias antes)
                  </label>
                  <input 
                    type="number" 
                    name="reminder_days" 
                    id="reminder_days" 
                    value={eventForm.reminder_days} 
                    onChange={handleEventFormChange} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    min="0" 
                  />
                </div>
              </div>

              {/* Footer do Modal */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button 
                  type="button" 
                  onClick={() => setShowEventModal(false)} 
                  className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50" 
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;