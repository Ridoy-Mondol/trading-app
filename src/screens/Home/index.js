import React, { useRef } from "react";
import Main from "./Main";
import Learn from "./Learn";
import Trend from "./Trend";
import Popular from "../../components/Popular";
import Download from "./Download";
import News from "../../components/News";
import Steps from "./Steps";
import { useTokens } from "../../hooks/useTokens";

const Home = () => {
  const scrollToRef = useRef(null);
  const { data: tokens = [], isLoading, error } = useTokens();

  return (
    <>
      <Main scrollToRef={scrollToRef} tokens={tokens} loading={isLoading} />
      <Learn scrollToRef={scrollToRef} />
      <Trend tokens={tokens} loading={isLoading} />
      <Popular classSection="section-bg section-mb0" />
      <Download />
      <News classSection="section-bg" />
      <Steps />
    </>
  );
};

export default Home;
