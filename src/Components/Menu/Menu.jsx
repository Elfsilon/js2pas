import React from 'react';
import './Menu.css';

function Menu({lang}) {
  return (
      <div className="menu">
          <div className="editor-button button">Editor</div>
          <div className="ast-button button">AST</div>
      </div>
  );
}

export default Menu;