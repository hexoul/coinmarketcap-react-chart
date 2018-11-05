import React from 'react';
import { Layout } from 'antd';

// Styles.
import './App.css';

import data from './report.log';

class App extends React.Component {

  async loadRawData() {
    let resp = await fetch(data);
    let ret = await resp.text();
    ret.split('\n').forEach(line => {
      if (! line) return;
      console.log(JSON.parse(line));
    });
  }

  componentWillMount() {
    this.loadRawData();
  }

  render() {
    return (
      <Layout className='layout'>
        <Layout.Header>
          Header
        </Layout.Header>
        <Layout.Content style={{ padding: '5vh 5vw 0vh 5vw', backgroundColor: '#fff' }}>
          Content
        </Layout.Content>
        <Layout.Footer>
          <center>coinmarketcap-graph ©2018 Created by hexoul</center>
        </Layout.Footer>
      </Layout>
    );
  }
}

export default App;