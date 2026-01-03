import { useState, useEffect } from "react";
import cn from "classnames";
import { JsonRpc } from "eosjs";
import styles from "./Currency.module.sass";
import Icon from "../../../components/Icon";
import { useNavigate } from "react-router-dom";

const Currency = () => {
  const [search, setSearch] = useState("");
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const rpc = new JsonRpc(process.env.REACT_APP_PROTON_ENDPOINT);

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

  const getSymbol = (token) => token.split(",")[1];

  const filteredPairs = pairs.filter((pair) => {
    const text = search.toLowerCase();

    const base = getSymbol(pair.base_symbol).toLowerCase();
    const quote = getSymbol(pair.quote_symbol).toLowerCase();

    return (
      base.includes(text) ||
      quote.includes(text) ||
      `${base}/${quote}`.includes(text)
    );
  });

  return (
    <div className={styles.currency}>
      <div className={styles.form}>
        <input
          className={styles.input}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          name="search"
          placeholder="Search"
          required
        />
        <button className={styles.result}>
          <Icon name="search" size="20" />
        </button>
      </div>
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>
            <div className="sorting">Pair</div>
          </div>
          <div className={styles.col}>
            <div className="sorting">Price</div>
          </div>
          <div className={styles.col}>
            <div className="sorting">Volume</div>
          </div>
        </div>
        {filteredPairs.map((pair, index) => (
          <div className={styles.row} key={index}>
            <div className={styles.col}>
              <div className={styles.line}>
                <button className={cn("favorite", styles.favorite)}>
                  <Icon name="star-outline" size="16" />
                </button>
                <div
                  className={styles.info}
                  onClick={() =>
                    navigate(
                      `/exchange/${getSymbol(pair?.base_symbol)}_${getSymbol(
                        pair?.quote_symbol
                      )}`
                    )
                  }
                >
                  {getSymbol(pair?.base_symbol)}
                  <span>/{getSymbol(pair?.quote_symbol)}</span>
                </div>
              </div>
            </div>
            <div className={styles.col}>
              {pair.positive && (
                <div className={styles.positive}>{pair.positive}</div>
              )}
              {pair.negative && (
                <div className={styles.negative}>{pair.negative}</div>
              )}
            </div>
            <div className={styles.col}>{pair.volume}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Currency;
