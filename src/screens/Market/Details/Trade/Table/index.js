import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Table.module.sass";
import { useNavigate } from "react-router-dom";
import Icon from "../../../../../components/Icon";
import Loader from "../../../../../components/Loader";
import { useTokens } from "../../../../../hooks/useTokens";

const Table = ({ filters }) => {
  const [items, setItems] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredTokens, setFilteredTokens] = useState([]);

  const navigate = useNavigate();
  const { data: allTokens = [], isLoading, error } = useTokens();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("watchlist") || "[]");
    setWatchlist(stored);
  }, []);

  const handleFavoriteClick = (token) => {
    const existing = JSON.parse(localStorage.getItem("watchlist") || "[]");
    const isSaved = existing.some((t) => t.symbol === token.symbol);

    let updated;
    if (isSaved) {
      updated = existing.filter((t) => t.symbol !== token.symbol);
    } else {
      updated = [...existing, token];
    }

    localStorage.setItem("watchlist", JSON.stringify(updated));
    setWatchlist(updated);
  };

  useEffect(() => {
    if (allTokens.length === 0) return;

    let result = [...allTokens];

    // === Search ===
    if (filters.search) {
      result = result.filter(
        (t) =>
          t.metadata.name
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          t.symbol.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // === Exchange filter ===
    if (filters.selectedExchanges?.length > 0) {
      result = result.filter((t) => {
        const firstPair = t.pairs?.[0];
        return (
          firstPair && filters.selectedExchanges.includes(firstPair.exchange)
        );
      });
    }

    // === Watchlist filter ===
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    if (filters.watchlistOnly) {
      result = result.filter((t) => {
        const name = t.metadata?.name?.toLowerCase();
        const symbol = t.symbol?.toLowerCase();
        return watchlist.some(
          (w) =>
            w.name?.toLowerCase() === name && w.symbol?.toLowerCase() === symbol
        );
      });
    }

    // === Stablecoin filter ===
    const stablecoins = ["XUSDT", "XUSDC", "XDAI", "XTUSD", "XPAX"];
    if (filters.stablecoinOnly) {
      result = result.filter((t) => {
        const symbol = t.symbol?.toUpperCase();
        return stablecoins.includes(symbol);
      });
    }

    // === Tabs filter ===
    if (filters.activeTab) {
      switch (filters.activeTab) {
        case "trending":
          result = result.filter((t) => {
            const change = t.price?.change_24hr || 0;
            const vol = t.price?.volume_usd_24h || 0;
            return Math.abs(change) >= 15 || vol > 10000000000;
          });
          break;

        case "top":
          result = result.filter((t) => t.price?.marketcap_usd > 10000000000);
          break;

        case "gainers":
          result = result
            .filter((t) => (t.price?.change_24hr ?? 0) > 0)
            .sort((a, b) => {
              const changeA = a.price?.change_24hr ?? 0;
              const changeB = b.price?.change_24hr ?? 0;
              return changeB - changeA;
            });
          break;

        case "losers":
          result = result
            .filter((t) => (t.price?.change_24hr ?? 0) < 0)
            .sort((a, b) => {
              const changeA = a.price?.change_24hr ?? 0;
              const changeB = b.price?.change_24hr ?? 0;
              return changeA - changeB;
            });
          break;
      }
    }

    // === Advanced filters ===
    const adv = filters.advanced || {};
    result = result.filter((t) => {
      const price = t.price?.usd || 0;
      const marketCap = t.price?.marketcap_usd || 0;
      const volume = t.price?.volume_usd_24h || 0;
      const fdv = t.supply?.max ? marketCap * t.supply.max : 0;
      const circ = t.supply?.circulating || 0;
      const max = t.supply?.max || 0;
      const change24h = t.price?.change_24hr || 0;
      const exchangeCount = t.pairs?.length || 0;
      const leadingPairVol = t.pairs?.[0]?.percentage_daily_volume * 100;

      const checks = [
        !adv.priceMin || price >= adv.priceMin,
        !adv.priceMax || price <= adv.priceMax,
        !adv.marketCapMin || marketCap >= adv.marketCapMin,
        !adv.marketCapMax || marketCap <= adv.marketCapMax,
        !adv.volume24hMin || volume >= adv.volume24hMin,
        !adv.volume24hMax || volume <= adv.volume24hMax,
        !adv.fdvMin || fdv >= adv.fdvMin,
        !adv.fdvMax || fdv <= adv.fdvMax,
        !adv.circulatingSupplyMin || circ >= adv.circulatingSupplyMin,
        !adv.circulatingSupplyMax || circ <= adv.circulatingSupplyMax,
        !adv.maxSupplyMin || max >= adv.maxSupplyMin,
        !adv.maxSupplyMax || max <= adv.maxSupplyMax,
        !adv.change24hMin || change24h >= adv.change24hMin,
        !adv.change24hMax || change24h <= adv.change24hMax,
        !adv.exchangeCountMin || exchangeCount >= adv.exchangeCountMin,
        !adv.exchangeCountMax || exchangeCount <= adv.exchangeCountMax,
        !adv.leadingPairVolMin || leadingPairVol >= adv.leadingPairVolMin,
        !adv.leadingPairVolMax || leadingPairVol <= adv.leadingPairVolMax,
      ];

      return checks.every(Boolean);
    });

    // === Sorting ===
    if (filters.sortBy) {
      const order = filters.sortOrder === "asc" ? 1 : -1;
      result.sort((a, b) => {
        let valA, valB;
        switch (filters.sortBy) {
          case "Default":
            if (["gainers", "losers"].includes(filters.activeTab)) {
              valA = a.price?.change_24hr || 0;
              valB = b.price?.change_24hr || 0;
            } else {
              valA = b._originalIndex;
              valB = a._originalIndex;
            }
            break;
          case "Price":
            valA = a.price?.usd || 0;
            valB = b.price?.usd || 0;
            break;
          case "Market Cap":
            valA = a.price?.marketcap_usd || 0;
            valB = b.price?.marketcap_usd || 0;
            break;
          case "24h Volume (USD)":
            valA = a.price?.volume_usd_24h || 0;
            valB = b.price?.volume_usd_24h || 0;
            break;
          case "24h Change":
            valA = a.price?.change_24hr || 0;
            valB = b.price?.change_24hr || 0;
            break;
          case "FDV":
            valA = a.supply?.max ? a.price?.marketcap_usd * a.supply.max : 0;
            valB = b.supply?.max ? b.price?.marketcap_usd * b.supply.max : 0;
            break;
          case "Circulating Supply":
            valA = a.supply?.circulating || 0;
            valB = b.supply?.circulating || 0;
            break;
          case "Max Supply":
            valA = a.supply?.max || 0;
            valB = b.supply?.max || 0;
            break;
          case "Exchange Count":
            valA = a.pairs?.length || 0;
            valB = b.pairs?.length || 0;
            break;
          case "Leading Pair Volume":
            valA = a.pairs?.[0]?.percentage_daily_volume || 0;
            valB = b.pairs?.[0]?.percentage_daily_volume || 0;
            break;
          default:
            valA = 0;
            valB = 0;
        }
        return (valA - valB) * order;
      });
    }

    setFilteredTokens(result);
    setTotalItems(result.length);
    setCurrentPage(1);
  }, [filters, allTokens]);

  useEffect(() => {
    if (filteredTokens.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setItems(filteredTokens.slice(startIndex, endIndex));
    } else {
      setItems([]);
    }
  }, [currentPage, itemsPerPage, filteredTokens]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      document.querySelector(`.${styles.table}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const formatNumber = (num) => {
    if (num >= 1e33) return (num / 1e33).toFixed(2) + "Dc";
    if (num >= 1e30) return (num / 1e30).toFixed(2) + "No";
    if (num >= 1e27) return (num / 1e27).toFixed(2) + "Oc";
    if (num >= 1e24) return (num / 1e24).toFixed(2) + "Sp";
    if (num >= 1e21) return (num / 1e21).toFixed(2) + "Sx";
    if (num >= 1e18) return (num / 1e18).toFixed(2) + "Qi";
    if (num >= 1e15) return (num / 1e15).toFixed(2) + "Q";
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num < 10 ? num.toFixed(4) : num.toFixed(2);
  };

  const truncate = (num, decimals = 4) => {
    const factor = Math.pow(10, decimals);
    return Math.floor(num * factor) / factor;
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.trade}>
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>
            <div className="sorting">#</div>
          </div>
          <div className={styles.col}>
            <div className="sorting">Name</div>
          </div>
          <div className={styles.col}>
            <div>
              Price <Icon name="coin" size="20" />
            </div>
          </div>
          <div className={styles.col}>24h %</div>
          <div className={styles.col}>
            Marketcap <Icon name="coin" size="20" />
          </div>
          <div className={styles.col}>
            FDV <Icon name="coin" size="20" />
          </div>
          <div className={styles.col}>
            Vol.(24h)
            <Icon name="chart" size="20" />
          </div>
          <div className={styles.col}>
            <div className="sorting">Circulating</div>
          </div>
          <div className={styles.col}>
            <div className="sorting">Max</div>
          </div>
          <div className={styles.col}>
            <div className="sorting">Leading Pair</div>
          </div>
          <div className={styles.col}>
            <div className="sorting">Total Pair</div>
          </div>
          <div className={styles.col}>
            <div className="sorting">Top Exchange</div>
          </div>
          <div className={styles.col}>Vol. %</div>
        </div>
        {items.map((x, index) => {
          const actualIndex = startIndex + index;
          const isFavorited = watchlist.some((t) => t.symbol === x.symbol);
          return (
            <div
              onClick={() => navigate(`/exchange/${x.metadata.name}`)}
              className={styles.row}
              style={{ cursor: "pointer" }}
              key={actualIndex}
            >
              <div className={styles.col}>
                <div className={styles.line}>
                  <button
                    className={cn("favorite", styles.favorite)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteClick({
                        name: x.metadata.name,
                        symbol: x.symbol,
                      });
                    }}
                  >
                    <Icon
                      name={isFavorited ? "star" : "star-outline"}
                      size={16}
                    />
                  </button>
                  {actualIndex + 1}
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.item}>
                  <div className={styles.icon}>
                    <img
                      src={
                        x.metadata.logo ||
                        "/images/content/currency/fallback-logo.png"
                      }
                      alt={x.metadata.name}
                    />
                  </div>
                  <div className={styles.details}>
                    <span className={styles.subtitle}>{x.metadata.name}</span>
                    <span className={styles.currency}>{x.symbol}</span>
                  </div>
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.label}>Price</div>
                {`$${formatNumber(x.price?.usd)}`}
              </div>
              <div className={styles.col}>
                <div className={styles.label}>24h</div>
                <div
                  className={
                    x.price.change_24hr >= 0
                      ? x.price.change_24hr > 0
                        ? styles.positive
                        : ""
                      : styles.negative
                  }
                >
                  {x.price.change_24hr > 0
                    ? `+${x.price.change_24hr.toFixed(2)}`
                    : x.price.change_24hr.toFixed(2)}
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.label}>Marketcap</div>
                {`$${formatNumber(x.price.marketcap_usd)}`}
              </div>
              <div className={styles.col}>
                <div className={styles.label}>FDV</div>
                {`$${formatNumber(x.price.marketcap_usd * x.supply.max)}`}
              </div>
              <div className={styles.col}>
                <div className={styles.label}>Volume (24h)</div>
                {`$${formatNumber(x.price.volume_usd_24h)}`}
              </div>
              <div className={styles.col}>
                {x.supply.circulating < 1000
                  ? x.supply.circulating
                  : formatNumber(x.supply?.circulating) || 0}
              </div>
              <div className={styles.col}>
                {x.supply?.max < 1000
                  ? x.supply?.max
                  : formatNumber(x.supply?.max) || 0}
              </div>
              <div className={styles.col}>{x.pairs?.[0]?.id || ""}</div>
              <div className={styles.col}>
                <div className={styles.line}>{x.pairs?.length || 0}</div>
              </div>
              <div className={styles.col}>
                {x.pairs?.[0]?.exchange
                  ? x.pairs[0].exchange === "MetalX Swap"
                    ? "MetalX"
                    : x.pairs[0].exchange
                  : ""}
              </div>
              <div className={styles.col}>
                {x.pairs?.[0]?.percentage_daily_volume != null
                  ? (() => {
                      const value = Number(
                        (x.pairs[0].percentage_daily_volume * 100).toFixed(50)
                      );
                      return value < 100
                        ? truncate(value, 4).toFixed(4) + "%"
                        : value.toFixed(3) + "%";
                    })()
                  : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Component */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
            {totalItems} tokens
          </div>
          <div className={styles.paginationControls}>
            <button
              className={cn(styles.paginationBtn, styles.prevBtn)}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Icon name="arrow-left" size="20" />
              Previous
            </button>

            <div className={styles.pageNumbers}>
              {getVisiblePageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className={styles.dots}>...</span>
                  ) : (
                    <button
                      className={cn(styles.pageBtn, {
                        [styles.active]: page === currentPage,
                      })}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            <button
              className={cn(styles.paginationBtn, styles.nextBtn)}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <Icon name="arrow-right" size="20" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
