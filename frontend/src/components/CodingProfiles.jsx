// components/CodingProfiles.jsx
import { useState, useEffect } from 'react';
import '../styles/main.css';

const CodingProfiles = () => {
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [codeforcesData, setCodeforcesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flippedCard, setFlippedCard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch LeetCode data
        const leetcodeResponse = await fetch('https://leetcode-stats-api.herokuapp.com/Sumukesh');
        const leetcode = await leetcodeResponse.json();
        setLeetcodeData(leetcode);

        // Fetch Codeforces data
        const cfResponse = await fetch('https://codeforces.com/api/user.info?handles=Sumukesh');
        const cfData = await cfResponse.json();
        
        // Fetch Codeforces user stats (problems solved)
        const cfStatusResponse = await fetch('https://codeforces.com/api/user.status?handle=Sumukesh');
        const cfStatus = await cfStatusResponse.json();
        
        // Calculate unique problems solved
        const solvedProblems = new Set();
        if (cfStatus.status === 'OK') {
          cfStatus.result.forEach(submission => {
            if (submission.verdict === 'OK') {
              solvedProblems.add(`${submission.problem.contestId}-${submission.problem.index}`);
            }
          });
        }
        
        setCodeforcesData({
          ...cfData.result[0],
          solvedCount: solvedProblems.size
        });
      } catch (error) {
        console.error('Error fetching coding profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCardClick = (index) => {
    setFlippedCard(flippedCard === index ? null : index);
  };

  if (loading) {
    return (
      <section id="coding-profiles" className="section">
        <div className="container">
          <h2 className="section-title">Coding Profiles</h2>
          <div className="skills-flip-container">
            <div className="flip-card">
              <div className="flip-card-inner">
                <div className="flip-card-front">Loading Stats...</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const profiles = [
    {
      id: 'leetcode',
      title: 'LeetCode',
      icon: 'fab fa-leanpub',
      frontContent: (
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-code" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
          <h3>Rating: {leetcodeData?.rating || 1764}</h3>
          <p>Global Rank: 75,628/839,080</p>
        </div>
      ),
      backContent: (
        <div className="skills-list">
          <div className="skill">
            <span>Problems Solved: 555</span>
            <div className="skill-bar">
              <div className="skill-progress" style={{ width: '55%' }}></div>
            </div>
          </div>
          <div className="skill">
            <span>Easy: 236</span>
            <div className="skill-bar">
              <div className="skill-progress" style={{ width: '33%' }}></div>
            </div>
          </div>
          <div className="skill">
            <span>Medium: 287</span>
            <div className="skill-bar">
              <div className="skill-progress" style={{ width: '41%' }}></div>
            </div>
          </div>
          <div className="skill">
            <span>Hard: 20</span>
            <div className="skill-bar">
              <div className="skill-progress" style={{ width: '3%' }}></div>
            </div>
          </div>
          <div className="skill">
            <span>Contests Attended: 31</span>
            <div className="skill-bar">
              <div className="skill-progress" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="skill">
            <span>Badges: 8</span>
            <div className="skill-bar">
              <div className="skill-progress" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>
      ),
      link: 'https://leetcode.com/u/Sumukesh/'
    },
    {
      id: 'codeforces',
      title: 'Codeforces',
      icon: 'fas fa-chart-line',
      frontContent: (
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-trophy" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
          <h3>Rating: {codeforcesData?.rating || 'N/A'}</h3>
          <p>Rank: {codeforcesData?.rank || 'N/A'}</p>
        </div>
      ),
      backContent: (
        <div className="skills-list">
          <div className="skill">
            <span>Problems Solved: {codeforcesData?.solvedCount || 0}</span>
            <div className="skill-bar">
              <div className="skill-progress" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div className="skill">
            <span>Max Rating: {codeforcesData?.maxRating || 0}</span>
            <div className="skill-bar">
              <div className="skill-progress" style={{ width: '70%' }}></div>
            </div>
          </div>
          <div className="skill">
            <span>Contribution: {codeforcesData?.contribution || 0}</span>
            <div className="skill-bar">
              <div className="skill-progress" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>
      ),
      link: 'https://codeforces.com/profile/Sumukesh'
    }
  ];

  return (
    <section id="coding-profiles" className="section">
      <div className="container">
        <h2 className="section-title">Coding Profiles</h2>
        <div className="skills-flip-container">
          {profiles.map((profile, index) => (
            <div 
              key={profile.id}
              className="flip-card"
              onClick={() => handleCardClick(index)}
            >
              <div className={`flip-card-inner ${flippedCard === index ? 'flipped' : ''}`}>
                <div className="flip-card-front">
                  {profile.frontContent}
                </div>
                <div className="flip-card-back">
                  {profile.backContent}
                  <a 
                    href={profile.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link"
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      borderRadius: 'var(--border-radius)',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Profile <i className="fas fa-external-link-alt"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CodingProfiles;