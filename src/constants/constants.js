let constants = {};

// About remote source location
constants.organization = 'hexoul';
constants.repoName = 'go-cryptoinfo-gather';
constants.branch = 'master';
constants.sourceFile = 'report.log';

// About target
constants.target = {
    symbol: 'META',
    quotes: ['USD', 'BTC', 'ETH'],
    markets: ['coinsuper', 'kucoin', 'abcc'],
};

// About keys
constants.key = {
    tokenMetric: 'metric',
    marketData: 'market',
    ohlcvData: 'ohlcv',
    balanceData: 'balance',
};

// About gather
constants.gather = {
    cryptoQuote: 'GatherCryptoQuote',
    marketPairs: 'GatherExchangeMarketPairs',
    tokenMetric: 'GatherTokenMetric',
    ohlcv: 'GatherOhlcv',
    balance: 'GatherBalance',
}

// About rendering
constants.dataUpdatePeriod = 5 * 60 * 1000; // 5 min

export {constants}