import { useState } from "react";
import styles from "./swap.module.sass";
import cn from "classnames";
import Icon from "../../components/Icon";
import { Repeat, ArrowUpDown } from "lucide-react";
import { MdRefresh, MdSettings } from "react-icons/md";

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
  const [showDetails, setShowDetails] = useState(false);

  // Mock price data
  const priceImpact = 0.02;
  const exchangeRate = (fromToken.price / toToken.price).toFixed(6);
  const minimumReceived = toAmount
    ? (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)
    : "0";
  const liquidityProviderFee = fromAmount
    ? (parseFloat(fromAmount) * 0.003).toFixed(6)
    : "0";

  const handleFromAmountChange = (value) => {
    setFromAmount(value);
    if (value && !isNaN(value)) {
      const calculated = (parseFloat(value) * fromToken.price) / toToken.price;
      setToAmount(calculated.toFixed(6));
    } else {
      setToAmount("");
    }
  };

  const handleToAmountChange = (value) => {
    setToAmount(value);
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
    alert("Swap functionality will be implemented");
  };

  return (
    <div className={styles.swap}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Main Swap Card */}
          <div className={styles.main}>
            <div className={styles.card}>
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <Repeat size={20} />
                  <span>Exchange</span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={cn(styles.iconBtn, "tooltip-bottom")}
                    data-tooltip="Refresh price"
                  >
                    <MdRefresh size={20} />
                  </button>
                  <button
                    className={cn(styles.iconBtn, {
                      [styles.active]: showSettings,
                    })}
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <MdSettings size={20} />
                  </button>
                </div>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className={styles.settings}>
                  <div className={styles.settingsRow}>
                    <div className={styles.settingsLabel}>
                      <Icon name="lightning" size="16" />
                      Slippage Tolerance
                    </div>
                    <div className={styles.slippageGroup}>
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
                        className={styles.slippageInput}
                        placeholder="Custom"
                        onChange={(e) =>
                          setSlippage(parseFloat(e.target.value) || 0.5)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* From Token */}
              <div className={styles.tokenBox}>
                <div className={styles.tokenHeader}>
                  <span className={styles.tokenLabel}>From</span>
                  <div className={styles.tokenBalance}>
                    <Icon name="wallet" size="14" />
                    Balance: {fromToken.balance.toFixed(4)}
                  </div>
                </div>
                <div className={styles.tokenInput}>
                  <input
                    type="number"
                    className={styles.amountInput}
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.00"
                  />
                  <div className={styles.tokenRight}>
                    <button className={styles.maxBtn} onClick={handleMaxClick}>
                      MAX
                    </button>
                    <button className={styles.tokenBtn}>
                      <span className={styles.tokenIcon}>{fromToken.logo}</span>
                      <div className={styles.tokenMeta}>
                        <div className={styles.tokenSymbol}>
                          {fromToken.symbol}
                        </div>
                      </div>
                      <Icon name="arrow-down" size="16" />
                    </button>
                  </div>
                </div>
                {fromAmount && (
                  <div className={styles.tokenUsd}>
                    ≈ ${(parseFloat(fromAmount) * fromToken.price).toFixed(2)}{" "}
                    USD
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className={styles.swapButtonWrapper}>
                <button className={styles.swapIcon} onClick={handleSwapTokens}>
                  <ArrowUpDown size={24} />
                </button>
              </div>

              {/* To Token */}
              <div className={styles.tokenBox}>
                <div className={styles.tokenHeader}>
                  <span className={styles.tokenLabel}>To</span>
                  <div className={styles.tokenBalance}>
                    <Icon name="wallet" size="14" />
                    Balance: {toToken.balance.toFixed(4)}
                  </div>
                </div>
                <div className={styles.tokenInput}>
                  <input
                    type="number"
                    className={styles.amountInput}
                    value={toAmount}
                    onChange={(e) => handleToAmountChange(e.target.value)}
                    placeholder="0.00"
                  />
                  <div className={styles.tokenRight}>
                    <button className={styles.tokenBtn}>
                      <span className={styles.tokenIcon}>{toToken.logo}</span>
                      <div className={styles.tokenMeta}>
                        <div className={styles.tokenSymbol}>
                          {toToken.symbol}
                        </div>
                      </div>
                      <Icon name="arrow-down" size="16" />
                    </button>
                  </div>
                </div>
                {toAmount && (
                  <div className={styles.tokenUsd}>
                    ≈ ${(parseFloat(toAmount) * toToken.price).toFixed(2)} USD
                  </div>
                )}
              </div>

              {/* Price Info */}
              {fromAmount && toAmount && (
                <div className={styles.priceCard}>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Rate</span>
                    <div className={styles.priceValue}>
                      <span>
                        1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
                      </span>
                      <MdRefresh size={14} />
                    </div>
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Price Impact</span>
                    <span className={cn(styles.priceValue, styles.impact)}>
                      <span
                        className={cn(styles.impactBadge, {
                          [styles.low]: priceImpact < 1,
                          [styles.medium]: priceImpact >= 1 && priceImpact < 3,
                          [styles.high]: priceImpact >= 3,
                        })}
                      >
                        {priceImpact > 0.01 ? priceImpact.toFixed(2) : "<0.01"}%
                      </span>
                    </span>
                  </div>
                  <button
                    className={styles.detailsToggle}
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    <span>{showDetails ? "Hide" : "Show"} details</span>
                    <span
                      style={{
                        display: "inline-block",
                        transform: showDetails
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <Icon name="arrow-down" size="16" />
                    </span>
                  </button>
                </div>
              )}

              {/* Expandable Details */}
              {showDetails && fromAmount && toAmount && (
                <div className={styles.details}>
                  <div className={styles.detailRow}>
                    <span>Minimum received</span>
                    <span>
                      {minimumReceived} {toToken.symbol}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Liquidity Provider Fee</span>
                    <span>
                      {liquidityProviderFee} {fromToken.symbol}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Route</span>
                    <span>
                      {fromToken.symbol} → {toToken.symbol}
                    </span>
                  </div>
                </div>
              )}

              {/* Swap Action Button */}
              <button
                className={cn("button", styles.swapButton)}
                disabled={!fromAmount || !toAmount}
                onClick={handleSwap}
              >
                {!fromAmount || !toAmount ? "Enter amount" : "Swap Tokens"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;
