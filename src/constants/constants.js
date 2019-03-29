let constants = {}

// About remote source location
constants.organization = 'hexoul'
constants.repoName = 'go-cryptoinfo-gather'
constants.branch = 'master'
constants.sourceFile = {
  report: 'report.log',
  balance: 'balance.log',
  trade: 'trade.log'
}

// About target
constants.target = {
  symbol: 'META',
  quotes: ['USD', 'BTC', 'ETH'],
  markets: ['bittrex', 'upbit', 'kucoin', 'abcc', 'coinsuper']
}

// About keys
constants.key = {
  tokenMetric: 'metric',
  marketData: 'market',
  ohlcvData: 'ohlcv',
  balanceData: 'balance'
}

// About gather
constants.gather = {
  cryptoQuote: 'GatherCryptoQuote',
  marketPairs: 'GatherExchangeMarketPairs',
  tokenMetric: 'GatherTokenMetric',
  ohlcv: 'GatherOhlcv',
  balance: 'GatherBalance',
  trade: 'GatherTrades'
}

// About rendering
constants.dataUpdatePeriod = 5 * 60 * 1000 // 5 min

export { constants }
