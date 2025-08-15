import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import cn from "classnames";
import styles from "./Code.module.sass";
import Loader from "../../../components/Loader";

const Code = () => {
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();

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
        handleSubmit();
      } else {
        inputsRef.current[nextIndex].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const clearInputs = () => {
    inputsRef.current.forEach((input) => {
      if (input) input.value = "";
    });
  };

  const handleSubmit = async () => {
    const code = inputsRef.current.map((input) => input.value).join("");

    if (code.length === inputsRef.current.length) {
      try {
        setLoading(true);
        clearInputs();
        console.log("otp submitted", code);
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/signup/verify-otp`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ otp: code }),
          }
        );

        const data = await response.json();
        setLoading(false);

        if (response.ok) {
          console.log("✅ OTP verified, user created:", data);
          navigate("/");
        } else {
          setLoading(false);
          console.error("❌ OTP verification failed:", data.message);
        }
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
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <h3 className={cn("h3", styles.title)}>Enter your security code</h3>
      <div className={styles.info}>
        We {email ? "emailed" : "texted"} your code to {email || phone}
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
    </form>
  );
};

export default Code;
