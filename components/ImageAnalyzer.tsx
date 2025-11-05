
import React, { useState, useRef, useCallback } from 'react';
import { Point } from '../types';
import { analyzeImageForArea } from '../services/geminiService';
import Spinner from './Spinner';

const ImageAnalyzer: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const [selectionPoints, setSelectionPoints] = useState<Point[]>([]);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetState();
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        setImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetState = () => {
    setImageSrc(null);
    setImageMimeType('');
    setSelectionPoints([]);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  };
  
  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    setSelectionPoints((prevPoints) => [...prevPoints, { x, y }]);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageSrc || selectionPoints.length < 3) {
      setError('Por favor, sube una imagen y selecciona al menos 3 puntos para formar un área.');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setAnalysisResult(null);

    const base64Data = imageSrc.split(',')[1];
    const result = await analyzeImageForArea(base64Data, imageMimeType, selectionPoints);
    setAnalysisResult(result);
    setIsLoading(false);
  }, [imageSrc, imageMimeType, selectionPoints]);

  const renderSelection = () => {
    if (!imageRef.current || selectionPoints.length === 0) return null;

    const img = imageRef.current;
    const scaleX = img.width / img.naturalWidth;
    const scaleY = img.height / img.naturalHeight;
    
    const scaledPoints = selectionPoints.map(p => ({ x: p.x * scaleX, y: p.y * scaleY }));

    const pointsString = scaledPoints.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {scaledPoints.length > 2 && (
          <polygon points={pointsString} className="fill-indigo-500/30 stroke-indigo-400 stroke-2" />
        )}
        {scaledPoints.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="5" className="fill-red-500" />
        ))}
      </svg>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-gray-800 rounded-lg shadow-2xl flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-indigo-400">Analizador de Superficie con IA</h2>
        <p className="text-gray-400 mt-2">Sube una foto, selecciona un área y obtén una estimación de su superficie.</p>
      </div>

      {!imageSrc && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <label htmlFor="file-upload" className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700 transition-colors">
            Seleccionar Imagen
          </label>
          <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP</p>
        </div>
      )}

      {imageSrc && (
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-200 text-sm">
            <strong>Instrucciones:</strong>
            <ol className="list-decimal list-inside ml-2 mt-1">
              <li>Coloca un objeto de tamaño estándar (ej. una tarjeta de crédito) cerca del área a medir para dar escala.</li>
              <li>Toma la foto lo más perpendicular posible a la superficie.</li>
              <li>Haz clic en las esquinas del área que deseas medir.</li>
            </ol>
          </div>
          <div className="relative w-full max-w-full mx-auto cursor-crosshair rounded-lg overflow-hidden" onClick={handleImageClick}>
            <img ref={imageRef} src={imageSrc} alt="Uploaded content" className="w-full h-auto object-contain max-h-[60vh]" />
            {renderSelection()}
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-center">{error}</p>}

      {(isLoading || analysisResult) && (
        <div className="p-4 bg-gray-700 rounded-lg text-center">
            {isLoading && <div className="flex flex-col items-center gap-2"><Spinner /><span>Analizando...</span></div>}
            {analysisResult && !isLoading && (
                <div>
                    <h3 className="text-lg font-semibold text-indigo-400">Resultado del Análisis:</h3>
                    <p className="text-2xl font-bold mt-2">{analysisResult}</p>
                </div>
            )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
        <button onClick={handleAnalyzeClick} disabled={isLoading || !imageSrc || selectionPoints.length < 3} className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex-grow">
          {isLoading ? 'Analizando...' : 'Calcular Superficie'}
        </button>
        <button onClick={resetState} className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex-grow">
          Reiniciar
        </button>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
