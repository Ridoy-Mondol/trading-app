import React, { useState } from "react";
import cn from "classnames";
import styles from "./Confirm.module.sass";
import Radio from "../../../components/Radio";
import Icon from "../../../components/Icon";
import Loader from "../../../components/Loader";

const Confirm = ({ goNext }) => {
  const [confirm, setConfirm] = useState(true);
  const [loading, setLoading] = useState(false);

  const getSignupContact = () => {
    const name = "signup_contact=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookiesArray = decodedCookie.split(";");

    for (let cookie of cookiesArray) {
      cookie = cookie.trim();
      if (cookie.startsWith(name)) {
        return cookie.substring(name.length);
      }
    }
    return null;
  };

  const contact = getSignupContact();

  const cleanedContact = contact
    ? contact.replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, "").trim()
    : null;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\+?\d{7,15}$/;

  let email = null;
  let phone = null;

  if (cleanedContact) {
    if (emailPattern.test(cleanedContact)) {
      email = cleanedContact;
    } else if (phonePattern.test(cleanedContact)) {
      phone = cleanedContact;
    }
  }

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!confirm) return alert("Please confirm your contact method");
    if (!email && !phone) return alert("No valid contact found");

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/signup/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            contact: email || phone,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to send code");
      }

      const data = await res.json();
      console.log("Server response:", data);

      goNext();
    } catch (err) {
      console.error("Error sending code:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <form className={styles.form} onSubmit={handleContinue}>
      <h3 className={cn("h3", styles.title)}>Let’s confirm it's really you</h3>
      <div className={styles.info}>
        Help us secure your account. <br></br>Please complete the verifications
        below
      </div>
      <div className={styles.variants}>
        {contact && (
          <Radio
            className={styles.radio}
            name="confirm"
            value={confirm}
            checked={confirm}
            onChange={() => setConfirm(!confirm)}
            content={`<span>Get the code by ${
              email ? "email" : "text message (SM)"
            } at <strong>${email || phone}</strong></span>`}
          />
        )}
      </div>
      <button
        type="submit"
        className={cn("button", styles.button)}
        disabled={!confirm}
      >
        <span>Continue</span>
        <Icon name="arrow-right" size="16" />
      </button>
    </form>
  );
};

export default Confirm;
