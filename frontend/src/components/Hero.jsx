import heroImage from '../assets/images/sumukesh.png';
import '../hooks/useScrollAnimation';

const Hero = () => {
    return (
      <section id="home" className="hero">
        <div className="container hero-container">
          <div className="hero-text">
            <h1>Hi, I'm <span className="highlight">Sumukesh Reddy</span></h1>
            <p>Full Stack Developer | Machine Learning Enthusiast</p>
            <div className="hero-buttons">
              <a href="#projects" className="btn">View Projects</a>
              <a 
                href="https://drive.google.com/uc?export=download&id=10p8jej-TnbZZizXPMmAksM-I8nmhxzpe" 
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