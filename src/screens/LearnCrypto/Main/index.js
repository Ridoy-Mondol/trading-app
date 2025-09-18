import React from "react";
import { useNavigate } from "react-router-dom";
import cn from "classnames";
import styles from "./Main.module.sass";
import { useUser } from "../../../context/UserContext";

const Main = ({ scrollToRef, scrollToRefCatalog }) => {
  const navigate = useNavigate();
  const { user, loadingUser } = useUser();

  return (
    <div className={cn("section", styles.main)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.head}>
          <h1 className={cn("h1", styles.title)}>Blockchain & Crypto</h1>
          <div className={styles.info}>
            Learn, Trade, and Stay Ahead in the Crypto Market
          </div>
          <div className={styles.btns}>
            <button
              className={cn("button", styles.button)}
              onClick={() =>
                scrollToRef.current.scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn now
            </button>
            {(user?.role === "ADMIN" || user?.role === "SUPERADMIN") && (
              <button
                className={cn("button-stroke", styles.button)}
                onClick={() => navigate("/learn-crypto/write")}
              >
                Write Tutorial
              </button>
            )}
          </div>
        </div>
        <div className={styles.video}>
          <img src="/images/content/crypto.webp" alt="Preview" />
        </div>
      </div>
    </div>
  );
};

export default Main;
