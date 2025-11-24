import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Brain, BookOpen, ArrowLeft, RotateCw, 
  Sparkles, ChevronLeft, ChevronRight 
} from 'lucide-react';
import api from '../services/api';

const Flashcards = () => {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(20);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!subject.trim()) {
      toast.error('Digite uma matéria!');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        subject: subject.trim(),
        topic: topic.trim() || "",
        count: parseInt(count)
      };

      console.log('Enviando requisição:', requestData);

      const response = await api.post('/flashcards/generate', requestData);

      console.log('Resposta recebida:', response.data);

      if (response.data && response.data.flashcards && Array.isArray(response.data.flashcards)) {
        setFlashcards(response.data.flashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowResults(true);
        toast.success(`${response.data.flashcards.length} flashcards gerados!`);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('Erro completo:', error);
      console.error('Resposta do erro:', error.response);
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          const errors = error.response.data.detail.map(err => err.msg).join(', ');
          toast.error(`Erro de validação: ${errors}`);
        } else {
          toast.error(error.response.data.detail);
        }
      } else {
        toast.error('Erro ao gerar flashcards. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setFlashcards([]);
    setSubject('');
    setTopic('');
    setCount(20);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Se não há resultados ou flashcards, mostrar formulário
  if (!showResults || !flashcards || flashcards.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Flashcards Inteligentes
            </h1>
            <p className="text-gray-600 text-lg">
              Gere flashcards personalizados com IA para estudar qualquer matéria
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                  Matéria *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ex: Cálculo I, História do Brasil, Anatomia..."
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Digite a matéria que você deseja estudar
                </p>
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                  Tópico Específico (Opcional)
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ex: Limites e Derivadas, Segunda Guerra Mundial..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Deixe em branco para flashcards gerais sobre a matéria
                </p>
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  Quantidade de Flashcards
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-2xl font-bold text-blue-600 w-12 text-center">
                    {count}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Escolha entre 5 e 50 flashcards
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Gerando flashcards...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Gerar Flashcards com IA
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 flex items-start">
                <Brain className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  Nossa IA criará flashcards personalizados para você estudar de forma eficiente. 
                  Cada flashcard terá uma pergunta e resposta sobre o tema escolhido.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Garantir que temos um card válido
  const currentCard = flashcards[currentIndex];
  
  if (!currentCard || !currentCard.question || !currentCard.answer) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Erro ao carregar flashcard</p>
          <button onClick={handleReset} className="btn-primary">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Tela de visualização de flashcards
  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleReset}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{subject}</h2>
            {topic && <p className="text-gray-600">{topic}</p>}
          </div>
          <button
            onClick={handleReset}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <RotateCw className="w-5 h-5 mr-2" />
            Novo
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{currentIndex + 1} / {flashcards.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <div 
            onClick={handleFlip}
            className="relative h-96 cursor-pointer perspective-1000"
          >
            <div 
              className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Frente */}
              <div className="absolute w-full h-full backface-hidden">
                <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center border-4 border-blue-200">
                  <div className="text-sm font-semibold text-blue-600 mb-4">
                    PERGUNTA
                  </div>
                  <p className="text-2xl font-bold text-gray-900 text-center mb-6">
                    {currentCard.question}
                  </p>
                  <div className="text-sm text-gray-500 flex items-center">
                    <RotateCw className="w-4 h-4 mr-2" />
                    Clique para ver a resposta
                  </div>
                </div>
              </div>

              {/* Verso */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180">
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center border-4 border-blue-700">
                  <div className="text-sm font-semibold text-blue-200 mb-4">
                    RESPOSTA
                  </div>
                  <p className="text-2xl font-bold text-white text-center mb-6">
                    {currentCard.answer}
                  </p>
                  <div className="text-sm text-blue-200 flex items-center">
                    <RotateCw className="w-4 h-4 mr-2" />
                    Clique para ver a pergunta
                  </div>
                </div>
              </div>
            </div>
          </div>

          <style>{`
            .perspective-1000 {
              perspective: 1000px;
            }
            .transform-style-3d {
              transform-style: preserve-3d;
            }
            .backface-hidden {
              backface-visibility: hidden;
            }
            .rotate-y-180 {
              transform: rotateY(180deg);
            }
          `}</style>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center px-6 py-3 bg-white rounded-lg font-semibold text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Anterior
          </button>

          <button
            onClick={handleFlip}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
          >
            <RotateCw className="w-5 h-5 mr-2" />
            Virar Card
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="flex items-center px-6 py-3 bg-white rounded-lg font-semibold text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-blue-600">{flashcards.length}</div>
            <div className="text-sm text-gray-600">Total de Cards</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-blue-600">{currentIndex + 1}</div>
            <div className="text-sm text-gray-600">Card Atual</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(((currentIndex + 1) / flashcards.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Completo</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;