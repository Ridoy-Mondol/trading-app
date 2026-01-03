import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import cn from "classnames";
import { JsonRpc } from "eosjs";
import styles from "./Exchange.module.sass";
import Main from "./Main";
import Balance from "./Balance";
import Currency from "./Currency";
import Trades from "./Trades";
import Table from "./Table";
import Actions from "./Actions";
import Charts from "./Charts";
import { useMediaQuery } from "react-responsive";

const navigation = ["Chart", "Order books", "Trades"];
const rpc = new JsonRpc(process.env.REACT_APP_PROTON_ENDPOINT);

const Exchange = () => {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const isTablet = useMediaQuery({ query: "(max-width: 1023px)" });

  const { id } = useParams();

  const [baseSymbol, quoteSymbol] = id.split("_");

  const extractSymbol = (symbol) => {
    return symbol.split(",")[1];
  };

  const fetchPairs = async () => {
    try {
      setLoading(true);
      const result = await rpc.get_table_rows({
        json: true,
        code: "orderbook",
        scope: "orderbook",
        table: "pairs",
        limit: 100,
      });

      setPairs(result.rows);
    } catch (error) {
      console.error("Failed to fetch pairs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPairs();
  }, []);

  const selectedPair = pairs?.find((pair) => {
    const baseFromTable = extractSymbol(pair.base_symbol);
    const quoteFromTable = extractSymbol(pair.quote_symbol);

    return baseSymbol === baseFromTable && quoteSymbol === quoteFromTable;
  });

  return (
    <div className={styles.exchange}>
      <Main pair={id} />
      <div className={styles.nav}>
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
      {isTablet ? (
        <>
          <Actions currentPair={selectedPair} />
          {activeIndex === 0 && (
            <div className={styles.box}>
              <Charts />
              <Table />
            </div>
          )}
          {activeIndex === 1 && (
            <div className={styles.box}>
              <Balance currentPair={selectedPair} />
            </div>
          )}
          {activeIndex === 2 && (
            <div className={styles.box}>
              <Currency />
              <Trades />
            </div>
          )}
        </>
      ) : (
        <div className={styles.row}>
          <div className={styles.col}>
            <Balance currentPair={selectedPair} />
          </div>
          <div className={styles.col}>
            <Charts />
            <Actions currentPair={selectedPair} />
            <Table />
          </div>
          <div className={styles.col}>
            <Currency />
            <Trades />
          </div>
        </div>
      )}
    </div>
  );
};

export default Exchange;
