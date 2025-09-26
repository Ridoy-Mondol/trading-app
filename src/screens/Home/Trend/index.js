import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Trend.module.sass";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader";

// const navigation = [
//   "All",
//   "DeFi",
//   "Innovation",
//   "POS",
//   "NFT",
//   "POW",
//   "Storage",
// ];

const Learn = ({ tokens, loading }) => {
  // const [activeIndex, setActiveIndex] = useState(0);
  // const [sorting, setSorting] = useState(navigation[0]);

  const formatNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(2);
  };

  if (loading) {
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
    <div className={cn("section", styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.line}>
          <h2 className={cn("h2", styles.title)}>Market trend</h2>
          <Link className={cn("button-stroke", styles.button)} to="/market">
            View more
          </Link>
        </div>
        {/* <div className={styles.nav}>
          {navigation.map((x, index) => (
            <button
              className={cn(styles.link, {
                [styles.active]: index === activeIndex,
              })}
              onClick={() => setActiveIndex(index)}
              key={index}
            >
              {x}
            </button>
          ))}
        </div>
        <div className={styles.dropdown}>
          <Dropdown
            className={styles.dropdown}
            value={sorting}
            setValue={setSorting}
            options={navigation}
          />
        </div> */}
        <div className={styles.table}>
          <div className={styles.row}>
            <div className={styles.col}>#</div>
            <div className={styles.col}>Name</div>
            <div className={styles.col}>Price</div>
            <div className={styles.col}>24h change</div>
            <div className={styles.col}>Marketcap</div>
            <div className={styles.col}>Trade</div>
          </div>
          {tokens.map((x, index) => {
            return (
              <Link
                className={styles.row}
                to={`/exchange/${x.metadata.name}`}
                key={index}
              >
                <div className={styles.col}>{index + 1}</div>
                <div className={styles.col}>
                  <div className={styles.item}>
                    <div className={styles.icon}>
                      <img
                        src={
                          x.metadata.logo ||
                          "/images/content/currency/fallback-logo.png"
                        }
                        alt={x.metadata.name}
                      />
                    </div>
                    <div className={styles.details}>
                      <span className={styles.subtitle}>
                        {x.metadata.name}{" "}
                      </span>
                      <span className={styles.currency}>{x.symbol}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.col}>
                  {`$${x.price?.usd.toFixed(2)}`}
                </div>
                <div className={styles.col}>
                  <div
                    className={
                      x.price.change_24hr >= 0
                        ? x.price.change_24hr > 0
                          ? styles.positive
                          : ""
                        : styles.negative
                    }
                  >
                    {x.price.change_24hr > 0
                      ? `+${x.price.change_24hr.toFixed(2)}`
                      : x.price.change_24hr.toFixed(2)}
                  </div>
                </div>
                <div className={styles.col}>
                  {`$${formatNumber(x.price.marketcap_usd)}`}
                </div>
                <div className={styles.col}>
                  <button
                    className={cn("button-stroke button-small", styles.button)}
                  >
                    Trade
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Learn;
