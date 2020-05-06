// Libs
const fs = require('fs').promises;
const path = require('path');


// Logic
const Lexer = require('../logic/Lexer');
// const Analyzer = require('../logic/Analyzer');
// const Parser = require('../logic/Parser2');
// const Compiler = require('../logic/Compiler');


// Constants
// const FILE = 'source.js';
const FILE = path.join(__dirname, 'source.js');


// Main
console.log(path.join(__dirname, 'source.js'));

fs.readFile(FILE).then(filedata => {
    let programString = filedata.toString();

    // Lexer
    const Lex = new Lexer();
    let parced = Lex.parse(programString);
    console.log(parced);

});




















// lex.parse(src).then((parced) => {

// Проверка синтаксиса
// let checker = new Analyzer(parced);
// let res = checker.analyze();
// console.log(res);

// let tokens = lex.getTokens(parced);
// lex.show(tokens);

// const parser = new Parser(tokens);
// let ast = parser.parseTokens();

// fs.writeFile('AST.json', JSON.stringify(ast)).then(() => console.log('Created AST.json'));

// const compiler = new Compiler();
// let compiled = compiler.compile(ast);
// compiler.save(compiled).then(() => console.log('\x1b[34m', 'Succesfully compiled', '\x1b[0m'));
// });