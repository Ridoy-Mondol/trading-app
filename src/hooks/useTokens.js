import { useQuery } from "@tanstack/react-query";

export const useTokens = () => {
  return useQuery({
    queryKey: ["protonTokens"],
    queryFn: async () => {
      const res = await fetch("https://www.api.bloks.io/proton/tokens", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();

      return data
        .filter((token) => token.chain === "proton-test")
        .map((t, i) => ({ ...t, _originalIndex: i }));
    },
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};
