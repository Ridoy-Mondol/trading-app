import React, { useState } from "react";
import cn from "classnames";
import styles from "./Filters.module.sass";
import Dropdown from "../../../../../components/Dropdown";

const sortOptions = [
  "Default",
  "Price",
  "Market Cap",
  "24h Volume (USD)",
  "24h Change",
  "FDV",
  "Circulating Supply",
  "Max Supply",
  "Exchange Count",
  "Leading Pair Volume",
];

const tabs = [
  { id: "trending", label: "Trending", icon: "📈" },
  { id: "top", label: "Top", icon: "⭐" },
  { id: "gainers", label: "Gainers (24h)", icon: "⬆️" },
  { id: "losers", label: "Losers (24h)", icon: "⬇️" },
];

const exchanges = ["Coingecko", "MetalX", "Alcor"];

const advancedFilters = [
  { key: "price", label: "Price", unit: "$" },
  { key: "marketCap", label: "Market Cap", unit: "$" },
  { key: "volume24h", label: "24h Volume", unit: "$" },
  { key: "fdv", label: "FDV", unit: "$" },
  { key: "change24h", label: "24h Change", unit: "%" },
  { key: "maxSupply", label: "Max Supply", unit: "tokens" },
  { key: "circulatingSupply", label: "Circulating Supply", unit: "tokens" },
  { key: "exchangeCount", label: "Exchange Count", unit: "#" },
  { key: "leadingPairVol", label: "Leading Pair Volume", unit: "%" },
];

const buildEmptyAdvancedDraft = () =>
  advancedFilters.reduce((acc, { key }) => {
    acc[`${key}Min`] = "";
    acc[`${key}Max`] = "";
    return acc;
  }, {});

