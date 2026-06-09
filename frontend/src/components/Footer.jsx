import '../hooks/useScrollAnimation';
const Footer = () => {
    return (
      <footer>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Sumukesh Reddy. All rights reserved.</p>
          <p>Code with ❤️</p>
        </div>
      </footer>
    );
  };
  
  export default Footer;