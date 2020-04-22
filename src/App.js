import React from 'react';
import './App.css';

import Menu from './Components/Menu/Menu';
import Editor from './Components/Editor/Editor';

function App() {
  
  return (
    <main className="main">
      <div className="container">
        <div className="left">
          <Menu />
        </div>
        <div className="right">
          <div className="js-editor editor">
            <Editor lang="javascript"/>
            <div className="compile-button button">Compile</div>
          </div>
          <div className="pas-editor editor">
            <Editor lang="pascal"/>
            <div className="copy-button button">Copy</div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
