import React, { useState, useEffect } from "react";
import Profile from "../../components/Profile";
import TwoFaEnabled from "./TwoFaEnabled";
import TwoFaDisabled from "./TwoFaDisabled";
import { useUser } from "../../context/UserContext";

const breadcrumbs = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "2FA",
  },
];

const TwoFa = () => {
  const { user, loadingUser } = useUser();
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (user) {
      setDisabled(!user.is2FAEnabled);
    }
  }, [user]);

  return (
    <Profile title="2FA" breadcrumbs={breadcrumbs}>
      {disabled ? (
        <TwoFaDisabled goEnabled={() => setDisabled(false)} user={user} />
      ) : (
        <TwoFaEnabled goDisabled={() => setDisabled(true)} user={user} />
      )}
    </Profile>
  );
};

export default TwoFa;
