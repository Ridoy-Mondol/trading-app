import React, { useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import ctd from "country-telephone-data";
import styles from "./Form.module.sass";
import Dropdown from "../../../components/Dropdown";
import TextInput from "../../../components/TextInput";
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

const Form = ({ onScan, parentLoading }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phoneCode, setPhoneCode] = useState(optionsPhone[0]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (num) => /^\d{6,15}$/.test(num);

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
    if (!password) {
      return alert("Password is required");
    }

    const bodyData =
      activeIndex === 0
        ? {
            email,
            password,
            authProvider: "EMAIL",
          }
        : {
            phone: `${phoneCode}${phone}`,
            password,
            authProvider: "PHONE",
          };

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/login`,
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
        alert(data.message || "Login failed");
        return;
      }

      window.location.href = "/";
    } catch (err) {
      setLoading(false);
      console.error("Login error:", err);
      alert("Something went wrong, please try again");
    }
  };

  if (loading || parentLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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
      <div className={styles.container}>
        {activeIndex === 0 && (
          <TextInput
            className={styles.field}
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
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
      <TextInput
        className={styles.field}
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        view
      />
      <div className={styles.foot}>
        <button className={styles.scan} onClick={onScan}>
          Scan to login
        </button>
        <Link className={styles.link} to="/forgot-password">
          Forgot password?
        </Link>
      </div>
      <button
        className={cn("button", styles.button)}
        type="submit"
        onClick={handleSubmit}
      >
        Login
      </button>
    </form>
  );
};

export default Form;
