import React from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Cards.module.sass";
import Loader from "../../../../components/Loader";

const Cards = ({ className, tokens, loading }) => {
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
    <div className={cn(className, styles.cards)}>
      {tokens.slice(0, 4).map((x, index) => (
        <Link
          className={styles.card}
          key={index}
          to={`/exchange/${x.metadata.name}`}
        >
          <div className={styles.icon}>
            <img
              src={
                x.metadata.logo || "/images/content/currency/fallback-logo.png"
              }
              alt={x.metadata.name}
            />
          </div>
          <div className={styles.details}>
            <div className={styles.line}>
              <div className={styles.title}>{x.pairs[0].id}</div>
              <div
                className={
                  x.price.change_24hr >= 0
                    ? x.price.change_24hr > 0
                      ? styles.positive
                      : ""
                    : styles.negative
                }
              >
                {x.price.change_24hr.toFixed(2) > 0
                  ? `+${x.price.change_24hr.toFixed(2)}`
                  : x.price.change_24hr.toFixed(2)}
              </div>
            </div>
            <div className={styles.price}>{x.price?.usd.toFixed(4)}</div>
            <div className={styles.money}>{x.price.marketcap_usd}</div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Cards;
