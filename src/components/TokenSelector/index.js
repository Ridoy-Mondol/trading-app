// import React, { useState } from "react";
// import cn from "classnames";
// import styles from "./TokenSelector.module.sass";
// import Icon from "../Icon";

// const TokenSelector = ({ 
//   tokens = [], 
//   onSelect, 
//   excludeToken = null,
//   renderTokenLogo 
// }) => {
//   const [search, setSearch] = useState("");

//   // Filter tokens based on search and excluded token
//   const filteredTokens = tokens.filter((token) => {
//     // Exclude already selected token
//     if (excludeToken && token.symbol === excludeToken.symbol) {
//       return false;
//     }

//     // Apply search filter
//     if (search) {
//       const searchLower = search.toLowerCase();
//       return (
//         token.symbol.toLowerCase().includes(searchLower) ||
//         token.name.toLowerCase().includes(searchLower)
//       );
//     }

//     return true;
//   });

//   const handleTokenClick = (token) => {
//     onSelect(token);
//     setSearch("");
//   };

//   return (
//     <div className={styles.selector}>
//       <div className={styles.title}>Select token</div>
      
//       {/* Search Input */}
//       <div className={styles.form}>
//         <input
//           className={styles.input}
//           type="text"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Search token..."
//           autoFocus
//         />
//         <button className={styles.result} type="button">
//           <Icon name="search" size="20" />
//         </button>
//       </div>

//       {/* Token List */}
//       <div className={styles.list}>
//         {filteredTokens.length > 0 ? (
//           filteredTokens.map((token, index) => (
//             <div
//               className={styles.row}
//               key={`${token.symbol}_${token.contract}`}
//               onClick={() => handleTokenClick(token)}
//             >
//               <div className={styles.item}>
//                 <div className={styles.icon}>
//                   {renderTokenLogo ? (
//                     renderTokenLogo(token.logo, token.symbol, styles.tokenLogo)
//                   ) : (
//                     <span style={{ fontSize: "24px" }}>{token.logo || "🪙"}</span>
//                   )}
//                 </div>
//                 <div className={styles.details}>
//                   <span className={styles.subtitle}>{token.symbol}</span>
//                   <span className={styles.currency}>{token.name}</span>
//                 </div>
//               </div>
              
//               <div className={styles.balance}>
//                 {token.balance > 0 ? (
//                   <>
//                     <span className={styles.balanceAmount}>
//                       {token.balance.toFixed(Math.min(token.precision, 6))}
//                     </span>
//                     <span className={styles.balanceSymbol}>{token.symbol}</span>
//                   </>
//                 ) : (
//                   <span className={styles.balanceZero}>0</span>
//                 )}
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className={styles.noResults}>
//             <div className={styles.noResultsIcon}>🔍</div>
//             <div className={styles.noResultsText}>No tokens found</div>
//             {search && (
//               <div className={styles.noResultsHint}>
//                 Try searching by symbol or name
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TokenSelector;









import React, { useState } from "react";
import cn from "classnames";
import styles from "./TokenSelector.module.sass";
import Icon from "../Icon";

const TokenSelector = ({ 
  tokens = [], 
  onSelect, 
  excludeToken = null,
  renderTokenLogo 
}) => {
  const [search, setSearch] = useState("");

  // Filter tokens based on search and excluded token
  const filteredTokens = tokens.filter((token) => {
    // Exclude already selected token
    if (excludeToken && token.symbol === excludeToken.symbol) {
      return false;
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        token.symbol.toLowerCase().includes(searchLower) ||
        token.name.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const handleTokenClick = (token, e) => {
    e.stopPropagation();
    onSelect(token);
    setSearch("");
  };

  return (
    <div className={styles.crypto} onClick={(e) => e.stopPropagation()}>
      <div className={styles.title}>Select token</div>
      
      {/* Search Input */}
      <form className={styles.form} action="" onSubmit={(e) => e.preventDefault()}>
        <input
          className={styles.input}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search token..."
          autoFocus
        />
        <button className={styles.result} type="button">
          <Icon name="search" size="20" />
        </button>
      </form>

      {/* Token List */}
      <div className={styles.table}>
        {filteredTokens.length > 0 ? (
          filteredTokens.map((token, index) => (
            <div
              className={styles.row}
              key={`${token.symbol}_${token.contract}`}
              onClick={(e) => handleTokenClick(token, e)}
            >
              <div className={styles.col}>
                <div className={styles.item}>
                  <div className={styles.icon}>
                    {renderTokenLogo ? (
                      renderTokenLogo(token.logo, token.symbol, "")
                    ) : (
                      <span style={{ fontSize: "24px" }}>{token.logo || "🪙"}</span>
                    )}
                  </div>
                  <div className={styles.details}>
                    <span className={styles.subtitle}>{token.symbol}</span>
                    <span className={styles.currency}>{token.name}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.col}>
                {token.balance > 0 ? (
                  <div className={styles.balance}>
                    {token.balance.toFixed(Math.min(token.precision, 6))}
                  </div>
                ) : (
                  <div className={styles.balanceZero}>0</div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <div className={styles.noResultsText}>No tokens found</div>
            {search && (
              <div className={styles.noResultsHint}>
                Try searching by symbol or name
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenSelector;