import React, { useState } from "react";
import cn from "classnames";
import ctd from "country-telephone-data";
import styles from "./Form.module.sass";
import { Link } from "react-router-dom";
import TextInput from "../../../components/TextInput";
import Dropdown from "../../../components/Dropdown";
import Loader from "../../../components/Loader";

const navigation = ["Email", "Mobile"];

function countryCodeToFlagEmoji(countryCode) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
}
const optionsPhone = ctd.allCountries.map((country) => {
  const flag = countryCodeToFlagEmoji(country.iso2);
  return `${flag} +${country.dialCode}`;
});

const Form = ({ goNext }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phoneCode, setPhoneCode] = useState(optionsPhone[0]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (num) => /^\d{6,15}$/.test(num);

  const setForgetContact = (value) => {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    document.cookie = `forget_contact=${encodeURIComponent(
      value
    )}; expires=${expires.toUTCString()}; path=/`;

    document.cookie = `index=1; expires=${expires.toUTCString()}; path=/`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeIndex === 0 && !email) {
      return alert("Email is required");
    }
    if (activeIndex === 0 && !isValidEmail(email)) {
      return alert("Invalid email format");
    }
    if (activeIndex === 1 && !phone) {
      return alert("Phone number is required");
    }
    if (activeIndex === 1 && !isValidPhone(phone)) {
      return alert("Invalid phone number");
    }

    const bodyData =
      activeIndex === 0
        ? {
            authProvider: "EMAIL",
            email,
          }
        : {
            authProvider: "PHONE",
            phone: `${phoneCode}${phone}`,
          };

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/password/forgot/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(bodyData),
        }
      );

      const data = await res.json();

      setLoading(false);
      if (!res.ok) {
        alert(data.message || "Something went wrong!");
        return;
      }

      setForgetContact(
        bodyData.authProvider === "EMAIL" ? email : `${phoneCode}${phone}`
      );

      goNext();
    } catch (err) {
      setLoading(false);
      console.error("Forget password error:", err);
      alert("Something went wrong, please try again");
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.top}>
        <h3 className={cn("h3", styles.title)}>Forgot password</h3>
        <div className={styles.info}>
          For security purposes, no withdrawals are permitted for 24 hours after
          password changed.
        </div>
      </div>

      <div className={styles.nav}>
        {navigation.map((x, index) => (
          <button
            className={cn(styles.link, {
              [styles.active]: index === activeIndex,
            })}
            onClick={() => setActiveIndex(index)}
            key={index}
            type="button"
          >
            {x}
          </button>
        ))}
      </div>

      <div className={styles.fieldset}>
        {activeIndex === 0 && (
          <TextInput
            className={styles.field}
            label="Enter the account email"
            name="email"
            type="email"
            placeholder="Your email"
            icon="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        {activeIndex === 1 && (
          <div className={styles.line}>
            <div className={styles.field}>
              <Dropdown
                className={styles.dropdown}
                label="mobile"
                value={phoneCode}
                setValue={setPhoneCode}
                options={optionsPhone}
              />
            </div>
            <TextInput
              className={styles.field}
              name="phone"
              type="number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        )}
      </div>
      <button className={cn("button", styles.button)} type="submit">
        Continue
      </button>
      <div className={styles.foot}>
        <Link className={styles.link} to="/sign-in">
          Nevermind, I got it
        </Link>
      </div>
    </form>
  );
};

export default Form;
