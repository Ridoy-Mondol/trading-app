import React, { useState } from "react";
import cn from "classnames";
import styles from "./Header.module.sass";
import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import Image from "../Image";
import Dropdown from "./Dropdown";
import Settings from "./Settings";
import Icon from "../Icon";
import Notifications from "./Notifications";
import Theme from "../Theme";
import User from "./User";
import { useWallet } from "../../context/WalletContext";

const navigation = [
  {
    title: "Exchange",
    url: "/exchange",
  },
  {
    title: "Buy Crypto",
    dropdown: [
      {
        title: "Credit card",
        icon: "user",
        url: "/buy-crypto",
      },
      {
        title: "Bank deposit",
        icon: "image",
        url: "/deposit-fiat",
      },
    ],
  },
  {
    title: "Market",
    url: "/market",
  },
  {
    title: "Discover",
    url: "/learn-crypto",
  },
];

const Header = ({ headerWide }) => {
  const [visibleNav, setVisibleNav] = useState(false);
  const { pathname } = useLocation();

  const { walletConnected, connectWallet } = useWallet();
  const navigate = useNavigate();

  const handleWalletClick = async () => {
    setVisibleNav(false);

    try {
      if (walletConnected) {
        navigate("/wallet-overview");
        return;
      }

      const session = await connectWallet();

      if (session) {
        navigate("/wallet-overview");
      }
    } catch (err) {
      console.error("❌ Wallet connection failed:", err);
    }
  };

  return (
    <header className={cn(styles.header, { [styles.wide]: headerWide })}>
      <div className={cn("container", styles.container)}>
        <Link
          className={styles.logo}
          to="/"
          onClick={() => setVisibleNav(false)}
        >
          <Image
            className={styles.picDesktop}
            src="/images/logo-light.svg"
            srcDark="/images/logo-dark.svg"
            alt="BitCloud"
          />
          <img
            className={styles.picMobile}
            src="/images/logo.svg"
            alt="BitCloud"
          />
        </Link>
        <div className={styles.wrapper}>
          <div
            className={cn(styles.wrap, {
              [styles.visible]: visibleNav,
            })}
          >
            <nav className={styles.nav}>
              {navigation.map((x, index) =>
                x.dropdown ? (
                  <Dropdown
                    className={styles.dropdown}
                    key={index}
                    item={x}
                    setValue={setVisibleNav}
                  />
                ) : (
                  <NavLink
                    className={cn(styles.item, {
                      [styles.active]: pathname === x.url,
                    })}
                    onClick={() => setVisibleNav(false)}
                    to={x.url}
                    key={index}
                  >
                    {x.title}
                  </NavLink>
                )
              )}
            </nav>
            <button
              className={cn("button-stroke", styles.button, {
                [styles.active]: pathname === "/wallet-overview",
              })}
              onClick={handleWalletClick}
            >
              {walletConnected ? "Wallet" : "Connect Wallet"}
            </button>

            {/* <div className={styles.btns}>
                            <Link
                                className={cn("button-small", styles.button)}
                                to="/sign-up"
                            >
                                Sign Up
                            </Link>
                            <Link
                                className={cn(
                                    "button-stroke button-small",
                                    styles.button
                                )}
                                to="/sign-in"
                            >
                                Login
                            </Link>
                        </div> */}
          </div>
          <Settings className={styles.settings} />
          <div className={styles.control}>
            <NavLink
              className={cn(styles.activity, {
                [styles.active]: pathname === "/activity",
              })}
              to="/activity"
            >
              <Icon name="lightning" size="24" />
            </NavLink>
            <Notifications className={styles.notifications} />
            {/* <NavLink
              className={cn("button-stroke button-small", styles.button, {
                [styles.active]: pathname === "/wallet-overview",
              })}
              to="/wallet-overview"
            >
              Wallet
            </NavLink> */}

            <button
              className={cn("button-stroke button-small", styles.button, {
                [styles.active]: pathname === "/wallet-overview",
              })}
              onClick={handleWalletClick}
            >
              Wallet
            </button>

            <Theme className={styles.theme} icon />
            <User className={styles.user} />
          </div>
          {/* <div className={styles.btns}>
                        <Link
                            className={cn("button-small", styles.button)}
                            to="/sign-up"
                            onClick={() => setVisibleNav(false)}
                        >
                            Sign Up
                        </Link>
                        <Link
                            className={cn(
                                "button-stroke button-small",
                                styles.button
                            )}
                            to="/sign-in"
                            onClick={() => setVisibleNav(false)}
                        >
                            Login
                        </Link>
                    </div> */}
          <button
            className={cn(styles.burger, {
              [styles.active]: visibleNav,
            })}
            onClick={() => setVisibleNav(!visibleNav)}
          ></button>
        </div>
      </div>
    </header>
  );
};

export default Header;
