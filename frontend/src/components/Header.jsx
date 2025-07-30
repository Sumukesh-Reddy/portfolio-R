import { useState, useEffect } from "react";
import '../styles/main.css';
import '../hooks/useScrollAnimation';

const Header = () => {
    const[isMenuOpen, setIsMenuOpen] = useState(false);
    const[darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        const currentTheme = localStorage.getItem('theme') || 
                            (prefersDarkScheme.matches ? 'dark' : 'light');
        setDarkMode(currentTheme === 'dark');
        document.body.classList.toggle('dark-mode', currentTheme === 'dark');
      }, []);

    const toggleTheme = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        document.body.classList.toggle('dark-mode', newDarkMode);
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
      };
      return (
        <header id="header">
          <div className="container header-container">
            <div className="logo">
              <h1>Sumukesh</h1>
            </div>
            <nav id="navbar">
              <ul className={isMenuOpen ? 'active' : ''}>
                <li><a href="#home" className="active">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#certificates">Certificates</a></li>
                <li><a href="#skills">Skills</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </nav>
            <div className="theme-toggle">
              <button id="themeToggle" onClick={toggleTheme}>
                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`} 
                   style={{ color: darkMode ? 'white' : 'black' }}></i>
              </button>
            </div>
            <div className="hamburger" id="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <div className={isMenuOpen ? 'active' : ''}></div>
              <div className={isMenuOpen ? 'active' : ''}></div>
              <div className={isMenuOpen ? 'active' : ''}></div>
            </div>
          </div>
        </header>
      );
};

export default Header;