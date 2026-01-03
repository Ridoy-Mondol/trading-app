import React, { useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import styles from "./Actions.module.sass";
import Icon from "../../../components/Icon";
import Form from "./Form";

const orderTypes = ["limit", "stop-limit", "market"];

const Actions = ({ currentPair }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleAction, setVisibleAction] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleClickBuy = () => {
    setVisibleAction(true);
    setVisible(true);
  };

  const handleClickSell = () => {
    setVisibleAction(false);
    setVisible(true);
  };

  return (
    <div className={styles.actions}>
      <div className={styles.head}>
        <div className={styles.nav}>
          {orderTypes.map((x, index) => (
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
        <div className={styles.info}>
          Crypto trading tutorial
          <Link to="/learn-crypto">
            Learn now <Icon name="arrow-right" size="20" />
          </Link>
        </div>
      </div>
      <div className={cn(styles.wrapper, { [styles.show]: visible })}>
        {activeIndex === 0 && (
          <Form
            currentPair={currentPair}
            price={true}
            visible={visibleAction}
            setValue={setVisible}
            orderType={orderTypes[0]}
          />
        )}
        {activeIndex === 1 && (
          <Form
            currentPair={currentPair}
            stop={true}
            limit={true}
            visible={visibleAction}
            setValue={setVisible}
            orderType={orderTypes[1]}
          />
        )}
        {activeIndex === 2 && (
          <Form
            currentPair={currentPair}
            limit={true}
            visible={visibleAction}
            setValue={setVisible}
            orderType={orderTypes[2]}
          />
        )}
      </div>
      <div className={styles.btns}>
        <button
          className={cn("button-green button-small", styles.button)}
          onClick={() => handleClickBuy()}
        >
          Buy
        </button>
        <button
          className={cn("button-red button-small", styles.button)}
          onClick={() => handleClickSell()}
        >
          Sell
        </button>
      </div>
    </div>
  );
};

export default Actions;
