import { useState, useEffect } from "react";
import { CoinGeckoClient } from "../utilities/coingeckoclient";

export const useCryptoDetails = () => {
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCryptoData = async () => {
      setLoading(true);
      setError(null);

      try {
        const marketData = await CoinGeckoClient.coinsMarkets({
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 100,
          page: 1,
          sparkline: true,
          price_change_percentage: "1h,24h,7d,30d",
        });

        const updatedAssets = marketData.map((priceData) => ({
          id: priceData.id,
          name: priceData.name,
          symbol: priceData.symbol.toUpperCase(),
          rank: priceData.market_cap_rank,
          currentPrice: priceData.current_price?.toLocaleString() || "0",
          priceChange1h:
            priceData.price_change_percentage_1h_in_currency?.toFixed(2) || "0",
          priceChange24h:
            priceData.price_change_percentage_24h_in_currency?.toFixed(2) ||
            "0",
          priceChange7d:
            priceData.price_change_percentage_7d_in_currency?.toFixed(2) || "0",
          priceChange30d:
            priceData.price_change_percentage_30d_in_currency?.toFixed(2) ||
            "0",
          volume24h: priceData.total_volume?.toLocaleString() || "0",
          circulatingSupply:
            priceData.circulating_supply?.toLocaleString() || "0",
          totalSupply: priceData.total_supply?.toLocaleString() || "0",
          marketCap: priceData.market_cap?.toLocaleString() || "0",
          logoUrl: priceData.image || "",
          priceHistory: priceData.sparkline_in_7d?.price || [],
        }));

        setFilteredAssets(updatedAssets);
      } catch (err) {
        console.error("Error fetching crypto data:", err);
        setError("Failed to fetch crypto data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  return { assets: filteredAssets, loading, error };
};
