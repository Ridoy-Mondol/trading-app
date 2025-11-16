// import { useState, useEffect, useMemo } from "react";
// import styles from "./swap.module.sass";
// import cn from "classnames";
// import { JsonRpc } from "eosjs";
// import { useWallet } from "../../context/WalletContext";
// import { useTokens } from "../../hooks/useTokens";
// import Icon from "../../components/Icon";
// import { Repeat, ArrowUpDown, Search, X } from "lucide-react";
// import { MdRefresh, MdSettings } from "react-icons/md";

// const SwapPage = () => {
//   const [pools, setPools] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userBalance, setUserBalance] = useState([]);
//   const [fromToken, setFromToken] = useState(null);
//   const [toToken, setToToken] = useState(null);
//   // const [fromToken, setFromToken] = useState({
//   //   symbol: "XPR",
//   //   name: "Proton",
//   //   logo: "🟣",
//   //   balance: 1250.5,
//   //   price: 0.0125,
//   // });

//   // const [toToken, setToToken] = useState({
//   //   symbol: "XUSDT",
//   //   name: "Tether USD",
//   //   logo: "💵",
//   //   balance: 500.25,
//   //   price: 1.0,
//   // });

//   const [fromAmount, setFromAmount] = useState("");
//   const [toAmount, setToAmount] = useState("");
//   const [slippage, setSlippage] = useState(0.5);
//   const [showSettings, setShowSettings] = useState(false);
//   const [showDetails, setShowDetails] = useState(false);
//   const [showTokenModal, setShowTokenModal] = useState(false);
//   const [selectingToken, setSelectingToken] = useState("");
//   const [tokenSearch, setTokenSearch] = useState("");

//   const { activeSession, walletConnected, connectWallet } = useWallet();
//   const { data: allTokens = [], isLoading } = useTokens();
//   const rpc = new JsonRpc(process.env.REACT_APP_PROTON_ENDPOINT);

//   console.log(allTokens);

//   // Create enriched token list with balance and price data
//   const enrichedTokenList = useMemo(() => {
//     if (!allTokens.length) return [];

//     return allTokens.map((token) => {
//       const userBal = userBalance.find(
//         (bal) => bal.symbol === token.symbol && bal.contract === token.account
//       );

//       return {
//         symbol: token.symbol,
//         name: token.metadata?.name || token.symbol,
//         logo: token.metadata?.logo || "🪙",
//         balance: userBal?.amount || 0,
//         price: token.price?.usd || 0,
//         contract: token.account,
//         precision: token.supply?.precision || 4,
//       };
//     });
//   }, [allTokens, userBalance]);

//   // Mock token list
//   // const tokenList = [
//   //   {
//   //     symbol: "XPR",
//   //     name: "Proton",
//   //     logo: "🟣",
//   //     balance: 1250.5,
//   //     price: 0.0125,
//   //   },
//   //   {
//   //     symbol: "XUSDT",
//   //     name: "Tether USD",
//   //     logo: "💵",
//   //     balance: 500.25,
//   //     price: 1.0,
//   //   },
//   //   {
//   //     symbol: "XUSDC",
//   //     name: "USD Coin",
//   //     logo: "💎",
//   //     balance: 750.0,
//   //     price: 1.0,
//   //   },
//   //   { symbol: "XBTC", name: "Bitcoin", logo: "₿", balance: 0.5, price: 45000 },
//   //   { symbol: "XETH", name: "Ethereum", logo: "Ξ", balance: 2.5, price: 3000 },
//   //   {
//   //     symbol: "XBNB",
//   //     name: "Binance Coin",
//   //     logo: "🟡",
//   //     balance: 10.0,
//   //     price: 320,
//   //   },
//   //   { symbol: "XSOL", name: "Solana", logo: "◎", balance: 25.0, price: 110 },
//   //   {
//   //     symbol: "XDOGE",
//   //     name: "Dogecoin",
//   //     logo: "🐕",
//   //     balance: 10000,
//   //     price: 0.08,
//   //   },
//   // ];

//   // Filter tokens based on search
//   // const filteredTokens = tokenList.filter(
//   //   (token) =>
//   //     token.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
//   //     token.name.toLowerCase().includes(tokenSearch.toLowerCase())
//   // );

//   const filteredTokens = useMemo(() => {
//     if (!tokenSearch) return enrichedTokenList;

//     return enrichedTokenList.filter(
//       (token) =>
//         token.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
//         token.name.toLowerCase().includes(tokenSearch.toLowerCase())
//     );
//   }, [enrichedTokenList, tokenSearch]);

//   // Find pool for selected token pair
//   const currentPool = useMemo(() => {
//     if (!fromToken || !toToken || !pools.length) return null;

//     return pools.find(
//       (pool) =>
//         (pool.token0 === fromToken.symbol.toLowerCase() &&
//           pool.token1 === toToken.symbol.toLowerCase()) ||
//         (pool.token1 === fromToken.symbol.toLowerCase() &&
//           pool.token0 === toToken.symbol.toLowerCase())
//     );
//   }, [fromToken, toToken, pools]);

//   // Calculate exchange rate and price impact
//   const swapCalculations = useMemo(() => {
//     if (!fromAmount || !fromToken || !toToken || !currentPool) {
//       return {
//         exchangeRate: 0,
//         priceImpact: 0,
//         minimumReceived: 0,
//         liquidityProviderFee: 0,
//         estimatedOutput: 0,
//       };
//     }

