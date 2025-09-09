import React from 'react';
import { BookOpen } from 'lucide-react';

const Loading = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">StudyApp</h2>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando...</span>
        </div>
      </div>
    </div>
  );
};

export default Loading;