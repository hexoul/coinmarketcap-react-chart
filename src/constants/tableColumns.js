let columns = {};

// var strSorter = (a, b) => {
//   if (a > b) return 1;
//   else if (a < b) return -1;
//   return 0;
// }

columns.TokenMetric = [
  {
    title: 'Holders',
    dataIndex: 'holders',
    key: 'holders',
    width: '30%',
  },
  {
    title: 'Transactions',
    dataIndex: 'txns',
    key: 'txns',
    width: '30%',
  },
  {
    title: 'Transfers',
    dataIndex: 'transfers',
    key: 'transfers',
    width: '30%',
  }
];

columns.MarketData = [
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    width: '10%',
  },
  {
    title: 'USD Price',
    dataIndex: 'usdPrice',
    key: 'usdPrice',
    width: '20%',
  },
  {
    title: 'ETH Price',
    dataIndex: 'ethPrice',
    key: 'ethPrice',
    width: '20%',
  },
  {
    title: 'BTC Price',
    dataIndex: 'btcPrice',
    key: 'btcPrice',
    width: '20%',
  },
  {
    title: 'Volume(USD)',
    dataIndex: 'usdVolume',
    key: 'usdVolume',
    width: '30%',
  }
];

export {columns}