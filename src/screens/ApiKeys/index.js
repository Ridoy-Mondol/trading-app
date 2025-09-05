import React, { useState } from "react";
import Profile from "../../components/Profile";
import ApiKeysDisabled from "./ApiKeysDisabled";
import ApiKeysConfirm from "./ApiKeysConfirm";
import ApiKeysEnabled from "./ApiKeysEnabled";
import { useUser } from "../../context/UserContext";

const breadcrumbs = [
    {
        title: "Home",
        url: "/",
    },
    {
        title: "API keys",
    },
];

const ApiKeys = () => {
    const { user, loadingUser } = useUser();
    const [activeIndex, setActiveIndex] = useState(0);
    return (
        <Profile title="API keys" breadcrumbs={breadcrumbs}>
            {activeIndex === 0 && (
                <ApiKeysDisabled goNext={() => setActiveIndex(1)} user={user} />
            )}
            {activeIndex === 1 && (
                <ApiKeysConfirm goNext={() => setActiveIndex(2)} user={user} />
            )}
            {activeIndex === 2 && (
                <ApiKeysEnabled goNext={() => setActiveIndex(0)} user={user} />
            )}
        </Profile>
    );
};

export default ApiKeys;
