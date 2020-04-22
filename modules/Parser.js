class Parser {
    constructor(tokens) {
        this._AST = {
            type: undefined,
            body: [],
        };
        this._tokens = tokens;
        this._current = 0;
        this._operations = ['+', '-', '*', '/', '**', '>', '<', '>=', '<=', '=='];
        this.statements = {
            VariableDeclaration: 'VariableDeclaration',
            FunctionDeclaration: 'FunctionDeclaration',
            WhileStatement: 'WhileStatement',
            ForStatement: 'ForStatement',
            IfStatement: 'IfStatement',
            ExpressionStatement: 'ExpressionStatement',
            AssignmentExpression: 'AssignmentExpression',
            CallExpression: 'CallExpression',
            BinaryExpression: 'BinaryExpression',
            BlockStatement: 'BlockStatement',
        };
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
        this._triggers = {
            FunctionDeclaration: 'function',
            VariableDeclaration: 'let',
            IfStatement: 'if',
            ForStatement: 'for',
            WhileStatement: 'while',
        };
        this._tokenTypes = {
            SERVICE: 'Service',
            IDENTIFIER: 'Identifier',
            OPERATION: 'Operation',
            LITERAL: 'Literal',
            SEPARATOR: 'Separator',
        };
    }

    _nextToken() {
        this._current++;
        return this._tokens[this._current];
    }

    parseTokens() {
        this._AST.type = 'Program';
        this._AST.body = this._blockStatementHandler(this._tokens[this._current]);
        return this._AST;
    }

    /**
     * @returns Block statement object
     */
    _blockStatementHandler(token) {
        let BlockStatement = {
            type: this.statements.BlockStatement,
            body: [],
        };
        while (this._current < this._tokens.length && this._tokens[this._current].data.value != this._symbols.CURLY_CLOSE) {
            console.log('CURRENT WHILE =', this._tokens[this._current].data.value);

            switch (this._tokens[this._current].data.type) {
                case this._tokenTypes.SERVICE:
                    {
                        switch (this._tokens[this._current].data.value) {
                            case this._triggers.WhileStatement:
                                {
                                    console.log('--Transfer control to _whileStatementHandler--');
                                    BlockStatement.body.push(this._whileStatementHandler(this._nextToken()));
                                    break;
                                }
                            case this._triggers.IfStatement:
                                {
                                    console.log('--Transfer control to _ifStatementHandler--');
                                    BlockStatement.body.push(this._ifStatementHandler(this._nextToken()));
                                    break;
                                }
                            case this._triggers.VariableDeclaration:
                                {
                                    console.log('--Transfer control to _variableDeclarationHandler--');
                                    BlockStatement.body.push({
                                        type: this.statements.VariableDeclaration,
                                        declarations: this._variableDeclarationHandler(this._nextToken()),
                                        kind: 'let',
                                    });
                                    break;
                                }
                            case this._triggers.FunctionDeclaration:
                                {
                                    console.log('--Transfer control to _functionDeclarationHandler--');
                                    BlockStatement.body.push(this._functionDeclarationHandler(this._nextToken()));
                                    console.log('END OF FD');
                                    break;
                                }
                            default:
                                {
                                    throw new Error('_blockStatementError: <Unknown service token>', token.data.value);
                                }
                        }
                        break;
                    }
                case this._tokenTypes.IDENTIFIER:
                    {
                        console.log('--Transfer control to _expressionStatementHandler--');
                        let expr = this._expressionStatementHandler(this._tokens[this._current]);
                        console.log(expr);

                        BlockStatement.body.push({
                            type: this.statements.ExpressionStatement,
                            expression: expr,
                        });
                        break;
                    }
                default:
                    throw new Error('_blockStatementError: <Invalid token type>');
            }
        }
        return BlockStatement;
    }

    /**
     * @returns ExpressionStatement object
     */
    _expressionStatementHandler(prevToken) {
        let token = this._nextToken();
        switch (token.data.value) {
            case this._symbols.PLUS:
            case this._symbols.MINUS:
            case this._symbols.MULT:
            case this._symbols.DIV:
            case this._symbols.EXPON:
                {
                    // BinaryExpression
                    let expression = [prevToken.data.value];
                    while (token.data.value != this._symbols.COMMAND_END) {
                        expression.push(token.data.value);
                        token = this._nextToken();
                    }
                    this._nextToken();
                    return this._binaryExpressionHandler(expression);
                }
            case this._symbols.EQUAL:
                {
                    // AssignmentExpression
                    let expression = [];
                    token = this._nextToken();
                    while (token.data.value != this._symbols.COMMAND_END) {
                        expression.push(token.data.value);
                        token = this._nextToken();
                    }
                    if (expression.length == 1) {
                        expression = expression[0];
                    } else {
                        expression = this._binaryExpressionHandler(expression);
                    }
                    this._nextToken();
                    return {
                        type: this.statements.AssignmentExpression,
                        left: prevToken.data.value,
                        right: expression,
                    };
                }
            case this._symbols.BR_OPEN:
                {
                    // CallExpression
                    let args = [];
                    let expression = [];

                    token = this._nextToken();
                    while (token.data.value != this._symbols.COMMAND_END) {
                        switch (token.data.value) {
                            case this._symbols.BR_CLOSE:
                            case this._symbols.COMMA:
                                {
                                    if (expression.length == 1) {
                                        args.push(expression[0]);
                                    } else {
                                        args.push(this._binaryExpressionHandler(expression));
                                    }
                                    expression = [];
                                    break;
                                }
                            default:
                                expression.push(token.data.value);
                        }
                        token = this._nextToken();
                    }
                    this._nextToken();
                    return {
                        type: this.statements.CallExpression,
                        name: prevToken.data.value,
                        arguments: args,
                    };
                }
            default:
                {
                    throw new Error('_expressionStatementHandler: <Unexpected token>');
                }
        }
    }

    _whileStatementHandler(token) {
        token = this._nextToken();
        let expression = [];
        // Extracting expression
        while (token.data.value != this._symbols.BR_CLOSE) {
            expression.push(token.data.value);
            token = this._nextToken();
        }
        expression = this._binaryExpressionHandler(expression);
        // Extracting body
        this._nextToken();
        let body = this._blockStatementHandler(this._nextToken());

        this._nextToken();
        return {
            type: this.statements.WhileStatement,
            condition: expression,
            body: body,
        };
    }

    _ifStatementHandler(token) {
        token = this._nextToken();
        let expression = [];
        // Extracting expression
        while (token.data.value != this._symbols.BR_CLOSE) {
            expression.push(token.data.value);
            token = this._nextToken();
        }
        expression = this._binaryExpressionHandler(expression);

        // Extracting consequent
        this._nextToken();
        let consequent = this._blockStatementHandler(this._nextToken());

        // Extracting alternate
        this._nextToken(); // Passing else and '{'
        this._nextToken();
        let alternate = this._blockStatementHandler(this._nextToken());
        this._nextToken();

        return {
            type: this.statements.IfStatement,
            condition: expression,
            consequent: consequent,
            alternate: alternate,
        };
    }

    /**
     * @returns Array of declarations
     */
    _variableDeclarationHandler(token) {
        let result = [];
        let declaration = [];
        let END = false;

        while (!END) {
            switch (token.data.value) {
                case this._symbols.COMMAND_END:
                    {
                        result.push(this._newAssignmentFrom(declaration));
                        END = true;
                        break;
                    }
                case this._symbols.COMMA:
                    {
                        result.push(this._newAssignmentFrom(declaration));
                        declaration = [];
                        token = this._nextToken();
                        break;
                    }
                case this._symbols.EQUAL:
                    {
                        token = this._nextToken();
                        break;
                    }
                default:
                    {
                        declaration.push(token.data.value);
                        token = this._nextToken();
                    }
            }
        }
        this._nextToken();
        return result;
    }

    _newAssignmentFrom(assignment) {
        let init = assignment.slice(1);
        if (init.length == 1) {
            init = init[0];
        } else {
            init = this._binaryExpressionHandler(init);
        }
        return {
            id: assignment[0],
            init: init,
        };
    }

    /**
     * @returns FunctionDeclaration object
     */
    _functionDeclarationHandler(token) {
        let functionName = token.data.value;

        // Handle Params
        this._nextToken();
        token = this._nextToken();
        let params = [];
        while (token.data.value != this._symbols.BR_CLOSE) {
            if (token.data.value != this._symbols.COMMA) {
                params.push(token.data.value);
            }
            token = this._nextToken();
        }

        // Handle Block Statement
        this._nextToken();
        let body = this._blockStatementHandler(this._nextToken());
        this._nextToken();

        return {
            type: this.statements.FunctionDeclaration,
            name: functionName,
            params: params,
            body: body,
        };
    }

    /**
     * Collect array of tokens then feed it to the RPN
     */
    _binaryExpressionHandler(expression) {
        return this._parseRPN(RPN.transform(expression), [], 0, {
            type: 'BinaryExpression',
            operation: undefined,
            left: undefined,
            right: null,
        });
    }

    /**
     * Build a BinaryExpression based on the array of tokens in Reverse Polish Notation
     */
    _parseRPN(tokens, stack, i, obj) {
        if (this._operations.includes(tokens[i])) {
            obj.operation = tokens[i];
            if (!obj.right) {
                obj.right = stack.pop();
            }
            obj.left = stack.pop();
            if (i == tokens.length - 1) {
                return obj;
            }
            return this._parseRPN(tokens, stack, i + 1, {
                type: 'BinaryExpression',
                operation: undefined,
                left: undefined,
                right: obj,
            });
        } else {
            stack.push(tokens[i]);
            return this._parseRPN(tokens, stack, i + 1, obj);
        }
    }
}