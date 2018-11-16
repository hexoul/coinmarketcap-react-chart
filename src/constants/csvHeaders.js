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
        { label: 'Coinsuper', key: 'coinsuperVolume' },
        { label: 'Kucoin', key: 'kucoinVolume' },
    ]
};

export {csvHeaders}