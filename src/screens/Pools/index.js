import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./pools.module.sass";
import CreatePoolModal from "../../components/TokenSelector";
import RemoveLiquidityModal from "../../components/RemLiquidity";
import cn from "classnames";
import { JsonRpc } from "eosjs";
import { useWallet } from "../../context/WalletContext";
import { useTokens } from "../../hooks/useTokens";

const PoolsPage = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddLiquidity, setShowAddLiquidity] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [sortBy, setSortBy] = useState("tvl");
  const [sortOrder, setSortOrder] = useState("desc");
  const [userLiquidity, setUserLiquidity] = useState([]);
  const [config, setConfig] = useState(null);
  const [userBalance, setUserBalance] = useState([]);

  // Add liquidity form state
  const [token0, setToken0] = useState(null);
  const [token1, setToken1] = useState(null);
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [slippage, setSlippage] = useState(0.5);

  const [showCreatePool, setShowCreatePool] = useState(false);

  const { activeSession, walletConnected, connectWallet } = useWallet();
  const { data: allTokens = [], isLoading } = useTokens();
  const rpc = new JsonRpc(process.env.REACT_APP_PROTON_ENDPOINT);
  const navigate = useNavigate();

  // Parse symbol from "8,XBTC" format to "XBTC"
  const parseSymbol = (symbolStr) => {
    if (!symbolStr) return "";
    const parts = symbolStr.split(",");
    return parts.length === 2 ? parts[1] : symbolStr;
  };

  // Find token data from API by symbol
  const findTokenBySymbol = (symbol) => {
    if (!symbol || !allTokens || allTokens.length === 0) return null;

    const upperSymbol = symbol.toUpperCase();
    return allTokens.find((token) => token.symbol === upperSymbol);
  };

  // Find user balance for a specific token
  const getUserTokenBalance = (symbol, contract) => {
    if (!userBalance || userBalance.length === 0) return 0;

    const balance = userBalance.find(
      (b) => b.symbol === symbol && b.contract === contract
    );

    return balance ? balance.amount : 0;
  };

  const getTokenInfo = (tokenKey, symbolStr) => {
    const symbol = parseSymbol(symbolStr);

    const tokenData = findTokenBySymbol(symbol);

    if (tokenData) {
      return {
        key: tokenKey,
        symbol: tokenData.symbol,
        logo: tokenData.metadata?.logo || "🪙",
        name: tokenData.metadata?.name || tokenData.symbol,
        balance: 0,
        price: tokenData.price?.usd || 0,
        precision: tokenData.supply?.precision || 8,
      };
    }

    return {
      key: tokenKey,
      symbol: symbol,
      logo: "🪙",
      name: symbol,
      balance: 0,
      price: 0,
      precision: 8,
    };
  };

  // Calculate TVL
  const calculateTVL = (reserve0, reserve1, token0Info, token1Info) => {
    if (!token0Info || !token1Info) return 0;

    // Convert reserves to actual amounts (divide by 10^precision)
    const amount0 = reserve0 / Math.pow(10, token0Info.precision);
    const amount1 = reserve1 / Math.pow(10, token1Info.precision);

    const price0 = Number(token0Info.price) || 0;
    const price1 = Number(token1Info.price) || 0;

    // Calculate USD value
    const value0 = amount0 * price0;
    const value1 = amount1 * price1;

    return value0 + value1;
  };

  const calculateAPR = (swaps, pool, poolWithMetrics, allTokens, config) => {
    if (!pool || !poolWithMetrics || !config || pool.tvl === 0) {
      return 0;
    }

    // Utility: APR for any hour window
    const calcAPR = (hours) => {
      const fees = calculateFees(swaps, pool, allTokens, hours);
      if (fees === 0) return 0;

      const days = hours / 24;
      const dailyAvg = fees / days;
      const annualized = dailyAvg * 365;

      return (annualized / poolWithMetrics.tvl) * 100;
    };

    const apr7d = calcAPR(24 * 7);

    if (apr7d > 0) {
      return apr7d;
    }

    // 2️⃣ Fallback → 30d APR if no 7d volume
    const apr30d = calcAPR(24 * 30);

    return apr30d;
  };

  const calculateVolume = (swaps, pool, allTokens, hours = 24) => {
    if (!Array.isArray(swaps) || swaps.length === 0) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    const timeWindow = now - hours * 60 * 60;

    let totalVolumeUSD = 0;

    console.log(`Calculating volume for last ${hours} hours`);
    console.log(`Current time (seconds): ${now}`);
    console.log(`Time window cutoff: ${timeWindow}`);

    swaps.forEach((swap) => {
      console.log(`Processing swap #${swap.id}:`, {
        timestamp: swap.timestamp,
        token_in: swap.token_in,
        amount_in: swap.amount_in,
        isInWindow: swap.timestamp >= timeWindow,
      });

      // ✅ Check timestamp (in seconds)
      if (swap.timestamp < timeWindow) {
        console.log(`Swap #${swap.id} is too old, skipping`);
        return;
      }

      // ✅ Determine which token is being swapped in
      const tokenInSymbol = swap.token_in.toUpperCase();
      const isToken0In = tokenInSymbol === pool.token0.toUpperCase();

      // ✅ Get contract address from pool
      const tokenInContract = isToken0In
        ? pool.token0_contract
        : pool.token1_contract;
      const tokenSymbol = isToken0In ? pool.token0_symbol : pool.token1_symbol;

      // ✅ Find token price data
      const tokenInData = allTokens.find(
        (t) => t.symbol === tokenInSymbol && t.account === tokenInContract
      );

      if (!tokenInData) {
        console.log(`Token not found: ${tokenInSymbol} (${tokenInContract})`);
        return;
      }

      if (!tokenInData.price?.usd) {
        console.log(`No USD price for ${tokenInSymbol}`);
        return;
      }

      // ✅ Parse precision from "6,XUSDT" format
      const precision = parseInt(tokenSymbol.split(",")[0]) || 4;

      // Convert raw amount to decimal
      const amountInDecimal =
        parseFloat(swap.amount_in) / Math.pow(10, precision);

      // Calculate USD value
      const volumeUSD = amountInDecimal * tokenInData.price.usd;

      console.log(
        `Swap #${swap.id}: ${amountInDecimal.toFixed(6)} ${tokenInSymbol} @ $${
          tokenInData.price.usd
        } = $${volumeUSD.toFixed(2)}`
      );

      totalVolumeUSD += volumeUSD;
    });

    console.log(`Total volume: $${totalVolumeUSD.toFixed(2)}`);
    return totalVolumeUSD;
  };

  const calculateFees = (swaps, pool, allTokens, hours = 24) => {
    if (!Array.isArray(swaps) || swaps.length === 0) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    const timeWindow = now - hours * 60 * 60;

    let totalFeesUSD = 0;

    swaps.forEach((swap) => {
      if (swap.timestamp < timeWindow) return;

      // Get token info from pool
      const tokenInSymbol = swap.token_in.toUpperCase();
      const isToken0In = tokenInSymbol === pool.token0.toUpperCase();
      const tokenInContract = isToken0In
        ? pool.token0_contract
        : pool.token1_contract;
      const tokenSymbol = isToken0In ? pool.token0_symbol : pool.token1_symbol;

      // Find token price
      const tokenInData = allTokens.find(
        (t) => t.symbol === tokenInSymbol && t.account === tokenInContract
      );

      if (!tokenInData || !tokenInData.price?.usd) return;

      // Parse precision
      const precision = parseInt(tokenSymbol.split(",")[0]) || 4;

      // Convert fee to decimal
      const feeDecimal = parseFloat(swap.fee_paid) / Math.pow(10, precision);

      // Calculate USD value
      const feeUSD = feeDecimal * tokenInData.price.usd;

      totalFeesUSD += feeUSD;
    });

    return totalFeesUSD;
  };

  // Fetch config from blockchain
  const fetchConfig = async () => {
    try {
      const result = await rpc.get_table_rows({
        json: true,
        code: "xprswap",
        scope: "xprswap",
        table: "config",
        limit: 1,
      });

      if (result.rows.length > 0) {
        setConfig(result.rows[0]);
        console.log("Config loaded:", result.rows[0]);
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
    }
  };

  // Fetch all user token balances
  const fetchAllTokens = async () => {
    if (!activeSession?.auth?.actor) {
      setUserBalance([]);
      return;
    }

    try {
      const accountName = activeSession.auth.actor.toString();
      const isTestnet = process.env.REACT_APP_NETWORK === "testnet";

      if (isTestnet) {
        const contracts = [
          "xtokens",
          "eosio.token",
          "snipx",
          "loan.token",
          "xmd.token",
        ];

        const allBalances = [];

        for (const contract of contracts) {
          try {
            const balances = await rpc.get_currency_balance(
              contract,
              accountName
            );

            balances.forEach((str) => {
              const [amount, symbol] = str.split(" ");
              allBalances.push({
                symbol,
                amount: parseFloat(amount),
                contract,
              });
            });
          } catch (error) {
            console.error(`Failed to fetch from ${contract}:`, error);
          }
        }

        setUserBalance(allBalances);
        console.log("User balances loaded:", allBalances);
      } else {
        const response = await fetch(
          `https://proton.eosusa.io/v2/state/get_tokens?account=${accountName}`
        );
        const data = await response.json();
        setUserBalance(
          data.tokens.map((t) => ({
            symbol: t.symbol,
            amount: t.amount,
            contract: t.contract,
          }))
        );
        console.log("User balances loaded:", data.tokens);
      }
    } catch (error) {
      console.error("Failed to fetch user balances:", error);
      setUserBalance([]);
    }
  };

  // Fetch liquidity from blockchain
  const fetchLiquidity = async () => {
    if (!walletConnected || !activeSession) {
      setUserLiquidity([]);
      return;
    }

    try {
      setLoading(true);
      const result = await rpc.get_table_rows({
        json: true,
        code: "xprswap",
        scope: "xprswap",
        table: "liquidity",
        index_position: 2,
        key_type: "i64",
        lower_bound: activeSession.auth.actor.toString(),
        upper_bound: activeSession.auth.actor.toString(),
        limit: 100,
      });

      setUserLiquidity(result.rows);
      console.log("User liquidity positions:", result.rows);
    } catch (error) {
      console.error("Failed to fetch liquidity:", error);
      setUserLiquidity([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPools = async () => {
    try {
      setLoading(true);
      const result = await rpc.get_table_rows({
        json: true,
        code: "xprswap",
        scope: "xprswap",
        table: "pools",
        limit: 100,
      });

      // Fetch swaps for all pools in parallel
      const poolsWithSwaps = await Promise.all(
        result.rows.map(async (pool) => {
          const swaps = await fetchPoolSwaps(pool.id);
          return { pool, swaps };
        })
      );

      // Transform blockchain data to UI format
      const transformedPools = poolsWithSwaps.map(({ pool, swaps }) => {
        const token0Info = getTokenInfo(pool.token0, pool.token0_symbol);
        const token1Info = getTokenInfo(pool.token1, pool.token1_symbol);

        token0Info.balance = getUserTokenBalance(
          token0Info.symbol,
          pool.token0_contract
        );
        token1Info.balance = getUserTokenBalance(
          token1Info.symbol,
          pool.token1_contract
        );

        const tvl = calculateTVL(
          pool.reserve0,
          pool.reserve1,
          token0Info,
          token1Info
        );

        const volume24h = calculateVolume(swaps, pool, allTokens, 24);
        const volume7d = calculateVolume(swaps, pool, allTokens, 168);
        const fees24h = calculateFees(swaps, pool, allTokens, 24);

        const userPosition = userLiquidity.find(
          (liq) => liq.pool_id === pool.id
        );

        let yourLiquidityUSD = 0;
        if (userPosition && pool.lp_supply > 0) {
          const userShare = userPosition.lp_balance / pool.lp_supply;
          yourLiquidityUSD = tvl * userShare;
        }

        const poolWithMetrics = {
          id: pool.id,
          token0: token0Info,
          token1: token1Info,
          token0_contract: pool.token0_contract,
          token1_contract: pool.token1_contract,
          reserve0: pool.reserve0,
          reserve1: pool.reserve1,
          token0_symbol: pool.token0_symbol,
          token1_symbol: pool.token1_symbol,
          lp_supply: pool.lp_supply,
          tvl: tvl,
          volume24h: volume24h,
          volume7d: volume7d,
          fees24h: fees24h,
          yourLiquidity: yourLiquidityUSD,
          userPosition: userPosition,
          kLast: pool.kLast,
          created_at: pool.created_at,
        };

        poolWithMetrics.apr = calculateAPR(
          swaps,
          pool,
          poolWithMetrics,
          allTokens,
          config
        );

        return poolWithMetrics;
      });

      setPools(transformedPools);
    } catch (error) {
      console.error("Failed to fetch pools:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch swaps for a specific pool
  const fetchPoolSwaps = async (poolId) => {
    try {
      const result = await rpc.get_table_rows({
        json: true,
        code: "xprswap",
        scope: "xprswap",
        table: "swaps",
        index_position: 2, // bypool
        key_type: "i64",
        lower_bound: poolId,
        upper_bound: poolId,
        limit: 1000,
      });

      return Array.isArray(result.rows) ? result.rows : [];
    } catch (error) {
      console.error(`Failed to fetch swaps for pool ${poolId}:`, error);
      return [];
    }
  };

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  // Load user liquidity when wallet connects
  useEffect(() => {
    if (walletConnected && activeSession) {
      fetchLiquidity();
      fetchAllTokens();
    } else {
      setUserLiquidity([]);
      setUserBalance([]);
    }
  }, [walletConnected, activeSession]);

  // Load pools when tokens and config are ready
  useEffect(() => {
    if (!isLoading && allTokens.length > 0) {
      fetchPools();
    }
  }, [isLoading, allTokens, config, userLiquidity, userBalance]);

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return "$0.00";
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(4)}`;
  };

  const filteredPools = pools.filter((pool) => {
    if (!pool.token0 || !pool.token1) return false;

    const search = searchQuery.toLowerCase().trim();
    const token0Symbol = pool.token0.symbol.toLowerCase();
    const token1Symbol = pool.token1.symbol.toLowerCase();
    const token0Name = pool.token0.name.toLowerCase();
    const token1Name = pool.token1.name.toLowerCase();

    // Match individual token searches
    const matchesSingle =
      token0Symbol.includes(search) ||
      token1Symbol.includes(search) ||
      token0Name.includes(search) ||
      token1Name.includes(search);

    // Combine pool pairs
    const poolCombo1 = `${token0Symbol}/${token1Symbol}`;
    const poolCombo2 = `${token1Symbol}/${token0Symbol}`;

    const matchesPair =
      poolCombo1.includes(search) || poolCombo2.includes(search);

    const matchesSearch = matchesSingle || matchesPair;

    if (activeTab === "my") return pool.yourLiquidity > 0 && matchesSearch;
    return matchesSearch;
  });

  // Sort pools
  const sortedPools = [...filteredPools].sort((a, b) => {
    const multiplier = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "tvl") return (a.tvl - b.tvl) * multiplier;
    if (sortBy === "volume") return (a.volume24h - b.volume24h) * multiplier;
    if (sortBy === "apr") return (a.apr - b.apr) * multiplier;
    return 0;
  });

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  // Calculate total stats
  const totalTVL = pools.reduce((sum, pool) => sum + (pool.tvl || 0), 0);
  const totalVolume24h = pools.reduce(
    (sum, pool) => sum + (pool.volume24h || 0),
    0
  );
  const myTotalLiquidity = pools.reduce(
    (sum, pool) => sum + (pool.yourLiquidity || 0),
    0
  );

  const handleAddLiquidity = (e, pool) => {
    e.stopPropagation();
    setSelectedPool(pool);
    setToken0(pool.token0);
    setToken1(pool.token1);
    setAmount0("");
    setAmount1("");
    setShowAddLiquidity(true);
  };

  // Auto-calculate amount1 based on pool ratio
  const handleAmount0Change = (value) => {
    setAmount0(value);

    if (!selectedPool || !value || parseFloat(value) <= 0) {
      setAmount1("");
      return;
    }

    const amount0Float = parseFloat(value);

    // If pool has liquidity, use pool ratio
    if (selectedPool.reserve0 > 0 && selectedPool.reserve1 > 0) {
      const amount0Raw = Math.floor(
        amount0Float * Math.pow(10, token0.precision)
      );
      const amount1Raw = Math.floor(
        (amount0Raw * selectedPool.reserve1) / selectedPool.reserve0
      );

      const amount1Decimal = amount1Raw / Math.pow(10, token1.precision);
      setAmount1(amount1Decimal.toFixed(token1.precision));
    }

    // If pool is empty, use token prices
    else if (token0.price > 0 && token1.price > 0) {
      const priceRatio = token0.price / token1.price;
      setAmount1((amount0Float * priceRatio).toFixed(token1.precision));
    }
  };

  const handleAmount1Change = (value) => {
    setAmount1(value);

    if (!selectedPool || !value || parseFloat(value) <= 0) {
      setAmount0("");
      return;
    }

    const amount1Float = parseFloat(value);

    // If pool has liquidity, use pool ratio
    if (selectedPool.reserve0 > 0 && selectedPool.reserve1 > 0) {
      const amount1Raw = Math.floor(
        amount1Float * Math.pow(10, token1.precision)
      );

      const amount0Raw = Math.floor(
        (amount1Raw * selectedPool.reserve0) / selectedPool.reserve1
      );

      const amount0Decimal = amount0Raw / Math.pow(10, token0.precision);
      setAmount0(amount0Decimal.toFixed(token0.precision));
    }
    // If pool is empty, use token prices
    else if (token0.price > 0 && token1.price > 0) {
      const priceRatio = token1.price / token0.price;
      setAmount0((amount1Float * priceRatio).toFixed(token0.precision));
    }
  };

  const liquidityAdd = async () => {
    if (!walletConnected) {
      connectWallet();
      return;
    }

    try {
      if (!amount0 || !amount1 || !selectedPool) {
        alert("Please enter amounts for both tokens");
        return;
      }

      if (parseFloat(amount0) <= 0 || parseFloat(amount1) <= 0) {
        alert("Amounts must be greater than zero");
        return;
      }

      if (parseFloat(amount0) > token0.balance) {
        alert(
          `Insufficient ${token0.symbol} balance. You have ${token0.balance} ${token0.symbol}`
        );
        return;
      }

      if (parseFloat(amount1) > token1.balance) {
        alert(
          `Insufficient ${token1.symbol} balance. You have ${token1.balance} ${token1.symbol}`
        );
        return;
      }

      setLoading(true);

      const parseSymbolInfo = (symbolStr) => {
        const parts = symbolStr.split(",");
        return {
          precision: parseInt(parts[0]),
          symbol: parts[1],
        };
      };

      const token0Info = selectedPool?.token0_symbol
        ? parseSymbolInfo(selectedPool.token0_symbol)
        : { precision: 0, symbol: "" };

      const token1Info = selectedPool?.token1_symbol
        ? parseSymbolInfo(selectedPool.token1_symbol)
        : { precision: 0, symbol: "" };

      const amount0Raw = Math.floor(
        parseFloat(amount0) * Math.pow(10, token0Info.precision)
      );
      const amount1Raw = Math.floor(
        parseFloat(amount1) * Math.pow(10, token1Info.precision)
      );

      const slippageWithBuffer = slippage + 0.5;
      const amount0Min = Math.floor(
        amount0Raw * (1 - slippageWithBuffer / 100)
      );
      const amount1Min = Math.floor(
        amount1Raw * (1 - slippageWithBuffer / 100)
      );

      const formatAsset = (rawAmount, precision, symbol) => {
        const value = (rawAmount / Math.pow(10, precision)).toFixed(precision);
        return `${value} ${symbol}`;
      };

      const amount0Asset = formatAsset(
        amount0Raw,
        token0Info.precision,
        token0Info.symbol
      );
      const amount1Asset = formatAsset(
        amount1Raw,
        token1Info.precision,
        token1Info.symbol
      );
      const amount0MinAsset = formatAsset(
        amount0Min,
        token0Info.precision,
        token0Info.symbol
      );
      const amount1MinAsset = formatAsset(
        amount1Min,
        token1Info.precision,
        token1Info.symbol
      );

      const actions = [
        {
          account: "xprswap",
          name: "depositprep",
          authorization: [
            {
              actor: activeSession.auth.actor.toString(),
              permission: activeSession.auth.permission.toString(),
            },
          ],
          data: {
            owner: activeSession.auth.actor.toString(),
            symbols: [
              {
                contract: selectedPool.token0_contract,
                sym: selectedPool.token0_symbol,
              },
              {
                contract: selectedPool.token1_contract,
                sym: selectedPool.token1_symbol,
              },
            ],
          },
        },

        // Action 2: Transfer token0
        {
          account: selectedPool.token0_contract,
          name: "transfer",
          authorization: [
            {
              actor: activeSession.auth.actor.toString(),
              permission: activeSession.auth.permission.toString(),
            },
          ],
          data: {
            from: activeSession.auth.actor.toString(),
            to: "xprswap",
            quantity: amount0Asset,
            memo: "deposit",
          },
        },

        // Action 3: Transfer token1
        {
          account: selectedPool.token1_contract,
          name: "transfer",
          authorization: [
            {
              actor: activeSession.auth.actor.toString(),
              permission: activeSession.auth.permission.toString(),
            },
          ],
          data: {
            from: activeSession.auth.actor.toString(),
            to: "xprswap",
            quantity: amount1Asset,
            memo: "deposit",
          },
        },

        // Action 4: liquidityadd
        {
          account: "xprswap",
          name: "liquidityadd",
          authorization: [
            {
              actor: activeSession.auth.actor.toString(),
              permission: activeSession.auth.permission.toString(),
            },
          ],
          data: {
            owner: activeSession.auth.actor.toString(),
            add_token1: {
              quantity: amount0Asset,
              contract: selectedPool.token0_contract,
            },
            add_token2: {
              quantity: amount1Asset,
              contract: selectedPool.token1_contract,
            },
            add_token1_min: {
              quantity: amount0MinAsset,
              contract: selectedPool.token0_contract,
            },
            add_token2_min: {
              quantity: amount1MinAsset,
              contract: selectedPool.token1_contract,
            },
          },
        },

        // Action 5: withdrawall
        {
          account: "xprswap",
          name: "withdrawall",
          authorization: [
            {
              actor: activeSession.auth.actor.toString(),
              permission: activeSession.auth.permission.toString(),
            },
          ],
          data: {
            owner: activeSession.auth.actor.toString(),
          },
        },
      ];

      const result = await activeSession.transact(
        {
          actions,
        },
        {
          broadcast: true,
        }
      );

      alert(
        `✅ Liquidity added successfully!\n\nTransaction ID: ${result.processed.id}`
      );

      setAmount0("");
      setAmount1("");
      setShowAddLiquidity(false);
      setLoading(false);

      await fetchLiquidity();
      await fetchAllTokens();
      await fetchPools();
    } catch (e) {
      console.error("❌ Transaction failed:", e);
      setLoading(false);
    }
  };

  const handleCreatePoolSuccess = () => {
    fetchPools();
  };

  // Handle remove button click
  const handleRemoveClick = (pool, e) => {
    e.stopPropagation();
    setSelectedPool(pool);
    setShowRemoveModal(true);
  };

  // Handle remove liquidity transaction
  const handleRemoveLiquidity = async (removeParams) => {
    try {
      // Your transaction logic here
      // const result = await session.transact({
      //   actions: [
      //     {
      //       account: 'xprswap', // Your contract name
      //       name: 'remliquidity',
      //       authorization: [session.permissionLevel],
      //       data: {
      //         token0: removeParams.token0,
      //         token1: removeParams.token1,
      //         token0_contract: removeParams.token0Contract,
      //         token1_contract: removeParams.token1Contract,
      //         liquidity: removeParams.liquidity,
      //         amount0_min: removeParams.amount0Min,
      //         amount1_min: removeParams.amount1Min,
      //         token0_symbol: removeParams.token0Symbol,
      //         token1_symbol: removeParams.token1Symbol,
      //         token0_precision: removeParams.token0Precision,
      //         token1_precision: removeParams.token1Precision,
      //         provider: removeParams.provider,
      //       },
      //     },
      //   ],
      // });

      console.log("Liquidity removed successfully:");

      // Refresh pools data
      await fetchPools();

      // Show success notification (optional)
      // showNotification('Liquidity removed successfully!', 'success');
    } catch (error) {
      console.error("Failed to remove liquidity:", error);
      // Show error notification (optional)
      // showNotification('Failed to remove liquidity', 'error');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className={styles.poolsPage}>
        <div className={styles.loading}>
          <div className={styles.spinner}>⏳</div>
          <p>Loading pools...</p>
        </div>
      </div>
    );
  }

  const renderTokenLogo = (logo, alt = "Token", className = "") => {
    const isUrl =
      logo && (logo.startsWith("http://") || logo.startsWith("https://"));

    if (isUrl) {
      return (
        <span className="relative inline-flex items-center">
          <img
            src={logo}
            alt={alt}
            className={className}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback =
                e.currentTarget.parentNode.querySelector(".fallback-logo");
              if (fallback) fallback.style.display = "inline-block";
            }}
          />
          <span
            className={`fallback-logo ${className}`}
            style={{ display: "none" }}
          >
            🪙
          </span>
        </span>
      );
    }

    return <span className={className}>{logo || "🪙"}</span>;
  };

  return (
    <div className={styles.poolsPage}>
      {/* Header Stats */}
      <div className={styles.statsHeader}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Value Locked</div>
          <div className={styles.statValue}>{formatCurrency(totalTVL)}</div>
          <div className={cn(styles.statChange, styles.positive)}>
            {pools.length} Pools
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>24h Volume</div>
          <div className={styles.statValue}>
            {formatCurrency(totalVolume24h)}
          </div>
          <div className={cn(styles.statChange)}>
            From recent trading activity
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Your Liquidity</div>
          <div className={styles.statValue}>
            {formatCurrency(myTotalLiquidity)}
          </div>
          <div className={styles.statChange}>
            {pools.filter((p) => p.yourLiquidity > 0).length} Active Pools
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.poolsContainer}>
        <div className={styles.poolsHeader}>
          <h1>Liquidity Pools</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.btnSecondary}
              onClick={() => setShowCreatePool(true)}
            >
              <span className={styles.icon}>⚡</span> Create Pool
            </button>
            <button
              className={styles.btnPrimary}
              onClick={(e) => {
                if (pools.length > 0) {
                  handleAddLiquidity(e, pools[0]);
                }
              }}
            >
              <span className={styles.icon}>+</span> Add Liquidity
            </button>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className={styles.controls}>
          <div className={styles.tabs}>
            <button
              className={cn(styles.tab, {
                [styles.active]: activeTab === "all",
              })}
              onClick={() => setActiveTab("all")}
            >
              All Pools ({pools.length})
            </button>
            <button
              className={cn(styles.tab, {
                [styles.active]: activeTab === "my",
              })}
              onClick={() => setActiveTab("my")}
            >
              My Pools ({pools.filter((p) => p.yourLiquidity > 0).length})
            </button>
          </div>

          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search tokens and pools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Pools Table */}
        <div className={styles.tableContainer}>
          <table className={styles.poolsTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Pool</th>
                <th
                  onClick={() => handleSort("tvl")}
                  className={cn(styles.sortable)}
                >
                  TVL {sortBy === "tvl" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("volume")}
                  className={cn(styles.sortable)}
                >
                  24h Volume{" "}
                  {sortBy === "volume" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>7d Volume</th>
                <th>24h Fees</th>
                <th
                  onClick={() => handleSort("apr")}
                  className={cn(styles.sortable)}
                >
                  APR {sortBy === "apr" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>LP Supply</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPools.map((pool, index) => (
                <tr
                  key={pool.id}
                  className={activeTab === "my" ? styles.myLiquidity : ""}
                  onClick={() =>
                    navigate(
                      `/swap?from=${pool.token0.symbol}&to=${pool.token1.symbol}`
                    )
                  }
                >
                  <td className={styles.poolRank}>{index + 1}</td>
                  <td className={styles.poolPair}>
                    <div className={styles.tokenLogos}>
                      {renderTokenLogo(
                        pool.token0.logo,
                        pool.token0.symbol,
                        styles.tokenLogo
                      )}
                      {renderTokenLogo(
                        pool.token1.logo,
                        pool.token1.symbol,
                        styles.tokenLogo
                      )}
                    </div>

                    <div className={styles.pairInfo}>
                      <div className={styles.pairSymbols}>
                        {pool.token0.symbol}/{pool.token1.symbol}
                      </div>
                      <div className={styles.pairNames}>
                        {pool.token0.name} - {pool.token1.name}
                      </div>
                    </div>
                  </td>
                  <td className={styles.poolTvl}>
                    <div className={styles.value}>
                      {formatCurrency(pool.tvl)}
                    </div>
                  </td>
                  <td className={styles.poolVolume}>
                    <div className={styles.value}>
                      {formatCurrency(pool.volume24h)}
                    </div>
                  </td>
                  <td className={styles.poolVolume}>
                    <div className={styles.value}>
                      {formatCurrency(pool.volume7d)}
                    </div>
                  </td>
                  <td className={styles.poolFees}>
                    <div className={styles.value}>
                      {formatCurrency(pool.fees24h)}
                    </div>
                  </td>
                  <td className={styles.poolApr}>
                    <span
                      className={cn(
                        styles.aprBadge,
                        { [styles.high]: pool.apr > 30 },
                        { [styles.medium]: pool.apr > 20 && pool.apr <= 30 },
                        { [styles.low]: pool.apr <= 20 }
                      )}
                    >
                      {pool.apr.toFixed(2)}%
                    </span>
                  </td>
                  <td className={styles.poolLiquidity}>
                    {pool.lp_supply > 0 ? (
                      <div className={styles.value}>
                        {pool.lp_supply.toLocaleString()}
                      </div>
                    ) : (
                      <span className={styles.noLiquidity}>Empty</span>
                    )}
                  </td>
                  <td className={styles.poolActions}>
                    <button
                      className={cn(styles.btnAction, styles.btnAdd)}
                      onClick={(e) => handleAddLiquidity(e, pool)}
                    >
                      Add
                    </button>
                    {pool.yourLiquidity > 0 && activeTab === "my" && (
                      <button
                        className={cn(styles.btnAction, styles.btnRemove)}
                        onClick={(e) => handleRemoveClick(pool, e)}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedPools.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏊</div>
            <h3>No pools found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add Liquidity Modal */}
      {showAddLiquidity && token0 && token1 && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAddLiquidity(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add Liquidity</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowAddLiquidity(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {selectedPool && (
                <div className={styles.poolInfoBanner}>
                  <div className={styles.poolPairLarge}>
                    {renderTokenLogo(
                      token0.logo,
                      token0.symbol,
                      styles.tokenLogoLarge
                    )}
                    {renderTokenLogo(
                      token1.logo,
                      token1.symbol,
                      styles.tokenLogoLarge
                    )}
                    <span className={styles.pairText}>
                      {token0.symbol}/{token1.symbol}
                    </span>
                  </div>

                  <div className={styles.poolStatsInline}>
                    <div className={styles.statInline}>
                      <span className={styles.label}>APR:</span>
                      <span className={cn(styles.value, styles.apr)}>
                        {selectedPool.apr.toFixed(1)}%
                      </span>
                    </div>
                    <div className={styles.statInline}>
                      <span className={styles.label}>TVL:</span>
                      <span className={styles.value}>
                        {formatCurrency(selectedPool.tvl)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Token Input 1 */}
              <div className={styles.inputGroup}>
                <div className={styles.inputHeader}>
                  <label>Token 1</label>
                  <span className={styles.balance}>
                    Balance:{" "}
                    {token0.balance?.toFixed(token0.precision) || "0.0000"}
                    {token0.balance > 0 && (
                      <span style={{ color: "#22c55e", marginLeft: "4px" }}>
                        ✓
                      </span>
                    )}
                  </span>
                </div>
                <div className={styles.inputWrapper}>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={amount0}
                    onChange={(e) => handleAmount0Change(e.target.value)}
                  />

                  <div className={styles.tokenSelect}>
                    {renderTokenLogo(
                      token0.logo,
                      token0.symbol,
                      styles.tokenLogo
                    )}
                    <span className={styles.tokenSymbol}>{token0.symbol}</span>
                  </div>
                </div>

                {token0.balance > 0 && (
                  <button
                    className={styles.maxBtn}
                    onClick={() =>
                      handleAmount0Change(token0.balance?.toString() || "0")
                    }
                  >
                    MAX
                  </button>
                )}
                {parseFloat(amount0) > token0.balance && (
                  <div
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    Insufficient {token0.symbol} balance
                  </div>
                )}
              </div>

              {/* Plus Icon */}
              <div className={styles.inputDivider}>
                <div className={styles.plusIcon}>+</div>
              </div>

              {/* Token Input 2 */}
              <div className={styles.inputGroup}>
                <div className={styles.inputHeader}>
                  <label>Token 2</label>
                  <span className={styles.balance}>
                    Balance:{" "}
                    {token1.balance?.toFixed(token1.precision) || "0.0"}
                    {token1.balance > 0 && (
                      <span style={{ color: "#22c55e", marginLeft: "4px" }}>
                        ✓
                      </span>
                    )}
                  </span>
                </div>
                <div className={styles.inputWrapper}>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={amount1}
                    onChange={(e) => handleAmount1Change(e.target.value)}
                  />

                  <div className={styles.tokenSelect}>
                    {renderTokenLogo(
                      token1.logo,
                      token1.symbol,
                      styles.tokenLogo
                    )}
                    <span className={styles.tokenSymbol}>{token1.symbol}</span>
                  </div>
                </div>

                {token1.balance > 0 && (
                  <button
                    className={styles.maxBtn}
                    onClick={() =>
                      handleAmount1Change(token1.balance?.toString() || "0")
                    }
                  >
                    MAX
                  </button>
                )}
                {parseFloat(amount1) > token1.balance && (
                  <div
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    Insufficient {token1.symbol} balance
                  </div>
                )}
              </div>

              {/* Slippage Settings */}
              <div className={styles.settingsSection}>
                <div className={styles.settingHeader}>
                  <span>Slippage Tolerance</span>
                  <span className={styles.settingValue}>{slippage}%</span>
                </div>
                <div className={styles.slippageOptions}>
                  {[0.1, 0.5, 1.0].map((value) => (
                    <button
                      key={value}
                      className={cn(styles.slippageBtn, {
                        [styles.active]: slippage === value,
                      })}
                      onClick={() => setSlippage(value)}
                    >
                      {value}%
                    </button>
                  ))}
                  <input
                    type="number"
                    className={styles.customSlippage}
                    placeholder="Custom"
                    onChange={(e) =>
                      setSlippage(parseFloat(e.target.value) || 0.5)
                    }
                  />
                </div>
              </div>

              {/* Price Info */}
              {selectedPool && amount0 && selectedPool.reserve0 > 0 && (
                <div className={styles.priceInfo}>
                  <div className={styles.infoRow}>
                    <span>Price</span>
                    <span>
                      1 {token0.symbol} ={" "}
                      {(
                        selectedPool.reserve1 /
                        Math.pow(10, token1.precision) /
                        (selectedPool.reserve0 / Math.pow(10, token0.precision))
                      ).toFixed(6)}{" "}
                      {token1.symbol}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Pool Reserves</span>
                    <span>
                      {(
                        selectedPool.reserve0 / Math.pow(10, token0.precision)
                      ).toFixed(token0.precision)}{" "}
                      {token0.symbol} /{" "}
                      {(
                        selectedPool.reserve1 / Math.pow(10, token1.precision)
                      ).toFixed(token1.precision)}{" "}
                      {token1.symbol}
                    </span>
                  </div>
                  {selectedPool.yourLiquidity > 0 && (
                    <div className={styles.infoRow}>
                      <span>Your Liquidity</span>
                      <span>{formatCurrency(selectedPool.yourLiquidity)}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedPool && selectedPool.reserve0 === 0 && (
                <div className={styles.priceInfo}>
                  <div className={styles.infoRow}>
                    <span>⚠️ Empty Pool</span>
                    <span>You'll set the initial price</span>
                  </div>
                  {token0.price > 0 && token1.price > 0 && (
                    <div className={styles.infoRow}>
                      <span>Suggested Price (Market)</span>
                      <span>
                        1 {token0.symbol} ={" "}
                        {(token0.price / token1.price).toFixed(6)}{" "}
                        {token1.symbol}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className={styles.modalActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setShowAddLiquidity(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.btnPrimary}
                  disabled={
                    activeSession &&
                    (!amount0 ||
                      !amount1 ||
                      parseFloat(amount0) > token0.balance ||
                      parseFloat(amount1) > token1.balance ||
                      loading)
                  }
                  onClick={() => liquidityAdd()}
                >
                  {loading
                    ? "Processing..."
                    : !activeSession
                    ? "Connect Wallet"
                    : parseFloat(amount0) > token0.balance ||
                      parseFloat(amount1) > token1.balance
                    ? "Insufficient Balance"
                    : "Add Liquidity"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreatePoolModal
        show={showCreatePool}
        onClose={() => setShowCreatePool(false)}
        onSuccess={handleCreatePoolSuccess}
        allTokens={allTokens}
        existingPools={pools}
        getUserTokenBalance={getUserTokenBalance}
        renderTokenLogo={renderTokenLogo}
      />

      {/* Remove Liquidity Modal */}
      {showRemoveModal && selectedPool && (
        <RemoveLiquidityModal
          show={showRemoveModal}
          onClose={() => {
            setShowRemoveModal(false);
            setSelectedPool(null);
          }}
          pool={selectedPool}
          userPosition={selectedPool.userPosition}
          onRemove={handleRemoveLiquidity}
          renderTokenLogo={renderTokenLogo}
          accountName={activeSession.auth.actor.toString()}
        />
      )}
    </div>
  );
};

export default PoolsPage;
