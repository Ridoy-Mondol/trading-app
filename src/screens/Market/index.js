import React from "react";
import Main from "./Main";
import Details from "./Details";
import Lessons from "../../components/Lessons";
import cn from "classnames";
import styles from "./Market.module.sass";

const Market = () => {
  return (
    <>
      {/* <Main /> */}
      <Details />
      <Lessons classSection="section" />
    </>
  );
};

export default Market;













// import React from "react";
// import cn from "classnames";
// import styles from "./Market.module.sass";

// const Details = () => {
//   const dummyMetrics = {
//     volume: "21.87B",
//     txns: "40,664,579"
//   };

//   const dummyPairs = [
//     {
//       rank: 1,
//       name: "MOCHI/SOL",
//       token: "MOCHI CULT 500",
//       price: "$0.00207",
//       timeframe: "6h",
//       volume: "$9.0M",
//       txns: "11,955",
//       changes: ["-1.89%", "+20.01%", "+248%"],
//       marketCap: "$210K",
//       liquidity: "$2.0M",
//       chain: "solana",
//       address: "2zya4xngcrzaxbxw8zpfnaifwh3xscolo1rb3ffdarmj"
//     },
//     {
//       rank: 2,
//       name: "WIF/ETH",
//       token: "dogwifhat",
//       price: "$2.45",
//       timeframe: "24h",
//       volume: "$15.2M",
//       txns: "25,430",
//       changes: ["+5.67%", "-3.12%", "+45%"],
//       marketCap: "$1.2B",
//       liquidity: "$50M",
//       chain: "ethereum",
//       address: "abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx"
//     },
//     {
//       rank: 3,
//       name: "PEPE/BSC",
//       token: "Pepe Coin",
//       price: "$0.00000123",
//       timeframe: "1h",
//       volume: "$3.5M",
//       txns: "8,200",
//       changes: ["+12.34%", "+8.90%", "-2.1%"],
//       marketCap: "$500M",
//       liquidity: "$10M",
//       chain: "bsc",
//       address: "wxyz9876yzab6543cdef3210ghij0987klmn"
//     },
//     {
//       rank: 4,
//       name: "SHIB/SOL",
//       token: "Shiba Inu",
//       price: "$0.000018",
//       timeframe: "6h",
//       volume: "$7.8M",
//       txns: "14,500",
//       changes: ["-0.45%", "+15.67%", "+120%"],
//       marketCap: "$10B",
//       liquidity: "$100M",
//       chain: "solana",
//       address: "mnop4567opqr8901stuv2345vwxy6789zabc"
//     },
//     {
//       rank: 5,
//       name: "DOGE/ETH",
//       token: "Dogecoin",
//       price: "$0.12",
//       timeframe: "24h",
//       volume: "$25.1M",
//       txns: "35,678",
//       changes: ["+2.1%", "-1.23%", "+30%"],
//       marketCap: "$17B",
//       liquidity: "$200M",
//       chain: "ethereum",
//       address: "defg7890hijk1234lmno5678pqrs9012tuv"
//     },
//     // Add more dummy pairs as needed for pagination simulation
//     ...Array.from({ length: 95 }, (_, i) => ({
//       rank: i + 6,
//       name: `TOKEN${i + 6}/CHAIN`,
//       token: `Dummy Token ${i + 6}`,
//       price: `$${ (Math.random() * 10).toFixed(4) }`,
//       timeframe: "6h",
//       volume: `$${(Math.random() * 100).toFixed(1)}M`,
//       txns: Math.floor(Math.random() * 50000),
//       changes: [`${(Math.random() * 100 - 50).toFixed(2)}%`, `${(Math.random() * 50).toFixed(2)}%`, `${(Math.random() * 300).toFixed(0)}%`],
//       marketCap: `$${(Math.random() * 1000).toFixed(0)}K`,
//       liquidity: `$${(Math.random() * 500).toFixed(1)}M`,
//       chain: "solana",
//       address: `dummyaddress${i + 6}`
//     }))
//   ];

//   return (
//     <div className={cn("section", styles.details)}>
//       <div className={cn("container", styles.container)}>
//         {/* Header */}
//         <header className={styles.header}>
//           <h1 className={styles.title}>DEX Screener</h1>
//           <div className={styles.metrics}>
//             <span className={styles.metric}>
//               24H Volume: ${dummyMetrics.volume}
//             </span>
//             <span className={styles.metric}>
//               24H Txns: {dummyMetrics.txns.toLocaleString()}
//             </span>
//           </div>
//         </header>

//         {/* Trending Section */}
//         <section className={styles.trendingSection}>
//           <div className={styles.sectionHeader}>
//             <h2 className={styles.sectionTitle}>Trending</h2>
//             <a href="https://docs.dexscreener.com/trending" className={styles.docLink} target="_blank" rel="noopener noreferrer">
//               ?
//             </a>
//           </div>

//           {/* Pairs Table */}
//           <div className={styles.tableContainer}>
//             <table className={styles.pairsTable}>
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Pair</th>
//                   <th>Name</th>
//                   <th>Price</th>
//                   <th>Time</th>
//                   <th>Volume</th>
//                   <th>Txns</th>
//                   <th>5m / 1h / 6h</th>
//                   <th>Market Cap</th>
//                   <th>Liquidity</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {dummyPairs.slice(0, 100).map((pair, index) => (
//                   <tr key={index} className={styles.pairRow}>
//                     <td className={styles.rank}>{pair.rank}</td>
//                     <td className={styles.pairName}>
//                       <a href={`https://dexscreener.com/${pair.chain}/${pair.address}`} className={styles.link}>
//                         {pair.name}
//                       </a>
//                     </td>
//                     <td>{pair.token}</td>
//                     <td className={styles.price}>{pair.price}</td>
//                     <td>{pair.timeframe}</td>
//                     <td className={styles.volume}>{pair.volume}</td>
//                     <td>{pair.txns.toLocaleString()}</td>
//                     <td className={styles.changes}>
//                       {pair.changes.map((change, i) => (
//                         <span key={i} className={cn(styles.change, { [styles.gain]: parseFloat(change) >= 0, [styles.loss]: parseFloat(change) < 0 })}>
//                           {change}
//                         </span>
//                       ))}
//                     </td>
//                     <td>{pair.marketCap}</td>
//                     <td>{pair.liquidity}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           <div className={styles.pagination}>
//             <span>Showing pairs 1-100 of {dummyPairs.length}</span>
//             <a href="#" className={styles.pageLink}>Pairs 101-200</a>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default Details;