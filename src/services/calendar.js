// src/services/calendar.js
import api from './api';

export const calendarService = {
  // Eventos
  getEvents: async (startDate = null, endDate = null, eventTypeId = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (eventTypeId) params.append('event_type_id', eventTypeId);
    
    const response = await api.get(`/calendar/?${params}`);
    return response.data;
  },

  getEvent: async (eventId) => {
    const response = await api.get(`/calendar/${eventId}`);
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await api.post('/calendar/', eventData);
    return response.data;
  },

  updateEvent: async (eventId, eventData) => {
    const response = await api.put(`/calendar/${eventId}`, eventData);
    return response.data;
  },

  deleteEvent: async (eventId) => {
    const response = await api.delete(`/calendar/${eventId}`);
    return response.data;
  },

  // Tipos de eventos
  getEventTypes: async () => {
    const response = await api.get('/calendar/event-types/');
    return response.data;
  }
};