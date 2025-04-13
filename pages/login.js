import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';
import supabaseService from '../services/supabaseService';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
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
    setError(null);
    setLoading(true);
    
    try {
      // Iniciar sesión con Supabase
      const { session, user } = await supabaseService.signIn(formData.email, formData.password);
      
      if (session) {
        // Guardar información de sesión si "recordarme" está activado
        if (formData.rememberMe) {
          localStorage.setItem('genia_user', JSON.stringify(user));
        }
        
        // Redirigir al dashboard
        window.location.href = '/dashboard';
      } else {
        setError('Error de autenticación. Por favor, verifica tus credenciales.');
      }
    } catch (error) {
      console.error('Error de login:', error);
      setError(error.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Iniciar Sesión - GENIA</title>
        <meta name="description" content="Inicia sesión en tu cuenta de GENIA" />
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
        <div className="login-card">
          <div className="card-header">
            <h3>Iniciar Sesión</h3>
          </div>
          <div className="card-body">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
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
              <div className="form-check">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={loading}
                />
                <label htmlFor="rememberMe">Recordarme</label>
              </div>
              <div className="form-button">
                <button type="submit" disabled={loading}>
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </div>
            </form>
            <div className="forgot-password">
              <Link href="/forgot-password">¿Olvidaste tu contraseña?</Link>
            </div>
            <hr />
            <div className="register-link">
              <p>¿No tienes una cuenta? <Link href="/register">Regístrate</Link></p>
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
        .login-card {
          max-width: 500px;
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
        .forgot-password {
          text-align: center;
          margin-top: 20px;
        }
        .forgot-password a {
          color: #4a6cf7;
          text-decoration: none;
        }
        hr {
          margin: 20px 0;
          border: none;
          border-top: 1px solid #eee;
        }
        .register-link {
          text-align: center;
        }
        .register-link a {
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
