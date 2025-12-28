import React, { act, memo, useEffect, useState } from "react";
import cn from "classnames";
import styles from "./Action.module.sass";
import { Range, getTrackBackground } from "react-range";
import { JsonRpc } from "eosjs";
import { useWallet } from "../../../../../context/WalletContext";
import { useTokenBalance } from "../../../../../context/WalletBalance";
import Icon from "../../../../../components/Icon";

const Action = ({
  title,
  content,
  price: showPrice,
  stop: showStop,
  limit: showLimit,
  classButton,
  buttonText,
  orderType, // "limit", "stop-limit", "market"
  side, // "buy" or "sell"
}) => {
  const [values, setValues] = useState([0]);
  const [loading, setLoading] = useState(false);

  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState("");

  const [availableBalance, setAvailableBalance] = useState("0");

  const stepPrice = 5;
  const minPrice = 0;
  const maxPrice = 100;

  const { activeSession, walletConnected, connectWallet } = useWallet();
  const { userBalance, loadingTokens, refetchTokens } = useTokenBalance();
  const rpc = new JsonRpc(process.env.REACT_APP_PROTON_ENDPOINT);

  // Token configurations - MUST be defined BEFORE useEffect
  const TOKEN_XBTC = {
    contract: "xtokens",
    symbol: "XBTC",
    precision: 8,
  };

  const TOKEN_XUSDT = {
    contract: "xtokens",
    symbol: "XUSDT",
    precision: 6,
  };

  const DEX_CONTRACT = "orderbook";
  const PAIR_ID = 0;
  const BASE_TOKEN = TOKEN_XBTC;
  const QUOTE_TOKEN = TOKEN_XUSDT;

  console.log("u", userBalance);
  console.log("a", availableBalance);

  useEffect(() => {
    console.log("userBalance:", userBalance); // Debug log
    console.log("side:", side); // Debug log

    if (!userBalance || userBalance.length === 0) {
      console.log("No balance data");
      setAvailableBalance("0");
      return;
    }

    // Determine which token balance to show based on side
    const targetSymbol =
      side === "buy" ? QUOTE_TOKEN.symbol : BASE_TOKEN.symbol;

    console.log("Looking for symbol:", targetSymbol);

    const tokenBalance = userBalance.find(
      (balance) => balance.symbol === targetSymbol
    );

    console.log("Found balance:", tokenBalance);

    if (tokenBalance && tokenBalance.amount) {
      setAvailableBalance(tokenBalance.amount.toString());
    } else {
      setAvailableBalance("0");
    }
  }, [userBalance, side, QUOTE_TOKEN.symbol, BASE_TOKEN.symbol]);

  // Calculate total when price or amount changes (for limit and stop-limit)
  useEffect(() => {
    if (orderType === "limit" && price && amount) {
      const priceValue = parseFloat(price);
      const amountValue = parseFloat(amount);

      if (!isNaN(priceValue) && !isNaN(amountValue)) {
        const totalValue = priceValue * amountValue;
        setTotal(totalValue.toFixed(QUOTE_TOKEN.precision));
      }
    } else if (orderType === "stop-limit" && limitPrice && amount) {
      const limitValue = parseFloat(limitPrice);
      const amountValue = parseFloat(amount);

      if (!isNaN(limitValue) && !isNaN(amountValue)) {
        const totalValue = limitValue * amountValue;
        setTotal(totalValue.toFixed(QUOTE_TOKEN.precision));
      }
    }
  }, [price, limitPrice, amount, orderType]);

  const handleSliderChange = (newValues) => {
    setValues(newValues);
    const percentage = newValues[0] / 100;
    const balance = parseFloat(availableBalance);

    console.log("Slider change:", { percentage, balance, side, orderType }); // Debug

    if (balance <= 0 || isNaN(balance)) {
      return;
    }

    if (orderType === "limit") {
      if (side === "buy") {
        // Buy: Calculate amount from price
        const priceValue = parseFloat(price);
        if (!isNaN(priceValue) && priceValue > 0) {
          const availableQuote = balance * percentage;
          const calculatedAmount = availableQuote / priceValue;
          setAmount(calculatedAmount.toFixed(BASE_TOKEN.precision));
          setTotal(availableQuote.toFixed(QUOTE_TOKEN.precision));
        } else {
          // No price set, just set total
          const availableQuote = balance * percentage;
          setTotal(availableQuote.toFixed(QUOTE_TOKEN.precision));
        }
      } else {
        // ✅ FIX: Sell side for limit orders
        const availableBase = balance * percentage;
        setAmount(availableBase.toFixed(BASE_TOKEN.precision));

        const priceValue = parseFloat(price);
        if (!isNaN(priceValue) && priceValue > 0) {
          const calculatedTotal = availableBase * priceValue;
          setTotal(calculatedTotal.toFixed(QUOTE_TOKEN.precision));
        }
      }
    } else if (orderType === "stop-limit") {
      if (side === "buy") {
        const limitValue = parseFloat(limitPrice);
        if (!isNaN(limitValue) && limitValue > 0) {
          const availableQuote = balance * percentage;
          const calculatedAmount = availableQuote / limitValue;
          setAmount(calculatedAmount.toFixed(BASE_TOKEN.precision));
          setTotal(availableQuote.toFixed(QUOTE_TOKEN.precision));
        } else {
          const availableQuote = balance * percentage;
          setTotal(availableQuote.toFixed(QUOTE_TOKEN.precision));
        }
      } else {
        const availableBase = balance * percentage;
        setAmount(availableBase.toFixed(BASE_TOKEN.precision));

        const limitValue = parseFloat(limitPrice);
        if (!isNaN(limitValue) && limitValue > 0) {
          const calculatedTotal = availableBase * limitValue;
          setTotal(calculatedTotal.toFixed(QUOTE_TOKEN.precision));
        }
      }
    } else if (orderType === "market") {
      if (side === "buy") {
        const availableQuote = balance * percentage;
        setTotal(availableQuote.toFixed(QUOTE_TOKEN.precision));
      } else {
        const availableBase = balance * percentage;
        setAmount(availableBase.toFixed(BASE_TOKEN.precision));
      }
    }
  };

  // Update slider when amount/total changes manually
  useEffect(() => {
    const balance = parseFloat(availableBalance);
    if (balance <= 0 || isNaN(balance)) return;

    let currentValue = 0;

    if (side === "buy") {
      const totalValue = parseFloat(total);
      if (!isNaN(totalValue) && totalValue > 0) {
        currentValue = (totalValue / balance) * 100;
      }
    } else {
      const amountValue = parseFloat(amount);
      if (!isNaN(amountValue) && amountValue > 0) {
        currentValue = (amountValue / balance) * 100;
      }
    }

    currentValue = Math.min(Math.max(currentValue, 0), 100);

    if (Math.abs(currentValue - values[0]) > 0.1) {
      setValues([currentValue]);
    }
  }, [amount, total, availableBalance, side, values]);

  const formatAsset = (amount, precision, symbol) => {
    const value = parseFloat(amount).toFixed(precision);
    return `${value} ${symbol}`;
  };

  const handleSubmit = async () => {
    if (!walletConnected) {
      connectWallet();
      return;
    }

    if (orderType === "limit") {
      if (!price || !amount) {
        return alert("Please fill in all fields");
      }

      const amountValue = parseFloat(amount);
      if (amountValue < 0.00000001) {
        return alert(`Amount must be at least 0.00000001 ${BASE_TOKEN.symbol}`);
      }
      if (amountValue > 100) {
        return alert(`Amount cannot exceed 100 ${BASE_TOKEN.symbol}`);
      }

      // Validate tick size
      const priceValue = parseFloat(price);
      const tickSize = 0.001;
      if ((priceValue * 1000) % (tickSize * 1000) !== 0) {
        return alert(
          `Price must be a multiple of ${tickSize} ${QUOTE_TOKEN.symbol}`
        );
      }
    } else if (orderType === "stop-limit") {
      if (!stopPrice || !limitPrice || !amount) {
        return alert("Please fill in all fields");
      }

      const amountValue = parseFloat(amount);
      if (amountValue < 0.00000001 || amountValue > 100) {
        return alert(
          `Amount must be between 0.00000001 and 100 ${BASE_TOKEN.symbol}`
        );
      }

      const stopValue = parseFloat(stopPrice);
      const limitValue = parseFloat(limitPrice);
      const tickSize = 0.001;

      if ((stopValue * 1000) % (tickSize * 1000) !== 0) {
        return alert(
          `Stop price must be a multiple of ${tickSize} ${QUOTE_TOKEN.symbol}`
        );
      }
      if ((limitValue * 1000) % (tickSize * 1000) !== 0) {
        return alert(
          `Limit price must be a multiple of ${tickSize} ${QUOTE_TOKEN.symbol}`
        );
      }
    } else if (orderType === "market") {
      if (side === "buy" && !total) {
        return alert("Please fill in Total amount to spend");
      }
      if (side === "sell" && !amount) {
        return alert("Please fill in Amount to sell");
      }

      if (side === "sell") {
        const amountValue = parseFloat(amount);
        if (amountValue < 0.00000001 || amountValue > 100) {
          return alert(
            `Amount must be between 0.00000001 and 100 ${BASE_TOKEN.symbol}`
          );
        }
      }
    }

    setLoading(true);

    try {
      const actions = [];

      // Determine which token to deposit based on side
      const depositToken = side === "buy" ? QUOTE_TOKEN : BASE_TOKEN;
      let depositAmount;

      if (side === "buy") {
        // For buy orders, deposit quote currency
        depositAmount = orderType === "market" ? total : total;
      } else {
        // For sell orders, deposit base currency
        depositAmount = amount;
      }

      // ACTION 1: Deposit token to DEX
      actions.push({
        account: depositToken.contract,
        name: "transfer",
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          from: activeSession.auth.actor.toString(),
          to: DEX_CONTRACT,
          quantity: formatAsset(
            depositAmount,
            depositToken.precision,
            depositToken.symbol
          ),
          memo: "deposit",
        },
      });

      // ACTION 2: Place order based on type
      if (orderType === "limit") {
        actions.push({
          account: DEX_CONTRACT,
          name: "limitorder",
          authorization: [
            {
              actor: activeSession.auth.actor.toString(),
              permission: activeSession.auth.permission.toString(),
            },
          ],
          data: {
            user: activeSession.auth.actor.toString(),
            pair_id: PAIR_ID,
            side: side,
            price: formatAsset(
              price,
              QUOTE_TOKEN.precision,
              QUOTE_TOKEN.symbol
            ),
            amount: formatAsset(
              amount,
              BASE_TOKEN.precision,
              BASE_TOKEN.symbol
            ),
          },
        });
      } else if (orderType === "stop-limit") {
        actions.push({
          account: DEX_CONTRACT,
          name: "stoploss",
          authorization: [
            {
              actor: activeSession.auth.actor.toString(),
              permission: activeSession.auth.permission.toString(),
            },
          ],
          data: {
            user: activeSession.auth.actor.toString(),
            pair_id: PAIR_ID,
            side: side,
            trigger_price: formatAsset(
              stopPrice,
              QUOTE_TOKEN.precision,
              QUOTE_TOKEN.symbol
            ),
            limit_price: formatAsset(
              limitPrice,
              QUOTE_TOKEN.precision,
              QUOTE_TOKEN.symbol
            ),
            amount: formatAsset(
              amount,
              BASE_TOKEN.precision,
              BASE_TOKEN.symbol
            ),
          },
        });
      } else if (orderType === "market") {
        const marketAmount =
          side === "buy"
            ? formatAsset(total, QUOTE_TOKEN.precision, QUOTE_TOKEN.symbol)
            : formatAsset(amount, BASE_TOKEN.precision, BASE_TOKEN.symbol);

        actions.push({
          account: DEX_CONTRACT,
          name: "marketorder",
          authorization: [
            {
              actor: activeSession.auth.actor.toString(),
              permission: activeSession.auth.permission.toString(),
            },
          ],
          data: {
            user: activeSession.auth.actor.toString(),
            pair_id: PAIR_ID,
            side: side,
            amount: marketAmount,
          },
        });
      }

      // ACTION 3: Process limit orders (30 orders)
      actions.push({
        account: DEX_CONTRACT,
        name: "processlimit",
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          pair_id: PAIR_ID,
          max_orders: 30,
        },
      });

      // ACTION 4: Process stop-loss/take-profit queue (10 orders)
      actions.push({
        account: DEX_CONTRACT,
        name: "processsltpq",
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          pair_id: PAIR_ID,
          max_orders: 10,
        },
      });

      // ACTION 5: Withdraw all funds from DEX
      actions.push({
        account: DEX_CONTRACT,
        name: "withdrawall",
        authorization: [
          {
            actor: activeSession.auth.actor.toString(),
            permission: activeSession.auth.permission.toString(),
          },
        ],
        data: {
          user: activeSession.auth.actor.toString(),
        },
      });

      // Execute transaction
      const result = await activeSession.transact(
        {
          actions,
        },
        {
          broadcast: true,
        }
      );

      alert(`${orderType} order placed successfully for ${side}`);

      // Reset form
      setPrice("");
      setStopPrice("");
      setLimitPrice("");
      setAmount("");
      setTotal("");
      setValues([5]);
      setLoading(false);

      await refetchTokens();
    } catch (e) {
      console.error("❌ Order failed:", e);
      alert("Failed to place order");
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.head}>
        <div className={styles.title}>{title}</div>
        <div className={styles.counter}>
          <Icon name="wallet" size="16" /> {availableBalance}{" "}
          {side === "buy" ? QUOTE_TOKEN.symbol : BASE_TOKEN.symbol}
        </div>
      </div>

      {showPrice && (
        <label className={styles.field}>
          <div className={styles.label}>Price</div>
          <input
            className={styles.input}
            type="number"
            name="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.001"
            step="0.001"
            disabled={loading}
            required
          />
          <div className={styles.currency}>{QUOTE_TOKEN.symbol}</div>
        </label>
      )}

      {showStop && (
        <label className={styles.field}>
          <div className={styles.label}>Stop</div>
          <input
            className={styles.input}
            type="number"
            name="stop"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            placeholder="0.001"
            step="0.001"
            disabled={loading}
            required
          />
          <div className={styles.currency}>{QUOTE_TOKEN.symbol}</div>
        </label>
      )}

      {showLimit && (
        <label className={styles.field}>
          <div className={styles.label}>Limit</div>
          <input
            className={styles.input}
            type="number"
            name="limit"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder="0.001"
            step="0.001"
            disabled={loading}
            required
          />
          <div className={styles.currency}>{QUOTE_TOKEN.symbol}</div>
        </label>
      )}

      <label className={styles.field}>
        <div className={styles.label}>Amount</div>
        <input
          className={styles.input}
          type="number"
          name="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00000001"
          step="0.00000001"
          disabled={loading}
          required
        />
        <div className={styles.currency}>{BASE_TOKEN.symbol}</div>
      </label>
      <Range
        values={values}
        step={stepPrice}
        min={minPrice}
        max={maxPrice}
        onChange={handleSliderChange}
        renderMark={({ props, index }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: "6px",
              width: "2px",
              marginTop: "-2px",
              borderRadius: "1px",
              backgroundColor:
                index * stepPrice < values[0] ? "#3772FF" : "#E6E8EC",
            }}
          />
        )}
        renderTrack={({ props, children }) => (
          <div
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={{
              ...props.style,
              height: "36px",
              display: "flex",
              width: "100%",
            }}
          >
            <div
              ref={props.ref}
              style={{
                height: "2px",
                width: "100%",
                borderRadius: "1px",
                background: getTrackBackground({
                  values,
                  colors: ["#3772FF", "#E6E8EC"],
                  min: minPrice,
                  max: maxPrice,
                }),
                alignSelf: "center",
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: "18px",
              width: "18px",
              borderRadius: "50%",
              backgroundColor: "#F4F5F6",
              border: "4px solid #777E90",
              boxShadow: "0px 8px 16px -8px rgba(15, 15, 15, 0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-27px",
                color: "#FCFCFD",
                fontWeight: "600",
                fontSize: "13px",
                lineHeight: "16px",
                fontFamily: "Poppins",
                padding: "2px 6px",
                borderRadius: "6px",
                backgroundColor: "#777E90",
              }}
            >
              {values[0].toFixed(0)}%
            </div>
          </div>
        )}
      />

      <label className={styles.field}>
        <div className={styles.label}>Total</div>
        <input
          className={styles.input}
          type="number"
          name="total"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          placeholder="0.000000"
          step="0.000001"
          disabled={loading}
          required
        />
        <div className={styles.currency}>{QUOTE_TOKEN.symbol}</div>
      </label>

      <button
        className={cn(classButton, styles.button)}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Processing..." : buttonText}
      </button>
    </>
  );
};

export default Action;
