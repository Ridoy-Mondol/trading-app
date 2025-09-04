import React, { useState } from "react";
import cn from "classnames";
import styles from "./TwoFaEnabled.module.sass";
import TextInput from "../../../components/TextInput";
import Icon from "../../../components/Icon";
import Modal from "../../../components/Modal";

const TwoFaEnabled = ({ goDisabled }) => {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleDisable = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/2fa/disable`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, password }),
        }
      );
      const data = await res.json();
      setMessage(data.message);
      setShowModal(true);
      if (res.ok) {
        goDisabled?.();
        setPassword("");
        setCode("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error verifying 2FA");
      setShowModal(true);
    }
  };

  return (
    <div>
      <div className={cn("h3", styles.title)}>
        2FA <span>Enabled</span>
      </div>
      <div className={styles.text}>
        If you want to turn off 2FA, input your account password and the
        six-digit code provided by the Google Authenticator app below, then
        click "<span>Disable 2FA</span>".
      </div>
      <div className={styles.subtitle}>Disable 2FA</div>
      <div className={styles.info}>
        Enter your password and the six-digit code provided by the Google
        Authenticator app to Disable the 2FA verification
      </div>
      <div className={styles.email}>
        <Icon name="email" size="24" />
        schinner@ui8.net
      </div>
      <div className={styles.row}>
        <TextInput
          className={styles.field}
          label="password"
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          view
        />
        <TextInput
          className={styles.field}
          label="2FA code"
          name="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      <button
        className={cn("button-red", styles.button)}
        onClick={handleDisable}
        disabled={!code || !password}
      >
        Disable 2FA
      </button>

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Notification"
      >
        <p>{message}</p>
      </Modal>
    </div>
  );
};

export default TwoFaEnabled;
