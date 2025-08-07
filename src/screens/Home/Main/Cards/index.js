import React from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Cards.module.sass";
import { useCryptoData } from "../../../../hooks/useCryptoData"

const Cards = ({ className }) => {

  const { data, isLoading, error } = useCryptoData()

  if (isLoading) return <div>Loading price...</div>
  if (error) return <div>Error loading price</div>

  return (
    <div className={cn(className, styles.cards)}>
      {data.map((x, index) => (
        <Link className={styles.card} key={index} to={x.url}>
          <div className={styles.icon}>
            <img src={x.image} alt="Currency" />
          </div>
          <div className={styles.details}>
            <div className={styles.line}>
              <div className={styles.title}>{x.title}</div>
              <div className={parseFloat(x.change) >= 0 ? styles.positive : styles.negative}>{x.change}</div>
            </div>
            <div className={styles.price}>{x.price}</div>
            <div className={styles.money}>{x.price}</div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Cards;
