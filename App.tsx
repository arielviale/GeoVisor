
import React, { useState } from 'react';
import { Page } from './types';
import ImageAnalyzer from './components/ImageAnalyzer';
import MapViewer from './components/MapViewer';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>(Page.Analyzer);

  const NavButton: React.FC<{
    targetPage: Page;
    children: React.ReactNode;
  }> = ({ targetPage, children }) => {
    const isActive = page === targetPage;
    return (
      <button
        onClick={() => setPage(targetPage)}
        className={`px-4 py-2 text-lg font-medium rounded-t-lg transition-colors ${
          isActive
            ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-400'
            : 'text-gray-400 hover:bg-gray-700'
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4">
      <header className="w-full max-w-4xl text-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          Geo<span className="text-indigo-400">Visor</span> AI
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Herramientas inteligentes para análisis de imágenes y geolocalización.
        </p>
      </header>
      
      <nav className="flex justify-center border-b border-gray-700 w-full max-w-4xl">
        <NavButton targetPage={Page.Analyzer}>Analizador de Área</NavButton>
        <NavButton targetPage={Page.Mapper}>Mi Ubicación</NavButton>
      </nav>

      <main className="w-full flex-grow mt-[-1px]">
        {page === Page.Analyzer && <ImageAnalyzer />}
        {page === Page.Mapper && <MapViewer />}
      </main>
      
      <footer className="w-full max-w-4xl text-center p-4 mt-8 text-gray-500 text-sm">
        <p>Desarrollado con React, Tailwind CSS y la API de Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
