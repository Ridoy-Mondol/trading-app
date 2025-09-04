import React, { useState } from "react";
import cn from "classnames";
import styles from "./TwoFaDisabled.module.sass";
import TextInput from "../../../components/TextInput";
import Icon from "../../../components/Icon";
import Modal from "../../../components/Modal";

const TwoFaDisabled = ({ goEnabled }) => {
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSetup = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/2fa/setup`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.qrCode) {
        setQrCode(data.qrCode);
      } else {
        setMessage(data.message || "Failed to setup 2FA");
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error setting up 2FA");
      setShowModal(true);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/2fa/verify`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        }
      );
      const data = await res.json();
      setMessage(data.message);
      setShowModal(true);
      if (res.ok) {
        goEnabled?.();
        setPassword("");
        setToken("");
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
        2FA <span>Disabled</span>
      </div>
      <div className={styles.text}>
        To turn on 2FA, scan the QR code with the Google Authenticator app. Then
        enter your account password and the six-digit code from the app and
        click "<span>Enable 2FA</span>".
      </div>
      <div className={styles.subtitle}>Enable 2FA</div>
      <div className={styles.info}>
        Scan the QR code with the Google Authenticator app to complete the 2FA
        setup
      </div>
      <div className={styles.email}>
        <Icon name="email" size="24" />
        schinner@ui8.net
      </div>
      <div className={styles.box}>
        <div className={styles.details}>
          <div className={styles.code}>
            <img
              src={qrCode ? qrCode : "/images/content/qr-code.jpg"}
              alt="Qr code"
            />
          </div>
        </div>
      </div>

      {qrCode && (
        <>
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
            label="Authenticator Code"
            name="otp"
            type="text"
            placeholder="Enter 6-digit code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </>
      )}

      <div className={styles.btns}>
        {!qrCode ? (
          <button
            className={cn("button-green", styles.button)}
            onClick={handleSetup}
          >
            Enable 2FA
          </button>
        ) : (
          <button
            className={cn("button-green", styles.button)}
            onClick={handleVerify}
            disabled={!password || !token}
          >
            Verify 2FA
          </button>
        )}
      </div>

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

export default TwoFaDisabled;
