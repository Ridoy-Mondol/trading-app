import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [signupStep, setSignupStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/auth/verify`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.ok) {
          if (data.status === "authenticated") {
            setIsAuthenticated(true);
            setSignupStep(0);
          } else if (data.status === "signup_progress") {
            setIsAuthenticated(false);
            setSignupStep(data.step);
          }
        } else {
          setIsAuthenticated(false);
          setSignupStep(0);
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, signupStep, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
