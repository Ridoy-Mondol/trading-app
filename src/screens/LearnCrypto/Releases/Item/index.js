import React from "react";
import cn from "classnames";
import styles from "./Item.module.sass";
import { Link } from "react-router-dom";
import Icon from "../../../../components/Icon";

const Item = ({ className, item }) => {
  return (
    <Link
      className={cn(className, styles.item)}
      to={`/learn-crypto-details/${item.id}`}
    >
      <div className={styles.preview}>
        <img srcSet={`${item.media} 2x`} src={item.media} alt="Item" />
      </div>
      <div className={styles.details}>
        <div className={cn("category-red", styles.category)}>new</div>

        <h4 className={cn("h4", styles.title)}>{item.title}</h4>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{
            __html:
              item.content.length > 120
                ? item.content.slice(0, 120) + "..."
                : item.content,
          }}
        ></div>
      </div>
      <div className={styles.arrow}>
        <Icon name="arrow-next" size="14" />
      </div>
    </Link>
  );
};

export default Item;
