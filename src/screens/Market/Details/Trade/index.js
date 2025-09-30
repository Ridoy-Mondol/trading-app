import React, { useState } from "react";
import Table from "./Table";
import Filters from "./Filters";

const Trade = () => {
  const [filters, setFilters] = useState({
    search: "",
    activeTab: "",
    sortBy: "Default",
    sortOrder: "desc",
    selectedExchanges: [],
    watchlistOnly: false,
    stablecoinOnly: false,
    advanced: {},
  });

  return (
    <>
      <Filters filters={filters} setFilters={setFilters} />
      <Table filters={filters} />
    </>
  );
};

export default Trade;