//     const inputAmount = parseFloat(fromAmount);
//     const isToken0 = currentPool.token0 === fromToken.symbol.toLowerCase();

//     const reserveIn = isToken0 ? currentPool.reserve0 : currentPool.reserve1;
//     const reserveOut = isToken0 ? currentPool.reserve1 : currentPool.reserve0;

//     // Calculate output using constant product formula with 0.3% fee
//     const amountInWithFee = inputAmount * 997;
//     const numerator = amountInWithFee * reserveOut;
//     const denominator = reserveIn * 1000 + amountInWithFee;
//     const estimatedOutput = numerator / denominator;

//     // Calculate exchange rate
//     const exchangeRate = estimatedOutput / inputAmount;

//     // Calculate price impact
//     const midPrice = reserveOut / reserveIn;
//     const executionPrice = estimatedOutput / inputAmount;
//     const priceImpact = Math.abs(
//       ((executionPrice - midPrice) / midPrice) * 100
//     );

//     // Calculate minimum received with slippage
//     const minimumReceived = estimatedOutput * (1 - slippage / 100);

//     // Calculate LP fee
//     const liquidityProviderFee = inputAmount * 0.003;

//     return {
//       exchangeRate: exchangeRate.toFixed(6),
//       priceImpact: priceImpact.toFixed(2),
//       minimumReceived: minimumReceived.toFixed(toToken.precision),
//       liquidityProviderFee: liquidityProviderFee.toFixed(fromToken.precision),
//       estimatedOutput: estimatedOutput.toFixed(toToken.precision),
//     };
//   }, [fromAmount, fromToken, toToken, currentPool, slippage]);

//   // Fetch all user token balances
//   const fetchAllTokens = async () => {
//     if (!activeSession?.auth?.actor) {
//       setUserBalance([]);
//       return;
//     }

//     try {
//       const accountName = activeSession.auth.actor.toString();
//       const isTestnet = process.env.REACT_APP_NETWORK === "testnet";

//       if (isTestnet) {
//         const contracts = [
//           "xtokens",
//           "eosio.token",
//           "snipx",
//           "loan.token",
//           "xmd.token",
//         ];

//         const allBalances = [];

//         for (const contract of contracts) {
//           try {
//             const balances = await rpc.get_currency_balance(
//               contract,
//               accountName
//             );

//             balances.forEach((str) => {
//               const [amount, symbol] = str.split(" ");
//               allBalances.push({
//                 symbol,
//                 amount: parseFloat(amount),
//                 contract,
//               });
//             });
//           } catch (error) {
//             console.error(`Failed to fetch from ${contract}:`, error);
//           }
//         }

//         setUserBalance(allBalances);
//         console.log("User balances loaded:", allBalances);
//       } else {
//         const response = await fetch(
//           `https://proton.eosusa.io/v2/state/get_tokens?account=${accountName}`
//         );
//         const data = await response.json();
//         setUserBalance(
//           data.tokens.map((t) => ({
//             symbol: t.symbol,
//             amount: t.amount,
//             contract: t.contract,
//           }))
//         );
//         console.log("User balances loaded:", data.tokens);
//       }
//     } catch (error) {
//       console.error("Failed to fetch user balances:", error);
//       setUserBalance([]);
//     }
//   };

//   console.log(userBalance);

//   useEffect(() => {
//     if (walletConnected && activeSession) {
//       fetchAllTokens();
//     } else {
//       setUserBalance([]);
//     }
//   }, [walletConnected, activeSession]);

//   const fetchPools = async () => {
//     try {
//       setLoading(true);
//       const result = await rpc.get_table_rows({
//         json: true,
//         code: "xprswap",
//         scope: "xprswap",
//         table: "pools",
//         limit: 100,
//       });

//       setPools(result.rows);
//       console.log("Pools:", result.rows);
//     } catch (error) {
//       console.error("Failed to fetch pools:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//       if (!isLoading && allTokens.length > 0) {
//         fetchPools();
//       }
//     }, [isLoading, allTokens]);

//   // Set default tokens once data is loaded
//   useEffect(() => {
//     if (enrichedTokenList.length > 0 && !fromToken && !toToken) {
//       const xbtc = enrichedTokenList.find((t) => t.symbol === "XBTC");
//       const xusdt = enrichedTokenList.find((t) => t.symbol === "XUSDT");

//       if (xbtc) setFromToken(xbtc);
//       if (xusdt) setToToken(xusdt);
//     }
//   }, [enrichedTokenList]);

//   const handleFromAmountChange = (value) => {
//     setFromAmount(value);
//     if (value && !isNaN(value) && currentPool) {
//       setToAmount(swapCalculations.estimatedOutput);
//     } else {
//       setToAmount("");
//     }
//   };

//   const handleToAmountChange = (value) => {
//     setToAmount(value);
//     if (value && !isNaN(value) && currentPool) {
//       // Reverse calculation
//       const outputAmount = parseFloat(value);
//       const isToken0 = currentPool.token0 === fromToken.symbol.toLowerCase();
//       const reserveIn = isToken0 ? currentPool.reserve0 : currentPool.reserve1;
//       const reserveOut = isToken0 ? currentPool.reserve1 : currentPool.reserve0;

//       const numerator = reserveIn * outputAmount * 1000;
//       const denominator = (reserveOut - outputAmount) * 997;
//       const inputAmount = numerator / denominator;

//       setFromAmount(inputAmount.toFixed(fromToken.precision));
//     } else {
//       setFromAmount("");
//     }
//   };

