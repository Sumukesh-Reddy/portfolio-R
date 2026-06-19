import { useState, useEffect } from "react";
import '../styles/main.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        // Theme init
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        const currentTheme = localStorage.getItem('theme') ||
            (prefersDarkScheme.matches ? 'dark' : 'light');
        setDarkMode(currentTheme === 'dark');
        document.body.classList.toggle('dark-mode', currentTheme === 'dark');

        // Scrolled class for header shrink effect
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });

        
        document.documentElement.style.scrollBehavior = 'auto';

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Temporarily freeze smooth scroll when tab becomes visible
                document.documentElement.style.scrollBehavior = 'auto';
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Smooth scroll only on anchor clicks
        const handleAnchorClick = (e) => {
            const anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                document.documentElement.style.scrollBehavior = 'smooth';
                target.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    document.documentElement.style.scrollBehavior = 'auto';
                }, 800);
            }
            // Close mobile menu on link click
            setIsMenuOpen(false);
        };
        document.addEventListener('click', handleAnchorClick);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('click', handleAnchorClick);
        };
    }, []);

    const toggleTheme = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        document.body.classList.toggle('dark-mode', newDarkMode);
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    };

    return (
        <header id="header" className={scrolled ? 'scrolled' : ''}>
            <div className="header-container">
                <div className="logo">
                    <h1>Sumukesh</h1>
                </div>
                <nav id="navbar">
                    <ul className={isMenuOpen ? 'active' : ''}>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#achievements">Position</a></li>
                        <li><a href="#projects">Projects</a></li>
                        <li><a href="#certificates">Certificates</a></li>
                        <li><a href="#skills">Skills</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </nav>
                <div className="theme-toggle">
                    <button id="themeToggle" onClick={toggleTheme} aria-label="Toggle theme">
                        <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;