import React, { useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import styles from "./Referrals.module.sass";
import Profile from "../../components/Profile";
import TextInput from "../../components/TextInput";
import { useUser } from "../../context/UserContext";

const breadcrumbs = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Referrals",
  },
];

const Referrals = () => {
  const { user, loadingUser } = useUser();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (user?.referralLink) {
      try {
        await navigator.clipboard.writeText(user.referralLink);
        setCopied(true);

        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error("Failed to copy referral link:", err);
      }
    }
  };
  return (
    <Profile title="Referrals" breadcrumbs={breadcrumbs}>
      <div className={styles.stage}>Total rewards</div>
      <div className={cn("h3", styles.price)}>
        {user?.referralPoints} <span className={styles.currency}>USDT</span>
      </div>
      <div className={styles.info}>
        You're earning 20% of the trading fees your referrals pay. Learn more
      </div>
      <div className={styles.wrap}>
        <div className={styles.title}>Invite friends to earn 20%</div>
        <div className={styles.row}>
          <div className={styles.col}>
            <TextInput
              className={styles.field}
              classLabel={styles.label}
              classInput={styles.input}
              label="Referral link"
              name="referral-link"
              value={user?.referralLink || ""}
              readOnly
              type="text"
              required
            />
            <button
              type="button"
              onClick={handleCopy}
              className={cn("category", styles.category)}
            >
              {copied ? "copied" : "copy"}
            </button>
          </div>
        </div>
      </div>
      <Link
        className={cn("button-stroke", styles.button)}
        to="/wallet-overview"
      >
        My wallet
      </Link>
    </Profile>
  );
};

export default Referrals;
