import { useState } from "react";
import { X, AlertCircle, TrendingDown, Settings, Info } from "lucide-react";
import styles from "./RemoveLiquidityModal.module.sass";
import cn from "classnames";

const RemoveLiquidityModal = ({
  show,
  onClose,
  pool,
  userPosition,
  onRemove,
  renderTokenLogo,
  accountName,
}) => {
  const [removePercentage, setRemovePercentage] = useState(100);
  const [slippage, setSlippage] = useState(0.5);
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [customSlippage, setCustomSlippage] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);

  // Calculate amounts based on percentage
  const liquidityToRemove = Math.floor(
    (userPosition.lp_balance * removePercentage) / 100
  );

  const amount0 = Math.floor(
    (liquidityToRemove * pool.reserve0) / pool.lp_supply
  );

  const amount1 = Math.floor(
    (liquidityToRemove * pool.reserve1) / pool.lp_supply
  );

  // Calculate minimum amounts with slippage
  const amount0Min = Math.floor(amount0 * (1 - slippage / 100));
  const amount1Min = Math.floor(amount1 * (1 - slippage / 100));

  // Token precision
  const token0Precision = parseInt(pool.token0_symbol.split(",")[0]) || 4;
  const token1Precision = parseInt(pool.token1_symbol.split(",")[0]) || 4;

  // Convert to decimal display
  const token0Amount = amount0 / Math.pow(10, token0Precision);
  const token1Amount = amount1 / Math.pow(10, token1Precision);
  const token0AmountMin = amount0Min / Math.pow(10, token0Precision);
  const token1AmountMin = amount1Min / Math.pow(10, token1Precision);

  // User's share of pool
  const poolShare = (userPosition.lp_balance / pool.lp_supply) * 100;

  const newPoolShare =
    ((userPosition.lp_balance - liquidityToRemove) / pool.lp_supply) * 100;

  const handleRemove = async () => {
    if (liquidityToRemove === 0) return;

    setIsRemoving(true);
    try {
      await onRemove({
        token0: pool.token0,
        token1: pool.token1,
        token0Contract: pool.token0_contract,
        token1Contract: pool.token1_contract,
        liquidity: liquidityToRemove,
        amount0Min: amount0Min,
        amount1Min: amount1Min,
        token0Symbol: pool.token0_symbol,
        token1Symbol: pool.token1_symbol,
        token0Precision: token0Precision,
        token1Precision: token1Precision,
        provider: accountName,
      });

      onClose();
    } catch (error) {
      console.error("Failed to remove liquidity:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSlippageChange = (value) => {
    setSlippage(value);
    setCustomSlippage("");
  };

  const handleCustomSlippage = (value) => {
    setCustomSlippage(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      setSlippage(numValue);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.removeModal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <TrendingDown size={24} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>Remove Liquidity</h3>
              <p className={styles.modalSubtitle}>
                {pool.token0.symbol} / {pool.token1.symbol}
              </p>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Current Position Info */}
          <div className={styles.positionCard}>
            <div className={styles.positionHeader}>
              <span className={styles.positionLabel}>Your Position</span>
              <span className={styles.positionShare}>
                {poolShare.toFixed(4)}% of pool
              </span>
            </div>
            <div className={styles.positionTokens}>
              <div className={styles.positionToken}>
                {renderTokenLogo(
                  pool.token0.logo,
                  pool.token0.symbol,
                  styles.tokenLogo
                )}
                <div className={styles.tokenDetails}>
                  <span className={styles.tokenAmount}>
                    {(
                      (pool.reserve0 * userPosition.lp_balance) /
                      pool.lp_supply /
                      Math.pow(10, token0Precision)
                    ).toFixed(token0Precision)}
                  </span>
                  <span className={styles.tokenSymbol}>
                    {pool.token0.symbol}
                  </span>
                </div>
              </div>
              <div className={styles.positionToken}>
                {renderTokenLogo(
                  pool.token1.logo,
                  pool.token1.symbol,
                  styles.tokenLogo
                )}
                <div className={styles.tokenDetails}>
                  <span className={styles.tokenAmount}>
                    {(
                      (pool.reserve1 * userPosition.lp_balance) /
                      pool.lp_supply /
                      Math.pow(10, token1Precision)
                    ).toFixed(token1Precision)}
                  </span>
                  <span className={styles.tokenSymbol}>
                    {pool.token1.symbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Removal Amount */}
          <div className={styles.removalSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Amount to Remove</span>
              <span className={styles.percentageDisplay}>
                {removePercentage}%
              </span>
            </div>

            {/* Percentage Buttons */}
            <div className={styles.percentageButtons}>
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  className={cn(styles.percentBtn, {
                    [styles.active]: removePercentage === percent,
                  })}
                  onClick={() => setRemovePercentage(percent)}
                >
                  {percent}%
                </button>
              ))}
            </div>

            {/* Slider */}
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min="0"
                max="100"
                value={removePercentage}
                onChange={(e) => setRemovePercentage(parseInt(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderTrack}>
                <div
                  className={styles.sliderFill}
                  style={{ width: `${removePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* You Will Receive */}
          <div className={styles.receiveSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>You Will Receive</span>
            </div>

            <div className={styles.receiveCards}>
              <div className={styles.receiveCard}>
                <div className={styles.receiveLeft}>
                  {renderTokenLogo(
                    pool.token0.logo,
                    pool.token0.symbol,
                    styles.receiveLogo
                  )}
                  <span className={styles.receiveSymbol}>
                    {pool.token0.symbol}
                  </span>
                </div>
                <div className={styles.receiveRight}>
                  <span className={styles.receiveAmount}>
                    {token0Amount.toFixed(token0Precision)}
                  </span>
                  {pool?.token0?.price > 0 && (
                    <span className={styles.receiveUsd}>
                      ${(token0Amount * pool.token0.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.receiveCard}>
                <div className={styles.receiveLeft}>
                  {renderTokenLogo(
                    pool.token1.logo,
                    pool.token1.symbol,
                    styles.receiveLogo
                  )}
                  <span className={styles.receiveSymbol}>
                    {pool.token1.symbol}
                  </span>
                </div>
                <div className={styles.receiveRight}>
                  <span className={styles.receiveAmount}>
                    {token1Amount.toFixed(token1Precision)}
                  </span>
                  {pool?.token1?.price > 0 && (
                    <span className={styles.receiveUsd}>
                      ${(token1Amount * pool?.token1?.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Slippage Settings */}
          <div className={styles.settingsSection}>
            <button
              className={styles.settingsToggle}
              onClick={() => setShowSlippageSettings(!showSlippageSettings)}
            >
              <Settings size={18} />
              <span>Slippage Tolerance: {slippage}%</span>
            </button>

            {showSlippageSettings && (
              <div className={styles.slippageSettings}>
                <div className={styles.slippagePresets}>
                  {[0.1, 0.5, 1.0].map((value) => (
                    <button
                      key={value}
                      className={cn(styles.slippageBtn, {
                        [styles.active]: slippage === value && !customSlippage,
                      })}
                      onClick={() => handleSlippageChange(value)}
                    >
                      {value}%
                    </button>
                  ))}
                  <input
                    type="number"
                    placeholder="Custom"
                    value={customSlippage}
                    onChange={(e) => handleCustomSlippage(e.target.value)}
                    className={styles.customSlippageInput}
                    min="0"
                    max="50"
                    step="0.1"
                  />
                </div>
                <div className={styles.slippageInfo}>
                  <Info size={14} />
                  <span>
                    Transaction will revert if price changes unfavorably by more
                    than this percentage
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Details Card */}
          <div className={styles.detailsCard}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>LP Tokens to Burn</span>
              <span className={styles.detailValue}>
                {liquidityToRemove.toLocaleString()}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                Minimum {pool.token0.symbol} Received
              </span>
              <span className={styles.detailValue}>
                {token0AmountMin.toFixed(token0Precision)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                Minimum {pool.token1.symbol} Received
              </span>
              <span className={styles.detailValue}>
                {token1AmountMin.toFixed(token1Precision)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>New Pool Share</span>
              <span className={styles.detailValue}>
                {removePercentage === 100
                  ? "0%"
                  : `${newPoolShare.toFixed(4)}%`}
              </span>
            </div>
          </div>

          {/* Warning if removing 100% */}
          {removePercentage === 100 && (
            <div className={styles.warningBox}>
              <AlertCircle size={20} />
              <div>
                <div className={styles.warningTitle}>
                  Removing All Liquidity
                </div>
                <div className={styles.warningText}>
                  You are removing your entire position from this pool. Your LP
                  tokens will be burned.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            className={styles.btnSecondary}
            onClick={onClose}
            disabled={isRemoving}
          >
            Cancel
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleRemove}
            disabled={isRemoving || liquidityToRemove === 0}
          >
            {isRemoving ? (
              <>
                <span className={styles.spinner}></span>
                Removing...
              </>
            ) : (
              <>
                <TrendingDown size={18} />
                Remove Liquidity
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveLiquidityModal;
