import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/theme/useTheme';

// Componente para mostrar notificaciones responsivas y adaptables al tema
const ResponsiveNotifications = () => {
  const { isDarkMode, getColorClass } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);
  
  // Tipo para las notificaciones
  type NotificationType = 'info' | 'success' | 'warning' | 'error';
  
  interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: Date;
    read: boolean;
  }
  
  // Cargar notificaciones de ejemplo (en una aplicación real, vendrían de una API)
  useEffect(() => {
    const exampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        message: 'Tu clon Content ha sido actualizado con nuevas capacidades',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
        read: false
      },
      {
        id: '2',
        type: 'success',
        message: 'Tu integración con Instagram se ha completado exitosamente',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
        read: false
      },
      {
        id: '3',
        type: 'warning',
        message: 'Tus créditos están por agotarse, considera actualizar tu plan',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 horas atrás
        read: true
      },
      {
        id: '4',
        type: 'error',
        message: 'Hubo un problema con la integración de Zapier, revisa la configuración',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
        read: true
      },
      {
        id: '5',
        type: 'info',
        message: 'Nuevas funcionalidades disponibles para tu plan actual',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 días atrás
        read: true
      }
    ];
    
    setNotifications(exampleNotifications);
  }, []);
  
  // Marcar notificación como leída
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Eliminar notificación
  const removeNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };
  
  // Obtener icono según tipo
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <i className="fas fa-info-circle"></i>;
      case 'success':
        return <i className="fas fa-check-circle"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle"></i>;
      case 'error':
        return <i className="fas fa-times-circle"></i>;
    }
  };
  
  // Obtener clase de color según tipo
  const getTypeColorClass = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };
  
  // Formatear tiempo relativo
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'Ahora mismo';
    } else if (diffMin < 60) {
      return `Hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHour < 24) {
      return `Hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
    } else if (diffDay < 7) {
      return `Hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Filtrar notificaciones a mostrar
  const visibleNotifications = showAll 
    ? notifications 
    : notifications.filter(n => !n.read).slice(0, 3);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="relative">
      {/* Panel de notificaciones */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors duration-200 max-w-md w-full mx-auto`}>
        {/* Encabezado */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">
            Notificaciones
            {unreadCount > 0 && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getColorClass('primary')} text-white`}>
                {unreadCount}
              </span>
            )}
          </h3>
          
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                aria-label="Marcar todas como leídas"
              >
                Marcar todas como leídas
              </button>
            )}
            
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
              aria-label={showAll ? "Mostrar no leídas" : "Mostrar todas"}
            >
              {showAll ? "Mostrar no leídas" : "Mostrar todas"}
            </button>
          </div>
        </div>
        
        {/* Lista de notificaciones */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
          {visibleNotifications.length > 0 ? (
            visibleNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 ${!notification.read ? 'bg-gray-50 dark:bg-gray-750' : ''} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 p-2 rounded-full ${getTypeColorClass(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatRelativeTime(notification.timestamp)}
                    </p>
                  </div>
                  
                  <div className="ml-2 flex-shrink-0 flex">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        aria-label="Marcar como leída"
                      >
                        <i className="fas fa-check text-xs"></i>
                      </button>
                    )}
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      aria-label="Eliminar notificación"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No hay notificaciones
            </div>
          )}
        </div>
        
        {/* Pie del panel */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className={`text-sm ${getColorClass('accent')} hover:underline`}
              aria-label={showAll ? "Ver menos" : "Ver todas"}
            >
              {showAll ? "Ver menos" : `Ver todas (${notifications.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveNotifications;
