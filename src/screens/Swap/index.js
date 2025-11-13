import { useState } from "react";
import styles from "./swap.module.sass";
import cn from "classnames";
import Icon from "../../components/Icon";

const SwapPage = () => {
  const [fromToken, setFromToken] = useState({
    symbol: "XPR",
    name: "Proton",
    logo: "🟣",
    balance: 1250.5,
    price: 0.0125,
  });

  const [toToken, setToToken] = useState({
    symbol: "XUSDT",
    name: "Tether USD",
    logo: "💵",
    balance: 500.25,
    price: 1.0,
  });

  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [independentField, setIndependentField] = useState("from");

  // Mock price data
  const priceImpact = 0.02;
  const exchangeRate = (fromToken.price / toToken.price).toFixed(6);
  const minimumReceived = toAmount ? (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6) : "0";
  const liquidityProviderFee = fromAmount ? (parseFloat(fromAmount) * 0.003).toFixed(6) : "0";

  const handleFromAmountChange = (value) => {
    setFromAmount(value);
    setIndependentField("from");
    if (value && !isNaN(value)) {
      const calculated = (parseFloat(value) * fromToken.price) / toToken.price;
      setToAmount(calculated.toFixed(6));
    } else {
      setToAmount("");
    }
  };

  const handleToAmountChange = (value) => {
    setToAmount(value);
    setIndependentField("to");
    if (value && !isNaN(value)) {
      const calculated = (parseFloat(value) * toToken.price) / fromToken.price;
      setFromAmount(calculated.toFixed(6));
    } else {
      setFromAmount("");
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleMaxClick = () => {
    handleFromAmountChange(fromToken.balance.toString());
  };

  const handleSwap = () => {
    // TODO: Implement swap logic
    alert("Swap functionality will be implemented");
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.head}>
          <div className={styles.title}>Swap</div>
          <div className={styles.info}>Trade tokens in an instant</div>
        </div>

        {/* Main Swap Card */}
        <div className={styles.wrapper}>
          <div className={styles.card}>
            {/* Top Bar with Settings */}
            <div className={styles.top}>
              <div className={styles.line}>
                <div className={styles.subtitle}>Exchange</div>
                <div className={styles.actions}>
                  <button
                    className={cn(styles.action, "tooltip-bottom")}
                    data-tooltip="Refresh"
                    onClick={() => handleFromAmountChange(fromAmount)}
                  >
                    <Icon name="refresh" size="20" />
                  </button>
                  <button
                    className={cn(styles.action, { [styles.active]: showSettings })}
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Icon name="settings" size="20" />
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className={styles.settings}>
                <div className={styles.settingsTitle}>Transaction Settings</div>
                <div className={styles.field}>
                  <div className={styles.label}>Slippage Tolerance</div>
                  <div className={styles.slippageOptions}>
                    {[0.1, 0.5, 1.0].map((value) => (
                      <button
                        key={value}
                        className={cn(styles.slippageBtn, {
                          [styles.active]: slippage === value,
                        })}
                        onClick={() => setSlippage(value)}
                      >
                        {value}%
                      </button>
                    ))}
                    <input
                      type="number"
                      className={styles.customSlippage}
                      placeholder="Custom"
                      step="0.1"
                      min="0"
                      max="50"
                      onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* From Token Input */}
            <div className={styles.group}>
              <div className={styles.label}>From</div>
              <div className={styles.inputBox}>
                <input
                  type="number"
                  className={styles.input}
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0.0"
                />
                <div className={styles.tokenActions}>
                  <button className={styles.max} onClick={handleMaxClick}>
                    MAX
                  </button>
                  <button className={styles.tokenSelect}>
                    <div className={styles.tokenLogo}>{fromToken.logo}</div>
                    <div className={styles.tokenInfo}>
                      <div className={styles.tokenSymbol}>{fromToken.symbol}</div>
                    </div>
                    <Icon name="arrow-down" size="16" />
                  </button>
                </div>
              </div>
              <div className={styles.balance}>
                <span>Balance: {fromToken.balance.toFixed(4)}</span>
                {fromAmount && (
                  <span className={styles.usd}>
                    ~${(parseFloat(fromAmount) * fromToken.price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className={styles.switch}>
              <button className={styles.switchBtn} onClick={handleSwapTokens}>
                <Icon name="arrow-down" size="20" />
              </button>
            </div>

            {/* To Token Input */}
            <div className={styles.group}>
              <div className={styles.label}>To (estimated)</div>
              <div className={styles.inputBox}>
                <input
                  type="number"
                  className={styles.input}
                  value={toAmount}
                  onChange={(e) => handleToAmountChange(e.target.value)}
                  placeholder="0.0"
                />
                <div className={styles.tokenActions}>
                  <button className={styles.tokenSelect}>
                    <div className={styles.tokenLogo}>{toToken.logo}</div>
                    <div className={styles.tokenInfo}>
                      <div className={styles.tokenSymbol}>{toToken.symbol}</div>
                    </div>
                    <Icon name="arrow-down" size="16" />
                  </button>
                </div>
              </div>
              <div className={styles.balance}>
                <span>Balance: {toToken.balance.toFixed(4)}</span>
                {toAmount && (
                  <span className={styles.usd}>
                    ~${(parseFloat(toAmount) * toToken.price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Price Info */}
            {fromAmount && toAmount && (
              <div className={styles.priceInfo}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Rate</span>
                  <span className={styles.priceValue}>
                    1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
                  </span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Price Impact</span>
                  <span className={cn(styles.priceValue, {
                    [styles.warning]: priceImpact > 1,
                    [styles.success]: priceImpact <= 1,
                  })}>
                    {priceImpact > 0.01 ? priceImpact.toFixed(2) : "<0.01"}%
                  </span>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <button
              className={cn("button", styles.button)}
              disabled={!fromAmount || !toAmount}
              onClick={handleSwap}
            >
              {!fromAmount || !toAmount ? "Enter an amount" : "Swap"}
            </button>

            {/* Transaction Details */}
            {fromAmount && toAmount && (
              <div className={styles.details}>
                <div className={styles.detailsTitle}>Transaction Details</div>
                <div className={styles.detailsList}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Minimum Received</span>
                    <span className={styles.detailValue}>
                      {minimumReceived} {toToken.symbol}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Liquidity Provider Fee</span>
                    <span className={styles.detailValue}>
                      {liquidityProviderFee} {fromToken.symbol}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Route</span>
                    <span className={styles.detailValue}>
                      {fromToken.symbol} → {toToken.symbol}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Slippage Tolerance</span>
                    <span className={styles.detailValue}>{slippage}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.activity}>
          <div className={styles.activityHead}>
            <div className={styles.subtitle}>Recent Activity</div>
          </div>
          <div className={styles.activityList}>
            {[
              { from: "100 XPR", to: "1.25 XUSDT", time: "2 mins ago", status: "success" },
              { from: "50 XBTC", to: "1850 XUSDT", time: "15 mins ago", status: "success" },
              { from: "200 XPR", to: "2.50 XUSDT", time: "1 hour ago", status: "success" },
            ].map((tx, i) => (
              <div className={styles.activityItem} key={i}>
                <div className={styles.activityInfo}>
                  <div className={styles.activityText}>
                    {tx.from} → {tx.to}
                  </div>
                  <div className={styles.activityTime}>{tx.time}</div>
                </div>
                <div className={cn(styles.status, styles.statusSuccess)}>
                  <Icon name="check" size="12" />
                  Success
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;