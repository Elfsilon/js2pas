const RPN = require('./RPN');

class Parser {
	constructor(tokens) {
		this._AST = {
			type: undefined,
			body: [],
		};
		this._tokens = tokens;
		this._current = 0;
		this._operations = ['+', '-', '*', '/', '**'];
		this.statements = {
			VariableDeclaration: 'VariableDeclaration',
			FunctionDeclaration: 'FunctionDeclaration',
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
		while (this._current != this._tokens.length - 1 && token.data.value != this._symbols.CURLY_CLOSE) {
			switch (token.data.type) {
				case this._tokenTypes.SERVICE: {
					switch (token.data.value) {
						case this._triggers.VariableDeclaration: {
							console.log('--Transfer control to _variableDeclarationHandler--');
							BlockStatement.body.push({
								type: this.statements.VariableDeclaration,
								declarations: this._variableDeclarationHandler(),
								kind: 'let',
							});
							break;
						}
						case this._triggers.FunctionDeclaration: {
							console.log('--Transfer control to _functionDeclarationHandler--');
							BlockStatement.body.push(this._functionDeclarationHandler());
							break;
						}
						default: {
							throw new Error('_blockStatementError: <Unknown service token>', token.data.value);
						}
					}
				}
				case this._tokenTypes.IDENTIFIER: {
					console.log('--Transfer control to _expressionStatementHandler--');
					BlockStatement.body.push(this._expressionStatementHandler());
					break;
				}
				default:
					throw new Error('_blockStatementError: <Invalid token type>');
			}
		}
		return BlockStatement;
	}

	/**
	 * @returns Array of declarations
	 */
	_variableDeclarationHandler() {
		let token = this._nextToken();
		while (token.data.value != this._symbols.COMMAND_END) {
			console.log('TIMES');
			VariableDeclaration.declarations.push(this._variableDeclarator());
		}
		return [];
	}

	_variableDeclarator() {}

	/**
	 * @returns FunctionDeclaration object
	 */
	_functionDeclarationHandler() {}

	/**
	 * @returns ExpressionStatement object
	 */
	_expressionStatementHandler() {}

	/**
	 * Collect array of tokens then feed it to the RPN
	 */
	_binaryExpressionHandler() {
		let token = this._nextToken();
		let expression = [];
		while (token.data.value != this._symbols.COMMAND_END && token.data.value != this._symbols.COMMA) {
			expression.push(token.data.value);
			token = this._nextToken();
		}
		console.log(expression);

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

module.exports = Parser;
