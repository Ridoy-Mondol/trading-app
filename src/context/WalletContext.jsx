import { createContext, useContext } from "react";
import { useProtonWallet } from "../hooks/useProtonWallet";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const wallet = useProtonWallet();
  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => {
  return useContext(WalletContext);
};
