import React, { useEffect, useState } from "react";
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
  // const [userBalance, setUserBalance] = useState([]);
  const [values, setValues] = useState([5]);

  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState("");

  const stepPrice = 5;
  const minPrice = 0;
  const maxPrice = 100;

  const { activeSession, walletConnected, connectWallet } = useWallet();
  const { userBalance, loadingTokens, refetchTokens } = useTokenBalance();
  const rpc = new JsonRpc(process.env.REACT_APP_PROTON_ENDPOINT);

  console.log('u', userBalance);

  useEffect(() => {
    if (orderType === "limit" && price && amount) {
      const priceValue = parseFloat(price);
      const amountValue = parseFloat(amount);

      if (!isNaN(priceValue) && !isNaN(amountValue)) {
        const totalValue = priceValue * amountValue;
        setTotal(totalValue.toFixed(5));
      }
    } else if (orderType === "stop-limit" && limitPrice && amount) {
      const limitValue = parseFloat(limitPrice);
      const amountValue = parseFloat(amount);

      if (!isNaN(limitValue) && !isNaN(amountValue)) {
        const totalValue = limitValue * amountValue;
        setTotal(totalValue.toFixed(5));
      }
    }
  }, [price, limitPrice, amount, orderType]);

  const handleSubmit = () => {
    let formData = {
      orderType: orderType,
      side: side,
    };

    if (orderType === "limit") {
      formData = {
        ...formData,
        price: price,
        amount: amount,
        total: total,
      };

      if (!price || !amount) {
        return alert("Please fill in all fields");
      }
    } else if (orderType === "stop-limit") {
      formData = {
        ...formData,
        stopPrice: stopPrice,
        limitPrice: limitPrice,
        amount: amount,
        total: total,
      };

      if (!stopPrice || !limitPrice || !amount) {
        return alert("Please fill in all fields");
      }
    } else if (orderType === "market") {
      if (side === "buy") {
        formData = {
          ...formData,
          total: total, // For market buy, user specifies quote amount
        };

        if (!total) {
          return alert("Please fill in total amount");
        }
      } else {
        formData = {
          ...formData,
          amount: amount, // For market sell, user specifies base amount
        };

        if (!amount) {
          return alert("Please fill in amount");
        }
      }
    }

    const displayData = formatData(formData);

    alert(displayData);

    console.log("Form Data:", formData);
  };

  const formatData = (data) => {
    let output = `📋 ORDER DATA FOR SMART CONTRACT\n`;
    output += `${"=".repeat(40)}\n\n`;

    output += `Order Type: ${data.orderType?.toUpperCase()}\n`;
    output += `Side: ${data.side?.toUpperCase()}\n\n`;

    if (data.orderType === "limit") {
      output += `🎯 LIMIT ORDER PARAMETERS:\n`;
      output += `- Price: ${data.price} XMD\n`;
      output += `- Amount: ${data.amount} XPR\n`;
      output += `- Total: ${data.total} XMD\n\n`;

      output += `📞 Smart Contract Action:\n`;
      output += `Action: limitorder\n`;
      output += `Parameters:\n`;
      output += `  user: "your_username"\n`;
      output += `  pair_id: 0\n`;
      output += `  side: "${data.side}"\n`;
      output += `  price: "${data.price} XMD"\n`;
      output += `  amount: "${data.amount} XPR"\n`;
    } else if (data.orderType === "stop-limit") {
      output += `🛑 STOP-LIMIT ORDER PARAMETERS:\n`;
      output += `- Stop Price (Trigger): ${data.stopPrice} XMD\n`;
      output += `- Limit Price: ${data.limitPrice} XMD\n`;
      output += `- Amount: ${data.amount} XPR\n`;
      output += `- Total: ${data.total} XMD\n\n`;

      output += `📞 Smart Contract Action:\n`;
      output += `Action: stoploss\n`;
      output += `Parameters:\n`;
      output += `  user: "your_username"\n`;
      output += `  pair_id: 0\n`;
      output += `  side: "${data.side}"\n`;
      output += `  trigger_price: "${data.stopPrice} XMD"\n`;
      output += `  limit_price: "${data.limitPrice} XMD"\n`;
      output += `  amount: "${data.amount} XPR"\n`;
    } else if (data.orderType === "market") {
      output += `⚡ MARKET ORDER PARAMETERS:\n`;

      if (data.side === "buy") {
        output += `- Amount to Spend: ${data.total} XMD\n\n`;

        output += `📞 Smart Contract Action:\n`;
        output += `Action: marketorder\n`;
        output += `Parameters:\n`;
        output += `  user: "your_username"\n`;
        output += `  pair_id: 0\n`;
        output += `  side: "buy"\n`;
        output += `  amount: "${data.total} XMD" (quote currency)\n`;
      } else {
        output += `- Amount to Sell: ${data.amount} XPR\n\n`;

        output += `📞 Smart Contract Action:\n`;
        output += `Action: marketorder\n`;
        output += `Parameters:\n`;
        output += `  user: "your_username"\n`;
        output += `  pair_id: 0\n`;
        output += `  side: "sell"\n`;
        output += `  amount: "${data.amount} XPR" (base currency)\n`;
      }
    }

    return output;
  };

  return (
    <>
      <div className={styles.head}>
        <div className={styles.title}>{title}</div>
        <div className={styles.counter}>
          <Icon name="wallet" size="16" /> {content}
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
            required
          />
          <div className={styles.currency}>USDT</div>
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
            required
          />
          <div className={styles.currency}>BTC</div>
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
            required
          />
          <div className={styles.currency}>USDT</div>
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
          required
        />
        <div className={styles.currency}>BTC</div>
      </label>
      <Range
        values={values}
        step={stepPrice}
        min={minPrice}
        max={maxPrice}
        onChange={(values) => setValues(values)}
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
          required
        />
        <div className={styles.currency}>BTC</div>
      </label>
      <button className={cn(classButton, styles.button)} onClick={handleSubmit}>
        {buttonText}
      </button>
    </>
  );
};

export default Action;
