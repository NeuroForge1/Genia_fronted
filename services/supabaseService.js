import { createClient } from '@supabase/supabase-js';
import { GENIA_CONFIG } from '../config.js';

// Crear cliente de Supabase con las credenciales del config
const supabaseUrl = GENIA_CONFIG.supabase.url;
const supabaseAnonKey = GENIA_CONFIG.supabase.anonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Servicio para interactuar con Supabase
 */
const supabaseService = {
  /**
   * Registrar un nuevo usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @param {Object} userData - Datos adicionales del usuario
   * @returns {Promise} - Promesa con el resultado del registro
   */
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en registro Supabase:', error);
      throw error;
    }
  },

  /**
   * Iniciar sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise} - Promesa con el resultado del login
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error en login Supabase:', error);
      throw error;
    }
  },

  /**
   * Cerrar sesión
   * @returns {Promise} - Promesa con el resultado del logout
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error en logout Supabase:', error);
      throw error;
    }
  },

  /**
   * Obtener usuario actual
   * @returns {Promise} - Promesa con el usuario actual
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  },

  /**
   * Obtener sesión actual
   * @returns {Promise} - Promesa con la sesión actual
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }
  },

  /**
   * Actualizar datos del usuario
   * @param {Object} userData - Nuevos datos del usuario
   * @returns {Promise} - Promesa con el resultado de la actualización
   */
  async updateUserData(userData) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: userData
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar datos de usuario:', error);
      throw error;
    }
  },

  /**
   * Restablecer contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise} - Promesa con el resultado
   */
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      throw error;
    }
  },

  /**
   * Obtener cliente Supabase para operaciones avanzadas
   * @returns {Object} - Cliente Supabase
   */
  getClient() {
    return supabase;
  }
};

export default supabaseService;
