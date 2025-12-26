import { AuthProvider } from "./AuthContext";
import { UserProvider } from "./UserContext";
import { WalletProvider } from "./WalletContext";
import { BalanceProvider } from "./WalletBalance";

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <WalletProvider>
          <BalanceProvider>{children}</BalanceProvider>
        </WalletProvider>
      </UserProvider>
    </AuthProvider>
  );
};
