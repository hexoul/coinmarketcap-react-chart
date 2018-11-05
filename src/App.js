import React from 'react';
import { Layout } from 'antd';

// Styles.
import './App.css';

class App extends React.Component {

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