// components/CodingProfiles.jsx
import { useState, useEffect } from 'react';
import '../styles/main.css';

const CodingProfiles = () => {
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [codeforcesData, setCodeforcesData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const profiles = [
    {
      id: 'leetcode',
      name: 'LeetCode',
      username: 'Sumukesh',
      rating: leetcodeData?.rating || 1764,
      solved: leetcodeData?.totalSolved || 555,
      rank: '75,628',
      icon: 'fas fa-code',
      color: '#FFA116',
      bgColor: 'rgba(255, 161, 22, 0.1)',
      link: 'https://leetcode.com/u/Sumukesh/'
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      username: 'Sumukesh',
      rating: codeforcesData?.rating || 'N/A',
      solved: codeforcesData?.solvedCount || 0,
      rank: codeforcesData?.rank || 'N/A',
      icon: 'fas fa-trophy',
      color: '#1F8ACB',
      bgColor: 'rgba(31, 138, 203, 0.1)',
      link: 'https://codeforces.com/profile/Sumukesh'
    }
  ];

  if (loading) {
    return (
      <section id="coding-profiles" className="section">
        <div className="container">
          <h2 className="section-title">Coding Profiles</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                background: 'var(--card-bg)',
                borderRadius: 'var(--border-radius)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow)',
                animation: 'pulse 1.5s infinite'
              }}>
                <div style={{ height: '20px', background: 'var(--light-gray)', marginBottom: '1rem', borderRadius: '4px' }}></div>
                <div style={{ height: '20px', background: 'var(--light-gray)', marginBottom: '1rem', borderRadius: '4px', width: '70%' }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="coding-profiles" className="section">
      <div className="container">
        <h2 className="section-title">Coding Profiles</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {profiles.map(profile => (
            <a
              key={profile.id}
              href={profile.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <div className="profile-card" style={{
                background: 'var(--card-bg)',
                borderRadius: 'var(--border-radius)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow)',
                transition: 'var(--transition)',
                border: '1px solid var(--light-gray)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
              }}
              >
                {/* Background icon */}
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  bottom: '10px',
                  fontSize: '4rem',
                  opacity: '0.1',
                  color: profile.color
                }}>
                  <i className={profile.icon}></i>
                </div>
                
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: profile.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem',
                    color: profile.color,
                    fontSize: '1.2rem'
                  }}>
                    <i className={profile.icon}></i>
                  </div>
                  <div>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1.2rem', 
                      fontWeight: '600',
                      color: 'var(--dark)'
                    }}>
                      {profile.name}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.9rem', 
                      color: 'var(--gray)'
                    }}>
                      @{profile.username}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.8rem', 
                      color: 'var(--gray)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Rating
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '1.3rem', 
                      fontWeight: '700',
                      color: profile.color
                    }}>
                      {profile.rating}
                    </p>
                  </div>
                  <div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.8rem', 
                      color: 'var(--gray)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Solved
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '1.3rem', 
                      fontWeight: '700',
                      color: 'var(--primary)'
                    }}>
                      {profile.solved}
                    </p>
                  </div>
                </div>

                {/* Additional info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--light-gray)'
                }}>
                  <span style={{
                    fontSize: '0.85rem',
                    color: 'var(--gray)'
                  }}>
                    {profile.id === 'leetcode' ? 'Global Rank' : 'Rank'}: {profile.rank}
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    Visit <i className="fas fa-arrow-right" style={{ fontSize: '0.7rem' }}></i>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CodingProfiles;