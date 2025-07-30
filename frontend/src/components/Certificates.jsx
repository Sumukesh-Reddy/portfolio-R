import { useState } from 'react';
import '../styles/main.css';
import '../hooks/useScrollAnimation';

// Certificate data (could also be moved to a separate data file)
const certificatesData = [
  {
    id: 1,
    title: "Machine Learning",
    issuer: "Coursera",
    date: "June 30,2025",
    description:"I learned about supervised and unsupervised learning, then explored CNNs and reinforcement learning, which eventually led me to deep learning.",
    link: "https://coursera.org/share/3c9c0717077896f73042fb5ff776e6b2",
    linkText: "View Certificate",
  },
  {
    id: 2,
    title: "Machine Learning A-Z: AI, Python",
    issuer: "Udemy",
    date: "July 6,2025",
    description: "Learned core machine learning concepts and implemented various algorithms using Python and scikit-learn.",
    link: "https://www.udemy.com/certificate/UC-6ae0c769-0de4-454f-99d7-e795d9d33ab7/",
    linkText: "View Certificate",
  },

];

const Certificates = () => {
  const [expandedCertificate, setExpandedCertificate] = useState(null);

  const toggleExpand = (id) => {
    setExpandedCertificate(expandedCertificate === id ? null : id);
  };

  return (
    <section id="certificates" className="section">
      <div className="container">
        <h2 className="section-title">Certificates</h2>
        <div className="certificates-grid">
          {certificatesData.map((certificate) => (
            <div 
              key={certificate.id} 
              className="certificate-card"
              onClick={() => toggleExpand(certificate.id)}
            >
              <h3>{certificate.title}</h3>
              <div className="certificate-meta">
                <span className="issuer">{certificate.issuer}</span>
                <span className="date">{certificate.date}</span>
              </div>
              <p>
                {certificate.description}<br/>
                {expandedCertificate === certificate.id && (
                  <a 
                    href={certificate.link} 
                    className="certificate-link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {certificate.linkText}
                  </a>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certificates;