import { useState, useEffect } from "react";
import cn from "classnames";
import { JsonRpc } from "eosjs";
import styles from "./Balance.module.sass";
import Dropdown from "../../../components/Dropdown";

const sorting = [
  {
    color1: "#FF6838",
    color2: "#B1B5C3",
    color3: "#58BD7D",
  },
  {
    color1: "#B1B5C3",
    color2: "#B1B5C3",
    color3: "#58BD7D",
  },
  {
    color1: "#FF6838",
    color2: "#B1B5C3",
    color3: "#B1B5C3",
  },
];

const counterOptions = ["10", "20", "30"];

const Balance = ({ currentPair }) => {
  const [orders, setOrders] = useState([]);
  const [counter, setCounter] = useState(counterOptions[0]);
  const [loading, setLoading] = useState(false);

  const rpc = new JsonRpc(process.env.REACT_APP_PROTON_ENDPOINT);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await rpc.get_table_rows({
        json: true,
        code: "orderbook",
        scope: "orderbook",
        table: "orders",
        index_position: 3,
        key_type: "i64",
        lower_bound: currentPair?.pair_id,
        upper_bound: currentPair?.pair_id,
        limit: 100,
      });

      const filtered = result.rows.filter(
        (order) =>
          (order.status === 0 || order.status === 1) &&
          order.order_type === "limit"
      );

      setOrders(filtered);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPair?.pair_id]);

  return (
    <div className={styles.balance}>
      <div className={styles.head}>
        <div className={styles.sorting}>
          {sorting.map((x, index) => (
            <button
              className={cn(styles.direction, {
                [styles.active]: index < 1,
              })}
              key={index}
            >
              <span style={{ backgroundColor: x.color1 }}></span>
              <span style={{ backgroundColor: x.color2 }}></span>
              <span style={{ backgroundColor: x.color3 }}></span>
            </button>
          ))}
        </div>
        <Dropdown
          className={styles.dropdown}
          classDropdownHead={styles.dropdownHead}
          classDropdownArrow={styles.dropdownArrow}
          classDropdownBody={styles.dropdownBody}
          classDropdownOption={styles.dropdownOption}
          value={counter}
          setValue={setCounter}
          options={counterOptions}
        />
      </div>
      <div className={styles.top}>
        <div className={styles.price}>Price (USDT)</div>
        <div className={styles.amount}>Amounts (BTC)</div>
        <div className={styles.total}>Total</div>
      </div>
      <div className={styles.list}>
        {orders.map((x, index) => (
          <div
            className={cn(
              styles.item,
              { [styles.positive]: x.side === "buy" },
              { [styles.negative]: x.side === "sell" }
            )}
            key={index}
          >
            <div className={styles.price}>{x.price.split(" ")[0]}</div>
            <div className={styles.amount}>
              {x.remaining_amount.split(" ")[0]}
            </div>
            <div className={styles.total}>
              {x.price.split(" ")[0] * x.remaining_amount.split(" ")[0]}
            </div>
            <div
              className={styles.line}
              style={{ width: `${x.percent}%` }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Balance;
