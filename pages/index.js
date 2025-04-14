import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabaseService from '../services/supabaseService';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    negocio: ''
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await supabaseService.getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
          // Si el usuario ya está autenticado, redirigir al dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
      }
    }
    
    checkAuth();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Redirigir al registro con los datos pre-llenados
      router.push({
        pathname: '/register',
        query: { 
          nombre: formData.nombre,
          email: formData.email,
          negocio: formData.negocio
        }
      });
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      alert('Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div>
      <Head>
        <title>GENIA - Tu Sistema de Crecimiento con IA</title>
        <meta name="description" content="Tu sistema de crecimiento automatizado con IA. Sin riesgo. Sin esfuerzo." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="container">
          <h1>Activa tu GENIA gratis por 7 días</h1>
          <p>Tu sistema de crecimiento automatizado con IA. Sin riesgo. Sin esfuerzo.</p>
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              name="nombre" 
              placeholder="Tu nombre completo" 
              required 
              value={formData.nombre}
              onChange={handleChange}
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Tu correo electrónico" 
              required 
              value={formData.email}
              onChange={handleChange}
            />
            <input 
              type="text" 
              name="negocio" 
              placeholder="¿Qué vendes? (opcional)" 
              value={formData.negocio}
              onChange={handleChange}
            />
            <button type="submit">Probar ahora gratis</button>
          </form>
          <p className="disclaimer">
            No se te cobrará nada hoy. El cargo se realiza después del periodo de prueba. Puedes cancelar en cualquier momento.
          </p>
        </div>
      </main>

      <style jsx>{`
        .container {
          max-width: 700px;
          margin: 60px auto;
          padding: 30px;
          text-align: center;
          background: #1c1c1c;
          border-radius: 12px;
          color: #ffffff;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 10px;
          color: #67f8c0;
        }
        p {
          font-size: 1rem;
          margin-bottom: 30px;
        }
        input, button {
          padding: 12px;
          margin: 10px;
          border-radius: 6px;
          border: none;
          font-size: 1rem;
          display: block;
          width: 80%;
          margin-left: auto;
          margin-right: auto;
        }
        button {
          background: #67f8c0;
          color: #000;
          cursor: pointer;
          width: auto;
          min-width: 200px;
        }
        .disclaimer {
          margin-top: 20px;
          font-size: 0.9rem;
          color: #999;
        }
      `}</style>

      <style jsx global>{`
        body {
          font-family: sans-serif;
          background: #0e0e0e;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
