const fs = require('fs').promises;
const path = require('path');

class Token {
    constructor(type, value) {
        this._type = type;
        this._value = value;
    }

    get data() {
        return {
            type: this._type,
            value: this._value,
        };
    }
}

class Lexer {
    constructor() {
        this._types = {
            identifier: 'Identifier',
            literal: 'Literal',
            service: 'Service',
            operation: 'Operation',
            separator: 'Separator',
        };
        this._services = ['let', 'if', 'else', 'function', 'while', 'for'];
        this._operations = ['=', '+', '-', '*', '/', '>', '<', '<=', '>='];
        this._separators = [';', ',', '(', ')', '{', '}', '[', ']'];
    }

    show(tokens) {
        let output = [];
        tokens.forEach((token) => {
            output.push(token.data.type, token.data.value);
        });
        console.log('Tokens:');
        console.log(output);
    }

    // Cache errors! Now absolutely all tokens have a normal type
    getTokens(parced) {
        let tokens = [];
        parced.forEach((lex) => {
            if (this._services.includes(lex)) {
                tokens.push(new Token(this._types.service, lex));
            } else if (this._operations.includes(lex)) {
                tokens.push(new Token(this._types.operation, lex));
            } else if (this._separators.includes(lex)) {
                tokens.push(new Token(this._types.separator, lex));
            } else if (parseInt(lex, 10)) {
                // add handle of string or char literals
                tokens.push(new Token(this._types.literal, lex));
            } else {
                tokens.push(new Token(this._types.identifier, lex));
            }
        });
        return tokens;
    }



    async parse(file) {
        try {
            let text = await fs.readFile(file);
            return text
                .toString()
                .replace(/\n|\r|\t/g, '')
                .replace(/==|[,;=<>{}()+*]|\[|\]/g, ' $& ')
                .split(' ')
                .filter((lex) => lex != '');
        } catch {
            throw new Error('Can not read this file');
        }
    }

    // parseText(text) {
    //     return text
    //         .toString()
    //         .replace(/\n|\r|\t/g, '')
    //         .replace(/==|[,;=<>{}()+*]/g, ' $& ')
    //         .split(' ')
    //         .filter((lex) => lex != '');
    // }
}

module.exports = Lexer;