import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import cn from "classnames";
import { X, Search } from "lucide-react";
import styles from "./TokenModal.module.sass";

const TokenSelectionModal = ({
  tokens,
  getUserTokenBalance,
  onSelect,
  selectingToken,
  token0,
  token1,
  onClose,
  renderTokenLogo,
}) => {
  const [tokenSearch, setTokenSearch] = useState("");
  const [displayedTokens, setDisplayedTokens] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const tokenListRef = useRef(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const TOKENS_PER_PAGE = 50;

  // Memoize filtered tokens to prevent unnecessary recalculations
  const filteredTokens = useMemo(() => {
    if (!tokenSearch.trim()) {
      return tokens;
    }

    const searchLower = tokenSearch.toLowerCase().trim();
    return tokens.filter(
      (token) =>
        token?.symbol?.toLowerCase().includes(searchLower) ||
        token?.metadata?.name?.toLowerCase().includes(searchLower)
    );
  }, [tokens, tokenSearch]);

  useEffect(() => {
    setPage(1);
    setIsLoading(false);

    const initialTokens = filteredTokens.slice(0, TOKENS_PER_PAGE);
    setDisplayedTokens(initialTokens);

    if (tokenListRef.current) {
      tokenListRef.current.scrollTop = 0;
    }
  }, [filteredTokens, TOKENS_PER_PAGE]);

  // Load more tokens
  const loadMoreTokens = useCallback(() => {
    if (isLoading) return;

    const startIndex = page * TOKENS_PER_PAGE;
    const endIndex = startIndex + TOKENS_PER_PAGE;

    if (startIndex >= filteredTokens.length) return;

    setIsLoading(true);

    requestAnimationFrame(() => {
      const nextTokens = filteredTokens.slice(startIndex, endIndex);
      setDisplayedTokens((prev) => {
        const currentFiltered = filteredTokens.slice(0, startIndex);
        return [...currentFiltered, ...nextTokens];
      });
      setPage((prev) => prev + 1);
      setIsLoading(false);
    });
  }, [page, filteredTokens, isLoading, TOKENS_PER_PAGE]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const options = {
      root: tokenListRef.current,
      rootMargin: "100px",
      threshold: 0.1,
    };

    const callback = (entries) => {
      const first = entries[0];
      if (
        first.isIntersecting &&
        !isLoading &&
        displayedTokens.length < filteredTokens.length
      ) {
        loadMoreTokens();
      }
    };

    observerRef.current = new IntersectionObserver(callback, options);

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (observerRef.current && currentLoadMoreRef) {
        observerRef.current.unobserve(currentLoadMoreRef);
      }
    };
  }, [
    loadMoreTokens,
    isLoading,
    displayedTokens.length,
    filteredTokens.length,
  ]);

  // Memoize enriched tokens
  const enrichedTokens = useMemo(() => {
    return displayedTokens.map((t) => ({
      ...t,
      balance: getUserTokenBalance(t.symbol, t.account),
    }));
  }, [displayedTokens, getUserTokenBalance]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setTokenSearch(e.target.value);
  };

  return (
    <div className={styles.tokenModalOverlay} onClick={onClose}>
      <div
        className={styles.tokenModalContent}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Select a token</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Search Box */}
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search name or symbol"
            value={tokenSearch}
            onChange={handleSearchChange}
            autoFocus
          />
        </div>

        {/* Token List with Infinite Scroll */}
        <div className={styles.tokenList} ref={tokenListRef}>
          {enrichedTokens.map((token, index) => {
            const isSelected =
              (selectingToken === "token0" &&
                token.symbol === token0?.symbol &&
                token.key === token0?.key) ||
              (selectingToken === "token1" &&
                token.symbol === token1?.symbol &&
                token.key === token1?.key);

            return (
              <button
                key={`${token.symbol}-${token.account}-${index}`}
                className={cn(styles.tokenItem, {
                  [styles.selected]: isSelected,
                })}
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
              >
                <div className={styles.tokenItemLeft}>
                  {renderTokenLogo(
                    token.metadata?.logo || token.logo,
                    token.symbol,
                    styles.tokenItemLogo
                  )}
                  <div className={styles.tokenItemInfo}>
                    <div className={styles.tokenItemSymbol}>{token.symbol}</div>
                    <div className={styles.tokenItemName}>
                      {token.metadata?.name || token.name || "Unknown"}
                    </div>
                  </div>
                </div>
                <div className={styles.tokenItemRight}>
                  <div className={styles.tokenItemBalance}>
                    {token?.balance?.toFixed(token.supply?.precision || 4) ||
                      "0.00"}
                  </div>
                  {token.price?.usd > 0 && (
                    <div className={styles.tokenItemUsd}>
                      ${((token.balance || 0) * token.price.usd).toFixed(2)}
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className={styles.loadingMore}>
              <div className={styles.spinner}></div>
              <span>Loading more tokens...</span>
            </div>
          )}

          {/* Intersection Observer Target */}
          {displayedTokens.length < filteredTokens.length && !isLoading && (
            <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
          )}

          {/* No Results */}
          {enrichedTokens.length === 0 && !isLoading && (
            <div className={styles.noResults}>
              <p>No tokens found</p>
              {tokenSearch && (
                <span className={styles.noResultsHint}>
                  Try searching with a different term
                </span>
              )}
            </div>
          )}

          {/* End Message */}
          {enrichedTokens.length > 0 &&
            displayedTokens.length >= filteredTokens.length &&
            !isLoading && (
              <div className={styles.endMessage}>
                <span>
                  {tokenSearch
                    ? `All ${filteredTokens.length} matching token${
                        filteredTokens.length !== 1 ? "s" : ""
                      } loaded`
                    : `All ${filteredTokens.length} tokens loaded`}
                </span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TokenSelectionModal;
