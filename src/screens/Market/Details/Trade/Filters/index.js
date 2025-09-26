import React, { useState } from "react";
import cn from "classnames";
import styles from "./Filters.module.sass";
import Dropdown from "../../../../../components/Dropdown";

const sortOptions = [
  "Price",
  "Market Cap",
  "24h Volume (USD)",
  "24h Change",
  "Pair Age",
  "FDV",
  "Max Supply",
  "Exchange Count",
];

const advancedFilters = [
  { key: "age", label: "Age", unit: "hours" },
  { key: "marketCap", label: "Market Cap", unit: "$" },
  { key: "fdv", label: "FDV", unit: "$" },
  { key: "volume24h", label: "24h Volume", unit: "$" },
  { key: "change24h", label: "24h Change", unit: "%" },
  { key: "price", label: "Price", unit: "$" },
];

const Filters = ({ filters, setFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedDraft, setAdvancedDraft] = useState({
    ageMin: "",
    ageMax: "",
    marketCapMin: "",
    marketCapMax: "",
    fdvMin: "",
    fdvMax: "",
    volumeMin: "",
    volumeMax: "",
    changeMin: "",
    changeMax: "",
    priceMin: "",
    priceMax: "",
  });

  const exchanges = ["Coingecko", "MetalX", "Alcor"];

  const tabs = [
    { id: "trending", label: "Trending", icon: "📈" },
    { id: "top", label: "Top", icon: "⭐" },
    { id: "new", label: "New", icon: "🕐" },
  ];

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
    setFilters((prev) => ({
      ...prev,
      advanced: { ...advancedDraft },
    }));
    setShowAdvanced(false);
  };

  const resetAdvanced = () => {
    const cleared = {
      ageMin: "",
      ageMax: "",
      marketCapMin: "",
      marketCapMax: "",
      fdvMin: "",
      fdvMax: "",
      volumeMin: "",
      volumeMax: "",
      changeMin: "",
      changeMax: "",
      priceMin: "",
      priceMax: "",
    };
    setAdvancedDraft(cleared);
    setFilters((prev) => ({
      ...prev,
      advanced: {},
    }));
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
            placeholder="Search tokens, pairs, or addresses..."
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
              onClick={() => setFilters((p) => ({ ...p, activeTab: id }))}
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
                    placeholder="Min"
                    className={styles.rangeInput}
                    value={advancedDraft[`${key}Min`] || ""}
                    onChange={(e) =>
                      handleAdvancedChange(`${key}Min`, e.target.value)
                    }
                  />
                  <input
                    type="number"
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
