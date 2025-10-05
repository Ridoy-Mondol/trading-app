import React, { useState, useEffect } from "react";
import { JsonRpc } from "@proton/js";
import cn from "classnames";
import styles from "./WalletOverview.module.sass";
import Wallet from "../../components/Wallet";
import Icon from "../../components/Icon";
import Dropdown from "../../components/Dropdown";
import AccountBalances from "./AccountBalances";
import AssetBalances from "./AssetBalances";
import Integrations from "./Integrations";
import { useWallet } from "../../context/WalletContext";
import { useTokens } from "../../hooks/useTokens";

const optionsCurrency = ["USD", "EUR", "RUB"];

const HYPERION_ENDPOINTS = [
  "https://proton.eosusa.io/v2",
  "https://proton.cryptolions.io/v2",
];

const WalletOverview = () => {
  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useState(optionsCurrency[0]);
  const [balances, setBalances] = useState([]);
  const [xprValue, setXprValue] = useState(0);
  const [usdValue, setUsdValue] = useState(0);
  const [eurValue, setEurValue] = useState(0);
  const [rubValue, setRubValue] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  const { activeSession } = useWallet();
  const { data: tokens = [], isLoading, error } = useTokens();

  const rpc = new JsonRpc(process.env.REACT_APP_PROTON_ENDPOINT);
  const fetchAllTokens = async () => {
    if (!activeSession?.auth?.actor) return;

    const accountName = activeSession.auth.actor.toString();
    const isTestnet = process.env.REACT_APP_NETWORK === "testnet";

    if (isTestnet) {
      const contracts = [
        "xtokens",
        "eosio.token",
        "snipx",
        "loan.token",
        "xmd.token",
        "sense",
        "mpd.token",
        "jaytest123",
        "grat",
        "testtoken1",
        "bqtoken",
        "myapp",
        "daotokens",
        "sayariplanet",
        "zomical",
        "zomicaltest",
        "saytto1",
        "franttest144",
        "abdelrahman",
        "taruntoken",
        "una1",
        "porkpay",
        "contac",
        "ritikantier",
        "metalseatest",
        "memetoken",
        "mpdtoken",
        "deployer",
        "ornpasstkn",
        "snd.token",
        "bfusd.token",
        "pcusd.token",
        "kpusd.token",
        "mcusd.token",
        "mykoroc",
        "koroc2",
        "koroc3",
        "darkiissuer",
        "twusd.token",
        "4fusd.token",
        "oazd.token",
        "m1usd.token",
        "ffusd.token",
        "azusd.token",
        "onusd.token",
        "gasd.token",
        "cldusd.token",
        "memestest3",
        "dlnd.token",
      ];

      // const contracts = ["snipx", "eosio.token", "xtokens", "loan.token", "metal.token"];

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
          console.error(`Failed: ${contract}`, error);
        }
      }

      setBalances(allBalances);
    } else {
      const response = await fetch(
        `https://proton.eosusa.io/v2/state/get_tokens?account=${accountName}`
      );
      const data = await response.json();
      setBalances(
        data.tokens.map((t) => ({
          symbol: t.symbol,
          amount: t.amount,
          contract: t.contract,
        }))
      );
    }
  };

  useEffect(() => {
    if (activeSession?.auth?.actor) {
      fetchAllTokens();
    }
  }, [activeSession?.auth?.actor]);

  console.log("b", balances);

  useEffect(() => {
    if (!isLoading && tokens.length > 0 && balances.length > 0) {
      let totalXPR = 0;
      let totalUSD = 0;

      for (const balance of balances) {
        const tokenInfo = tokens.find(
          (t) => t.symbol === balance.symbol && t.account === balance.contract
        );

        console.log("tokenInfo", tokenInfo);

        if (tokenInfo) {
          const priceInXPR = tokenInfo.price?.quotes?.XPR || 0;
          const priceInUSD = tokenInfo.price?.usd || 0;

          totalXPR += balance.amount * priceInXPR;
          totalUSD += balance.amount * priceInUSD;
        }
      }

      setXprValue(totalXPR);
      setUsdValue(totalUSD);
    }
  }, [balances, tokens, isLoading]);

  console.log("Total Portfolio Value:");
  console.log(`XPR: ${xprValue} XPR`);
  console.log(`USD: ${usdValue} USD`);

  useEffect(() => {
    if (!usdValue) {
      setEurValue(0);
      setRubValue(0);
      return;
    }

    const fetchAndConvert = async () => {
      try {
        const res = await fetch(
          "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json"
        );
        const data = await res.json();
        const eurRate = data.usd.eur;
        const rubRate = data.usd.rub;

        setEurValue((usdValue * eurRate).toFixed(2));
        setRubValue((usdValue * rubRate).toFixed(2));
      } catch (error) {
        console.error("Error fetching conversion rates:", error);
      }
    };

    fetchAndConvert();
  }, [usdValue]);

  const handleSubmit = (e) => {
    alert();
  };

  return (
    <Wallet>
      <div className={styles.top}>
        <div className={styles.line}>
          <h4 className={cn("h4", styles.title)}>Overview</h4>
          <div className={styles.wrap}>
            <form
              className={styles.form}
              action=""
              onSubmit={() => handleSubmit()}
            >
              <input
                className={styles.input}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                name="search"
                placeholder="Search coin"
                required
              />
              <button className={styles.result}>
                <Icon name="search" size="20" />
              </button>
            </form>
            <Dropdown
              className={styles.dropdown}
              classDropdownHead={styles.dropdownHead}
              value={currency}
              setValue={setCurrency}
              options={optionsCurrency}
            />
            <button
              className={cn("button-black button-small", styles.button)}
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? "Hide balance" : "Show balance"}
            </button>
          </div>
        </div>
        <div className={styles.details}>
          <div className={styles.info}>Total balance</div>
          <div className={styles.currency}>
            {showBalance ? (
              <>
                <div className={styles.number}>{xprValue}</div>
                <div className={cn("category-green", styles.category)}>XPR</div>
              </>
            ) : (
              <div className={styles.number}>***</div>
            )}
          </div>
          <div className={styles.price}>
            {showBalance
              ? currency === "EUR"
                ? `€${eurValue}`
                : currency === "RUB"
                ? `₽${rubValue}`
                : `$${usdValue}`
              : "***"}
          </div>
        </div>
      </div>
      <div className={styles.list}>
        <div className={styles.item}>
          <div className={styles.head}>Account Breakdown</div>
          <div className={styles.body}>
            <AccountBalances />
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.head}>Asset Balances</div>
          <div className={styles.body}>
            <AssetBalances />
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.head}>Integrations</div>
          <div className={styles.body}>
            <Integrations />
          </div>
        </div>
      </div>
    </Wallet>
  );
};

export default WalletOverview;
