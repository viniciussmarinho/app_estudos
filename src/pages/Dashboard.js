// src/pages/Dashboard.js

// 1. IMPORTS PRIMEIRO: Todos os imports devem estar no topo do arquivo.
import React from 'react'; // Descomentado e no lugar certo
import { useAuth } from '../hooks/useAuth';
import { Calendar, FileText, BookOpen, Clock, TrendingUp } from 'lucide-react';
// import { Link } from 'react-router-dom'; // Descomente se for usar links

// 2. LÓGICA DO COMPONENTE: A definição da função vem depois dos imports.
const Dashboard = () => {
  const { user } = useAuth();

  // Dados mock para demonstração
  const upcomingEvents = [
    { id: 1, title: 'Prova de Cálculo I', date: '2025-09-15', daysUntil: 8 },
    { id: 2, title: 'Entrega do Projeto Final', date: '2025-09-20', daysUntil: 13 },
    { id: 3, title: 'Renovação da biblioteca', date: '2025-09-10', daysUntil: 3 }
  ];

  const recentNotes = [
    { id: 1, title: 'Limites e Derivadas', subject: 'Cálculo I' },
    { id: 2, title: 'Algoritmos de Ordenação', subject: 'Estrutura de Dados' },
    { id: 3, title: 'Conceitos de POO', subject: 'Programação Orientada a Objetos' }
  ];

  const stats = [
    { name: 'Eventos Este Mês', value: '12', icon: Calendar, color: 'bg-blue-500' },
    { name: 'Anotações Criadas', value: '28', icon: FileText, color: 'bg-green-500' },
    { name: 'Matérias Ativas', value: '6', icon: BookOpen, color: 'bg-purple-500' },
    { name: 'Próximos Eventos', value: '3', icon: Clock, color: 'bg-orange-500' }
  ];

  // 3. RETURN: O componente precisa retornar o que será exibido na tela.
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Seu Painel</h1>
        <p className="text-gray-600">Bem-vindo(a) de volta, {user?.name || 'Estudante'}!</p>
      </header>

      {/* Seção de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className={`p-3 rounded-full text-white mr-4 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Seção de Eventos e Anotações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Próximos Eventos</h2>
          <ul>
            {upcomingEvents.map((event) => (
              <li key={event.id} className="border-b last:border-b-0 py-2">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(event.date).toLocaleDateString()} - Daqui a {event.daysUntil} dias
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Anotações Recentes</h2>
          <ul>
            {recentNotes.map((note) => (
              <li key={note.id} className="border-b last:border-b-0 py-2">
                <p className="font-semibold">{note.title}</p>
                <p className="text-sm text-gray-500">{note.subject}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// 4. EXPORT: A exportação do componente vem por último.
export default Dashboard;