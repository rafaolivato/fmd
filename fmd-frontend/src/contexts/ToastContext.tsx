import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ToastContainer, Toast } from 'react-bootstrap';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description: string;
}

interface ToastContextData {
  addToast: (message: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: ToastProviderProps) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = ({ type, title, description }: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, type, title, description };
    
    setMessages((prev) => [...prev, toast]);
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
      setMessages((prev) => prev.filter((message) => message.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          minWidth: '300px'
        }}
      >
        {messages.map((message) => (
          <Toast
            key={message.id}
            onClose={() => removeToast(message.id)}
            show={true}
            delay={5000}
            autohide
            bg={message.type}
          >
            <Toast.Header>
              <strong className="me-auto">{message.title}</strong>
            </Toast.Header>
            <Toast.Body className={message.type === 'error' ? 'text-white' : ''}>
              {message.description}
            </Toast.Body>
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextData {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}