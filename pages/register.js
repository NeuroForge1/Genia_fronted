import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { FormGroup, FormLabel, FormInput, FormTextarea } from '../components/ui/Form';
import Loader from '../components/ui/Loader';
import Alert from '../components/ui/Alert';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import supabaseService from '../services/supabaseService';

export default function Register() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    negocio: '',
    aceptaTerminos: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Obtener datos de la URL si vienen de la página principal
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const nombre = queryParams.get('nombre');
    const email = queryParams.get('email');
    const negocio = queryParams.get('negocio');

    if (nombre || email || negocio) {
      setFormData(prev => ({
        ...prev,
        nombre: nombre || prev.nombre,
        email: email || prev.email,
        negocio: negocio || prev.negocio
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (!formData.aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Registrar usuario con Supabase
      const userData = {
        nombre: formData.nombre,
        negocio: formData.negocio
      };
      
      const { user } = await supabaseService.signUp(formData.email, formData.password, userData);
      
      if (user) {
        setSuccess(true);
        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setError('Error al registrar usuario. Por favor, intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error de registro:', error);
      setError(error.message || 'Error al registrar usuario. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark">
      <Head>
        <title>Registro - GENIA</title>
        <meta name="description" content="Crea tu cuenta en GENIA" />
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
              <Button variant="outline" size="small">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="small">Register</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <Card 
          className="register-card" 
          withHeader={true} 
          header={<h3>Crear Cuenta</h3>}
          headerClassName="card-header"
        >
          {error && (
            <Alert type="error" dismissible={true} onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert type="success">
              ¡Registro exitoso! Serás redirigido al dashboard en unos segundos...
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel htmlFor="nombre" required={true}>Nombre completo</FormLabel>
              <FormInput 
                type="text" 
                id="nombre" 
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required 
                disabled={loading || success}
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="email" required={true}>Email</FormLabel>
              <FormInput 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required 
                disabled={loading || success}
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="password" required={true}>Contraseña</FormLabel>
              <FormInput 
                type="password" 
                id="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required 
                disabled={loading || success}
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="confirmPassword" required={true}>Confirmar contraseña</FormLabel>
              <FormInput 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
                disabled={loading || success}
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="negocio">¿Qué vendes? (opcional)</FormLabel>
              <FormTextarea 
                id="negocio" 
                name="negocio"
                value={formData.negocio}
                onChange={handleChange}
                rows={3}
                disabled={loading || success}
                placeholder="Describe brevemente tu negocio o servicio"
              />
            </FormGroup>
            
            <div className="form-check">
              <input 
                type="checkbox" 
                id="aceptaTerminos" 
                name="aceptaTerminos"
                checked={formData.aceptaTerminos}
                onChange={handleChange}
                disabled={loading || success}
                className="form-check-input"
              />
              <label htmlFor="aceptaTerminos" className="form-check-label">
                Acepto los <a href="/terminos" target="_blank">términos y condiciones</a>
              </label>
            </div>
            
            <div className="form-button">
              <Button type="submit" disabled={loading || success} fullWidth={true}>
                {loading ? <Loader size="small" color="white" text="Registrando..." /> : 'Crear Cuenta'}
              </Button>
            </div>
          </form>
          
          <hr />
          
          <div className="login-link">
            <p>¿Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link></p>
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
        .register-card {
          max-width: 600px;
          margin: 60px auto;
        }
        .card-header {
          background-color: var(--color-secondary) !important;
        }
        .form-check {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        .form-check-input {
          margin-right: 10px;
          width: 18px;
          height: 18px;
        }
        .form-check-label {
          font-size: 0.9rem;
        }
        .form-check-label a {
          color: var(--color-primary);
          text-decoration: none;
        }
        .form-button {
          margin-top: 20px;
        }
        hr {
          margin: 20px 0;
          border: none;
          border-top: 1px solid var(--color-border);
        }
        .login-link {
          text-align: center;
        }
        .login-link a {
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
