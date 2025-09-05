import React, { useState } from "react";
import cn from "classnames";
import styles from "./Form.module.sass";
import TextInput from "../../../components/TextInput";
import Loader from "../../../components/Loader";

const Form = ({ goFinish }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isStrongPassword = (pass) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pass);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (currentPassword === newPassword) {
      alert("New password must be different from the current password");
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
        `${process.env.REACT_APP_API_BASE_URL}/api/password/change`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.message || "Failed to change password");
        return;
      }

      goFinish();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Change password error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  {
    loading && <Loader />;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={cn("h3", styles.title)}>New password</div>
      <TextInput
        className={styles.field}
        label="Current Password"
        name="current-password"
        type="password"
        placeholder="Enter current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
        view
      />
      <TextInput
        className={styles.field}
        label="New Password"
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
        label="Confirm Password"
        name="confirm-password"
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        view
      />
      <button
        type="submit"
        className={cn("button", styles.button)}
        disabled={loading}
      >
        Change password
      </button>
    </form>
  );
};

export default Form;
