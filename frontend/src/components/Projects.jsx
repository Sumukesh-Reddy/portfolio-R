import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../styles/main.css';
import '../hooks/useScrollAnimation';

// Project data with descriptive titles, descriptions, links, and tags
const projectsData = [
  {
    id: 1,
    title: "Hotel Rooms Booking System",
    appName: "ShelterSeek",
    description: "A full-stack hotel booking application supporting room search, booking, authentication, real-time availability tracking, and an admin dashboard for inventory and booking analytics.",
    extraText: "Built secure session-based login and role-based access control with dashboards for Travelers, Hosts, and Admins. Integrated MongoDB Atlas for database storage and deployed on Render.",
    link: "https://shelterseek.onrender.com",
    tags: ["JavaScript", "Node.js", "MongoDB", "Express.js", "EJS"]
  },
  {
    id: 2,
    title: "Real-Time Chat Application",
    appName: "VachoLink",
    description: "A modern real-time chat application featuring secure user authentication, interactive messaging interfaces, profile management, live online status indicators, and responsive design.",
    link: "https://vacholink.vercel.app/",
    tags: ["React", "Node.js", "Socket.io", "Express.js", "TailwindCSS"]
  },
  {
    id: 3,
    title: "Sorting Algorithm Visualizer",
    appName: "Sort With Visualization",
    description: "An animated visualizer demonstrating sorting algorithms like Bubble Sort. Uses DOM manipulation and timed delays to visually show each step of the sorting process with responsive colored bars.",
    link: "https://sort-with-visualization.vercel.app",
    tags: ["HTML5", "CSS3", "JavaScript", "Algorithms"]
  },
  {
    id: 4,
    title: "Task Management Application",
    appName: "TODO APP",
    description: "A sleek and user-friendly TODO application supporting CRUD operations, status filters, task categorizations, and integrated Google Authentication for secure session management.",
    link: "https://todo-app-sumukesh.vercel.app",
    tags: ["React", "Firebase", "Google Auth", "CSS3"]
  },
  {
    id: 5,
    title: "Weather Forecast Application",
    appName: "Weather",
    description: "A weather forecast website providing current weather conditions for any city. Features dynamic background transitions based on weather states and displays temperature, humidity, and wind speed.",
    link: "https://sumukesh-reddy.github.io/weather/",
    tags: ["HTML5", "CSS3", "JavaScript", "OpenWeather API"]
  },
];

const Projects = () => {
  const [expandedProject, setExpandedProject] = useState(null);
  const [previewProject, setPreviewProject] = useState(null); // modal

  // Close modal on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setPreviewProject(null);
  }, []);

  useEffect(() => {
    if (previewProject) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [previewProject, handleKeyDown]);

  const openPreview = (e, project) => {
    e.stopPropagation();
    setPreviewProject(project);
  };

  const closePreview = () => setPreviewProject(null);

  return (
    <section id="projects" className="section">
      <div className="container">
        <h2 className="section-title">Projects</h2>
        <div className="projects-grid">
          {projectsData.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
            >
              {/* Browser thumbnail — click to open modal */}
              {project.link && (
                <div
                  className="browser-mockup browser-mockup--thumbnail"
                  onClick={(e) => openPreview(e, project)}
                  role="button"
                  aria-label={`Preview ${project.title} live`}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openPreview(e, project); }}
                >
                  <div className="browser-header">
                    <div className="browser-dots">
                      <span className="browser-dot red"></span>
                      <span className="browser-dot yellow"></span>
                      <span className="browser-dot green"></span>
                    </div>
                    <div className="browser-address-bar">
                      <span className="lock-icon">
                        <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </span>
                      <span className="address-text">
                        {project.link.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                      </span>
                    </div>
                  </div>
                  {/* Static placeholder body with hover hint */}
                  <div className="browser-thumbnail-body">
                    <div className="browser-thumbnail-hint">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polygon points="10 8 16 12 10 16 10 8"></polygon>
                      </svg>
                      <span>Click to preview live</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card details */}
              <div className="project-details">
                <div className="project-header">
                  <h3 className="project-title">{project.title}</h3>
                  <a
                    href={project.link}
                    className="project-external-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open ${project.title} in a new tab`}
                  >
                    <svg className="external-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                </div>

                <p className="project-description">
                  {project.description}
                  {expandedProject === project.id && project.extraText && (
                    <>
                      <br /><br />
                      <span className="project-extra-text">{project.extraText}</span>
                    </>
                  )}
                </p>

                {project.tags && (
                  <div className="project-tags">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="project-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-screen live preview modal */}
      {previewProject && createPortal(
        <div
          className="preview-modal-overlay"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
          aria-label={`Live preview of ${previewProject.title}`}
        >
          <div
            className="preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal browser chrome */}
            <div className="preview-modal-header">
              <div className="browser-dots">
                <span className="browser-dot red" onClick={closePreview} style={{ cursor: 'pointer' }}></span>
                <span className="browser-dot yellow"></span>
                <span className="browser-dot green"></span>
              </div>
              <div className="preview-modal-address">
                <span className="lock-icon">
                  <svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <span className="address-text">{previewProject.link.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
              </div>
              <div className="preview-modal-actions">
                <a
                  href={previewProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="preview-modal-newtab"
                  title="Open in new tab"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  Open
                </a>
                <button className="preview-modal-close" onClick={closePreview} aria-label="Close preview">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            {/* Live iframe */}
            <div className="preview-modal-content">
              <iframe
                src={previewProject.link}
                title={`${previewProject.title} live preview`}
                className="preview-modal-iframe"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default Projects;