//   const handleSwapTokens = () => {
//     const tempToken = fromToken;
//     setFromToken(toToken);
//     setToToken(tempToken);
//     setFromAmount(toAmount);
//     setToAmount(fromAmount);
//   };

//   const handleMaxClick = () => {
//     if (fromToken) {
//       handleFromAmountChange(fromToken.balance.toString());
//     }
//   };

//   const handleSwap = () => {
//     if (!walletConnected) {
//       alert("Please connect your wallet first");
//       return;
//     }
//     alert("Swap functionality will be implemented");
//   };

//   const openTokenModal = (type) => {
//     setSelectingToken(type);
//     setShowTokenModal(true);
//     setTokenSearch("");
//   };

//   const closeTokenModal = () => {
//     setShowTokenModal(false);
//     setSelectingToken("");
//     setTokenSearch("");
//   };

//   const selectToken = (token) => {
//     if (selectingToken === "from") {
//       setFromToken(token);
//       if (fromAmount) {
//         handleFromAmountChange(fromAmount);
//       }
//     } else {
//       setToToken(token);
//       if (fromAmount) {
//         handleFromAmountChange(fromAmount);
//       }
//     }
//     closeTokenModal();
//   };

//   // Mock price data
//   const priceImpact = 0.02;
//   const exchangeRate = (fromToken.price / toToken.price).toFixed(6);
//   const minimumReceived = toAmount
//     ? (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)
//     : "0";
//   const liquidityProviderFee = fromAmount
//     ? (parseFloat(fromAmount) * 0.003).toFixed(6)
//     : "0";

//   // const handleFromAmountChange = (value) => {
//   //   setFromAmount(value);
//   //   if (value && !isNaN(value)) {
//   //     const calculated = (parseFloat(value) * fromToken.price) / toToken.price;
//   //     setToAmount(calculated.toFixed(6));
//   //   } else {
//   //     setToAmount("");
//   //   }
//   // };

//   // const handleToAmountChange = (value) => {
//   //   setToAmount(value);
//   //   if (value && !isNaN(value)) {
//   //     const calculated = (parseFloat(value) * toToken.price) / fromToken.price;
//   //     setFromAmount(calculated.toFixed(6));
//   //   } else {
//   //     setFromAmount("");
//   //   }
//   // };

//   // const handleSwapTokens = () => {
//   //   const tempToken = fromToken;
//   //   setFromToken(toToken);
//   //   setToToken(tempToken);
//   //   setFromAmount(toAmount);
//   //   setToAmount(fromAmount);
//   // };

//   // const handleMaxClick = () => {
//   //   handleFromAmountChange(fromToken.balance.toString());
//   // };

//   // const handleSwap = () => {
//   //   alert("Swap functionality will be implemented");
//   // };

//   // const openTokenModal = (type) => {
//   //   setSelectingToken(type);
//   //   setShowTokenModal(true);
//   //   setTokenSearch("");
//   // };

//   // const closeTokenModal = () => {
//   //   setShowTokenModal(false);
//   //   setSelectingToken("");
//   //   setTokenSearch("");
//   // };

//   // const selectToken = (token) => {
//   //   if (selectingToken === "from") {
//   //     setFromToken(token);
//   //     // Recalculate toAmount if fromAmount exists
//   //     if (fromAmount) {
//   //       const calculated =
//   //         (parseFloat(fromAmount) * token.price) / toToken.price;
//   //       setToAmount(calculated.toFixed(6));
//   //     }
//   //   } else {
//   //     setToToken(token);
//   //     // Recalculate toAmount if fromAmount exists
//   //     if (fromAmount) {
//   //       const calculated =
//   //         (parseFloat(fromAmount) * fromToken.price) / token.price;
//   //       setToAmount(calculated.toFixed(6));
//   //     }
//   //   }
//   //   closeTokenModal();
//   // };

//   return (
//     <div className={styles.swap}>
//       <div className={styles.container}>
//         <div className={styles.content}>
//           {/* Main Swap Card */}
//           <div className={styles.main}>
//             <div className={styles.card}>
//               {/* Card Header */}
//               <div className={styles.cardHeader}>
//                 <div className={styles.cardTitle}>
//                   <Repeat size={20} />
//                   <span>Exchange</span>
//                 </div>
//                 <div className={styles.cardActions}>
//                   <button
//                     className={cn(styles.iconBtn, "tooltip-bottom")}
//                     data-tooltip="Refresh price"
//                   >
//                     <MdRefresh size={20} />
//                   </button>
//                   <button
//                     className={cn(styles.iconBtn, {
//                       [styles.active]: showSettings,
//                     })}
//                     onClick={() => setShowSettings(!showSettings)}
//                   >
//                     <MdSettings size={20} />
//                   </button>
//                 </div>
//               </div>

