import React from "react";
import cn from "classnames";
import styles from "./Card.module.sass";
import { Link } from "react-router-dom";

const Card = ({ className, item }) => {
  return (
    <Link
      className={cn(className, styles.card)}
      to={`/learn-crypto-details/${item.id}`}
    >
      <div className={styles.preview}>
        {item.category && (
          <div
            className={cn(
              "category",
              {
                "category-purple":
                  item.category.toLowerCase() === "news" ||
                  item.category.toLowerCase() === "tutorial",
                "category-green": item.category.toLowerCase() === "trading",
                "category-blue": item.category.toLowerCase() === "wallet",
              },
              styles.category
            )}
          >
            {item.category}
          </div>
        )}

        <img srcSet={`${item.media} 2x`} src={item.media} alt="Card" />
      </div>
      <div className={styles.body}>
        <div className={styles.avatar}></div>
        <div className={styles.details}>
          <div className={styles.title}>
            {item.title.length > 21
              ? item.title.substring(0, 21) + "..."
              : item.title}
          </div>

          <div className={styles.author}>{item.author.username}</div>
        </div>

        {item.category && (
          <div
            className={cn(
              "category-red",
              "category-stroke-green",
              styles.status
            )}
          >
            {item.category}
          </div>
        )}
      </div>
    </Link>
  );
};

export default Card;
