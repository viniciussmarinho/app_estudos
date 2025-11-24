import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  BookOpen, Plus, Search, Edit, Trash2, Calendar, X, Save, FileText, Folder
} from 'lucide-react';
import { notesService } from '../services/notes';
import { SUBJECT_COLORS, ACADEMIC_PERIODS } from '../utils/constants';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedSubjectForEdit, setSelectedSubjectForEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    subject_id: ''
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    period: '',
    color: SUBJECT_COLORS[0]
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [notesData, subjectsData] = await Promise.all([
        notesService.getNotes(),
        notesService.getSubjects()
      ]);

      setNotes(notesData);
      setSubjects(subjectsData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Carregar notas filtradas por matéria
  const loadNotesBySubject = async (subjectId) => {
    try {
      const notesData = subjectId 
        ? await notesService.getNotes(subjectId)
        : await notesService.getNotes();
      setNotes(notesData);
    } catch (error) {
      toast.error('Erro ao carregar anotações');
      console.error('Error loading notes:', error);
    }
  };

  // Filtrar notas localmente
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = 
      selectedSubject === '' || 
      note.subject.id === parseInt(selectedSubject);
    
    return matchesSearch && matchesSubject;
  });

  // ===== FUNÇÕES DE ANOTAÇÕES =====
  const handleCreateNote = () => {
    if (subjects.length === 0) {
      toast.error('Crie uma matéria primeiro!');
      setShowSubjectModal(true);
      return;
    }
    setSelectedNote(null);
    setNoteForm({
      title: '',
      content: '',
      subject_id: ''
    });
    setShowNoteModal(true);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      subject_id: note.subject.id
    });
    setShowNoteModal(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    
    if (!noteForm.title.trim() || !noteForm.content.trim() || !noteForm.subject_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const noteData = {
        title: noteForm.title,
        content: noteForm.content,
        subject_id: parseInt(noteForm.subject_id)
      };

      if (selectedNote) {
        await notesService.updateNote(selectedNote.id, noteData);
        toast.success('Anotação atualizada com sucesso!');
      } else {
        await notesService.createNote(noteData);
        toast.success('Anotação criada com sucesso!');
      }
      
      setShowNoteModal(false);
      loadInitialData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar anotação');
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      try {
        await notesService.deleteNote(noteId);
        toast.success('Anotação excluída com sucesso!');
        loadInitialData();
      } catch (error) {
        toast.error('Erro ao excluir anotação');
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleNoteFormChange = (e) => {
    const { name, value } = e.target;
    setNoteForm(prev => ({ ...prev, [name]: value }));
  };

  // ===== FUNÇÕES DE MATÉRIAS =====
  const handleCreateSubject = () => {
    setSelectedSubjectForEdit(null);
    setSubjectForm({
      name: '',
      period: '',
      color: SUBJECT_COLORS[0]
    });
    setShowSubjectModal(true);
  };

  const handleEditSubject = (subject) => {
    setSelectedSubjectForEdit(subject);
    setSubjectForm({
      name: subject.name,
      period: subject.period.toString(),
      color: subject.color
    });
    setShowSubjectModal(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    
    if (!subjectForm.name.trim() || !subjectForm.period) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const isDuplicate = subjects.some(subject => 
      subject.name.toLowerCase() === subjectForm.name.toLowerCase() &&
      subject.period === parseInt(subjectForm.period) &&
      subject.id !== selectedSubjectForEdit?.id
    );

    if (isDuplicate) {
      toast.error('Já existe uma matéria com este nome neste período');
      return;
    }

    setLoading(true);
    try {
      const subjectData = {
        name: subjectForm.name,
        period: parseInt(subjectForm.period),
        color: subjectForm.color
      };

      if (selectedSubjectForEdit) {
        await notesService.updateSubject(selectedSubjectForEdit.id, subjectData);
        toast.success('Matéria atualizada com sucesso!');
      } else {
        await notesService.createSubject(subjectData);
        toast.success('Matéria criada com sucesso!');
      }
      
      setShowSubjectModal(false);
      loadInitialData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar matéria');
      console.error('Error saving subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Tem certeza que deseja excluir esta matéria? Todas as anotações associadas também serão excluídas.')) {
      try {
        await notesService.deleteSubject(subjectId);
        toast.success('Matéria excluída com sucesso!');
        loadInitialData();
      } catch (error) {
        toast.error('Erro ao excluir matéria');
        console.error('Error deleting subject:', error);
      }
    }
  };

  const handleSubjectFormChange = (e) => {
    const { name, value } = e.target;
    setSubjectForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateEventFromNote = (note) => {
    toast.success(`Funcionalidade em desenvolvimento: criar evento para "${note.title}"`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Anotações</h1>
          <p className="text-gray-600">Organize suas anotações por matéria</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCreateSubject} className="btn-secondary">
            <Folder size={20} className="mr-2" />
            Gerenciar Matérias
          </button>
          <button onClick={handleCreateNote} className="btn-primary">
            <Plus size={20} className="mr-2" />
            Nova Anotação
          </button>
        </div>
      </header>

      {/* Seção de Matérias */}
      {subjects.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Suas Matérias</h3>
            <button 
              onClick={handleCreateSubject}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Adicionar matéria
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map(subject => (
              <div
                key={subject.id}
                className="flex items-center space-x-2 px-3 py-2 rounded-full border border-gray-200 hover:border-gray-300 cursor-pointer group"
                onClick={() => handleEditSubject(subject)}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {subject.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({subject.period}º)
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSubject(subject.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {subjects.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <BookOpen className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Nenhuma matéria cadastrada</h3>
              <p className="text-yellow-700 text-sm mb-3">
                Você precisa criar pelo menos uma matéria antes de adicionar anotações.
              </p>
              <button onClick={handleCreateSubject} className="btn-primary text-sm">
                <Plus size={16} className="mr-1" />
                Criar Primeira Matéria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar anotações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                loadNotesBySubject(e.target.value || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas as matérias</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} - {subject.period}º Período
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Anotações */}
      <div className="grid gap-4">
        {filteredNotes.length > 0 ? (
          filteredNotes.map(note => (
            <div key={note.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{note.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <BookOpen size={16} className="mr-2" />
                    <span
                      className="px-2 py-1 rounded-full text-white font-medium"
                      style={{ backgroundColor: note.subject.color }}
                    >
                      {note.subject.name} - {note.subject.period}º Período
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleCreateEventFromNote(note)}
                    className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50"
                    title="Criar evento no calendário"
                  >
                    <Calendar size={18} />
                  </button>
                  <button
                    onClick={() => handleEditNote(note)}
                    className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50"
                    title="Editar anotação"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
                    title="Excluir anotação"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{note.content}</p>
              
              <div className="text-xs text-gray-500 border-t pt-3">
                Criado em: {formatDate(note.created_at)}
                {note.updated_at !== note.created_at && (
                  <span className="ml-4">• Atualizado em: {formatDate(note.updated_at)}</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma anotação encontrada</h3>
            <p className="text-gray-500">
              {searchTerm || selectedSubject 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira anotação'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Anotação */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <form onSubmit={handleSaveNote} className="flex flex-col h-full">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold">
                  {selectedNote ? 'Editar Anotação' : 'Nova Anotação'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={noteForm.title}
                    onChange={handleNoteFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite o título da anotação"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Matéria *
                  </label>
                  <select
                    name="subject_id"
                    id="subject_id"
                    value={noteForm.subject_id}
                    onChange={handleNoteFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione uma matéria</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} - {subject.period}º Período
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo *
                  </label>
                  <textarea
                    name="content"
                    id="content"
                    value={noteForm.content}
                    onChange={handleNoteFormChange}
                    rows="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Digite o conteúdo da sua anotação..."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  <Save size={18} className="mr-2" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Criar/Editar Matéria */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <form onSubmit={handleSaveSubject}>
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">
                  {selectedSubjectForEdit ? 'Editar Matéria' : 'Nova Matéria'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Matéria *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={subjectForm.name}
                    onChange={handleSubjectFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Cálculo I"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                    Período *
                  </label>
                  <select
                    name="period"
                    id="period"
                    value={subjectForm.period}
                    onChange={handleSubjectFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione o período</option>
                    {ACADEMIC_PERIODS.map(period => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECT_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSubjectForm(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          subjectForm.color === color
                            ? 'border-gray-800 ring-2 ring-blue-500'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  <Save size={16} className="mr-2" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;