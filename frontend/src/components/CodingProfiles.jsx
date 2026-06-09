import { useState } from "react";
import "../styles/main.css";

function CodingProfiles() {
  const [active, setActive] = useState(null);

  const profiles = {
    leetcode: {
      name: "LeetCode",
      url: "https://leetcode.com/u/Sumukesh/",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png",
      username: "sumukesh",
    },
    codeforces: {
      name: "Codeforces",
      url: "https://codeforces.com/profile/Sumukesh",
      logo: "https://sta.codeforces.com/s/93277/images/codeforces-logo-with-telegram.png",
      username: "sumukesh",
    },
  };

  return (
    <div className="profiles-section">
      <h1>Coding Profiles</h1>

      <div className="profile-buttons">
        <button onClick={() => setActive("leetcode")}>LeetCode</button>
        <button onClick={() => setActive("codeforces")}>Codeforces</button>
      </div>

      {active && (
        <div className="modal-overlay">
          <div className="modal-card">

            <button className="close-btn" onClick={() => setActive(null)}>
              ✖
            </button>

            <img
              src={profiles[active].logo}
              alt="logo"
              className="platform-logo"
            />

            <h2>{profiles[active].name}</h2>
            <p>@{profiles[active].username}</p>

            <button
              className="visit-btn"
              onClick={() =>
                window.open(
                  profiles[active].url,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              Visit Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodingProfiles;