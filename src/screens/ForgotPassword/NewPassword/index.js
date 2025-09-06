import React, { useState } from "react";
import cn from "classnames";
import styles from "./NewPassword.module.sass";
import TextInput from "../../../components/TextInput";
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

const NewPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const contact = getCookie("forget_contact");
  const isEmail = contact?.includes("@") ?? false;

  let email = "";
  let phoneCode = "";
  let phone = "";

  if (contact) {
    if (isEmail) {
      email = contact;
    } else {
      const [, code, number] = contact.match(/^(\+\d{1,3})(\d+)$/) || [];
      phoneCode = code || "";
      phone = number || contact;
    }
  }

  const isStrongPassword = (pass) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pass);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (!isStrongPassword(newPassword)) {
      alert(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/password/forgot/reset`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            contact,
            newPassword,
          }),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.message || "Failed to reset password");
        return;
      }

      document.cookie = `forget_contact=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `index=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

      window.location.href = "/";
    } catch (err) {
      setLoading(false);
      console.error("Reset password error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={cn("h3", styles.title)}>New password</h3>
      <div className={styles.fieldset}>
        {isEmail && (
          <TextInput
            className={styles.field}
            label="email"
            name="email"
            type="email"
            value={email}
            readOnly
            placeholder="Email address"
          />
        )}
        {!isEmail && (
          <div className={styles.line}>
            <div className={styles.field}>
              <TextInput
                className={styles.dropdown}
                label="mobile"
                value={phoneCode}
                readOnly
              />
            </div>
            <TextInput
              className={styles.field}
              name="phone"
              type="tel"
              value={phone}
              readOnly
            />
          </div>
        )}

        <TextInput
          className={styles.field}
          label="new password"
          name="new-password"
          type="password"
          placeholder="Enter new password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          view
        />
        <TextInput
          className={styles.field}
          label="confirm password"
          name="confirm-password"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          view
        />
      </div>
      <button type="submit" className={cn("button", styles.button)}>
        Continue
      </button>
    </form>
  );
};

export default NewPassword;
