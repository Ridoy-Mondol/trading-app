import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "./WalletContext";
import { JsonRpc } from "eosjs";

const rpc = new JsonRpc(process.env.REACT_APP_PROTON_ENDPOINT);

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const { walletConnected, activeSession } = useWallet();

  const [userBalance, setUserBalance] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(true);

  const fetchAllTokens = async () => {
    if (!activeSession?.auth?.actor) {
      setUserBalance([]);
      setLoadingTokens(false);
      return;
    }

    try {
      setLoadingTokens(true);

      const accountName = activeSession.auth.actor.toString();
      const isTestnet = process.env.REACT_APP_NETWORK === "testnet";

      if (isTestnet) {
        const contracts = [
          "xtokens",
          "eosio.token",
          "snipx",
          "loan.token",
          "xmd.token",
        ];

        const allBalances = [];

        for (const contract of contracts) {
          try {
            const balances = await rpc.get_currency_balance(
              contract,
              accountName
            );

            balances.forEach((str) => {
              const [amount, symbol] = str.split(" ");
              allBalances.push({
                symbol,
                amount: parseFloat(amount),
                contract,
              });
            });
          } catch (err) {
            console.error(`Failed to fetch from ${contract}:`, err);
          }
        }

        setUserBalance(allBalances);
      } else {
        const response = await fetch(
          `https://proton.eosusa.io/v2/state/get_tokens?account=${accountName}`
        );

        const data = await response.json();

        setUserBalance(
          (data.tokens || []).map((t) => ({
            symbol: t.symbol,
            amount: t.amount,
            contract: t.contract,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch user balances:", error);
      setUserBalance([]);
    } finally {
      setLoadingTokens(false);
    }
  };

  useEffect(() => {
    if (walletConnected && activeSession) {
      fetchAllTokens();
    } else {
      setUserBalance([]);
      setLoadingTokens(false);
    }
  }, [walletConnected, activeSession]);

  return (
    <BalanceContext.Provider
      value={{
        userBalance,
        loadingTokens,
        refetchTokens: fetchAllTokens,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

export const useTokenBalance = () => useContext(BalanceContext);
