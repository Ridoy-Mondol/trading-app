import React, { useState } from "react";
import cn from "classnames";
import styles from "./Trend.module.sass";
import { Link } from "react-router-dom";
import Dropdown from "../../../components/Dropdown";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useCryptoDetails } from "../../../hooks/useCryptoDetails";

// const navigation = [
//   "All",
//   "DeFi",
//   "Innovation",
//   "POS",
//   "NFT",
//   "POW",
//   "Storage",
// ];

const Learn = () => {
  // const [activeIndex, setActiveIndex] = useState(0);
  // const [sorting, setSorting] = useState(navigation[0]);

  const { assets, loading, error } = useCryptoDetails();

  const normalizeHistory = (historyArray) => {
    const min = Math.min(...historyArray);
    const max = Math.max(...historyArray);

    if (max === min) {
      return historyArray.map(() => ({ price: 5 }));
    }

    return historyArray.map((p) => ({
      price: ((p - min) / (max - min)) * 10,
    }));
  };

  const transformedAssets = assets.map((asset) => ({
    ...asset,
    priceHistory: normalizeHistory(asset.priceHistory),
  }));

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div className={cn("section", styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.line}>
          <h2 className={cn("h2", styles.title)}>Market trend</h2>
          <Link className={cn("button-stroke", styles.button)} to="/market">
            View more
          </Link>
        </div>
        {/* <div className={styles.nav}>
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
        <div className={styles.dropdown}>
          <Dropdown
            className={styles.dropdown}
            value={sorting}
            setValue={setSorting}
            options={navigation}
          />
        </div> */}
        <div className={styles.table}>
          <div className={styles.row}>
            <div className={styles.col}>#</div>
            <div className={styles.col}>Name</div>
            <div className={styles.col}>Price</div>
            <div className={styles.col}>24h change</div>
            <div className={styles.col}>Chart</div>
            <div className={styles.col}>Trade</div>
          </div>
          {transformedAssets.map((x, index) => {
            const isIncreasing =
              x.priceHistory?.length > 1 &&
              x.priceHistory[x.priceHistory.length - 1].price >
                x.priceHistory[0].price;

            const gradientId = `colorPrice-${index}`;
            const strokeColor = isIncreasing ? "#58BD7D" : "#FF6A55";
            const stopColor = isIncreasing ? "#45B36B" : "#FF6A55";
            return (
              <Link className={styles.row} to='/exchange' key={index}>
                <div className={styles.col}>{index + 1}</div>
                <div className={styles.col}>
                  <div className={styles.item}>
                    <div className={styles.icon}>
                      <img src={x.logoUrl} alt="Currency" />
                    </div>
                    <div className={styles.details}>
                      <span className={styles.subtitle}>{x.name} </span>
                      <span className={styles.currency}>{x.symbol}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.col}>${x.currentPrice}</div>
                <div className={styles.col}>
                  <div
                    className={
                      parseFloat(x.priceChange24h) >= 0
                        ? styles.positive
                        : styles.negative
                    }
                  >
                    {parseFloat(x.priceChange24h) >= 0 ? `+${x.priceChange24h}` : `${x.priceChange24h}`}
                  </div>
                </div>
                <div className={styles.col}>
                  <div className={styles.chart}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        width={500}
                        height={400}
                        data={x.priceHistory}
                        margin={{
                          top: 0,
                          right: 0,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id={gradientId}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={stopColor}
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="95%"
                              stopColor={stopColor}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke={strokeColor}
                          fillOpacity={1}
                          fill={`url(#${gradientId})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className={styles.col}>
                  <button
                    className={cn("button-stroke button-small", styles.button)}
                  >
                    Trade
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Learn;
