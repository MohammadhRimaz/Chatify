import { createContext, useEffect, useState } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  // const navigate = useNavigate();

  // Redirect to Chat page after login/signup
  useEffect(() => {
    const hasToken = document.cookie.includes("token=");
    if (hasToken) {
      axios
        .get("/profile")
        .then((response) => {
          setId(response.data.userId);
          setUsername(response.data.username);
        })
        .catch((error) => {
          console.error("Unauthorized access to /profile: ", error);
          // Clear state if unauthorized
          setId(null);
          setUsername(null);
        });
    }
  }, []);

  // Logout the user when timeout
  useEffect(() => {
    // Check if a token exists in cookies before making the request
    const checkTokenExpiration = setInterval(() => {
      axios.get("/profile").catch(() => {
        // Log out the user on token expiration
        setUsername(null);
        setId(null);
      });
    }, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(checkTokenExpiration);
  }, []);
  return (
    <UserContext.Provider value={{ username, setUsername, id, setId }}>
      {children}
    </UserContext.Provider>
  );
}
