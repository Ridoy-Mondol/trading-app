import { AuthProvider } from "./AuthContext";
import { UserProvider } from "./UserContext";
import { WalletProvider } from "./WalletContext";

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <WalletProvider>{children}</WalletProvider>
      </UserProvider>
    </AuthProvider>
  );
};
