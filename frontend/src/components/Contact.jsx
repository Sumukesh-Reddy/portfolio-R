// components/Contact.jsx
import { useState, useRef, useEffect } from 'react';
import '../styles/main.css';
import '../hooks/useScrollAnimation';

const Contact = () => {
  const formRef = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [emailjsLoaded, setEmailjsLoaded] = useState(false);

  // Load EmailJS script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      if (window.emailjs) {
        window.emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your actual public key
        setEmailjsLoaded(true);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Replace these with your actual EmailJS credentials
  const EMAILJS_SERVICE_ID = 'your_service_id';
  const EMAILJS_TEMPLATE_ID = 'your_template_id';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    if (!emailjsLoaded) {
      showNotification('Email service is loading. Please try again.', 'error');
      return;
    }
  
    setIsSubmitting(true);
    
    try {
      // Send email using EmailJS
      const result = await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_email: 'sumukeshreddy.m23@iiits.in', // Your email
          reply_to: formData.email
        }
      );

      if (result.status === 200) {
        showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Email sending error:', error);
      showNotification(
        'Failed to send message. Please try again or email me directly at sumukeshreddy.m23@iiits.in', 
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <h2 className="section-title">Contact Me</h2>
        <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
          ></textarea>
          <button 
            type="submit" 
            className="btn" 
            disabled={isSubmitting || !emailjsLoaded}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Sending...
              </>
            ) : !emailjsLoaded ? (
              'Loading...'
            ) : (
              'Send Message'
            )}
          </button>
        </form>
        
        {/* Alternative contact info */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p>Or reach me directly at:</p>
          <p>
            <i className="fas fa-envelope"></i>{' '}
            <a href="mailto:sumukeshreddy.m23@iiits.in" style={{ color: 'var(--primary)' }}>
              sumukeshreddy.m23@iiits.in
            </a>
          </p>
        </div>

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;