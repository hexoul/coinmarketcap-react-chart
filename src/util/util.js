import { constants } from '../constants';

window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  lightBlue: 'rgb(151,187,205)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

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
        borderColor: window.chartColors.red,
        backgroundColor: window.chartColors.red,
        fill: false,
        data: prices,
        yAxisID: 'y-axis-1',
      },
      {
        label: 'Volume',
        borderColor: window.chartColors.lightBlue,
        backgroundColor: window.chartColors.lightBlue,
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
        borderColor: window.chartColors.red,
        backgroundColor: window.chartColors.red,
        fill: false,
        data: closes,
        yAxisID: 'y-axis-1',
      },
      {
        label: 'Volume',
        borderColor: window.chartColors.lightBlue,
        backgroundColor: window.chartColors.lightBlue,
        fill: true,
        data: volumes,
        yAxisID: 'y-axis-2',
      },
    ]
  };
}

const barChartOptions = (title) => {
  return {
    title: {
      display: true,
      text: title,
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    responsive: true,
    scales: {
      xAxes: [{
        stacked: true,
      }],
      yAxes: [{
        stacked: true,
      }]
    },
  }
}

const barChartWithVolumes = (volumes) => {
  return {
    labels: Object.values(volumes).map(e => e.date),
    datasets: [
      {
        label: 'others',
        backgroundColor: window.chartColors.green,
        data: Object.values(volumes).map(e => toFloat(e.volume) - toFloat(e.kucoinVolume) - toFloat(e.coinsuperVolume)),
      },
      {
        label: 'coinsuper',
        backgroundColor: window.chartColors.yellow,
        data: Object.values(volumes).map(e => toFloat(e.coinsuperVolume)),
      },
      {
        label: 'kucoin',
        backgroundColor: window.chartColors.orange,
        data: Object.values(volumes).map(e => toFloat(e.kucoinVolume)),
      },
    ]
  };
}

const fmtInt = v => v.toLocaleString('en');
const fmtFloat = v => parseFloat(Number(v).toFixed(8)).toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
const toFloat = v => parseFloat(v.replace(',',''));

const getMarketDataCSV = e => {
  return {
    category: e.market,
    usdPrice: fmtFloat(e.quote.USD.price),
    usdVolume: fmtFloat(e.quote.USD.volume_24h),
    usdMarketCap: e.quote.USD.market_cap,
    ethPrice: fmtFloat(e.quote.ETH.price),
    ethVolume: fmtFloat(e.quote.ETH.volume_24h),
    ethMarketCap: e.quote.ETH.market_cap,
    btcPrice: fmtFloat(e.quote.BTC.price),
    btcVolume: fmtFloat(e.quote.BTC.volume_24h),
    btcMarketCap: e.quote.BTC.market_cap,
    time: e.time,
  }
}

const getOhlcvCSV = (e, md) => {
  let targetTime = Date.parse(e.ctime);
  var ret = {
    date: e.ctime.split('T')[0],
    unit: e.convert,
    open: fmtFloat(e.quote.open),
    high: fmtFloat(e.quote.high),
    low: fmtFloat(e.quote.low),
    close: fmtFloat(e.quote.close),
    volume: fmtInt(e.quote.volume),
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
  barChartOptions,
  barChartWithVolumes,
  getMarketDataCSV,
  getOhlcvCSV
}