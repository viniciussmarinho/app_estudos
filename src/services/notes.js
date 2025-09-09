// src/services/notes.js
import api from './api';

export const notesService = {
  // Anotações
  getNotes: async (subjectId = null) => {
    const params = subjectId ? `?subject_id=${subjectId}` : '';
    const response = await api.get(`/notes/${params}`);
    return response.data;
  },

  getNote: async (noteId) => {
    const response = await api.get(`/notes/${noteId}`);
    return response.data;
  },

  createNote: async (noteData) => {
    const response = await api.post('/notes/', noteData);
    return response.data;
  },

  updateNote: async (noteId, noteData) => {
    const response = await api.put(`/notes/${noteId}`, noteData);
    return response.data;
  },

  deleteNote: async (noteId) => {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  },

  // Matérias
  getSubjects: async (period = null) => {
    const params = period ? `?period=${period}` : '';
    const response = await api.get(`/subjects/${params}`);
    return response.data;
  },

  createSubject: async (subjectData) => {
    const response = await api.post('/subjects/', subjectData);
    return response.data;
  },

  updateSubject: async (subjectId, subjectData) => {
    const response = await api.put(`/subjects/${subjectId}`, subjectData);
    return response.data;
  },

  deleteSubject: async (subjectId) => {
    const response = await api.delete(`/subjects/${subjectId}`);
    return response.data;
  }
};