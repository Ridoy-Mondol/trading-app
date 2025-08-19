import React, { useState } from "react";
import cn from "classnames";
import styles from "./SignIn.module.sass";
import Login from "../../components/Login";
import Icon from "../../components/Icon";
import Form from "./Form";
import Scan from "./Scan";

const SignIn = () => {
  const [scan, setScan] = useState(false);

  return (
    <Login
      content="Don’t have an account?"
      linkText="Sign up for free"
      linkUrl="/sign-up"
    >
      <div className={styles.login}>
        <div className={styles.top}>
          <h3 className={cn("h3", styles.title)}>Sign in XPRTrade</h3>
          <div className={styles.info}>Use Your OpenID to Sign in</div>

          <div className={styles.btns}>
            <button
              className={cn("button", styles.button)}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `${process.env.REACT_APP_API_BASE_URL}/api/auth/google`;
              }}
            >
              <Icon name="google" size="16" />
              <span>Google</span>
            </button>
            <button className={cn("button-black", styles.button)}>
              <Icon name="apple" size="16" />
              <span>Apple</span>
            </button>
          </div>
        </div>
        {scan ? <Scan /> : <Form onScan={() => setScan(true)} />}
      </div>
    </Login>
  );
};

export default SignIn;