//               {/* Settings Panel */}
//               {showSettings && (
//                 <div className={styles.settings}>
//                   <div className={styles.settingsRow}>
//                     <div className={styles.settingsLabel}>
//                       <Icon name="lightning" size="16" />
//                       Slippage Tolerance
//                     </div>
//                     <div className={styles.slippageGroup}>
//                       {[0.1, 0.5, 1.0].map((value) => (
//                         <button
//                           key={value}
//                           className={cn(styles.slippageBtn, {
//                             [styles.active]: slippage === value,
//                           })}
//                           onClick={() => setSlippage(value)}
//                         >
//                           {value}%
//                         </button>
//                       ))}
//                       <input
//                         type="number"
//                         className={styles.slippageInput}
//                         placeholder="Custom"
//                         onChange={(e) =>
//                           setSlippage(parseFloat(e.target.value) || 0.5)
//                         }
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* From Token */}
//               <div className={styles.tokenBox}>
//                 <div className={styles.tokenHeader}>
//                   <span className={styles.tokenLabel}>From</span>
//                   <div className={styles.tokenBalance}>
//                     <Icon name="wallet" size="14" />
//                     Balance: {fromToken.balance.toFixed(4)}
//                   </div>
//                 </div>
//                 <div className={styles.tokenInput}>
//                   <input
//                     type="number"
//                     className={styles.amountInput}
//                     value={fromAmount}
//                     onChange={(e) => handleFromAmountChange(e.target.value)}
//                     placeholder="0.00"
//                   />
//                   <div className={styles.tokenRight}>
//                     <button className={styles.maxBtn} onClick={handleMaxClick}>
//                       MAX
//                     </button>
//                     <button
//                       className={styles.tokenBtn}
//                       onClick={() => openTokenModal("from")}
//                     >
//                       <span className={styles.tokenIcon}>{fromToken.logo}</span>
//                       <div className={styles.tokenMeta}>
//                         <div className={styles.tokenSymbol}>
//                           {fromToken.symbol}
//                         </div>
//                       </div>
//                       <Icon name="arrow-down" size="16" />
//                     </button>
//                   </div>
//                 </div>
//                 {fromAmount && (
//                   <div className={styles.tokenUsd}>
//                     ≈ ${(parseFloat(fromAmount) * fromToken.price).toFixed(2)}{" "}
//                     USD
//                   </div>
//                 )}
//               </div>

//               {/* Swap Button */}
//               <div className={styles.swapButtonWrapper}>
//                 <button className={styles.swapIcon} onClick={handleSwapTokens}>
//                   <ArrowUpDown size={24} />
//                 </button>
//               </div>

//               {/* To Token */}
//               <div className={styles.tokenBox}>
//                 <div className={styles.tokenHeader}>
//                   <span className={styles.tokenLabel}>To</span>
//                   <div className={styles.tokenBalance}>
//                     <Icon name="wallet" size="14" />
//                     Balance: {toToken.balance.toFixed(4)}
//                   </div>
//                 </div>
//                 <div className={styles.tokenInput}>
//                   <input
//                     type="number"
//                     className={styles.amountInput}
//                     value={toAmount}
//                     onChange={(e) => handleToAmountChange(e.target.value)}
//                     placeholder="0.00"
//                   />
//                   <div className={styles.tokenRight}>
//                     <button
//                       className={styles.tokenBtn}
//                       onClick={() => openTokenModal("to")}
//                     >
//                       <span className={styles.tokenIcon}>{toToken.logo}</span>
//                       <div className={styles.tokenMeta}>
//                         <div className={styles.tokenSymbol}>
//                           {toToken.symbol}
//                         </div>
//                       </div>
//                       <Icon name="arrow-down" size="16" />
//                     </button>
//                   </div>
//                 </div>
//                 {toAmount && (
//                   <div className={styles.tokenUsd}>
//                     ≈ ${(parseFloat(toAmount) * toToken.price).toFixed(2)} USD
//                   </div>
//                 )}
//               </div>

//               {/* Price Info */}
//               {fromAmount && toAmount && (
//                 <div className={styles.priceCard}>
//                   <div className={styles.priceRow}>
//                     <span className={styles.priceLabel}>Rate</span>
//                     <div className={styles.priceValue}>
//                       <span>
//                         1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
//                       </span>
//                       <MdRefresh size={14} />
//                     </div>
//                   </div>
//                   <div className={styles.priceRow}>
//                     <span className={styles.priceLabel}>Price Impact</span>
//                     <span className={cn(styles.priceValue, styles.impact)}>
//                       <span
//                         className={cn(styles.impactBadge, {
//                           [styles.low]: priceImpact < 1,
//                           [styles.medium]: priceImpact >= 1 && priceImpact < 3,
//                           [styles.high]: priceImpact >= 3,
//                         })}
//                       >
//                         {priceImpact > 0.01 ? priceImpact.toFixed(2) : "<0.01"}%
//                       </span>
//                     </span>
//                   </div>
//                   <button
//                     className={styles.detailsToggle}
//                     onClick={() => setShowDetails(!showDetails)}
//                   >
//                     <span>{showDetails ? "Hide" : "Show"} details</span>
//                     <span
//                       style={{
//                         display: "inline-block",
//                         transform: showDetails
//                           ? "rotate(180deg)"
//                           : "rotate(0deg)",
//                         transition: "transform 0.2s ease",
//                       }}
//                     >
//                       <Icon name="arrow-down" size="16" />
//                     </span>
//                   </button>
//                 </div>
//               )}

//               {/* Expandable Details */}
//               {showDetails && fromAmount && toAmount && (
//                 <div className={styles.details}>
//                   <div className={styles.detailRow}>
//                     <span>Minimum received</span>
//                     <span>
//                       {minimumReceived} {toToken.symbol}
//                     </span>
//                   </div>
//                   <div className={styles.detailRow}>
//                     <span>Liquidity Provider Fee</span>
//                     <span>
//                       {liquidityProviderFee} {fromToken.symbol}
//                     </span>
//                   </div>
//                   <div className={styles.detailRow}>
//                     <span>Route</span>
//                     <span>
//                       {fromToken.symbol} → {toToken.symbol}
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {/* Swap Action Button */}
//               <button
//                 className={cn("button", styles.swapButton)}
//                 disabled={!fromAmount || !toAmount}
//                 onClick={handleSwap}
//               >
//                 {!fromAmount || !toAmount ? "Enter amount" : "Swap Tokens"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Token Selection Modal */}
//       {showTokenModal && (
//         <div className={styles.modalOverlay} onClick={closeTokenModal}>
//           <div
//             className={styles.modalContent}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className={styles.modalHeader}>
//               <h3 className={styles.modalTitle}>Select a token</h3>
//               <button className={styles.modalClose} onClick={closeTokenModal}>
//                 <X size={24} />
//               </button>
//             </div>

