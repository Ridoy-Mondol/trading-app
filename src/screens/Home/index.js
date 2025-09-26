import React, { useState, useEffect, useRef } from "react";
import Main from "./Main";
import Learn from "./Learn";
import Trend from "./Trend";
import Popular from "../../components/Popular";
import Download from "./Download";
import News from "../../components/News";
import Steps from "./Steps";

const Home = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  const scrollToRef = useRef(null);

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://www.api.bloks.io/proton/tokens", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();

        const protonTokens = data.filter((token) => token.chain === "proton");
        setTokens(protonTokens.slice(0, 5));
      } catch (err) {
        console.error("Error fetching tokens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  return (
    <>
      <Main scrollToRef={scrollToRef} tokens={tokens} loading={loading} />
      <Learn scrollToRef={scrollToRef} />
      <Trend tokens={tokens} loading={loading} />
      <Popular classSection="section-bg section-mb0" />
      <Download />
      <News classSection="section-bg" />
      <Steps />
    </>
  );
};

export default Home;
