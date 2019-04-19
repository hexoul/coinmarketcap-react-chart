import { constants } from '../constants'

const fetch = require('node-fetch')

window.chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  lightBlue: 'rgb(151,187,205)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
}

const getURL = (name) => {
  return `https://raw.githubusercontent.com/${constants.organization}/${constants.repoName}/${constants.branch}/${
    constants.sourceFile[name]
  }`
}

const getSource = (name) => {
  return fetch(getURL(name)).then(response => response.text())
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
        id: 'y-axis-1'
      }, {
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display: true,
        position: 'right',
        id: 'y-axis-2',
        // grid line settings
        gridLines: {
          drawOnChartArea: false // only want the grid lines for one axis to show up
        }
      }]
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
        yAxisID: 'y-axis-1'
      },
      {
        label: 'Volume',
        borderColor: window.chartColors.lightBlue,
        backgroundColor: window.chartColors.lightBlue,
        fill: true,
        data: volumes,
        yAxisID: 'y-axis-2'
      }
    ]
  }
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
        yAxisID: 'y-axis-1'
      },
      {
        label: 'Volume',
        borderColor: window.chartColors.lightBlue,
        backgroundColor: window.chartColors.lightBlue,
        fill: true,
        data: volumes,
        yAxisID: 'y-axis-2'
      }
    ]
  }
}

const barChartOptions = (title) => {
  return {
    title: {
      display: true,
      text: title
    },
    tooltips: {
      mode: 'index',
      intersect: false
    },
    responsive: true,
    scales: {
      xAxes: [{
        stacked: true
      }],
      yAxes: [{
        stacked: true
      }]
    }
  }
}

const barChartWithVolumes = (volumes) => {
  return {
    labels: Object.values(volumes).map(e => e.date),
    datasets: [
      {
        label: 'others',
        backgroundColor: window.chartColors.grey,
        data: Object.values(volumes).map(e => {
          let remain = toFloat(e.volume) -
            toFloat(e.upbitVolume) -
            toFloat(e.bittrexVolume) -
            toFloat(e.abccVolume) -
            toFloat(e.kucoinVolume) -
            toFloat(e.coinsuperVolume)
          return remain > 0 ? remain : 0
        })
      },
      {
        label: 'upbit',
        backgroundColor: window.chartColors.red,
        data: Object.values(volumes).map(e => toFloat(e.upbitVolume))
      },
      {
        label: 'bittrex',
        backgroundColor: window.chartColors.green,
        data: Object.values(volumes).map(e => toFloat(e.bittrexVolume))
      },
      {
        label: 'abcc',
        backgroundColor: window.chartColors.blue,
        data: Object.values(volumes).map(e => toFloat(e.abccVolume))
      },
      {
        label: 'kucoin',
        backgroundColor: window.chartColors.orange,
        data: Object.values(volumes).map(e => toFloat(e.kucoinVolume))
      },
      {
        label: 'coinsuper',
        backgroundColor: window.chartColors.yellow,
        data: Object.values(volumes).map(e => toFloat(e.coinsuperVolume))
      }
    ]
  }
}

const replaceAll = (str, searchStr, replaceStr) => str.split(searchStr).join(replaceStr)
const fmtInt = v => v ? v.toLocaleString('en') : '0'
const fmtFloat = v => v ? parseFloat(Number(v).toFixed(8)).toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,') : 0
const toFloat = v => v ? parseFloat(replaceAll(v, ',', '')) : 0

const numberFormat = (number, decimals, decPoint, thousandsSep) => {
  // http://kevin.vanzonneveld.net
  // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +     bugfix by: Michael White (http://getsprink.com)
  // +     bugfix by: Benjamin Lupton
  // +     bugfix by: Allan Jensen (http://www.winternet.no)
  // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // +     bugfix by: Howard Yeend
  // +    revised by: Luke Smith (http://lucassmith.name)
  // +     bugfix by: Diogo Resende
  // +     bugfix by: Rival
  // +      input by: Kheang Hok Chin (http://www.distantia.ca/)
  // +   improved by: davook
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // +      input by: Jay Klehr
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // +      input by: Amir Habibi (http://www.residence-mixte.com/)
  // +     bugfix by: Brett Zamir (http://brett-zamir.me)
  // +   improved by: Theriault
  // +   improved by: Drew Noakes
  // *     example 1: number_format(1234.56);
  // *     returns 1: '1,235'
  // *     example 2: number_format(1234.56, 2, ',', ' ');
  // *     returns 2: '1 234,56'
  // *     example 3: number_format(1234.5678, 2, '.', '');
  // *     returns 3: '1234.57'
  // *     example 4: number_format(67, 2, ',', '.');
  // *     returns 4: '67,00'
  // *     example 5: number_format(1000);
  // *     returns 5: '1,000'
  // *     example 6: number_format(67.311, 2);
  // *     returns 6: '67.31'
  // *     example 7: number_format(1000.55, 1);
  // *     returns 7: '1,000.6'
  // *     example 8: number_format(67000, 5, ',', '.');
  // *     returns 8: '67.000,00000'
  // *     example 9: number_format(0.9, 0);
  // *     returns 9: '1'
  // *    example 10: number_format('1.20', 2);
  // *    returns 10: '1.20'
  // *    example 11: number_format('1.20', 4);
  // *    returns 11: '1.2000'
  // *    example 12: number_format('1.2000', 3);
  // *    returns 12: '1.200'
  var n = !isFinite(+number) ? 0 : +number
  var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
  var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
  var dec = (typeof decPoint === 'undefined') ? '.' : decPoint

  var toFixedFix = function (n, prec) {
    // Fix for IE parseFloat(0.55).toFixed(0) = 0
    var k = Math.pow(10, prec)
    return Math.round(n * k) / k
  }

  var s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.')
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || ''
    s[1] += new Array(prec - s[1].length + 1).join('0')
  }
  return s.join(dec)
}

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
    time: e.time
  }
}

const getOhlcvCSV = (e, md) => {
  let targetTime = Date.parse(e.ctime)
  var ret = {
    ctime: e.ctime,
    date: e.ctime.split('T')[0],
    unit: e.convert,
    open: fmtFloat(e.quote.open),
    high: fmtFloat(e.quote.high),
    low: fmtFloat(e.quote.low),
    close: fmtFloat(e.quote.close),
    volume: fmtInt(e.quote.volume)
  }
  let capFound = md['CMC'].filter(v => Date.parse(v.time) <= targetTime)
  if (capFound && capFound.length) ret.marketCap = fmtFloat(capFound[0][e.convert.toLowerCase() + 'MarketCap'])

  constants.target.markets.forEach(market => {
    let found = md[market].filter(v => Date.parse(v.time) <= targetTime)
    if (found && found.length) ret[market + 'Volume'] = found[0][e.convert.toLowerCase() + 'Volume']
  })
  return ret
}

const getBalanceCSV = e => {
  return {
    time: e.time,
    exchange: e.exchange,
    meta: numberFormat(e.meta, 8),
    eth: numberFormat(e.eth, 8),
    btc: numberFormat(e.btc, 8),
    amount: numberFormat(e.amount, 8)
  }
}

export {
  getURL,
  getSource,
  fmtFloat,
  lineChartOptions,
  lineChartWithPriceVolume,
  lineChartWithCloseVolume,
  barChartOptions,
  barChartWithVolumes,
  getMarketDataCSV,
  getOhlcvCSV,
  getBalanceCSV
}
