import React from 'react';
import AceEditor from "react-ace";

import './Editor.css';
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-pascal";
import "ace-builds/src-noconflict/theme-github";

function onChange(newValue) {
  console.log("change", newValue);
}

function Editor({lang}) {
  return (
    <AceEditor
        mode={lang}
        // theme="github"
        theme="github"
        onChange={onChange}
        fontSize={18}
        name="UNIQUE_ID_OF_DIV"
        editorProps={{ $blockScrolling: true }}
        height="100%"
        width="100%"
    />
  );
}

export default Editor;