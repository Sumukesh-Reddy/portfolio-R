import { useState } from 'react';
import { skillsData } from '../assets/data/skills';
import '../styles/main.css';
import '../hooks/useScrollAnimation';

const Skills = () => {
  const [flippedCard, setFlippedCard] = useState(null);

  const handleCardClick = (index) => {
    setFlippedCard(flippedCard === index ? null : index);
  };

  return (
    <section id="skills" className="section">
      <div className="container">
        <h2 className="section-title">Skills</h2>
        <div className="skills-flip-container">
          {skillsData.map((category, index) => (
            <div 
              key={index}
              className="flip-card"
              onClick={() => handleCardClick(index)}
            >
              <div className={`flip-card-inner ${flippedCard === index ? 'flipped' : ''}`}>
                <div className="flip-card-front">
                  {category.title}
                </div>
                <div className="flip-card-back">
                  <div className="skills-list">
                    {category.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="skill">
                        <span>{skill.name}</span>
                        <div className="skill-bar">
                          <div 
                            className="skill-progress" 
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;