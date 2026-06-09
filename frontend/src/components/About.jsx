import '../styles/main.css';
import '../hooks/useScrollAnimation';
const About = () => {
  
  
  return (
    <section id="about" className="section">
      <div className="container">
        <h2 className="section-title">About Me</h2>
        <div className="about-content">
          <div className="about-text">
            <p>I am a Computer Science and Engineering student at IIIT Sri City with a strong foundation in programming (C, Python, Java) and web technologies (HTML, CSS, JavaScript, React, MongoDB, Express). I enjoy solving complex problems, working on real-time projects like ShelterSeek, and continuously learning new technologies.</p>
            <p>My native language is Telugu, and I am also proficient in English and Hindi.</p>
            <div className="about-details">
              <div>
                <h3>Contact Info</h3>
                <ul>
                  <li>Email: <a href="mailto:sumukeshreddy.m23@iiits.in">sumukeshreddy.m23@iiits.in</a></li>
                  <li>Phone: +91-8790787664</li>
                </ul>
              </div>
              <div>
                <h3>Education</h3>
                <ul>
                  <li><strong>B.Tech (CSE)</strong> - IIIT Sri City (2023-2027)</li>
                  <li><strong>Intermediate (MPC)</strong> - Sri Chaitanya Junior College (2023)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;