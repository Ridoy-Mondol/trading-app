import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Table.module.sass";
import { useNavigate } from "react-router-dom";
import Icon from "../../../../../components/Icon";
import Loader from "../../../../../components/Loader";

const Table = () => {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allTokens, setAllTokens] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://www.api.bloks.io/proton/tokens", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();

        const protonTokens = data.filter((token) => token.chain === "proton");
        setAllTokens(protonTokens);
        setTotalItems(protonTokens.length);
      } catch (err) {
        console.error("Error fetching tokens:", err);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  useEffect(() => {
    if (allTokens.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentItems = allTokens.slice(startIndex, endIndex);
      setItems(currentItems);
    }
  }, [currentPage, itemsPerPage, allTokens]);

  const formatNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(2);
  };

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

  if (loading) {
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
            Volume(24h)
            <Icon name="chart" size="20" />
          </div>
          <div className={styles.col}>
            <div className="sorting">Leading Pair</div>
          </div>
          <div className={styles.col}>
            <div className="sorting">Exchange</div>
          </div>
          <div className={styles.col}>Volume %</div>
        </div>
        {items.map((x, index) => {
          const actualIndex = startIndex + index;
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
                    }}
                  >
                    <Icon name="star-outline" size="16" />
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
                {`$${x.price?.usd.toFixed(4)}`}
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
                <div className={styles.label}>Volume (24h)</div>
                {`$${formatNumber(x.price.volume_usd_24h)}`}
              </div>
              <div className={styles.col}>{x.pairs?.[0]?.id || ""}</div>
              <div className={styles.col}>
                {x.pairs?.[0]?.exchange
                  ? x.pairs[0].exchange === "MetalX Swap"
                    ? "MetalX"
                    : x.pairs[0].exchange
                  : ""}
              </div>
              <div className={styles.col}>
                {x.pairs?.[0]?.percentage_daily_volume != null
                  ? (x.pairs[0].percentage_daily_volume * 100).toFixed(4) + "%"
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
