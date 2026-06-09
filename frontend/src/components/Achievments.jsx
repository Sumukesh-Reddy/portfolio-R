import { useState, useEffect } from 'react';
import gradientClubImage from '../assets/images/gradient.png'; // You'll need to add this image

const Achievements = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger animation when component is in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    const section = document.getElementById('achievements');
    if (section) {
      observer.observe(section);
    }
    
    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  const achievements = [
    {
      id: 1,
      title: "Contest Manager",
      organization: "Gradient Club",
      description: "Organized and managed multiple coding competitions",
      date: "Present",
      image: gradientClubImage
    }
  ];

  return (
    <section id="achievements" className="achievements">
      <div className="container">
        <h2 className={`section-title ${isVisible ? 'animate' : ''}`}>Position</h2>
        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${isVisible ? 'animate' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="achievement-image">
                {achievement.image ? (
                  <img src={achievement.image} alt={achievement.organization} />
                ) : (
                  <div className="achievement-icon">
                    <i className="fas fa-trophy"></i>
                  </div>
                )}
              </div>
              <div className="achievement-content">
                <h3>{achievement.title}</h3>
                <p className="organization">{achievement.organization}</p>
                <p className="description">{achievement.description}</p>
                <p className="date">{achievement.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;