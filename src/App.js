import React from 'react';
import { Layout } from 'antd';
import { Line } from 'react-chartjs-2';

// Styles.
import './App.css';

// Raw data
import data from './report.log';

const options = {
  scaleShowGridLines: true,
  scaleGridLineColor: 'rgba(0,0,0,.05)',
  scaleGridLineWidth: 1,
  scaleShowHorizontalLines: true,
  scaleShowVerticalLines: true,
  bezierCurve: true,
  bezierCurveTension: 0.4,
  pointDot: true,
  pointDotRadius: 4,
  pointDotStrokeWidth: 1,
  pointHitDetectionRadius: 20,
  datasetStroke: true,
  datasetStrokeWidth: 2,
  datasetFill: true,
  legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
}

class App extends React.Component {
  
  data = {
    origin: [],
    lineChart: {},
  };

  state = {
    ready: false,
  }

  async loadRawData() {
    let resp = await fetch(data);
    let ret = await resp.text();
    ret.split('\n').forEach(line => {
      if (! line) return;
      this.data.origin.push(JSON.parse(line));
    });
    
    var labels = [], prices = [], volumes = [];
    this.data.origin.filter(e => e.msg === "GatherCryptoQuote").forEach(e => {
      labels.push(e.time);
      prices.push(e.quote.USD.price);
      volumes.push(e.quote.USD.volume_24h);
    });
    this.data.lineChart = this.makeLineChartData(labels, prices, volumes);
    this.setState({ ready: true });
  }

  makeLineChartData(labels, prices, volumes) {
    return {
      labels: labels,
      datasets: [
        {
          label: 'Prices',
          fillColor: 'rgba(220,220,220,0.2)',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: prices,
        },
        {
          label: 'Volumes',
          fillColor: 'rgba(151,187,205,0.2)',
          strokeColor: 'rgba(151,187,205,1)',
          pointColor: 'rgba(151,187,205,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(151,187,205,1)',
          data: volumes,
        },
      ]
    };
  }

  constructor() {
    super();
    this.loadRawData();
  }

  render() {
    return (
      <Layout className='layout'>
        <Layout.Header>
          Header
        </Layout.Header>
        <Layout.Content style={{ padding: '5vh 5vw 0vh 5vw', backgroundColor: '#fff' }}>
          <Line
            data={this.data.lineChart}
            options={options}
            width="600" height="250"
          />
        </Layout.Content>
        <Layout.Footer>
          <h1><a href={data}>Raw data</a></h1>
          <center>coinmarketcap-graph ©2018 Created by hexoul</center>
        </Layout.Footer>
      </Layout>
    );
  }
}

export default App;