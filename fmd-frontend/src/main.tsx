import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store'; 
import App from './App';
import './index.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 1. O Provider do Redux torna a store acessível a todos os componentes */}
    <Provider store={store}>
      {/* 2. O BrowserRouter habilita o roteamento na aplicação */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);