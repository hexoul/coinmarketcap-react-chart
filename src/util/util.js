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
    return {
      labels: labels,
      datasets: [
        {
          label: 'Prices',
          borderColor: 'rgba(246,44,44,1)',
          backgroundColor: 'rgba(246,44,44,1)',
          fill: false,
          data: prices,
          yAxisID: 'y-axis-1',
        },
        {
          label: 'Volumes',
          borderColor: 'rgba(151,187,205,1)',
          backgroundColor: 'rgba(151,187,205,1)',
          fill: false,
          data: volumes,
          yAxisID: 'y-axis-2',
        },
      ]
    };
  }

  const getMarketDataCSV = (market, e) => {
    return {
      category: market,
      usdPrice: e.quote.USD.price,
      usdVolume: e.quote.USD.volume_24h,
      ethPrice: e.quote.ETH.price,
      btcPrice: e.quote.BTC.price,
      time: e.time,
    }
  }

  export {
    getURL,
    getSource,
    lineChartOptions,
    lineChartWithPriceVolume,
    getMarketDataCSV,
  }