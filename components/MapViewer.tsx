
import React, { useState, useEffect, useCallback } from 'react';
import Spinner from './Spinner';

interface Location {
  lat: number;
  lon: number;
}

const MapViewer: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setLocation(null);

    if (!navigator.geolocation) {
      setError('La geolocalización no es soportada por este navegador.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsLoading(false);
      },
      () => {
        setError('No se pudo obtener la ubicación. Por favor, habilita los permisos de ubicación.');
        setIsLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    getLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-gray-800 rounded-lg shadow-2xl flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-indigo-400">Mi Ubicación</h2>
        <p className="text-gray-400 mt-2">Visualiza tu posición actual en el mapa.</p>
      </div>

      <div className="aspect-w-16 aspect-h-9 w-full bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
        {isLoading && (
          <div className="text-center flex flex-col items-center gap-2">
            <Spinner />
            <p>Obteniendo ubicación...</p>
          </div>
        )}
        {error && <p className="text-red-400">{error}</p>}
        {location && (
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${location.lat},${location.lon}&hl=es&z=14&output=embed`}
            className="border-0"
          ></iframe>
        )}
      </div>

       <div className="flex justify-center">
         <button onClick={getLocation} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-500" disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Actualizar Ubicación'}
        </button>
      </div>
    </div>
  );
};

export default MapViewer;
