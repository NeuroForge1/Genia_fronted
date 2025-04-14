import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { FormGroup, FormLabel, FormInput, FormCheckbox } from '../components/ui/Form';
import Loader from '../components/ui/Loader';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import supabaseService from '../services/supabaseService';

export default function Login() {
  const { theme } = useTheme();
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
    <div className="bg-dark">
      <Head>
        <title>Iniciar Sesión - GENIA</title>
        <meta name="description" content="Inicia sesión en tu cuenta de GENIA" />
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
            <Link href="/referrals" className="nav-link">Referral Program</Link>
          </div>
          <div className="nav-auth">
            <Link href="/login">
              <Button variant="primary" size="small">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="small">Register</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <Card 
          className="login-card" 
          withHeader={true} 
          header={<h3>Iniciar Sesión</h3>}
          headerClassName="card-header"
        >
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormInput 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required 
                disabled={loading}
              />
            </FormGroup>
            <FormGroup>
              <FormLabel htmlFor="password">Contraseña</FormLabel>
              <FormInput 
                type="password" 
                id="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required 
                disabled={loading}
              />
            </FormGroup>
            <FormGroup>
              <FormCheckbox 
                id="rememberMe" 
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
                label="Recordarme"
              />
            </FormGroup>
            <div className="form-button">
              <Button type="submit" disabled={loading} fullWidth={true}>
                {loading ? <Loader size="small" color="white" text="Iniciando sesión..." /> : 'Iniciar Sesión'}
              </Button>
            </div>
          </form>
          <div className="forgot-password">
            <Link href="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>
          <hr />
          <div className="register-link">
            <p>¿No tienes una cuenta? <Link href="/register">Regístrate</Link></p>
          </div>
        </Card>
      </div>

      <footer>
        <div className="container">
          <p>© 2025 Genia AI. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .navbar {
          background-color: var(--color-bg-light);
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
          color: var(--color-primary);
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          gap: 20px;
        }
        .nav-link {
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        .nav-link:hover {
          color: var(--color-primary);
        }
        .nav-auth {
          display: flex;
          gap: 10px;
        }
        .login-card {
          max-width: 500px;
          margin: 60px auto;
        }
        .card-header {
          background-color: var(--color-secondary) !important;
        }
        .error-message {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .form-button {
          margin-top: 20px;
        }
        .forgot-password {
          text-align: center;
          margin-top: 20px;
        }
        .forgot-password a {
          color: var(--color-secondary);
          text-decoration: none;
        }
        hr {
          margin: 20px 0;
          border: none;
          border-top: 1px solid var(--color-border);
        }
        .register-link {
          text-align: center;
        }
        .register-link a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 500;
        }
        footer {
          background-color: var(--color-bg-light);
          padding: 20px 0;
          text-align: center;
          margin-top: 60px;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
