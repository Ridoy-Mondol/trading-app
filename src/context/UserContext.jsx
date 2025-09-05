import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated || loading) {
        setLoadingUser(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/user/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();
        console.log(data.user);

        if (response.ok && data.success) {
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [isAuthenticated, loading]);

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
