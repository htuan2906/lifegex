/* main.js — Entry point: import styles + bootstrap app */
import './styles/main.css';
import { app } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept();
}
