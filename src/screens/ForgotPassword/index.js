import React, { useState, useEffect } from "react";
import Login from "../../components/Login";
import Form from "./Form";
import Verification from "./Verification";
import NewPassword from "./NewPassword";

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

const ForgotPassword = () => {
  const [acitveIndex, setAcitveIndex] = useState(() => {
    const cookieValue = getCookie("index");
    return cookieValue ? Number(cookieValue) : 0;
  });

  useEffect(() => {
    const cookieValue = getCookie("index");
    setAcitveIndex(cookieValue ? Number(cookieValue) : 0);
  }, []);

  return (
    <Login
      content="Don’t have an account?"
      linkText="Sign up for free"
      linkUrl="/sign-up"
    >
      {acitveIndex === 0 && <Form goNext={() => setAcitveIndex(1)} />}
      {acitveIndex === 1 && <Verification goNext={() => setAcitveIndex(2)} />}
      {acitveIndex === 2 && <NewPassword />}
    </Login>
  );
};

export default ForgotPassword;
