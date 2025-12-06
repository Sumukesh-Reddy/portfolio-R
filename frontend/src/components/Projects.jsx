import { useState } from 'react';
import '../styles/main.css';
import '../hooks/useScrollAnimation';

// Project data (could also be moved to a separate data file)
const projectsData = [
  {
    id: 1,
    title: "ShelterSeek",
    description: "Built a real-time accommodation platform with separate dashboards for Travelers, Hosts, and Admins, featuring room listing, booking, and verification workflows with secure session-based login and role-based access control. Integrated MongoDB Atlas for data storage, and deployed the project on Render with admin panel, form validation, and error handling.",
    extraText: "Here is the layout of our Project",
    link: "https://shelterseek.onrender.com",
    linkText: "View Project →",
  },
  {
    id: 2,
    title: "Sort With Visualization",
    description: "An animated project demonstrating sorting algorithms like Bubble Sort. Uses DOM manipulation and timed delays to visually show each step of the sorting process. Colored bars and transitions help users understand how the algorithm progresses.",
    link: "https://sort-with-visualization.vercel.app",
    linkText: "View Project →",
  },
];

const Projects = () => {
  const [expandedProject, setExpandedProject] = useState(null);

  const toggleExpand = (id) => {
    setExpandedProject(expandedProject === id ? null : id);
  };

  return (
    <section id="projects" className="section">
      <div className="container">
        <h2 className="section-title">Projects</h2>
        <div className="projects-grid">
          {projectsData.map((project) => (
            <div 
              key={project.id} 
              className="project-card"
              onClick={() => toggleExpand(project.id)}
            >
              <h3>{project.title}</h3>
              <p>
                {project.description}
                {expandedProject === project.id && project.extraText && (
                  <>
                    <br /><br />
                    {project.extraText}
                  </>
                )}
              </p>
              <a 
                href={project.link} 
                className="project-link" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {project.linkText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