const Filters = ({ filters, setFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedDraft, setAdvancedDraft] = useState(buildEmptyAdvancedDraft());

  const toggleExchange = (ex) => {
    setFilters((prev) => ({
      ...prev,
      selectedExchanges: prev.selectedExchanges.includes(ex)
        ? prev.selectedExchanges.filter((e) => e !== ex)
        : [...prev.selectedExchanges, ex],
    }));
  };

  const handleAdvancedChange = (field, value) => {
    setAdvancedDraft((prev) => ({ ...prev, [field]: value }));
  };

  const applyAdvancedFilters = () => {
    for (const { key, label } of advancedFilters) {
      const rawMin = advancedDraft[`${key}Min`];
      const rawMax = advancedDraft[`${key}Max`];

      const min = rawMin !== "" ? Number(rawMin) : null;
      const max = rawMax !== "" ? Number(rawMax) : null;

      // Check NaN / Infinity
      if (
        (min !== null && !isFinite(min)) ||
        (max !== null && !isFinite(max))
      ) {
        alert(`Invalid number for ${label}`);
        return;
      }

      // Min > Max check
      if (min !== null && max !== null && min > max) {
        alert(`Min value for "${label}" cannot be greater than Max.`);
        return;
      }

      // Field-specific validation
      switch (key) {
        case "price":
        case "marketCap":
        case "volume24h":
        case "fdv":
        case "maxSupply":
        case "circulatingSupply":
          if ((min !== null && min < 0) || (max !== null && max < 0)) {
            alert(`${label} cannot be negative.`);
            return;
          }
          break;

        case "exchangeCount":
          if (
            (min !== null && (!Number.isInteger(min) || min < 0)) ||
            (max !== null && (!Number.isInteger(max) || max < 0))
          ) {
            alert(`${label} must be a non-negative integer.`);
            return;
          }
          break;

        case "change24h":
          if (
            (min !== null && (min < -100 || min > 100)) ||
            (max !== null && (max < -100 || max > 100))
          ) {
            alert(`${label} must be between -100% and 100%.`);
            return;
          }
          break;

        case "leadingPairVol":
          if (
            (min !== null && (min < 0 || min > 100)) ||
            (max !== null && (max < 0 || max > 100))
          ) {
            alert(`${label} must be between 0% and 100%.`);
            return;
          }
          break;

        default:
          break;
      }
    }

    // ✅ Collect validated values
    const parsed = {};
    for (const { key } of advancedFilters) {
      const rawMin = advancedDraft[`${key}Min`];
      const rawMax = advancedDraft[`${key}Max`];
      if (rawMin !== "") parsed[`${key}Min`] = Number(rawMin);
      if (rawMax !== "") parsed[`${key}Max`] = Number(rawMax);
    }

    setFilters((prev) => ({ ...prev, advanced: parsed }));
    setShowAdvanced(false);
  };

  const resetAdvanced = () => {
    setAdvancedDraft(buildEmptyAdvancedDraft());
    setFilters((prev) => ({ ...prev, advanced: {} }));
  };

  return (
    <div className={styles.container}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        {/* Search Bar */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchIcon}>🔍</div>
          <input
            type="text"
            placeholder="Search by token name or symbol..."
            className={styles.search}
            value={filters.search}
            onChange={(e) =>
              setFilters((p) => ({ ...p, search: e.target.value }))
            }
          />
        </div>

        {/* Tab Pills */}
        <div className={styles.tabPills}>
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              className={cn(styles.tabPill, {
                [styles.active]: filters.activeTab === id,
              })}
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  activeTab: p.activeTab === id ? "" : id,
                }))
              }
            >
              <span className={styles.tabIcon}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Row */}
      <div className={styles.controlsRow}>
        {/* Sort Dropdown */}
        <div className={styles.sortWrapper}>
          <Dropdown
            value={filters.sortBy}
            setValue={(v) => setFilters((p) => ({ ...p, sortBy: v }))}
            options={sortOptions}
          />
        </div>

        {/* Sort Direction */}
        <button
          className={cn(styles.sortOrder, {
            [styles.desc]: filters.sortOrder === "desc",
          })}
          data-tooltip={
            filters.sortOrder === "asc" ? "Ascending" : "Descending"
          }
          onClick={() =>
            setFilters((p) => ({
              ...p,
              sortOrder: p.sortOrder === "asc" ? "desc" : "asc",
            }))
          }
        >
          {filters.sortOrder === "asc" ? "↑" : "↓"}
        </button>

        {/* Exchange Filters */}
        <div className={styles.exchangeFilters}>
          {exchanges.map((ex) => (
            <button
              key={ex}
              className={cn(styles.exchangeBtn, {
                [styles.selected]: filters.selectedExchanges.includes(ex),
              })}
              onClick={() => toggleExchange(ex)}
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Watchlist Toggle */}
        <button
          className={cn(styles.watchlistToggle, {
            [styles.active]: filters.watchlistOnly,
          })}
          onClick={() =>
            setFilters((p) => ({ ...p, watchlistOnly: !p.watchlistOnly }))
          }
        >
          <span className={styles.watchlistIcon}>
            {filters.watchlistOnly ? "⭐" : "✩"}
          </span>
          <span className={styles.watchlistText}>Watchlist</span>
        </button>

        {/* Stablecoin Toggle */}
        <button
          className={cn(styles.stablecoinToggle, {
            [styles.active]: filters.stablecoinOnly,
          })}
          onClick={() =>
            setFilters((p) => ({ ...p, stablecoinOnly: !p.stablecoinOnly }))
          }
        >
          <span className={styles.toggleIcon}>💰</span>
          Stablecoins
        </button>

        {/* Advanced Filters Toggle */}
        <button
          className={styles.advancedToggle}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span className={styles.filterIcon}>⚙️</span>
          Advanced
          <span
            className={cn(styles.chevron, {
              [styles.rotated]: showAdvanced,
            })}
          >
            ▼
          </span>
        </button>
      </div>

      {/* Advanced Filters */}
      <div
        className={cn(styles.advancedSection, {
          [styles.expanded]: showAdvanced,
        })}
      >
        <div className={styles.advancedContent}>
          <div className={styles.filtersGrid}>
            {advancedFilters.map(({ key, label, unit }) => (
              <div key={key} className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  {label} {unit && `(${unit})`}
                </label>
                <div className={styles.rangeInputs}>
                  <input
                    type="number"
                    step="any"
                    placeholder="Min"
                    className={styles.rangeInput}
                    value={advancedDraft[`${key}Min`] || ""}
                    onChange={(e) =>
                      handleAdvancedChange(`${key}Min`, e.target.value)
                    }
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Max"
                    className={styles.rangeInput}
                    value={advancedDraft[`${key}Max`] || ""}
                    onChange={(e) =>
                      handleAdvancedChange(`${key}Max`, e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Apply/Reset Buttons */}
          <div className={styles.actionButtons}>
            <button className={styles.resetBtn} onClick={resetAdvanced}>
              Reset
            </button>
            <button className={styles.applyBtn} onClick={applyAdvancedFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
