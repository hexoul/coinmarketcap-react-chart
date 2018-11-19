import { constants } from '../constants';

const getURL = () => {
  return `https://raw.githubusercontent.com/${constants.organization}/${constants.repoName}/${constants.branch}/${
    constants.sourceFile
  }`
}

const getSource = () => {
  return fetch(getURL()).then(response => response.text());
}

const lineChartOptions = (title) => {
  return {
    responsive: true,
    hoverMode: 'index',
    stacked: false,
    title: {
      display: true,
      text: title
    },
    scales: {
      xAxes: [{
        type: 'time',
        display: true,
        time: {
          unit: 'day',
          parser: 'YYYY-MM-DDTHH:mm:ss',
          round: 'hour',
          tooltipFormat: 'll HH:mm'
        },
        scaleLabel: {
          display: true,
          labelString: 'Date'
        },
        ticks: {
          major: {
            fontStyle: 'bold',
            fontColor: '#FF0000'
          }
        }
      }],
      yAxes: [{
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display: true,
        position: 'left',
        id: 'y-axis-1',
      }, {
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display: true,
        position: 'right',
        id: 'y-axis-2',
        // grid line settings
        gridLines: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      }],
    }
  }
}
  
const lineChartWithPriceVolume = (labels, prices, volumes) => {
  // if (labels.length > 150) {
  //   labels = labels.slice(labels.length -150, labels.length -1);
  //   prices = prices.slice(prices.length -150, prices.length -1);
  //   volumes = volumes.slice(volumes.length -150, volumes.length -1);
  // }
  return {
    labels: labels,
    datasets: [
      {
        label: 'Price',
        borderColor: 'rgba(246,44,44,1)',
        backgroundColor: 'rgba(246,44,44,1)',
        fill: false,
        data: prices,
        yAxisID: 'y-axis-1',
      },
      {
        label: 'Volume',
        borderColor: 'rgba(151,187,205,1)',
        backgroundColor: 'rgba(151,187,205,1)',
        fill: true,
        data: volumes,
        yAxisID: 'y-axis-2',
      },
    ]
  };
}

const lineChartWithCloseVolume = (labels, closes, volumes) => {
  return {
    labels: labels,
    datasets: [
      {
        label: 'Close',
        borderColor: 'rgba(246,44,44,1)',
        backgroundColor: 'rgba(246,44,44,1)',
        fill: false,
        data: closes,
        yAxisID: 'y-axis-1',
      },
      {
        label: 'Volume',
        borderColor: 'rgba(151,187,205,1)',
        backgroundColor: 'rgba(151,187,205,1)',
        fill: true,
        data: volumes,
        yAxisID: 'y-axis-2',
      },
    ]
  };
}

const getMarketDataCSV = e => {
  return {
    category: e.market,
    usdPrice: Number(e.quote.USD.price).toFixed(8),
    usdVolume: Number(e.quote.USD.volume_24h).toFixed(8),
    usdMarketCap: e.quote.USD.market_cap,
    ethPrice: Number(e.quote.ETH.price).toFixed(8),
    ethVolume: Number(e.quote.ETH.volume_24h).toFixed(8),
    ethMarketCap: e.quote.ETH.market_cap,
    btcPrice: Number(e.quote.BTC.price).toFixed(8),
    btcVolume: Number(e.quote.BTC.volume_24h).toFixed(8),
    btcMarketCap: e.quote.BTC.market_cap,
    time: e.time,
  }
}

const getOhlcvCSV = (e, md) => {
  let targetTime = Date.parse(e.ctime);
  var ret = {
    date: e.ctime.split('T')[0],
    unit: e.convert,
    open: Number(e.quote.open).toFixed(8),
    high: Number(e.quote.high).toFixed(8),
    low: Number(e.quote.low).toFixed(8),
    close: Number(e.quote.close).toFixed(8),
    volume: Number(e.quote.volume).toFixed(8),
    marketCap: md[e.convert.toLowerCase() + 'MarketCap'],
  };
  constants.target.markets.forEach(market => {
    let found = md[market].filter(v => Date.parse(v.time) <= targetTime);
    if (found && found.length) ret[market + 'Volume'] = found[0][e.convert.toLowerCase() + 'Volume'];
  });
  return ret;
}

export {
  getURL,
  getSource,
  lineChartOptions,
  lineChartWithPriceVolume,
  lineChartWithCloseVolume,
  getMarketDataCSV,
  getOhlcvCSV
}