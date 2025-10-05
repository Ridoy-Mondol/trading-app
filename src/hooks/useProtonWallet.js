import { useState, useEffect } from "react";
import ProtonWebSDK from "@proton/web-sdk";

const chainId = process.env.REACT_APP_CHAIN_ID;
const endpoint = process.env.REACT_APP_PROTON_ENDPOINT;
const appName = "XPRDex";

export const useProtonWallet = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [activeLink, setActiveLink] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const { link, session } = await ProtonWebSDK({
          linkOptions: {
            chainId,
            endpoints: [endpoint],
            restoreSession: true,
          },
          transportOptions: {
            requestAccount: "",
          },
          selectorOptions: {
            appName,
          },
        });

        if (session && link) {
          setActiveSession(session);
          setActiveLink(link);
          setWalletConnected(true);
        } else {
          console.log("ℹ️ No valid session found.");
        }
      } catch (error) {
        console.error("❌ Error restoring session:", error);
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  const connectWallet = async () => {
    try {
      const { link, session } = await ProtonWebSDK({
        linkOptions: {
          chainId,
          endpoints: [endpoint],
          restoreSession: false,
        },
        transportOptions: {
          request: true,
          requestAccount: "",
        },
        selectorOptions: {
          appName,
        },
      });

      if (!session?.auth) throw new Error("Wallet connection failed");

      setActiveSession(session);
      setActiveLink(link);
      setWalletConnected(true);

      console.log("✅ Wallet connected:", session.auth.actor);
      return session;
    } catch (error) {
      console.error("❌ Error connecting wallet:", error);
      throw error;
    }
  };

  return {
    walletConnected,
    activeSession,
    activeLink,
    loading,
    connectWallet,
  };
};
