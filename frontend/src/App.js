import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';  // Ensure correct import
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Certificates from './components/Certificates';
import Achievements from './components/Achievments';
import './styles/main.css';
import { sendLocation } from './services/api';
import './styles/main.css';

function App() {
  const [stars, setStars] = useState([]);
  const [shootingStars, setShootingStars] = useState([]);

  // Create stars for dark mode
  useEffect(() => {
    const createStars = () => {
      // Only create stars in dark mode
      const isDarkMode = document.body.classList.contains('dark-mode');
      
      if (isDarkMode) {
        const starCount = 150;
        const newStars = [];
        const newShootingStars = [];

        // Create regular stars
        for (let i = 0; i < starCount; i++) {
          const size = Math.random() * 3 + 1;
          const starType = Math.random();
          
          newStars.push({
            id: i,
            size,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: `${Math.random() * 3 + 2}s`,
            delay: `${Math.random() * 5}s`,
            type: starType > 0.9 ? 'blue' : size < 1.5 ? 'small' : size < 2.5 ? 'medium' : 'large'
          });
        }

        // Create shooting stars
        for (let i = 0; i < 3; i++) {
          const angle = 0; 
          const distance = 150 + Math.random() * 150;
        
          newShootingStars.push({
            id: `shooting-${i}`,
            left: `${Math.random() * 10}%`,
            top: `${Math.random() * 100}%`,
            delay: `${Math.random() * 15}s`,
            duration: `${Math.random() * 4 + 2}s`, 
            dx: `${Math.cos(angle) * distance}vw`,
            dy: `${Math.sin(angle) * distance}vh`,
            angle: (angle * 180) / Math.PI
          });
        }
        

        setStars(newStars);
        setShootingStars(newShootingStars);
      } else {
        // Clear stars in light mode
        setStars([]);
        setShootingStars([]);
      }
    };
    createStars();

    window.addEventListener('resize', createStars);
    
    // Recreate when theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setTimeout(createStars, 100); 
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => {
      window.removeEventListener('resize', createStars);
      observer.disconnect();
    };
  }, []);

  // Location tracking
  useEffect(() => {
    const trackLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              await sendLocation({ latitude, longitude });
              console.log('Location saved successfully');
            } catch (error) {
              console.error('Error saving location:', error);
            }
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser');
      }
    };

    trackLocation();
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Sun Container (only in light mode) */}
        
        {/* Stars Container (only in dark mode) */}
        <div className="stars-container">
          {stars.map(star => (
            <div
              key={star.id}
              className={`star ${star.type}`}
              style={{
                left: star.left,
                top: star.top,
                animationDuration: star.duration,
                animationDelay: star.delay,
              }}
            />
          ))}
          
          {shootingStars.map(star => (
            <div
              key={star.id}
              className="shooting-star"
              style={{
                left: star.left,
                top: star.top,
                animationDelay: star.delay,
                animationDuration: star.duration,
                '--dx': star.dx,
                '--dy': star.dy,
                transform: `rotate(${star.angle}deg)`
              }}
            />
          ))}


        </div>

        <Header />
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <About />
                <Achievements />
                <Projects />
                <Certificates />  
                <Skills />
                <Contact />
              </>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;