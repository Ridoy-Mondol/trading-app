import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const fetchCryptoData = async () => {
  const { data: topCoins } = await axios.get(
    'https://api.coingecko.com/api/v3/coins/markets',
    {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 5,
        page: 1,
        sparkline: false,
      },
    }
  )

  const symbols = topCoins.map((coin) => ({
    id: coin.id,
    symbol: (coin.symbol + 'usdt').toUpperCase(),
    image: coin.image,
  }))

  const { data: binanceData } = await axios.get(
    'https://api.binance.com/api/v3/ticker/24hr'
  )

  const filtered = binanceData.filter((item) =>
    symbols.map((s) => s.symbol).includes(item.symbol)
  )

  const result = filtered.map((item) => {
    const coinMeta = symbols.find((s) => s.symbol === item.symbol)
    const rawChange = parseFloat(item.priceChangePercent).toFixed(2)
    const sign = rawChange >= 0 ? '+' : '' 
    return {
      title: `${item.symbol.replace('USDT', '')}/USDT`,
      price: parseFloat(item.lastPrice).toLocaleString(),
      change: `${sign}${rawChange}%`,
      image: coinMeta?.image || 'images/default.svg',
      url: "/exchange",
    }
  })

  return result
}

export const useCryptoData = () =>
  useQuery({
    queryKey: ['cryptoData'],
    queryFn: fetchCryptoData,
    refetchInterval: 60000,
    staleTime: 55000, 
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })