import { useEffect } from 'react';

const useScrollAnimation = () => {
  useEffect(() => {
    const animateOnScroll = () => {
      const elements = document.querySelectorAll(
        '.hero-text, .hero-image, .about-content > *, .project-card, .skills-category'
      );
      
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });
    };

    // Initialize animation state
    document.querySelectorAll('.hero-text, .hero-image, .about-content > *, .project-card, .skills-category')
      .forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      });

    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('load', animateOnScroll);

    return () => {
      window.removeEventListener('scroll', animateOnScroll);
      window.removeEventListener('load', animateOnScroll);
    };
  }, []);
};

export default useScrollAnimation;