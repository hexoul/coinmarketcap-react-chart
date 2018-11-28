var csvHeaders = {
    tokenMetric: [
        { label: '# Holders', key: 'holders' },
        { label: '# Transfers', key: 'transfers' },
        { label: '# Transactions', key: 'txns' },
        { label: 'Time', key: 'time' },
    ],
    marketData: [
        { label: 'Category', key: 'category' },
        { label: 'USD Price', key: 'usdPrice' },
        { label: 'ETH Price', key: 'ethPrice' },
        { label: 'BTC Price', key: 'btcPrice' },
        { label: 'Volume (USD)', key: 'usdVolume' },
        { label: 'Time', key: 'time' },
    ],
    ohlcvData: [
        { label: 'Date', key: 'date' },
        { label: 'Unit', key: 'unit' },
        { label: 'Open', key: 'open' },
        { label: 'High', key: 'high' },
        { label: 'Low', key: 'low' },
        { label: 'Close', key: 'close' },
        { label: 'Volume', key: 'volume' },
        { label: 'Volume (Coinsuper)', key: 'coinsuperVolume' },
        { label: 'Volume (Kucoin)', key: 'kucoinVolume' },
        { label: 'Volume (Abcc)', key: 'abccVolume' },
        { label: 'Market Cap', key: 'marketCap' },
    ],
    balanceData: [
        { label: 'Date', key: 'time' },
        { label: 'Exchange', key: 'exchange' },
        { label: 'Balance(META)', key: 'meta' },
        { label: 'Balance(ETH)', key: 'eth' },
        { label: 'Balance(BTC)', key: 'btc' },
        { label: 'Volume(USD)', key: 'volume' },
    ],
};

export {csvHeaders}