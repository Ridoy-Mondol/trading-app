import { Routes, Route } from "react-router-dom";
import "./styles/app.sass";
import Page from "./components/Page";
import Home from "./screens/Home";
import Market from "./screens/Market";
import LearnCrypto from "./screens/LearnCrypto";
import LearnCryptoDetails from "./screens/LearnCryptoDetails";
import Contact from "./screens/Contact";
import Notifications from "./screens/Notifications";
import Activity from "./screens/Activity";
import Exchange from "./screens/Exchange";
import WalletOverview from "./screens/WalletOverview";
import WalletOverviewDetails from "./screens/WalletOverviewDetails";
import WalletMargin from "./screens/WalletMargin";
import FiatAndSpot from "./screens/FiatAndSpot";
import DepositFiat from "./screens/DepositFiat";
import BuyCrypto from "./screens/BuyCrypto";
import SellCrypto from "./screens/SellCrypto";
import ProfileInfo from "./screens/ProfileInfo";
import Referrals from "./screens/Referrals";
import ApiKeys from "./screens/ApiKeys";
import SessionsAndLoginHistory from "./screens/SessionsAndLoginHistory";
import TwoFa from "./screens/TwoFa";
import ChangePassword from "./screens/ChangePassword";
import SignIn from "./screens/SignIn";
import SignUp from "./screens/SignUp";
import ForgotPassword from "./screens/ForgotPassword";
import PageList from "./screens/PageList";

function App() {
    return (
        <Routes>
            <Route path="/">
                <Route
                    index
                    element={
                        <Page>
                            <Home />
                        </Page>
                    }
                />
                <Route
                    path="market"
                    element={
                        <Page>
                            <Market />
                        </Page>
                    }
                />
                <Route
                    path="learn-crypto"
                    element={
                        <Page>
                            <LearnCrypto />
                        </Page>
                    }
                />
                <Route
                    path="learn-crypto-details"
                    element={
                        <Page>
                            <LearnCryptoDetails />
                        </Page>
                    }
                />
                <Route
                    path="contact"
                    element={
                        <Page>
                            <Contact />
                        </Page>
                    }
                />
                <Route
                    path="notifications"
                    element={
                        <Page>
                            <Notifications />
                        </Page>
                    }
                />
                <Route
                    path="activity"
                    element={
                        <Page>
                            <Activity />
                        </Page>
                    }
                />
                <Route
                    path="exchange"
                    element={
                        <Page headerWide footerHide>
                            <Exchange />
                        </Page>
                    }
                />
                <Route
                    path="wallet-overview"
                    element={
                        <Page headerWide footerHide>
                            <WalletOverview />
                        </Page>
                    }
                />
                <Route
                    path="wallet-overview/:id"
                    element={
                        <Page headerWide footerHide>
                            <WalletOverviewDetails />
                        </Page>
                    }
                />
                <Route
                    path="wallet-margin"
                    element={
                        <Page headerWide footerHide>
                            <WalletMargin />
                        </Page>
                    }
                />
                <Route
                    path="fiat-and-spot"
                    element={
                        <Page headerWide footerHide>
                            <FiatAndSpot />
                        </Page>
                    }
                />
                <Route
                    path="profile-info"
                    element={
                        <Page>
                            <ProfileInfo />
                        </Page>
                    }
                />
                <Route
                    path="deposit-fiat"
                    element={
                        <Page>
                            <DepositFiat />
                        </Page>
                    }
                />
                <Route
                    path="buy-crypto"
                    element={
                        <Page>
                            <BuyCrypto />
                        </Page>
                    }
                />
                <Route
                    path="sell-crypto"
                    element={
                        <Page>
                            <SellCrypto />
                        </Page>
                    }
                />
                <Route
                    path="referrals"
                    element={
                        <Page>
                            <Referrals />
                        </Page>
                    }
                />
                <Route
                    path="api-keys"
                    element={
                        <Page>
                            <ApiKeys />
                        </Page>
                    }
                />
                <Route
                    path="sessions-and-login-history"
                    element={
                        <Page>
                            <SessionsAndLoginHistory />
                        </Page>
                    }
                />
                <Route
                    path="2fa"
                    element={
                        <Page>
                            <TwoFa />
                        </Page>
                    }
                />
                <Route
                    path="change-password"
                    element={
                        <Page>
                            <ChangePassword />
                        </Page>
                    }
                />
                <Route
                    path="sign-in"
                    element={
                        <Page headerHide footerHide>
                            <SignIn />
                        </Page>
                    }
                />
                <Route
                    path="sign-up"
                    element={
                        <Page headerHide footerHide>
                            <SignUp />
                        </Page>
                    }
                />
                <Route
                    path="forgot-password"
                    element={
                        <Page headerHide footerHide>
                            <ForgotPassword />
                        </Page>
                    }
                />
                <Route path="/pagelist" element={<PageList />} />
            </Route>
        </Routes>
    );
}

export default App;
