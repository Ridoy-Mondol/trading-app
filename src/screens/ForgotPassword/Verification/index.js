import React, { useState, useRef } from "react";
import cn from "classnames";
import styles from "./Verification.module.sass";
import Loader from "../../../components/Loader";

const getCookie = (name) => {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
};

const setForgetContact = (value) => {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 15);

  document.cookie = `forget_contact=${encodeURIComponent(
    value
  )}; expires=${expires.toUTCString()}; path=/`;

  document.cookie = `index=2; expires=${expires.toUTCString()}; path=/`;
};

const Verification = ({ goNext }) => {
  const [loading, setLoading] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const inputsRef = useRef([]);

  const contact = getCookie("forget_contact");

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    e.target.value = value.slice(0, 1);

    if (value) {
      const totalInputs = inputsRef.current.length;

      let nextIndex = -1;
      for (let i = index + 1; i < totalInputs; i++) {
        if (inputsRef.current[i] && !inputsRef.current[i].value) {
          nextIndex = i;
          break;
        }
      }

      if (nextIndex === -1) {
        for (let i = 0; i < totalInputs; i++) {
          if (inputsRef.current[i] && !inputsRef.current[i].value) {
            nextIndex = i;
            break;
          }
        }
      }

      if (nextIndex === -1) {
        setIsButtonEnabled(true);
      } else {
        setIsButtonEnabled(false);
        inputsRef.current[nextIndex].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }

    setTimeout(() => {
      const allFilled = inputsRef.current.every(
        (input) => input && input.value && input.value.length === 1
      );
      setIsButtonEnabled(allFilled);
    }, 0);
  };

  const clearInputs = () => {
    inputsRef.current.forEach((input) => {
      if (input) input.value = "";
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const code = inputsRef.current.map((input) => input.value).join("");

    if (code.length !== inputsRef.current.length) {
      return;
    }

    if (code.length === inputsRef.current.length) {
      try {
        setLoading(true);
        clearInputs();
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/password/forgot/verify-otp`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ otp: code }),
          }
        );

        const data = await response.json();
        setLoading(false);

        if (!response.ok) {
          setLoading(false);
          console.error("❌ OTP verification failed:", data.message);
          alert(data.message || "❌ OTP verification failed");
          return;
        }

        setForgetContact(contact);
        goNext();
      } catch (err) {
        setLoading(false);
        console.error("⚠️ API call error:", err);
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={cn("h3", styles.title)}>Security verification</h3>
      <div className={styles.info}>
        To secure your account, please complete the following verification.
      </div>
      <div className={styles.text}>
        Enter the 6 digit code received by <span>{contact}</span>
      </div>

      <div className={styles.code}>
        {[0, 1, 2, 3].map((_, index) => (
          <div className={styles.number} key={index}>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              ref={(el) => (inputsRef.current[index] = el)}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          </div>
        ))}
      </div>

      <div className={styles.btns}>
        <button className={cn("button-stroke button-small", styles.button)}>
          Resend code
        </button>
        <button
          className={cn("button-small", styles.button)}
          type="submit"
          disabled={!isButtonEnabled}
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default Verification;
