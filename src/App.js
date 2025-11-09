import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/app.sass";
import Page from "./components/Page";
import Home from "./screens/Home";
import Market from "./screens/Market";
import LearnCrypto from "./screens/LearnCrypto";
import LearnCryptoDetails from "./screens/LearnCryptoDetails";
import LearnCryptoWrite from "./screens/LearnCryptoWrite";
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
import ProtectedRoute from "./components/ProtectedRoute";
import Pools from "./screens/Pools";
import { useUser } from "./context/UserContext"; 
import Loader from "./components/Loader";

function App() {
  const { user, loadingUser } = useUser();
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
          path="learn-crypto-details/:id"
          element={
            <Page>
              <LearnCryptoDetails />
            </Page>
          }
        />
        <Route
          path="learn-crypto/write"
          element={
            loadingUser ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh",
                  width: "100%",
                }}
              >
                <Loader />
              </div>
            ) : !user || user.role === "USER" ? (
              <Navigate to="/" replace />
            ) : (
              <Page>
                <LearnCryptoWrite />
              </Page>
            )
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
          path="pools"
          element={
            <Page>
              <Pools />
            </Page>
          }
        />
        <Route
          path="exchange/:id"
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
            <ProtectedRoute>
              <Page headerHide footerHide>
                <SignIn />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="sign-up"
          element={
            <ProtectedRoute>
              <Page headerHide footerHide>
                <SignUp />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <ProtectedRoute>
              <Page headerHide footerHide>
                <ForgotPassword />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route path="/pagelist" element={<PageList />} />
      </Route>
    </Routes>
  );
}

export default App;
