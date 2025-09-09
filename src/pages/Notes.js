// src/pages/Notes.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  X,
  Save,
  FileText
} from 'lucide-react';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data para demonstração
  const mockSubjects = [
    { id: 1, name: 'Cálculo I', period: 2, color: '#3B82F6' },
    { id: 2, name: 'Programação', period: 3, color: '#10B981' },
    { id: 3, name: 'Física I', period: 2, color: '#F59E0B' },
    { id: 4, name: 'Estrutura de Dados', period: 3, color: '#8B5CF6' }
  ];

  const mockNotes = [
    {
      id: 1,
      title: 'Limites e Derivadas',
      content: 'Conceitos fundamentais de cálculo: limites são a base para entender derivadas. Uma derivada representa a taxa de variação instantânea de uma função.',
      subject: mockSubjects[0],
      created_at: '2025-09-01T10:00:00Z',
      updated_at: '2025-09-01T10:00:00Z'
    },
    {
      id: 2,
      title: 'Algoritmos de Busca',
      content: 'Busca linear: O(n) - percorre todos os elementos. Busca binária: O(log n) - divide o problema pela metade a cada iteração, mas requer array ordenado.',
      subject: mockSubjects[1],
      created_at: '2025-09-02T15:30:00Z',
      updated_at: '2025-09-02T15:30:00Z'
    },
    {
      id: 3,
      title: 'Leis de Newton',
      content: '1ª Lei: Lei da Inércia - Um objeto em repouso permanece em repouso. 2ª Lei: F = ma. 3ª Lei: Ação e reação.',
      subject: mockSubjects[2],
      created_at: '2025-09-03T09:15:00Z',
      updated_at: '2025-09-03T09:15:00Z'
    }
  ];

  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    subject_id: ''
  });

  useEffect(() => {
    // Carregar dados iniciais
    setSubjects(mockSubjects);
    setNotes(mockNotes);
  }, []);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === '' || note.subject.id === parseInt(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  const handleCreateNote = () => {
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
      // Simulação de chamada à API
      await new Promise(res => setTimeout(res, 1000));
      
      if (selectedNote) {
        toast.success('Anotação atualizada com sucesso!');
      } else {
        toast.success('Anotação criada com sucesso!');
      }
      setShowNoteModal(false);
    } catch (error) {
      toast.error('Erro ao salvar anotação');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      try {
        await new Promise(res => setTimeout(res, 500));
        toast.success('Anotação excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir anotação');
      }
    }
  };

  const handleCreateEventFromNote = (note) => {
    // Esta função seria implementada para criar evento no calendário
    toast.success(`Redirecionando para criar evento baseado em: ${note.title}`);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNoteForm(prev => ({ ...prev, [name]: value }));
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Anotações</h1>
          <p className="text-gray-600">Organize suas anotações por matéria</p>
        </div>
        <button
          onClick={handleCreateNote}
          className="btn-primary"
        >
          <Plus size={20} className="mr-2" />
          Nova Anotação
        </button>
      </header>

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
              onChange={(e) => setSelectedSubject(e.target.value)}
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
              {/* Header */}
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

              {/* Form Content */}
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
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
                    rows="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Digite o conteúdo da sua anotação..."
                    required
                  />
                </div>
              </div>

              {/* Footer */}
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
    </div>
  );
};

export default Notes;