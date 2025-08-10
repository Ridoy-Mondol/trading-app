import React, { useState } from "react";
import cn from "classnames";
import ctd from "country-telephone-data";
import styles from "./Form.module.sass";
import Icon from "../../../components/Icon";
import Checkbox from "../../../components/Checkbox";
import Dropdown from "../../../components/Dropdown";
import TextInput from "../../../components/TextInput";

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
  const [policy, setPolicy] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [phone, setPhone] = useState(optionsPhone[0]);

  return (
    <form className={styles.form}>
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
            label="email"
            name="email"
            type="email"
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
                value={phone}
                setValue={setPhone}
                options={optionsPhone}
              />
            </div>
            <TextInput
              className={styles.field}
              name="phone"
              type="tel"
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
        placeholder="Username"
        required
      />
      <TextInput
        className={styles.field}
        label="Password"
        name="password"
        type="password"
        placeholder="Password"
        required
        view
      />
      <TextInput
        className={styles.field}
        label="confirm password"
        name="confirm-password"
        type="password"
        placeholder="Password"
        required
        view
      />
      <Checkbox
        className={styles.checkbox}
        value={policy}
        onChange={() => setPolicy(!policy)}
        content="<span>By signing up I agree that I’m 18 years of age or older, to the <a href='/#' target='_blank' rel='noopener noreferrer'>User Agreements</a>, <a href='/#' target='_blank' rel='noopener noreferrer'>Privacy Policy</a>, <a href='/#' target='_blank' rel='noopener noreferrer'>Cookie Policy</a>, <a href='/#' target='_blank' rel='noopener noreferrer'>E-Sign Consent</a>.<span>"
      />
      <button className={cn("button", styles.button)} onClick={goNext}>
        Sign up
      </button>
    </form>
  );
};

export default Form;
