import React, { useState, useEffect } from "react";
import Login from "../../components/Login";
import Form from "./Form";
import Confirm from "./Confirm";
import Code from "./Code";
import { useAuth } from "../../context/AuthContext";

const SignUp = () => {
  const { signupStep } = useAuth();
  const [activeIndex, setActiveIndex] = useState(signupStep);

  useEffect(() => {
    setActiveIndex(signupStep);
  }, [signupStep]);

  return (
    <Login
      content="Already have an account?"
      linkText="Login"
      linkUrl="/sign-in"
    >
      {activeIndex === 0 && <Form goNext={() => setActiveIndex(1)} />}
      {activeIndex === 1 && <Confirm goNext={() => setActiveIndex(2)} />}
      {activeIndex === 2 && <Code />}
    </Login>
  );
};

export default SignUp;
