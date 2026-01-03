import React from "react";
import styles from "./Form.module.sass";
import Action from "./Action";
import { useMediaQuery } from "react-responsive";
import Icon from "../../../../components/Icon";

const Form = ({
  currentPair,
  price,
  stop,
  limit,
  visible,
  setValue,
  orderType,
}) => {
  const isTablet = useMediaQuery({ query: "(max-width: 1023px)" });

  return (
    <div className={styles.form}>
      {isTablet ? (
        <>
          {visible ? (
            <>
              <div className={styles.head}>
                <div className={styles.title}>Place order</div>
                <button
                  className={styles.close}
                  onClick={() => setValue(false)}
                >
                  <Icon name="close-circle" size="24" />
                </button>
              </div>
              <Action
                currentPair={currentPair}
                title={`Buy ${currentPair?.base_symbol?.split(",")[1]}`}
                price={price}
                stop={stop}
                limit={limit}
                classButton="button-green"
                buttonText={`Buy ${currentPair?.base_symbol?.split(",")[1]}`}
                orderType={orderType}
                side="buy"
              />
            </>
          ) : (
            <>
              <div className={styles.head}>
                <div className={styles.title}>Place order</div>
                <button
                  className={styles.close}
                  onClick={() => setValue(false)}
                >
                  <Icon name="close-circle" size="24" />
                </button>
              </div>
              <Action
                currentPair={currentPair}
                title={`Sell ${currentPair?.base_symbol?.split(",")[1]}`}
                price={price}
                stop={stop}
                limit={limit}
                classButton="button-red"
                buttonText={`Sell ${currentPair?.base_symbol?.split(",")[1]}`}
                orderType={orderType}
                side="sell"
              />
            </>
          )}
        </>
      ) : (
        <div className={styles.row}>
          <div className={styles.col}>
            <Action
              currentPair={currentPair}
              title={`Buy ${currentPair?.base_symbol?.split(",")[1]}`}
              price={price}
              stop={stop}
              limit={limit}
              classButton="button-green"
              buttonText={`Buy ${currentPair?.base_symbol?.split(",")[1]}`}
              orderType={orderType}
              side="buy"
            />
          </div>
          <div className={styles.col}>
            <Action
              currentPair={currentPair}
              title={`Sell ${currentPair?.base_symbol?.split(",")[1]}`}
              price={price}
              stop={stop}
              limit={limit}
              classButton="button-red"
              buttonText={`Sell ${currentPair?.base_symbol?.split(",")[1]}`}
              orderType={orderType}
              side="sell"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
