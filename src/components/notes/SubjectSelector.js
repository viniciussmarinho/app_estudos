import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, BookOpen, Edit, Trash2, X, Save } from 'lucide-react';
import { SUBJECT_COLORS, ACADEMIC_PERIODS } from '../../utils/constants';
import { notesService } from '../../services/notes';

const SubjectSelector = ({ 
  selectedSubjectId, 
  onSubjectSelect, 
  showCreateButton = true,
  onSubjectsUpdate 
}) => {
  const [subjects, setSubjects] = useState([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubjectForEdit, setSelectedSubjectForEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    period: '',
    color: SUBJECT_COLORS[0]
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoadingData(true);
    try {
      const data = await notesService.getSubjects();
      setSubjects(data);
      if (onSubjectsUpdate) {
        onSubjectsUpdate(data);
      }
    } catch (error) {
      toast.error('Erro ao carregar matérias');
      console.error('Error loading subjects:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateSubject = () => {
    setSelectedSubjectForEdit(null);
    setSubjectForm({
      name: '',
      period: '',
      color: SUBJECT_COLORS[0]
    });
    setShowSubjectModal(true);
  };

  const handleEditSubject = (subject, e) => {
    e.stopPropagation();
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

    // Verificar duplicata localmente
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
      await loadSubjects();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar matéria');
      console.error('Error saving subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId, e) => {
    e.stopPropagation();
    
    if (window.confirm('Tem certeza que deseja excluir esta matéria? Todas as anotações associadas também serão excluídas.')) {
      try {
        await notesService.deleteSubject(subjectId);
        toast.success('Matéria excluída com sucesso!');
        await loadSubjects();
      } catch (error) {
        toast.error('Erro ao excluir matéria');
        console.error('Error deleting subject:', error);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSubjectForm(prev => ({ ...prev, [name]: value }));
  };

  const groupedSubjects = subjects.reduce((groups, subject) => {
    const period = subject.period;
    if (!groups[period]) {
      groups[period] = [];
    }
    groups[period].push(subject);
    return groups;
  }, {});

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Matérias</h3>
          {showCreateButton && (
            <button
              onClick={handleCreateSubject}
              className="btn-primary text-sm"
            >
              <Plus size={16} className="mr-1" />
              Nova Matéria
            </button>
          )}
        </div>

        {/* Filtro rápido */}
        <div>
          <select
            value={selectedSubjectId || ''}
            onChange={(e) => onSubjectSelect && onSubjectSelect(e.target.value || null)}
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

        {/* Lista de matérias agrupadas por período */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Object.keys(groupedSubjects)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(period => (
            <div key={period}>
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                {period}º Período
              </h4>
              <div className="space-y-2 ml-4">
                {groupedSubjects[period].map(subject => (
                  <div
                    key={subject.id}
                    onClick={() => onSubjectSelect && onSubjectSelect(subject.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSubjectId === subject.id.toString()
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="font-medium text-gray-800">
                        {subject.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleEditSubject(subject, e)}
                        className="text-gray-400 hover:text-blue-600 p-1"
                        title="Editar matéria"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSubject(subject.id, e)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Excluir matéria"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
            <p>Nenhuma matéria cadastrada</p>
            <p className="text-sm">Crie sua primeira matéria para começar</p>
          </div>
        )}
      </div>

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
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
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
                            ? 'border-gray-800'
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
    </>
  );
};

export default SubjectSelector;