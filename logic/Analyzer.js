const INVALID_LET_IDENTIFIER = 'Invalid identifier in variable declaration: ';
const INVALID_LET_ASSIGNMENT = 'Invalid assignment symbol in variable declaration: ';
const INVALID_BINARY_EXPRESSION = 'Invalid expression in variable declaration: ';

function SyntaxError(message, addition = '') {
    return {
        message: message + addition,
    };
};

class Analyzer {
    constructor(lexes) {
        this._lexes = lexes;
        this._current = 0;
        this._symbols = {
            EQUAL: '=',
            BR_OPEN: '(',
            BR_CLOSE: ')',
            CURLY_OPEN: '{',
            CURLY_CLOSE: '}',
            COMMAND_END: ';',
            COMMA: ',',
            PLUS: '+',
            MINUS: '-',
            MULT: '*',
            DIV: '/',
            EXPON: '**',
        };
        this._types = {
            let: 'let',
            function: 'function',
            if: 'if',
            while: 'while',
        };
        this._services = ['let', 'if', 'function', 'while'];
        this._separators = ['=', '(', ')', ';', ',', '{', '}'];
        this._operations = ['+', '-', '*', '/', '**'];
    }

    /**
     * Analyze config array of lexes and returns bool
     */
    analyze() {
        return this._check(this._lexes[this._current]);
    }

    /**
     * Increase counter and returns new lex
     */
    _next() {
        this._current++;
        return this._lexes[this._current];
    }

    _check(lex) {
        switch (lex) {
            case this._types.let:
                {
                    let letError = this._letHandler(this._next());
                    if (letError) {
                        return letError;
                    }
                    break;
                }
            case this._types.function:
                {
                    break;
                }
            case this._types.if:
                {
                    break;
                }
            case this._types.while:
                {
                    break;
                }
            default:
                {
                    // statement
                }
        }
        return null;
    }

    _letHandler(lex) {
        if (this._services.includes(lex) || this._separators.includes(lex)) {
            return SyntaxError(INVALID_LET_IDENTIFIER, lex);
        }

        lex = this._next();
        if (lex != '=') {
            return SyntaxError(INVALID_LET_ASSIGNMENT, lex);
        }

        // Preparing expression
        let expression = [];
        lex = this._next();
        while (lex != this._symbols.COMMAND_END) {
            expression.push(lex);
            lex = this._next();
        }
        this._next(); //set current lex next to ';'

        return this._expressionHandler(expression);
    }

    /**
     * @todo Add handle of braces '(', ')'
     */
    _expressionHandler(expression) {
        let state = 'operand';
        for (let i = 0; i < expression.length; i++) {

            // If one of the chars is expression or separator
            if (this._services.includes(expression[i]) || this._separators.includes(expression[i])) {
                return SyntaxError(INVALID_BINARY_EXPRESSION, expression);
            }

            // If ends with operation
            if (i == expression.length - 1 && state == 'operation') {
                return SyntaxError(INVALID_BINARY_EXPRESSION, expression);
            }

            // 
            if (state == 'operand') {
                if (this._operations.includes(expression[i])) {
                    return SyntaxError(INVALID_BINARY_EXPRESSION, expression);
                }
                state = 'operation';
            } else {
                if (!this._operations.includes(expression[i])) {
                    return SyntaxError(INVALID_BINARY_EXPRESSION, expression);
                }
                state = 'operand';
            }
        }

        return null;
    }
}

module.exports = Analyzer;