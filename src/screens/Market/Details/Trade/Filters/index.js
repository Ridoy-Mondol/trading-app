import React, { useState } from "react";
import cn from "classnames";
import styles from "./Filters.module.sass";
import Dropdown from "../../../../../components/Dropdown";

const sortOptions = [
  "Token Rank",
  "Market Cap",
  "24h Volume (USD)",
  "24h Change",
  "Pair Age",
  "Price",
  "FDV",
  "Max Supply",
  "Exchange Count",
  "Chain Rank",
];

const Filters = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("top");
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedExchanges, setSelectedExchanges] = useState([]);
  const [stablecoinOnly, setStablecoinOnly] = useState(false);

  const exchanges = ["Coingecko", "MetalX", "Alcor"];

  const tabs = [
    { id: "trending", label: "Trending", icon: "📈" },
    { id: "top", label: "Top", icon: "⭐" },
    { id: "new", label: "New", icon: "🕐" },
  ];

  const toggleExchange = (ex) => {
    setSelectedExchanges((prev) =>
      prev.includes(ex) ? prev.filter((e) => e !== ex) : [...prev, ex]
    );
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tab Pills */}
        <div className={styles.tabPills}>
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              className={cn(styles.tabPill, {
                [styles.active]: activeTab === id,
              })}
              onClick={() => setActiveTab(id)}
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
          <Dropdown value={sortBy} setValue={setSortBy} options={sortOptions} />
        </div>

        {/* Sort Direction */}
        <button
          className={cn(styles.sortOrder, {
            [styles.desc]: sortOrder === "desc",
          })}
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>

        {/* Exchange Filters */}
        <div className={styles.exchangeFilters}>
          {exchanges.map((ex) => (
            <button
              key={ex}
              className={cn(styles.exchangeBtn, {
                [styles.selected]: selectedExchanges.includes(ex),
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
            [styles.active]: stablecoinOnly,
          })}
          onClick={() => setStablecoinOnly(!stablecoinOnly)}
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
            {[
              { label: "Age", unit: "hours" },
              { label: "Market Cap", unit: "$" },
              { label: "FDV", unit: "$" },
              { label: "24h Volume", unit: "$" },
              { label: "24h Change", unit: "%" },
              { label: "Price", unit: "$" },
            ].map(({ label, unit }) => (
              <div key={label} className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  {label} {unit && `(${unit})`}
                </label>
                <div className={styles.rangeInputs}>
                  <input
                    type="number"
                    placeholder="Min"
                    className={styles.rangeInput}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className={styles.rangeInput}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Apply/Reset Buttons */}
          <div className={styles.actionButtons}>
            <button className={styles.resetBtn}>Reset</button>
            <button className={styles.applyBtn}>Apply Filters</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
