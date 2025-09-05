import { AuthProvider } from "./AuthContext";
import { UserProvider } from "./UserContext";

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </AuthProvider>
  );
};
