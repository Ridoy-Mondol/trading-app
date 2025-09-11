import React from "react";
import cn from "classnames";
import styles from "./Item.module.sass";
import Icon from "../../../components/Icon";
import Loader from "../../../components/Loader";

const Item = ({ className, item, index, loading }) => {
  if (loading) {
    return <Loader />;
  }
  return (
    <div
      className={cn(className, styles.item, { [styles.active]: !item.isRead })}
    >
      <div className={styles.icon}>
        <Icon
          name={item.type === "SECURITY" ? "lightning" : "wallet"}
          size="24"
        />
      </div>
      <div className={styles.details}>
        <div className={styles.line}>
          <div className={styles.title}>{item.title}</div>
          <div className={styles.date}>
            {(() => {
              const d = new Date(item.createdAt);
              const pad = (n) => n.toString().padStart(2, "0");
              return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
                d.getDate()
              )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
                d.getSeconds()
              )}`;
            })()}
          </div>
          <div className={styles.status}></div>
        </div>
        <div className={styles.content}>{item.content}</div>
      </div>
    </div>
  );
};

export default Item;
