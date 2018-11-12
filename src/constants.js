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
    markets: ['coinsuper', 'kucoin'],
};

// About keys
constants.key = {
    tokenMetric: 'metric',
    marketData: 'market',
};

// About gather
constants.gather = {
    cryptoQuote: 'GatherCryptoQuote',
    marketPairs: 'GatherExchangeMarketPairs',
    tokenMetric: 'GatherTokenMetric',
}

// About rendering
constants.dataUpdatePeriod = 5 * 60 * 1000; // 5 min

export {constants}