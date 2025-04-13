import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';
import supabaseService from '../services/supabaseService';

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    negocio: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      // Registrar usuario con Supabase
      const userData = {
        nombre: formData.nombre,
        negocio: formData.negocio,
        telefono: formData.telefono
      };
      
      const { user, session } = await supabaseService.signUp(
        formData.email, 
        formData.password,
        userData
      );
      
      if (user) {
        // También registrar en el backend para datos adicionales
        try {
          await fetch('https://genia-backend.onrender.com/api/users/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nombre: formData.nombre,
              email: formData.email,
              negocio: formData.negocio,
              telefono: formData.telefono,
              supabase_id: user.id
            }),
          });
        } catch (backendError) {
          console.error('Error al registrar en backend:', backendError);
          // Continuamos aunque falle el backend, ya que el usuario está en Supabase
        }
        
        alert('Cuenta creada correctamente. Por favor, inicia sesión.');
        window.location.href = '/login';
      } else {
        setError('Error al crear la cuenta. Por favor, intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error de registro:', error);
      if (error.message.includes('already registered')) {
        setError('Este email ya está registrado. Por favor, utiliza otro o inicia sesión.');
      } else {
        setError(error.message || 'Error al crear la cuenta. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Registro - GENIA</title>
        <meta name="description" content="Crea una cuenta en GENIA" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="navbar">
        <div className="container">
          <Link href="/" className="navbar-brand">
            GENIA
          </Link>
          <div className="nav-links">
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/ai-tracker" className="nav-link">AI Tracker</Link>
            <Link href="/marketplace" className="nav-link">Marketplace</Link>
            <Link href="/referidos" className="nav-link">Referral Program</Link>
          </div>
          <div className="nav-auth">
            <Link href="/login" className="btn btn-primary">Login</Link>
            <Link href="/register" className="btn btn-outline">Register</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="register-card">
          <div className="card-header">
            <h3>Crear Cuenta</h3>
          </div>
          <div className="card-body">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo</label>
                <input 
                  type="text" 
                  id="nombre" 
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required 
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="negocio">Nombre del negocio</label>
                <input 
                  type="text" 
                  id="negocio" 
                  name="negocio"
                  value={formData.negocio}
                  onChange={handleChange}
                  required 
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="telefono">Teléfono (con WhatsApp)</label>
                <input 
                  type="tel" 
                  id="telefono" 
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                  disabled={loading}
                />
              </div>
              <div className="form-check">
                <input 
                  type="checkbox" 
                  id="terms" 
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <label htmlFor="terms">Acepto los <Link href="/terms">términos y condiciones</Link></label>
              </div>
              <div className="form-button">
                <button type="submit" disabled={loading}>
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </div>
            </form>
            <hr />
            <div className="login-link">
              <p>¿Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link></p>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="container">
          <p>© 2025 Genia AI. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }
        .navbar {
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 15px 0;
        }
        .navbar .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .navbar-brand {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          gap: 20px;
        }
        .nav-link {
          color: #555;
          text-decoration: none;
        }
        .nav-auth {
          display: flex;
          gap: 10px;
        }
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
        }
        .btn-primary {
          background-color: #4a6cf7;
          color: white;
        }
        .btn-outline {
          border: 1px solid #4a6cf7;
          color: #4a6cf7;
        }
        .register-card {
          max-width: 600px;
          margin: 60px auto;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .card-header {
          background-color: #4a6cf7;
          color: white;
          padding: 20px;
        }
        .card-header h3 {
          margin: 0;
        }
        .card-body {
          padding: 30px;
          background-color: white;
        }
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        .form-check {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        .form-check input {
          margin-right: 10px;
        }
        .form-check a {
          color: #4a6cf7;
          text-decoration: none;
        }
        .form-button button {
          width: 100%;
          padding: 12px;
          background-color: #4a6cf7;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }
        .form-button button:disabled {
          background-color: #a5b4fc;
          cursor: not-allowed;
        }
        hr {
          margin: 20px 0;
          border: none;
          border-top: 1px solid #eee;
        }
        .login-link {
          text-align: center;
        }
        .login-link a {
          color: #4a6cf7;
          text-decoration: none;
          font-weight: 500;
        }
        footer {
          background-color: #f5f5f5;
          padding: 20px 0;
          text-align: center;
          margin-top: 60px;
        }
      `}</style>

      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
          color: #333;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
