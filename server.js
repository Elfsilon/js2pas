const path = require('path');
const Lexer = require('./logic/Lexer');
const Analyzer = require('./logic/Analyzer');
const Parser = require('./logic/Parser2');
const Compiler = require('./logic/Compiler');
const fs = require('fs').promises;

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
    next();
});

app.post('/', (req, res) => {
    const lex = new Lexer();
    lex.parse('source.js').then(parced => {
        let tokens = lex.getTokens(parced);

        const parser = new Parser(tokens);
        let ast = parser.parseTokens();
        fs.writeFile('AST.json', JSON.stringify(ast)).then(() => console.log('Created AST.json'));

        const compiler = new Compiler();
        let compiled = compiler.compile(ast);

        let data = {
            prog: req.body.source,
            parced: parced,
            tokens: tokens,
            AST: ast,
            compiled: compiled
        };
        res.json(data);
    });
    // let parced = lex.parseText(req.body.source);
    // let tokens = lex.getTokens(parced);

    // console.log(parced);


    // const parser = new Parser(tokens);
    // let ast = parser.parseTokens();

    // const compiler = new Compiler();
    // let compiled = compiler.compile(ast);

    // let data = {
    //     prog: req.body.source,
    //     parced: parced,
    //     tokens: tokens,
    //     AST: ast,
    //     compiled: compiled
    // };
    // res.json(data);
});

app.listen(3000, () => console.log('Server started at localhost:3000'));