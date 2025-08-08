import { useState } from 'react';

export default function LienzoPensamiento() {
  const [thoughts, setThoughts] = useState('');

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-[#171717] border-t border-gray-200 dark:border-gray-800 p-4 flex flex-col">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Lienzo del Pensamiento
      </h3>
      <textarea
        className="flex-1 w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-mono bg-white dark:bg-[#232323] text-gray-900 dark:text-gray-100 resize-none"
        placeholder="Escribe aquí tus ideas, notas, hipótesis o pasos de razonamiento..."
        value={thoughts}
        onChange={(e) => setThoughts(e.target.value)}
        rows={8}
      />
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Este espacio es privado y no se envía al agente. Úsalo para organizar tu pensamiento
        profesionalmente.
      </div>
    </div>
  );
}
