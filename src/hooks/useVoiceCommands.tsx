import { useEffect, useState, useRef } from 'react';
import { useClone } from './useClone';

// Tipos para el reconocimiento de voz
type VoiceRecognitionStatus = 'inactive' | 'listening' | 'processing' | 'error';

// Hook personalizado para comandos por voz
export const useVoiceCommands = () => {
  const [status, setStatus] = useState<VoiceRecognitionStatus>('inactive');
  const [transcript, setTranscript] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const { sendRequest, loading, response, error } = useClone();

  // Inicializar el reconocimiento de voz
  useEffect(() => {
    // Verificar si el navegador soporta la API de reconocimiento de voz
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      
      // Crear instancia de reconocimiento de voz
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configurar opciones
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES'; // Idioma español
      
      // Configurar eventos
      recognitionRef.current.onstart = () => {
        setStatus('listening');
        setTranscript('');
      };
      
      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        setStatus('processing');
        
        // Enviar el texto reconocido al MCP
        sendRequest(result);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        setStatus('error');
      };
      
      recognitionRef.current.onend = () => {
        if (status === 'listening') {
          setStatus('inactive');
        }
      };
    }
    
    // Limpiar al desmontar
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Función para iniciar el reconocimiento de voz
  const startListening = () => {
    if (recognitionRef.current && status !== 'listening') {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error al iniciar reconocimiento de voz:', error);
        setStatus('error');
      }
    }
  };

  // Función para detener el reconocimiento de voz
  const stopListening = () => {
    if (recognitionRef.current && status === 'listening') {
      recognitionRef.current.stop();
      setStatus('inactive');
    }
  };

  // Función para sintetizar voz (respuesta hablada)
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES'; // Idioma español
      utterance.rate = 1.0; // Velocidad normal
      utterance.pitch = 1.0; // Tono normal
      window.speechSynthesis.speak(utterance);
    }
  };

  // Efecto para leer en voz alta la respuesta del clon
  useEffect(() => {
    if (response && status === 'processing') {
      speak(response.response);
      setStatus('inactive');
    }
  }, [response, status]);

  return {
    isSupported,
    status,
    transcript,
    startListening,
    stopListening,
    speak,
    response,
    loading,
    error
  };
};

export default useVoiceCommands;
