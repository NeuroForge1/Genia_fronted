"use client";
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      // Redirección manejada por el hook useAuth
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f9fafb', 
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '500px', 
        width: '100%', 
        backgroundColor: 'white', 
        borderRadius: '1rem', 
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', 
        padding: '2.5rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            color: '#2563eb', 
            marginBottom: '1.5rem' 
          }}>GENIA</h1>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#111827', 
            marginBottom: '1rem' 
          }}>Inicia sesión en tu cuenta</h2>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#4b5563', 
            marginBottom: '1.5rem' 
          }}>
            ¿No tienes una cuenta?{' '}
            <Link href="/register" style={{ 
              fontWeight: '500', 
              color: '#2563eb', 
              textDecoration: 'underline' 
            }}>
              Regístrate
            </Link>
          </p>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="email-address" 
              style={{ 
                display: 'block', 
                fontSize: '1.25rem', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '0.5rem' 
              }}
            >
              Correo electrónico
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '1.25rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.5rem', 
                backgroundColor: 'white',
                color: '#111827'
              }}
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="password" 
              style={{ 
                display: 'block', 
                fontSize: '1.25rem', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '0.5rem' 
              }}
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                fontSize: '1.25rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.5rem', 
                backgroundColor: 'white',
                color: '#111827'
              }}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              borderRadius: '0.5rem', 
              padding: '1rem', 
              marginBottom: '1.5rem',
              border: '1px solid #fca5a5'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <svg style={{ height: '1.5rem', width: '1.5rem', color: '#ef4444' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div style={{ marginLeft: '0.75rem' }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: '500', color: '#b91c1c' }}>{error}</p>
                </div>
              </div>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                style={{ 
                  height: '1.25rem', 
                  width: '1.25rem', 
                  color: '#2563eb', 
                  borderRadius: '0.25rem',
                  border: '1px solid #d1d5db'
                }}
              />
              <label htmlFor="remember-me" style={{ 
                marginLeft: '0.75rem', 
                fontSize: '1.25rem', 
                color: '#111827' 
              }}>
                Recordarme
              </label>
            </div>

            <div>
              <a href="#" style={{ 
                fontSize: '1.25rem', 
                fontWeight: '500', 
                color: '#2563eb', 
                textDecoration: 'underline' 
              }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '1rem 1.5rem', 
                fontSize: '1.5rem', 
                fontWeight: '500', 
                color: 'white', 
                backgroundColor: '#2563eb', 
                borderRadius: '0.5rem', 
                border: 'none',
                boxShadow: '0 4px 6px rgba(37, 99, 235, 0.25)',
                cursor: 'pointer',
                opacity: loading ? '0.7' : '1'
              }}
            >
              {loading ? (
                <>
                  <svg style={{ 
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.75rem',
                    height: '1.5rem',
                    width: '1.5rem',
                    color: 'white'
                  }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: '0.25' }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: '0.75' }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
