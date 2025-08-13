import React, { useState } from "react";
import cn from "classnames";
import ctd from "country-telephone-data";
import styles from "./Form.module.sass";
import Icon from "../../../components/Icon";
import Checkbox from "../../../components/Checkbox";
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

const Form = ({ goNext }) => {
  const [policy, setPolicy] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [phoneCode, setPhoneCode] = useState(optionsPhone[0]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidUsername = (name) => /^\w+$/.test(name.trim());

  const isValidPhone = (num) => /^\d{6,15}$/.test(num);

  const isStrongPassword = (pass) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pass);

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
    if (!username) {
      return alert("Username is required");
    }
    if (!isValidUsername(username)) {
      return alert(
        "Username must be a single word (letters, numbers, underscores)"
      );
    }
    if (!password) {
      return alert("Password is required");
    }
    if (!isStrongPassword(password)) {
      return alert(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
      );
    }
    if (password !== cPassword) {
      return alert("Passwords do not match");
    }
    if (!policy) {
      return alert("You must agree to the terms and policies");
    }

    const bodyData =
      activeIndex === 0
        ? { authProvider: "EMAIL", email, username, password }
        : {
            authProvider: "PHONE",
            phone: `${phoneCode}${phone}`,
            username,
            password,
          };

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/signup`,
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
        alert(data.message || "Signup failed");
        return;
      }

      goNext();
    } catch (err) {
      setLoading(false);
      console.error("Signup error:", err);
      alert("Something went wrong, please try again");
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.top}>
        <h3 className={cn("h3", styles.title)}>Sign up</h3>
        <div className={styles.info}>Use Your OpenID to Sign up</div>
        <div className={styles.btns}>
          <button className={cn("button", styles.button)}>
            <Icon name="google" size="16" />
            <span>Google</span>
          </button>
          <button className={cn("button-black", styles.button)}>
            <Icon name="apple" size="16" />
            <span>Apple</span>
          </button>
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
        label="Username"
        name="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <TextInput
        className={styles.field}
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete="new-password"
        required
        view
      />
      <TextInput
        className={styles.field}
        label="confirm password"
        name="confirm-password"
        type="password"
        value={cPassword}
        onChange={(e) => setCPassword(e.target.value)}
        placeholder="Confirm Password"
        required
        view
      />
      <Checkbox
        className={styles.checkbox}
        value={policy}
        onChange={() => setPolicy(!policy)}
        content="<span>By signing up I agree that I’m 18 years of age or older, to the <a href='/#' target='_blank' rel='noopener noreferrer'>User Agreements</a>, <a href='/#' target='_blank' rel='noopener noreferrer'>Privacy Policy</a>, <a href='/#' target='_blank' rel='noopener noreferrer'>Cookie Policy</a>, <a href='/#' target='_blank' rel='noopener noreferrer'>E-Sign Consent</a>.<span>"
      />

      <button className={cn("button", styles.button)} type="submit">
        Sign up
      </button>
    </form>
  );
};

export default Form;
