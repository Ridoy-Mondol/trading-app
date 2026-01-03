import { useEffect, useState, useRef } from "react";
import cn from "classnames";
import styles from "./Action.module.sass";
import { Range, getTrackBackground } from "react-range";
import { JsonRpc } from "eosjs";
import { useWallet } from "../../../../../context/WalletContext";
import { useTokenBalance } from "../../../../../context/WalletBalance";
import Icon from "../../../../../components/Icon";

const Action = ({
  currentPair,
  title,
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

  // Ref to prevent infinite loops
  const isUpdatingRef = useRef(false);

  const stepPrice = 1;
  const minPrice = 0;
  const maxPrice = 100;

  const { activeSession, walletConnected, connectWallet } = useWallet();
  const { userBalance, loadingTokens, refetchTokens } = useTokenBalance();
  const rpc = new JsonRpc(process.env.REACT_APP_PROTON_ENDPOINT);

  // Token configurations
  const TOKEN_BASE = {
    contract: currentPair?.base_contract,
    symbol: currentPair?.base_symbol?.split(",")[1],
    precision: currentPair?.base_symbol?.split(",")[0],
  };

  const TOKEN_QUOTE = {
    contract: currentPair?.quote_contract,
    symbol: currentPair?.quote_symbol.split(",")[1],
    precision: currentPair?.quote_symbol.split(",")[0],
  };

  const DEX_CONTRACT = "orderbook";
  const PAIR_ID = currentPair?.pair_id;
  const BASE_TOKEN = TOKEN_BASE;
  const QUOTE_TOKEN = TOKEN_QUOTE;

  // Fetch balance based on side
  useEffect(() => {
    if (!userBalance || userBalance.length === 0) {
      setAvailableBalance("0");
      return;
    }

    // Buy side → Quote balance
    // Sell side → Base balance
    const targetSymbol =
      side === "buy" ? QUOTE_TOKEN.symbol : BASE_TOKEN.symbol;

    const tokenBalance = userBalance.find(
      (balance) => balance.symbol === targetSymbol
    );

    if (tokenBalance && tokenBalance.amount) {
      setAvailableBalance(tokenBalance.amount.toString());
    } else {
      setAvailableBalance("0");
    }
  }, [userBalance, side, QUOTE_TOKEN.symbol, BASE_TOKEN.symbol]);

  // ============================================
  // CALCULATION FUNCTIONS
  // ============================================

  // Get the relevant price for calculations
  const getRelevantPrice = () => {
    if (orderType === "limit") {
      return parseFloat(price);
    } else if (orderType === "stop-limit") {
      return parseFloat(limitPrice);
    } else {
      // Market order - would need market price from orderbook
      // For now, return 0 to indicate no price available
      return 2;
    }
  };

  // Update slider based on value
  const updateSliderFromValue = (value) => {
    const balance = parseFloat(availableBalance);
    if (balance <= 0 || isNaN(value) || value <= 0) {
      setValues([0]);
      return;
    }
    const percentage = (value / balance) * 100;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    setValues([clampedPercentage]);
  };

  // ============================================
  // SLIDER CHANGE HANDLER
  // ============================================

  const handleSliderChange = (newValues) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    setValues(newValues);

    const percentage = newValues[0] / 100;
    const balance = parseFloat(availableBalance);

    if (balance <= 0 || isNaN(balance)) {
      isUpdatingRef.current = false;
      return;
    }

    if (side === "buy") {
      // BUY: Slider updates TOTAL (quote currency)
      const calculatedTotal = balance * percentage;
      setTotal(calculatedTotal.toFixed(QUOTE_TOKEN.precision));

      // Recalculate AMOUNT from total and price
      const relevantPrice = getRelevantPrice();
      if (relevantPrice > 0) {
        const calculatedAmount = calculatedTotal / relevantPrice;
        setAmount(calculatedAmount.toFixed(BASE_TOKEN.precision));
      } else {
        // No price available, clear amount
        setAmount("");
      }
    } else {
      // SELL: Slider updates AMOUNT (base currency)
      const calculatedAmount = balance * percentage;
      setAmount(calculatedAmount.toFixed(BASE_TOKEN.precision));

      // Recalculate TOTAL from amount and price
      const relevantPrice = getRelevantPrice();
      if (relevantPrice > 0) {
        const calculatedTotal = calculatedAmount * relevantPrice;
        setTotal(calculatedTotal.toFixed(QUOTE_TOKEN.precision));
      } else {
        // No price available, clear total
        setTotal("");
      }
    }

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  // ============================================
  // PRICE CHANGE HANDLERS
  // ============================================

  const handlePriceChange = (value) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    setPrice(value);

    const priceValue = parseFloat(value);
    const amountValue = parseFloat(amount);
    const totalValue = parseFloat(total);

    if (orderType === "limit") {
      if (side === "buy") {
        if (!isNaN(amountValue) && amountValue > 0) {
          const newTotal = amountValue * priceValue;
          setTotal(newTotal.toFixed(QUOTE_TOKEN.precision));
          updateSliderFromValue(newTotal);
        }
        // BUY: Total is primary, recalculate amount
        else if (
          !isNaN(totalValue) &&
          totalValue > 0 &&
          !isNaN(priceValue) &&
          priceValue > 0
        ) {
          const newAmount = totalValue / priceValue;
          setAmount(newAmount.toFixed(BASE_TOKEN.precision));
        } else if (isNaN(priceValue) || priceValue <= 0) {
          setAmount("");
        }
      } else {
        // SELL: Amount is primary, recalculate total
        if (
          !isNaN(amountValue) &&
          amountValue > 0 &&
          !isNaN(priceValue) &&
          priceValue > 0
        ) {
          const newTotal = amountValue * priceValue;
          setTotal(newTotal.toFixed(QUOTE_TOKEN.precision));
        } else if (isNaN(priceValue) || priceValue <= 0) {
          setTotal("");
        }
      }
    }

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  const handleLimitPriceChange = (value) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    setLimitPrice(value);

    const limitValue = parseFloat(value);
    const amountValue = parseFloat(amount);
    const totalValue = parseFloat(total);

    if (orderType === "stop-limit") {
      if (side === "buy") {
        // BUY: if amount exists → recalc total + slider
        if (!isNaN(amountValue) && amountValue > 0) {
          const newTotal = amountValue * limitValue;
          setTotal(newTotal.toFixed(QUOTE_TOKEN.precision));
          updateSliderFromValue(newTotal);
        }
        // BUY: Total is primary, recalculate amount
        else if (
          !isNaN(totalValue) &&
          totalValue > 0 &&
          !isNaN(limitValue) &&
          limitValue > 0
        ) {
          const newAmount = totalValue / limitValue;
          setAmount(newAmount.toFixed(BASE_TOKEN.precision));
        } else if (isNaN(limitValue) || limitValue <= 0) {
          setAmount("");
        }
      } else {
        // SELL: Amount is primary, recalculate total
        if (
          !isNaN(amountValue) &&
          amountValue > 0 &&
          !isNaN(limitValue) &&
          limitValue > 0
        ) {
          const newTotal = amountValue * limitValue;
          setTotal(newTotal.toFixed(QUOTE_TOKEN.precision));
        } else if (isNaN(limitValue) || limitValue <= 0) {
          setTotal("");
        }
      }
    }

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  // ============================================
  // AMOUNT CHANGE HANDLER
  // ============================================

  const handleAmountChange = (value) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    setAmount(value);

    const amountValue = parseFloat(value);
    const relevantPrice = getRelevantPrice();

    if (side === "buy") {
      // BUY: Amount changes → Update total, then slider from total
      if (!isNaN(amountValue) && amountValue > 0 && relevantPrice > 0) {
        const newTotal = amountValue * relevantPrice;
        setTotal(newTotal.toFixed(QUOTE_TOKEN.precision));
        // Update slider from total
        updateSliderFromValue(newTotal);
      } else {
        setTotal("");
        setValues([0]);
      }
    } else {
      // SELL: Amount changes → Update total and slider
      if (!isNaN(amountValue) && amountValue > 0) {
        if (relevantPrice > 0) {
          const newTotal = amountValue * relevantPrice;
          setTotal(newTotal.toFixed(QUOTE_TOKEN.precision));
        }
        // Update slider from amount
        updateSliderFromValue(amountValue);
      } else {
        setTotal("");
        setValues([0]);
      }
    }

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  // ============================================
  // TOTAL CHANGE HANDLER
  // ============================================

  const handleTotalChange = (value) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    setTotal(value);

    const totalValue = parseFloat(value);
    const relevantPrice = getRelevantPrice();

    if (side === "buy") {
      // BUY: Total changes → Update amount and slider
      if (!isNaN(totalValue) && totalValue > 0) {
        if (relevantPrice > 0) {
          const newAmount = totalValue / relevantPrice;
          setAmount(newAmount.toFixed(BASE_TOKEN.precision));
        }
        // Update slider from total
        updateSliderFromValue(totalValue);
      } else {
        setAmount("");
        setValues([0]);
      }
    } else {
      // SELL: Total changes → Update amount, then slider from amount
      if (!isNaN(totalValue) && totalValue > 0 && relevantPrice > 0) {
        const newAmount = totalValue / relevantPrice;
        setAmount(newAmount.toFixed(BASE_TOKEN.precision));
        // Update slider from amount
        updateSliderFromValue(newAmount);
      } else {
        setAmount("");
        setValues([0]);
      }
    }

    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  // ============================================
  // FORMAT & SUBMIT
  // ============================================

  const formatAsset = (amount, precision, symbol) => {
    const value = parseFloat(amount).toFixed(precision);
    return `${value} ${symbol}`;
  };

  const handleSubmit = async () => {
    if (!walletConnected) {
      connectWallet();
      return;
    }

    // Validation
    if (orderType === "limit") {
      if (!price || !amount) {
        return alert("Please fill in Price and Amount");
      }

      const amountValue = parseFloat(amount);
      if (amountValue < 0.00000001) {
        return alert(`Amount must be at least 0.00000001 ${BASE_TOKEN.symbol}`);
      }
      if (amountValue > 100) {
        return alert(`Amount cannot exceed 100 ${BASE_TOKEN.symbol}`);
      }

      const priceValue = parseFloat(price);
      const tickSize = 0.001;
      if ((priceValue * 1000) % (tickSize * 1000) !== 0) {
        return alert(
          `Price must be a multiple of ${tickSize} ${QUOTE_TOKEN.symbol}`
        );
      }
    } else if (orderType === "stop-limit") {
      if (!stopPrice || !limitPrice || !amount) {
        return alert("Please fill in Stop, Limit, and Amount");
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

      const depositToken = side === "buy" ? QUOTE_TOKEN : BASE_TOKEN;
      let depositAmount;

      if (side === "buy") {
        depositAmount = total;
      } else {
        depositAmount = amount;
      }

      // ACTION 1: Deposit
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

      // ACTION 2: Place order
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

      // ACTION 3: Process limit orders
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

      // ACTION 4: Process stop-loss queue
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

      // ACTION 5: Withdraw all
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

      const result = await activeSession.transact(
        {
          actions,
        },
        {
          broadcast: true,
        }
      );

      const orderTypeDisplay =
        orderType === "stop-limit"
          ? "Stop-Loss"
          : orderType.charAt(0).toUpperCase() + orderType.slice(1);
      const sideDisplay = side.charAt(0).toUpperCase() + side.slice(1);

      alert(
        `✅ ${orderTypeDisplay} ${sideDisplay} Order Placed!\n\nTX: ${result.processed.id}`
      );

      setPrice("");
      setStopPrice("");
      setLimitPrice("");
      setAmount("");
      setTotal("");
      setValues([0]);
      setLoading(false);

      await refetchTokens();
    } catch (e) {
      console.error("❌ Order failed:", e);
      alert(`Failed: ${e.message || e}`);
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
            onChange={(e) => handlePriceChange(e.target.value)}
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
            onChange={(e) => handleLimitPriceChange(e.target.value)}
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
          onChange={(e) => handleAmountChange(e.target.value)}
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
        renderMark={({ props, index }) => {
          const { key, ...rest } = props;
          return (
            <div
              key={key}
              {...rest}
              style={{
                ...rest.style,
                height: "6px",
                width: "2px",
                marginTop: "-2px",
                borderRadius: "1px",
                backgroundColor:
                  index * stepPrice < values[0] ? "#3772FF" : "#E6E8EC",
              }}
            />
          );
        }}
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
        renderThumb={({ props }) => {
          const { key, ...rest} = props
          return (
            <div
              key={key}
              {...rest}
              style={{
                ...rest.style,
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
          );
        }}
      />

      <label className={styles.field}>
        <div className={styles.label}>Total</div>
        <input
          className={styles.input}
          type="number"
          name="total"
          value={total}
          onChange={(e) => handleTotalChange(e.target.value)}
          placeholder="0.000000"
          step="0.000001"
          disabled={loading || (orderType === "market" && side === "sell")}
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
