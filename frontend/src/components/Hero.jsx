import { useState, useEffect } from 'react';
import heroImage from '../assets/images/sumukesh.png';
import '../hooks/useScrollAnimation';

const Hero = () => {
  const [currentWord, setCurrentWord] = useState('');
  
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const words = [
      // 'Full Stack Developer',
      // 'Software Engineer',
      // 'Web Developer',
      // 'Open Source Contributor',
      // 'Competitive Programmer',
      // 'Machine Learning Engineer',
      // 'Gammer'
    ];
    const handleTyping = () => {
      const current = index % words.length;
      const fullWord = words[current];

      if (isDeleting) {
        setCurrentWord(fullWord.substring(0, currentWord.length - 1));
        setTypingSpeed(75);
      } else {
        setCurrentWord(fullWord.substring(0, currentWord.length + 1));
        setTypingSpeed(150);
      }

      if (!isDeleting && currentWord === fullWord) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && currentWord === '') {
        setIsDeleting(false);
        setIndex(index + 1);
        setTypingSpeed(150);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentWord, index, isDeleting, typingSpeed]);

  return (
    <section id="home" className="hero">
      <div className="container hero-container">
        <div className="hero-text">
          <h1>Hi, I'm <span className="highlight">Sumukesh Reddy</span></h1>
          
          <div className="hero-buttons">
            <a href="#projects" className="btn">View Projects</a>
            <a 
              href="https://drive.google.com/uc?export=download&id=1d7aL2G5AALCuUzVdTX0eZfQ5RdKEDYBP" 
              className="btn secondary"
            >
              Resume
            </a>
          </div>
          <div className="social-links">
            <a href="mailto:sumukeshreddy.m23@iiits.in"><i className="fas fa-envelope"></i></a>
            <a href="https://www.linkedin.com/in/sumukesh-reddy-mopuram/" target="_blank" rel="noreferrer">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="https://github.com/Sumukesh-Reddy" target="_blank" rel="noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://leetcode.com/u/Sumukesh/" target="_blank" rel="noreferrer">
              <i className="fas fa-code"></i>
            </a>
          </div>
        </div>
        <div className="hero-image">
          <img src={heroImage} alt="Sumukesh Reddy" />
        </div>
      </div>
    </section>
  );
};

export default Hero;