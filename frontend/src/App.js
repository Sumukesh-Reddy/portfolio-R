import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';  // Ensure correct import
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Certificates from './components/Certificates';
import './styles/main.css';
import { useEffect } from 'react';
import { sendLocation } from './services/api';
function App() {
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
        <Header />
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <About />
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