//             <div className={styles.searchBox}>
//               <Search size={20} className={styles.searchIcon} />
//               <input
//                 type="text"
//                 className={styles.searchInput}
//                 placeholder="Search name or symbol"
//                 value={tokenSearch}
//                 onChange={(e) => setTokenSearch(e.target.value)}
//                 autoFocus
//               />
//             </div>

//             <div className={styles.tokenList}>
//               {filteredTokens.map((token) => (
//                 <button
//                   key={token.symbol}
//                   className={cn(styles.tokenItem, {
//                     [styles.selected]:
//                       (selectingToken === "from" &&
//                         token.symbol === fromToken.symbol) ||
//                       (selectingToken === "to" &&
//                         token.symbol === toToken.symbol),
//                   })}
//                   onClick={() => selectToken(token)}
//                 >
//                   <div className={styles.tokenItemLeft}>
//                     <span className={styles.tokenItemLogo}>{token.logo}</span>
//                     <div className={styles.tokenItemInfo}>
//                       <div className={styles.tokenItemSymbol}>
//                         {token.symbol}
//                       </div>
//                       <div className={styles.tokenItemName}>{token.name}</div>
//                     </div>
//                   </div>
//                   <div className={styles.tokenItemRight}>
//                     <div className={styles.tokenItemBalance}>
//                       {token.balance.toFixed(4)}
//                     </div>
//                     <div className={styles.tokenItemUsd}>
//                       ${(token.balance * token.price).toFixed(2)}
//                     </div>
//                   </div>
//                 </button>
//               ))}
//               {filteredTokens.length === 0 && (
//                 <div className={styles.noResults}>
//                   <p>No tokens found</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SwapPage;

import { useState, useEffect, useMemo } from "react";
import styles from "./swap.module.sass";
import cn from "classnames";
import { JsonRpc } from "eosjs";
import { useWallet } from "../../context/WalletContext";
import { useTokens } from "../../hooks/useTokens";
import Icon from "../../components/Icon";
import { Repeat, ArrowUpDown, Search, X } from "lucide-react";
import { MdRefresh, MdSettings } from "react-icons/md";

