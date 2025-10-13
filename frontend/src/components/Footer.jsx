// src/components/Footer.jsx
import React from 'react';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <p>© {new Date().getFullYear()} Central de Estudos - Todos os direitos reservados.</p>
    </footer>
  );
}

export default Footer;