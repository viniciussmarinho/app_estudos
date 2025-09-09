// src/utils/constants.js

// URLs da API
export const API_ENDPOINTS = {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password'
    },
    SUBJECTS: '/subjects',
    NOTES: '/notes',
    CALENDAR: '/calendar',
    EVENT_TYPES: '/calendar/event-types'
  };
  
  // Tipos de eventos padrão
  export const EVENT_TYPES = {
    PROVA: 'Prova',
    ENTREGA: 'Entrega',
    RENOVACAO: 'Renovação',
    COMPROMISSO: 'Compromisso',
    OUTRO: 'Outro'
  };
  
  // Cores padrão para matérias
  export const SUBJECT_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green  
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1'  // Indigo
  ];
  
  // Configurações de paginação
  export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
  };
  
  // Configurações de validação
  export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\(\d{2}\)\s\d{4,5}-\d{4}$/
  };
  
  // Mensagens de erro padrão
  export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
    UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
    FORBIDDEN: 'Você não tem permissão para esta ação.',
    NOT_FOUND: 'Recurso não encontrado.',
    SERVER_ERROR: 'Erro interno do servidor. Tente novamente.',
    VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.'
  };
  
  // Mensagens de sucesso padrão
  export const SUCCESS_MESSAGES = {
    LOGIN: 'Login realizado com sucesso!',
    REGISTER: 'Conta criada com sucesso!',
    LOGOUT: 'Logout realizado com sucesso!',
    CREATE: 'Item criado com sucesso!',
    UPDATE: 'Item atualizado com sucesso!',
    DELETE: 'Item excluído com sucesso!',
    PASSWORD_RESET: 'Senha redefinida com sucesso!'
  };
  
  // Configurações de localStorage
  export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language'
  };
  
  // Configurações de data
  export const DATE_FORMATS = {
    DISPLAY: 'dd/MM/yyyy',
    DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
    API: 'yyyy-MM-dd',
    API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss'
  };
  
  // Períodos acadêmicos
  export const ACADEMIC_PERIODS = [
    { value: 1, label: '1º Período' },
    { value: 2, label: '2º Período' },
    { value: 3, label: '3º Período' },
    { value: 4, label: '4º Período' },
    { value: 5, label: '5º Período' },
    { value: 6, label: '6º Período' },
    { value: 7, label: '7º Período' },
    { value: 8, label: '8º Período' },
    { value: 9, label: '9º Período' },
    { value: 10, label: '10º Período' }
  ];