const SwapPage = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userBalance, setUserBalance] = useState([]);
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);

  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectingToken, setSelectingToken] = useState("");
  const [tokenSearch, setTokenSearch] = useState("");

  const { activeSession, walletConnected } = useWallet();
  const { data: allTokens = [], isLoading } = useTokens();
  const rpc = new JsonRpc(process.env.REACT_APP_PROTON_ENDPOINT);

  // Get unique tokens that exist in pools
  const availablePoolTokens = useMemo(() => {
    if (!pools.length) return new Set();

    const tokenSet = new Set();
    pools.forEach((pool) => {
      tokenSet.add(pool.token0.toUpperCase());
      tokenSet.add(pool.token1.toUpperCase());
    });

    return tokenSet;
  }, [pools]);

  // Create enriched token list with balance and price data (only tokens in pools)
  const enrichedTokenList = useMemo(() => {
    if (!allTokens.length || !availablePoolTokens.size) return [];

    return allTokens
      .filter((token) => availablePoolTokens.has(token.symbol))
      .map((token) => {
        const userBal = userBalance.find(
          (bal) => bal.symbol === token.symbol && bal.contract === token.account
        );

        // Parse precision from token symbol format "8,XBTC" -> 8
        let precision = 4;
        const symbolParts = token.symbol.split(",");
        if (symbolParts.length === 2) {
          precision = parseInt(symbolParts[0]) || 4;
        }

        return {
          symbol: token.symbol,
          name: token.metadata?.name || token.symbol,
          logo: token.metadata?.logo || "🪙",
          balance: userBal?.amount || 0,
          price: token.price?.usd || 0,
          contract: token.account,
          precision: precision,
        };
      });
  }, [allTokens, userBalance, availablePoolTokens]);

  // Filter tokens based on search
  const filteredTokens = useMemo(() => {
    if (!tokenSearch) return enrichedTokenList;

    return enrichedTokenList.filter(
      (token) =>
        token.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
        token.name.toLowerCase().includes(tokenSearch.toLowerCase())
    );
  }, [enrichedTokenList, tokenSearch]);

  // Find pool for selected token pair
  const currentPool = useMemo(() => {
    if (!fromToken || !toToken || !pools.length) return null;

    return pools.find(
      (pool) =>
        (pool.token0.toUpperCase() === fromToken.symbol &&
          pool.token1.toUpperCase() === toToken.symbol) ||
        (pool.token1.toUpperCase() === fromToken.symbol &&
          pool.token0.toUpperCase() === toToken.symbol)
    );
  }, [fromToken, toToken, pools]);

  // Parse precision from pool token symbol
  const getPoolTokenPrecision = (poolTokenSymbol) => {
    const parts = poolTokenSymbol.split(",");
    return parts.length === 2 ? parseInt(parts[0]) : 4;
  };

  // Calculate pool price ratio (always available if pool exists)
  const poolPriceRatio = useMemo(() => {
    if (!currentPool || !fromToken || !toToken) return null;

    const isToken0 = currentPool.token0.toUpperCase() === fromToken.symbol;
    const reserveIn = parseFloat(
      isToken0 ? currentPool.reserve0 : currentPool.reserve1
    );
    const reserveOut = parseFloat(
      isToken0 ? currentPool.reserve1 : currentPool.reserve0
    );

    // Mid price (without fees)
    const midPrice = reserveOut / reserveIn;

    return {
      midPrice,
      reserveIn,
      reserveOut,
      isToken0,
      inputPrecision: getPoolTokenPrecision(
        isToken0 ? currentPool.token0_symbol : currentPool.token1_symbol
      ),
      outputPrecision: getPoolTokenPrecision(
        isToken0 ? currentPool.token1_symbol : currentPool.token0_symbol
      ),
    };
  }, [currentPool, fromToken, toToken]);

  // Calculate swap output based on input
  const calculateSwapOutput = (inputAmount, priceRatio) => {
    if (!priceRatio || inputAmount <= 0) return 0;

    const { reserveIn, reserveOut } = priceRatio;

    // Constant product formula: (x + Δx * 0.997) * (y - Δy) = x * y
    // Δy = (Δx * 0.997 * y) / (x + Δx * 0.997)
    const amountInWithFee = inputAmount * 997; // 0.3% fee
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000 + amountInWithFee;

    return numerator / denominator;
  };

  // Calculate swap input based on desired output (reverse calculation)
  const calculateSwapInput = (outputAmount, priceRatio) => {
    if (!priceRatio || outputAmount <= 0) return 0;

    const { reserveIn, reserveOut } = priceRatio;

    // Reverse constant product formula
    // Δx = (x * Δy * 1000) / ((y - Δy) * 997)
    const numerator = reserveIn * outputAmount * 1000;
    const denominator = (reserveOut - outputAmount) * 997;

    return numerator / denominator;
  };

  // Calculate all swap metrics
  const swapCalculations = useMemo(() => {
    if (!poolPriceRatio) {
      return {
        exchangeRate: "0",
        priceImpact: 0,
        minimumReceived: "0",
        liquidityProviderFee: "0",
        estimatedOutput: "0",
      };
    }

    const { midPrice, outputPrecision, inputPrecision } = poolPriceRatio;

    // If no input amount, show the current pool rate
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      return {
        exchangeRate: midPrice.toFixed(6),
        priceImpact: 0,
        minimumReceived: "0",
        liquidityProviderFee: "0",
        estimatedOutput: "0",
      };
    }

    const inputAmount = parseFloat(fromAmount);
    const estimatedOutput = calculateSwapOutput(inputAmount, poolPriceRatio);

    // Calculate actual execution price
    const executionPrice = estimatedOutput / inputAmount;

    // Calculate price impact
    const priceImpact = Math.abs(
      ((executionPrice - midPrice) / midPrice) * 100
    );

    // Calculate minimum received with slippage tolerance
    const minimumReceived = estimatedOutput * (1 - slippage / 100);

    // Calculate LP fee (0.3% of input)
    const liquidityProviderFee = inputAmount * 0.003;

    return {
      exchangeRate: executionPrice.toFixed(6),
      priceImpact: priceImpact.toFixed(2),
      minimumReceived: minimumReceived.toFixed(outputPrecision),
      liquidityProviderFee: liquidityProviderFee.toFixed(inputPrecision),
      estimatedOutput: estimatedOutput.toFixed(outputPrecision),
    };
  }, [fromAmount, poolPriceRatio, slippage]);

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
      }
    } catch (error) {
      console.error("Failed to fetch user balances:", error);
      setUserBalance([]);
    }
  };

  useEffect(() => {
    if (walletConnected && activeSession) {
      fetchAllTokens();
    } else {
      setUserBalance([]);
    }
  }, [walletConnected, activeSession]);

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

      setPools(result.rows);
    } catch (error) {
      console.error("Failed to fetch pools:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  // Set default token pair once data is loaded
  useEffect(() => {
    if (
      enrichedTokenList.length > 0 &&
      !fromToken &&
      !toToken &&
      pools.length > 0
    ) {
      // Find the first pool and set its tokens as default
      const firstPool = pools[0];

      const token0 = enrichedTokenList.find(
        (t) => t.symbol === firstPool.token0.toUpperCase()
      );
      const token1 = enrichedTokenList.find(
        (t) => t.symbol === firstPool.token1.toUpperCase()
      );

      if (token0 && token1) {
        setFromToken(token0);
        setToToken(token1);
      }
    }
  }, [enrichedTokenList, pools, fromToken, toToken]);

  const handleFromAmountChange = (value) => {
    setFromAmount(value);

    if (!value || isNaN(value) || parseFloat(value) <= 0) {
      setToAmount("");
      return;
    }

    if (!poolPriceRatio) {
      setToAmount("");
      return;
    }

    const inputAmount = parseFloat(value);
    const outputAmount = calculateSwapOutput(inputAmount, poolPriceRatio);

    setToAmount(outputAmount.toFixed(poolPriceRatio.outputPrecision));
  };

  const handleToAmountChange = (value) => {
    setToAmount(value);

    if (!value || isNaN(value) || parseFloat(value) <= 0) {
      setFromAmount("");
      return;
    }

    if (!poolPriceRatio) {
      setFromAmount("");
      return;
    }

    const outputAmount = parseFloat(value);

    // Check if output exceeds reserve
    if (outputAmount >= poolPriceRatio.reserveOut) {
      setFromAmount("");
      return;
    }

    const inputAmount = calculateSwapInput(outputAmount, poolPriceRatio);

    setFromAmount(inputAmount.toFixed(poolPriceRatio.inputPrecision));
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;

    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleMaxClick = () => {
    if (fromToken && fromToken.balance > 0) {
      handleFromAmountChange(fromToken.balance.toString());
    }
  };

  const handleSwap = () => {
    if (!walletConnected) {
      alert("Please connect your wallet first");
      return;
    }
    alert("Swap functionality will be implemented");
  };

  const openTokenModal = (type) => {
    setSelectingToken(type);
    setShowTokenModal(true);
    setTokenSearch("");
  };

  const closeTokenModal = () => {
    setShowTokenModal(false);
    setSelectingToken("");
    setTokenSearch("");
  };

  const selectToken = (token) => {
    if (selectingToken === "from") {
      setFromToken(token);
      // Recalculate output when token changes
      if (fromAmount && poolPriceRatio) {
        setTimeout(() => {
          const outputAmount = calculateSwapOutput(
            parseFloat(fromAmount),
            poolPriceRatio
          );
          setToAmount(outputAmount.toFixed(poolPriceRatio.outputPrecision));
        }, 10);
      }
    } else {
      setToToken(token);
      // Recalculate output when token changes
      if (fromAmount && poolPriceRatio) {
        setTimeout(() => {
          const outputAmount = calculateSwapOutput(
            parseFloat(fromAmount),
            poolPriceRatio
          );
          setToAmount(outputAmount.toFixed(poolPriceRatio.outputPrecision));
        }, 10);
      }
    }
    closeTokenModal();
  };

  if (isLoading || loading || !fromToken || !toToken) {
    return (
      <div className={styles.swap}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.main}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <Repeat size={20} />
                    <span>Exchange</span>
                  </div>
                </div>
                <div style={{ textAlign: "center", padding: "40px" }}>
                  Loading tokens...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.swap}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Main Swap Card */}
          <div className={styles.main}>
            <div className={styles.card}>
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <Repeat size={20} />
                  <span>Exchange</span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={cn(styles.iconBtn, "tooltip-bottom")}
                    data-tooltip="Refresh price"
                    onClick={() => {
                      fetchPools();
                      if (walletConnected) fetchAllTokens();
                    }}
                  >
                    <MdRefresh size={20} />
                  </button>
                  <button
                    className={cn(styles.iconBtn, {
                      [styles.active]: showSettings,
                    })}
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <MdSettings size={20} />
                  </button>
                </div>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className={styles.settings}>
                  <div className={styles.settingsRow}>
                    <div className={styles.settingsLabel}>
                      <Icon name="lightning" size="16" />
                      Slippage Tolerance
                    </div>
                    <div className={styles.slippageGroup}>
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
                        className={styles.slippageInput}
                        placeholder="Custom"
                        onChange={(e) =>
                          setSlippage(parseFloat(e.target.value) || 0.5)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* From Token */}
              <div className={styles.tokenBox}>
                <div className={styles.tokenHeader}>
                  <span className={styles.tokenLabel}>From</span>
                  <div className={styles.tokenBalance}>
                    <Icon name="wallet" size="14" />
                    Balance: {fromToken.balance.toFixed(fromToken.precision)}
                  </div>
                </div>
                <div className={styles.tokenInput}>
                  <input
                    type="number"
                    className={styles.amountInput}
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.00"
                  />
                  <div className={styles.tokenRight}>
                    <button className={styles.maxBtn} onClick={handleMaxClick}>
                      MAX
                    </button>
                    <button
                      className={styles.tokenBtn}
                      onClick={() => openTokenModal("from")}
                    >
                      {fromToken.logo.startsWith("http") ? (
                        <img
                          src={fromToken.logo}
                          alt={fromToken.symbol}
                          className={styles.tokenIcon}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <span className={styles.tokenIcon}>
                          {fromToken.logo}
                        </span>
                      )}
                      <div className={styles.tokenMeta}>
                        <div className={styles.tokenSymbol}>
                          {fromToken.symbol}
                        </div>
                      </div>
                      <Icon name="arrow-down" size="16" />
                    </button>
                  </div>
                </div>
                {fromAmount && fromToken.price > 0 && (
                  <div className={styles.tokenUsd}>
                    ≈ ${(parseFloat(fromAmount) * fromToken.price).toFixed(2)}{" "}
                    USD
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className={styles.swapButtonWrapper}>
                <button className={styles.swapIcon} onClick={handleSwapTokens}>
                  <ArrowUpDown size={24} />
                </button>
              </div>

              {/* To Token */}
              <div className={styles.tokenBox}>
                <div className={styles.tokenHeader}>
                  <span className={styles.tokenLabel}>To</span>
                  <div className={styles.tokenBalance}>
                    <Icon name="wallet" size="14" />
                    Balance: {toToken.balance.toFixed(toToken.precision)}
                  </div>
                </div>
                <div className={styles.tokenInput}>
                  <input
                    type="number"
                    className={styles.amountInput}
                    value={toAmount}
                    onChange={(e) => handleToAmountChange(e.target.value)}
                    placeholder="0.00"
                  />
                  <div className={styles.tokenRight}>
                    <button
                      className={styles.tokenBtn}
                      onClick={() => openTokenModal("to")}
                    >
                      {toToken.logo.startsWith("http") ? (
                        <img
                          src={toToken.logo}
                          alt={toToken.symbol}
                          className={styles.tokenIcon}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <span className={styles.tokenIcon}>{toToken.logo}</span>
                      )}
                      <div className={styles.tokenMeta}>
                        <div className={styles.tokenSymbol}>
                          {toToken.symbol}
                        </div>
                      </div>
                      <Icon name="arrow-down" size="16" />
                    </button>
                  </div>
                </div>
                {toAmount && toToken.price > 0 && (
                  <div className={styles.tokenUsd}>
                    ≈ ${(parseFloat(toAmount) * toToken.price).toFixed(2)} USD
                  </div>
                )}
              </div>

              {/* Pool Not Found Warning */}
              {!currentPool && fromToken && toToken && (
                <div
                  className={styles.priceCard}
                  style={{ marginBottom: "24px" }}
                >
                  <div style={{ textAlign: "center", color: "#ff6b6b" }}>
                    ⚠️ No liquidity pool found for this pair
                  </div>
                </div>
              )}

              {/* Price Info - Always show if pool exists */}
              {currentPool && (
                <div className={styles.priceCard}>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Rate</span>
                    <div className={styles.priceValue}>
                      <span>
                        1 {fromToken.symbol} =
                        {isNaN(parseFloat(swapCalculations.exchangeRate))
                          ? 0
                          : parseFloat(swapCalculations.exchangeRate)}
                        {toToken.symbol}
                      </span>
                      <MdRefresh size={14} />
                    </div>
                  </div>
                  {fromAmount && parseFloat(fromAmount) > 0 && (
                    <>
                      <div className={styles.priceRow}>
                        <span className={styles.priceLabel}>Price Impact</span>
                        <span className={cn(styles.priceValue, styles.impact)}>
                          <span
                            className={cn(styles.impactBadge, {
                              [styles.low]:
                                parseFloat(swapCalculations.priceImpact) < 1,
                              [styles.medium]:
                                parseFloat(swapCalculations.priceImpact) >= 1 &&
                                parseFloat(swapCalculations.priceImpact) < 3,
                              [styles.high]:
                                parseFloat(swapCalculations.priceImpact) >= 3,
                            })}
                          >
                            {isNaN(parseFloat(swapCalculations.priceImpact))
                              ? "0"
                              : parseFloat(swapCalculations.priceImpact)}
                            %
                          </span>
                        </span>
                      </div>
                      <button
                        className={styles.detailsToggle}
                        onClick={() => setShowDetails(!showDetails)}
                      >
                        <span>{showDetails ? "Hide" : "Show"} details</span>
                        <span
                          style={{
                            display: "inline-block",
                            transform: showDetails
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        >
                          <Icon name="arrow-down" size="16" />
                        </span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Expandable Details */}
              {showDetails &&
                fromAmount &&
                toAmount &&
                currentPool &&
                parseFloat(fromAmount) > 0 && (
                  <div className={styles.details}>
                    <div className={styles.detailRow}>
                      <span>Minimum received</span>
                      <span>
                        {swapCalculations.minimumReceived} {toToken.symbol}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Liquidity Provider Fee</span>
                      <span>
                        {swapCalculations.liquidityProviderFee}{" "}
                        {fromToken.symbol}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Route</span>
                      <span>
                        {fromToken.symbol} → {toToken.symbol}
                      </span>
                    </div>
                  </div>
                )}

              {/* Swap Action Button */}
              <button
                className={cn("button", styles.swapButton)}
                disabled={!fromAmount || !toAmount || !currentPool}
                onClick={handleSwap}
              >
                {!walletConnected
                  ? "Connect Wallet"
                  : !fromAmount || !toAmount
                  ? "Enter amount"
                  : !currentPool
                  ? "No liquidity pool"
                  : "Swap Tokens"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Token Selection Modal */}
      {showTokenModal && (
        <div className={styles.modalOverlay} onClick={closeTokenModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Select a token</h3>
              <button className={styles.modalClose} onClick={closeTokenModal}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.searchBox}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search name or symbol"
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.tokenList}>
              {filteredTokens.map((token) => (
                <button
                  key={`${token.symbol}-${token.contract}`}
                  className={cn(styles.tokenItem, {
                    [styles.selected]:
                      (selectingToken === "from" &&
                        token.symbol === fromToken.symbol) ||
                      (selectingToken === "to" &&
                        token.symbol === toToken.symbol),
                  })}
                  onClick={() => selectToken(token)}
                >
                  <div className={styles.tokenItemLeft}>
                    {token.logo.startsWith("http") ? (
                      <img
                        src={token.logo}
                        alt={token.symbol}
                        className={styles.tokenItemLogo}
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span className={styles.tokenItemLogo}>{token.logo}</span>
                    )}
                    <div className={styles.tokenItemInfo}>
                      <div className={styles.tokenItemSymbol}>
                        {token.symbol}
                      </div>
                      <div className={styles.tokenItemName}>{token.name}</div>
                    </div>
                  </div>
                  <div className={styles.tokenItemRight}>
                    <div className={styles.tokenItemBalance}>
                      {token.balance.toFixed(token.precision)}
                    </div>
                    {token.price > 0 && (
                      <div className={styles.tokenItemUsd}>
                        ${(token.balance * token.price).toFixed(2)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
              {filteredTokens.length === 0 && (
                <div className={styles.noResults}>
                  <p>No tokens found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapPage;
