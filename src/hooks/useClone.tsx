import { createContext, useContext, useState, ReactNode } from 'react';

// Definir tipos para los diferentes clones
export type CloneType = 'content' | 'ads' | 'ceo' | 'voice' | 'funnel' | 'calendar';

type CloneResponse = {
  response: string;
  clone_type: CloneType;
  task_id?: string;
  tokens_used?: number;
  credits_remaining?: number;
};

type CloneContextType = {
  loading: boolean;
  error: string | null;
  response: CloneResponse | null;
  sendRequest: (message: string, context?: any) => Promise<void>;
  clearResponse: () => void;
};

// Crear el contexto para los clones
const CloneContext = createContext<CloneContextType | undefined>(undefined);

// Proveedor del contexto de clones
export const CloneProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<CloneResponse | null>(null);

  // Función para enviar una solicitud al MCP
  const sendRequest = async (message: string, context?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('genia_token');
      if (!token) {
        throw new Error('No estás autenticado');
      }

      // Enviar la solicitud al endpoint del MCP
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message, context }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error('No tienes suficientes créditos para realizar esta acción');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar la solicitud');
      }

      const data = await response.json();
      setResponse({
        response: data.response,
        clone_type: data.clone_type,
        task_id: data.task_id,
        credits_remaining: data.credits_remaining
      });
    } catch (error) {
      console.error(`Error with MCP:`, error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar la respuesta
  const clearResponse = () => {
    setResponse(null);
    setError(null);
  };

  return (
    <CloneContext.Provider
      value={{
        loading,
        error,
        response,
        sendRequest,
        clearResponse,
      }}
    >
      {children}
    </CloneContext.Provider>
  );
};

// Hook personalizado para usar el contexto de clones
export const useClone = () => {
  const context = useContext(CloneContext);
  if (context === undefined) {
    throw new Error('useClone must be used within a CloneProvider');
  }
  return context;
};
