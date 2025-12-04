import { useState, useEffect } from "react";
import { X, ChevronDown, AlertCircle, Zap } from "lucide-react";
import styles from "./CreatePoolModal.module.sass";
import TokenSelectionModal from "../TokenModal";
import cn from "classnames";

const CreatePoolModal = ({
  show,
  onClose,
  onSuccess,
  allTokens,
  existingPools,
  getUserTokenBalance,
  renderTokenLogo,
}) => {
  const [token0, setToken0] = useState(null);
  const [token1, setToken1] = useState(null);
  const [selectingToken, setSelectingToken] = useState(null);
  const [poolExists, setPoolExists] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Check if pool already exists
  useEffect(() => {
    if (token0 && token1) {
      const exists = existingPools.some(
        (pool) =>
          (pool.token0.symbol === token0.symbol &&
            pool.token1.symbol === token1.symbol) ||
          (pool.token0.symbol === token1.symbol &&
            pool.token1.symbol === token0.symbol)
      );
      setPoolExists(exists);
    } else {
      setPoolExists(false);
    }
  }, [token0, token1, existingPools]);

  const handleTokenSelect = (token) => {
    if (selectingToken === "token0") {
      setToken0(token);
      // Auto-focus token1 if not selected
      if (!token1) {
        setTimeout(() => setSelectingToken("token1"), 100);
      } else {
        setSelectingToken(null);
      }
    } else if (selectingToken === "token1") {
      setToken1(token);
      setSelectingToken(null);
    }
  };

  const handleCreatePool = async () => {
    if (!token0 || !token1 || poolExists) return;

    setIsCreating(true);
    try {
      // Your pool creation logic here
      await onSuccess(token0, token1);
      handleClose();
    } catch (error) {
      console.error("Failed to create pool:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setToken0(null);
    setToken1(null);
    setSelectingToken(null);
    setPoolExists(false);
    onClose();
  };

  const removeToken = (tokenPosition) => {
    if (tokenPosition === "token0") setToken0(null);
    if (tokenPosition === "token1") setToken1(null);
  };

  // Filter out already selected token
  const getFilteredTokens = () => {
    if (selectingToken === "token0" && token1) {
      return allTokens.filter((t) => t.symbol !== token1.symbol);
    }
    if (selectingToken === "token1" && token0) {
      return allTokens.filter((t) => t.symbol !== token0.symbol);
    }
    return allTokens;
  };

  if (!show) return null;

  return (
    <>
      {/* Create Pool Modal */}
      <div className={styles.modalOverlay} onClick={handleClose}>
        <div
          className={styles.createPoolModal}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.modalHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon}>
                <Zap size={24} />
              </div>
              <div>
                <h3 className={styles.modalTitle}>Create Liquidity Pool</h3>
                <p className={styles.modalSubtitle}>
                  Select two tokens to create a new pool
                </p>
              </div>
            </div>
            <button className={styles.modalClose} onClick={handleClose}>
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className={styles.modalBody}>
            {/* Token 0 Selection */}
            <div className={styles.tokenSection}>
              <label className={styles.tokenLabel}>First Token</label>
              <button
                className={cn(styles.tokenDropdown, {
                  [styles.active]: selectingToken === "token0",
                  [styles.filled]: token0,
                })}
                onClick={() => setSelectingToken("token0")}
              >
                {token0 ? (
                  <div className={styles.selectedToken}>
                    {renderTokenLogo(
                      token0.metadata.logo,
                      token0.symbol,
                      styles.tokenLogo
                    )}
                    <div className={styles.tokenInfo}>
                      <span className={styles.tokenSymbol}>
                        {token0.symbol}
                      </span>
                      <span className={styles.tokenName}>
                        {token0.metadata.name}
                      </span>
                    </div>
                    <button
                      className={styles.removeToken}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeToken("token0");
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.placeholderContent}>
                    <span className={styles.placeholderIcon}>🪙</span>
                    <span className={styles.placeholderText}>Select token</span>
                    <ChevronDown size={20} className={styles.chevron} />
                  </div>
                )}
              </button>
            </div>

            {/* Plus Icon */}
            <div className={styles.divider}>
              <div className={styles.plusIcon}>+</div>
            </div>

            {/* Token 1 Selection */}
            <div className={styles.tokenSection}>
              <label className={styles.tokenLabel}>Second Token</label>
              <button
                className={cn(styles.tokenDropdown, {
                  [styles.active]: selectingToken === "token1",
                  [styles.filled]: token1,
                })}
                onClick={() => setSelectingToken("token1")}
              >
                {token1 ? (
                  <div className={styles.selectedToken}>
                    {renderTokenLogo(
                      token1.metadata.logo,
                      token1.symbol,
                      styles.tokenLogo
                    )}
                    <div className={styles.tokenInfo}>
                      <span className={styles.tokenSymbol}>
                        {token1.symbol}
                      </span>
                      <span className={styles.tokenName}>
                        {token1.metadata.name}
                      </span>
                    </div>
                    <button
                      className={styles.removeToken}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeToken("token1");
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.placeholderContent}>
                    <span className={styles.placeholderIcon}>🪙</span>
                    <span className={styles.placeholderText}>Select token</span>
                    <ChevronDown size={20} className={styles.chevron} />
                  </div>
                )}
              </button>
            </div>

            {/* Warning if pool exists */}
            {poolExists && (
              <div className={styles.warningBox}>
                <AlertCircle size={20} />
                <div>
                  <div className={styles.warningTitle}>Pool Already Exists</div>
                  <div className={styles.warningText}>
                    A liquidity pool for these tokens already exists. You can
                    add liquidity to the existing pool instead.
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            {token0 && token1 && !poolExists && (
              <div className={styles.infoBox}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Pool Pair</span>
                  <span className={styles.infoValue}>
                    {token0.symbol} / {token1.symbol}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Fee Tier</span>
                  <span className={styles.infoValue}>0.30%</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button
              className={styles.btnSecondary}
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              className={styles.btnPrimary}
              onClick={handleCreatePool}
              disabled={!token0 || !token1 || poolExists || isCreating}
            >
              {isCreating ? (
                <>
                  <span className={styles.spinner}></span>
                  Creating...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Create Pool
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Token Selection Modal (Layer 2) */}
      {selectingToken && (
        <TokenSelectionModal
          tokens={getFilteredTokens()}
          getUserTokenBalance={getUserTokenBalance}
          onSelect={handleTokenSelect}
          selectingToken={selectingToken}
          token0={token0}
          token1={token1}
          onClose={() => setSelectingToken(null)}
          renderTokenLogo={renderTokenLogo}
        />
      )}
    </>
  );
};

export default CreatePoolModal;
