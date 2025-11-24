import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Calendar, FileText, BookOpen, Clock } from 'lucide-react';
import { calendarService } from '../services/calendar';
import { notesService } from '../services/notes';
import { format, differenceInDays, parseISO, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    eventsThisMonth: 0,
    totalNotes: 0,
    activeSubjects: 0,
    upcomingEvents: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Carregar todos os dados em paralelo
      const [allEvents, allNotes, allSubjects] = await Promise.all([
        calendarService.getEvents(),
        notesService.getNotes(),
        notesService.getSubjects()
      ]);

      // Calcular estatísticas
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Eventos deste mês
      const eventsThisMonth = allEvents.filter(event => {
        const eventDate = parseISO(event.event_date);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      }).length;

      // Próximos eventos (futuros)
      const futureEvents = allEvents.filter(event => {
        const eventDate = parseISO(event.event_date);
        return isFuture(eventDate);
      });

      // Ordenar por data e pegar os 3 primeiros
      const sortedUpcoming = futureEvents
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
        .slice(0, 3)
        .map(event => {
          const eventDate = parseISO(event.event_date);
          const daysUntil = differenceInDays(eventDate, now);
          return {
            ...event,
            daysUntil,
            formattedDate: format(eventDate, 'dd/MM/yyyy', { locale: ptBR })
          };
        });

      // Anotações recentes (últimas 3)
      const sortedNotes = allNotes
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 3);

      setStats({
        eventsThisMonth,
        totalNotes: allNotes.length,
        activeSubjects: allSubjects.length,
        upcomingEvents: futureEvents.length
      });

      setUpcomingEvents(sortedUpcoming);
      setRecentNotes(sortedNotes);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    { 
      name: 'Eventos Este Mês', 
      value: stats.eventsThisMonth, 
      icon: Calendar, 
      color: 'bg-blue-500',
      link: '/calendar'
    },
    { 
      name: 'Anotações Criadas', 
      value: stats.totalNotes, 
      icon: FileText, 
      color: 'bg-green-500',
      link: '/notes'
    },
    { 
      name: 'Matérias Ativas', 
      value: stats.activeSubjects, 
      icon: BookOpen, 
      color: 'bg-purple-500',
      link: '/notes'
    },
    { 
      name: 'Próximos Eventos', 
      value: stats.upcomingEvents, 
      icon: Clock, 
      color: 'bg-orange-500',
      link: '/calendar'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Seu Painel</h1>
        <p className="text-gray-600">
          Bem-vindo(a) de volta, {user?.name || 'Estudante'}!
        </p>
      </header>

      {/* Seção de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="bg-white p-6 rounded-lg shadow-md flex items-center hover:shadow-lg transition-shadow"
          >
            <div className={`p-3 rounded-full text-white mr-4 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Seção de Eventos e Anotações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Eventos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Próximos Eventos</h2>
            <Link to="/calendar" className="text-sm text-blue-600 hover:text-blue-700">
              Ver todos →
            </Link>
          </div>
          {upcomingEvents.length > 0 ? (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{event.title}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar size={14} className="mr-1" />
                        {event.formattedDate}
                      </div>
                      {event.event_time && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock size={14} className="mr-1" />
                          {event.event_time}
                        </div>
                      )}
                    </div>
                    <span 
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        event.daysUntil === 0 
                          ? 'bg-red-100 text-red-800'
                          : event.daysUntil <= 3
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {event.daysUntil === 0 
                        ? 'Hoje' 
                        : event.daysUntil === 1 
                        ? 'Amanhã'
                        : `${event.daysUntil} dias`
                      }
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={32} className="mx-auto mb-2 opacity-50" />
              <p>Nenhum evento próximo</p>
              <Link to="/calendar" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
                Criar evento
              </Link>
            </div>
          )}
        </div>

        {/* Anotações Recentes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Anotações Recentes</h2>
            <Link to="/notes" className="text-sm text-blue-600 hover:text-blue-700">
              Ver todas →
            </Link>
          </div>
          {recentNotes.length > 0 ? (
            <ul className="space-y-3">
              {recentNotes.map((note) => (
                <li key={note.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                  <p className="font-semibold text-gray-800">{note.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className="text-xs px-2 py-1 rounded-full text-white font-medium"
                      style={{ backgroundColor: note.subject.color }}
                    >
                      {note.subject.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(parseISO(note.updated_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText size={32} className="mx-auto mb-2 opacity-50" />
              <p>Nenhuma anotação criada</p>
              <Link to="/notes" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
                Criar anotação
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Dicas rápidas */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Dica</h3>
        <p className="text-blue-800 text-sm">
          Mantenha suas anotações organizadas por matéria e configure lembretes para não perder nenhum compromisso importante!
        </p>
      </div>
    </div>
  );
};

export default Dashboard;