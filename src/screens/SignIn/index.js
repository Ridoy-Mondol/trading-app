import React, { useState } from "react";
import "abortcontroller-polyfill/dist/polyfill-patch-fetch.js";
import ProtonWebSDK from "@proton/web-sdk";
import cn from "classnames";
import styles from "./SignIn.module.sass";
import Login from "../../components/Login";
import Icon from "../../components/Icon";
import Form from "./Form";
import Scan from "./Scan";

const SignIn = () => {
  const [scan, setScan] = useState(false);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/xpr/nonce`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch nonce");
      const { nonce } = await res.json();
      if (!nonce) throw new Error("No nonce received");

      const { link, session } = await ProtonWebSDK({
        linkOptions: {
          chainId: process.env.REACT_APP_CHAIN_ID,
          endpoints: [process.env.REACT_APP_PROTON_ENDPOINT],
          restoreSession: false,
        },
        transportOptions: {
          request: true,
          requestAccount: "",
        },
        selectorOptions: {
          appName: "XPRTrade",
        },
      });

      if (!session?.auth) throw new Error("Wallet connection failed");
      const actor = session.auth.actor.toString();

      const action = {
        account: "eosio.token",
        name: "transfer",
        authorization: [
          {
            actor: actor,
            permission: session.auth.permission.toString(),
          },
        ],
        data: {
          from: session.auth.actor,
          to: session.auth.actor,
          quantity: "0.0000 XPR",
          memo: `Login nonce: ${nonce}`,
        },
      };

      let signedTx;
      try {
        signedTx = await session.transact(
          { actions: [action] },
          { broadcast: false }
        );
      } catch (error) {
        console.error("Transaction Error:", error);
        throw error;
      }

      setLoading(true);
      const verifyRes = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/xpr/verify`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actor,
            nonce,
            signatures: signedTx.signatures,
            serializedTransaction: signedTx.serializedTransaction,
          }),
        }
      );

      const data = await verifyRes.json();
      setLoading(false);

      if (verifyRes.ok && data.message === "Wallet verified") {
        window.location.href = "/";
      } else {
        console.log(data.message);
        throw new Error(data.message || "Verification failed");
      }
    } catch (err) {
      setLoading(false);
      console.error(err.message);
    }
  };

  return (
    <Login
      content="Don’t have an account?"
      linkText="Sign up for free"
      linkUrl="/sign-up"
    >
      <div className={styles.login}>
        <div className={styles.top}>
          <h3 className={cn("h3", styles.title)}>Sign in XPRTrade</h3>
          <div className={styles.info}>Use Your OpenID to Sign in</div>

          <div className={styles.btns}>
            <button
              className={cn("button", styles.button)}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `${process.env.REACT_APP_API_BASE_URL}/api/auth/google`;
              }}
            >
              <Icon name="google" size="16" />
              <span>Google</span>
            </button>
            <button
              className={cn("button-black", styles.button)}
              onClick={(e) => {
                e.preventDefault();
                connectWallet();
              }}
            >
              <Icon name="apple" size="16" />
              <span>Wallet</span>
            </button>
          </div>
        </div>
        {scan ? (
          <Scan />
        ) : (
          <Form onScan={() => setScan(true)} parentLoading={loading} />
        )}
      </div>
    </Login>
  );
};

export default SignIn;
