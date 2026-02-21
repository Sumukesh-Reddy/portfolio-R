// components/Hero.jsx
import heroImage from '../assets/images/bobby1.jpg';
import '../hooks/useScrollAnimation';

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="container hero-container">
        <div className="hero-text">
          <h1>Hi, I'm <span className="highlight">Sumukesh Reddy</span></h1>
          <p>Computer Science Student | Developer | Problem Solver</p>
          
          <div className="hero-buttons">
            <a href="#projects" className="btn">View Projects</a>
            <a 
              href="https://drive.google.com/uc?export=download&id=1Ns97SpM0aQT8h5kw7hlMhyZDZPhq84cq" 
              className="btn secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Resume
            </a>
          </div>
          <div className="social-links">
            <a href="mailto:sumukeshreddy.m23@iiits.in" aria-label="Email">
              <i className="fas fa-envelope"></i>
            </a>
            <a href="https://www.linkedin.com/in/sumukesh-reddy-mopuram/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="https://github.com/Sumukesh-Reddy" target="_blank" rel="noreferrer" aria-label="GitHub">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://codolio.com/profile/sumukesh" target="_blank" rel="noreferrer" aria-label="Coding Profile">
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