const RPN = require('./RPN');

class Parcer {
	constructor(tokens) {
		this.statements = {
			VariableDeclaration: 'VariableDeclaration',
			FunctionDeclaration: 'FunctionDeclaration',
			AssignmentExpression: 'AssignmentExpression',
			CallExpression: 'CallExpression',
			BinaryExpression: 'BinaryExpression',
			BlockStatement: 'BlockStatement',
		};
		this._operations = ['+', '-', '*', '/', '**'];
		this._symbols = {
			EQUAL: '=',
			BR_OPEN: '(',
			BR_CLOSE: ')',
			COMMAND_END: ';',
			COMMA: ',',
			PLUS: '+',
			MINUS: '-',
			MULT: '*',
			DIV: '/',
			EXPON: '**',
		};
		this._AST = {
			type: 'Program',
			body: [],
		};
		this._tokens = tokens;
		this._current = 0;
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

	parseTokens() {
		this._parce(this._tokens[this._current]);
		return this._AST;
	}

	_next(callback, obj = null, increaseCurrent = true) {
		if (increaseCurrent) {
			this._current++;
		}
		if (this._tokens[this._current] === undefined || this._current >= this._tokens.length) {
			return;
		}
		callback.call(this, this._tokens[this._current], obj);
	}

	_parce(token) {
		switch (token.data.type) {
			// If service word (let)
			case this._tokenTypes.SERVICE:
				switch (token.data.value) {
					case this._triggers.VariableDeclaration: {
						console.log('---Transferring control to _variableDeclarationHandler---');
						this._next(this._variableDeclarationHandler, {
							type: this.statements.VariableDeclaration,
							declarations: [{}],
							kind: 'let',
						});
						break;
					}
					case this._triggers.FunctionDeclaration:
						console.log('---Transferring control to _functionDeclarationHandler---');
						this._next(this._functionDeclarationHandler, {
							type: this.statements.FunctionDeclaration,
							name: undefined,
							params: [],
							body: {
								type: this.statements.BlockStatement,
								body: [],
							},
						});
						break;
					default: {
						this._next(this._parce); //What is this??? throw new Error();
					}
				}
				break;
			// If identifier
			case this._tokenTypes.IDENTIFIER: {
				console.log('---Transferring control to _expressionStatementHandler---');
				this._next(this._expressionStatementHandler, {
					type: 'ExpressionStatement',
					expression: null,
					_value: token.data.value,
				});
				break;
			}
			default:
				throw new Error('(_parce error) ** Invalid token type **');
		}
	}

	_functionDeclarationHandler(token, fd) {
		fd.name = token.data.value;
		this._next(this._paramsCollector, fd);
	}

	/**
	 * @todo Add handle of errors (expressions)
	 */
	_paramsCollector(token, fd) {
		switch (token.data.value) {
			case '(':
			case ',':
				this._next(this._paramsCollector, fd);
				break;
			case ')':
				this._next(this._blockStatementHandler, fd);
				break;
			default:
				fd.params.push(token.data.value);
				this._next(this._paramsCollector, fd);
		}
	}

	/**
	 * @todo All
	 */
	_blockStatementHandler(token, fd) {
		switch (token.data.value) {
			case 'return':
				// Need return handler
				fd.body.body.push({
					type: 'ReturnStatement',
					argument: 0,
				});
				this._next(this._blockStatementHandler, fd);
				break;
			case '}':
				this._AST.body.push(fd);
				this._next(this._parce);
			default:
				this._next(this._blockStatementHandler, fd);
		}
	}

	/**
	 * Handle the Variable declaration
	 * @param {Object} vd - Variable declaration object
	 * @todo Trace the same variables
	 * @todo Use previous token for detecting syntax errors
	 */
	_variableDeclarationHandler(token, vd) {
		switch (token.data.type) {
			case this._tokenTypes.IDENTIFIER:
				vd.declarations[vd.declarations.length - 1].id = token.data.value;
				break;
			case this._tokenTypes.LITERAL:
				vd.declarations[vd.declarations.length - 1].init = token.data.value;
				break;
			case this._tokenTypes.SEPARATOR:
				switch (token.data.value) {
					case this._symbols.COMMAND_END:
						this._AST.body.push(vd);
						this._next(this._parce);
						break;
					case this._symbols.COMMA:
						vd.declarations.push({});
						break;
					default:
						throw new Error('(_variableDeclarationHandler error) ** Unknown separator **');
				}
				break;
			case this._tokenTypes.OPERATION:
				break;
			default:
				throw new Error('(_variableDeclarationHandler error) ** Unknown token type **');
		}
		this._next(this._variableDeclarationHandler, vd);
	}

	/**
	 * Defines the required handler of expression handler based on the current token
	 * There are only tokens with 'Identifier' type
	 * @param {Object} es - Expression statement object
	 */
	_expressionStatementHandler(token, es) {
		switch (token.data.value) {
			case this._symbols.EQUAL:
				es.expression = {
					type: this.statements.AssignmentExpression,
					left: es._value,
					right: { prepareToRPN: [] },
				};
				this._next(this._binaryExpressionHandler, es);
				break;
			case this._symbols.PLUS:
			case this._symbols.MINUS:
			case this._symbols.MULT:
			case this._symbols.DIV:
			case this._symbols.EXPON:
				es.expression = {
					type: this.statements.BinaryExpression,
					left: es._value,
					right: { prepareToRPN: [] }, // prepareRPN is temp
				};
				this._next(this._binaryExpressionHandler, es);
				break;
			case this._symbols.BR_OPEN:
				es.expression = {
					type: this.statements.CallExpression,
					name: es._value,
					arguments: [],
					right: { prepareToRPN: [] }, // Temp
				};
				this._next(this._callExpressionHandler, es);
				break;
			default:
				throw new Error('(_expressionStatementHandler error) Unexpected identifier value');
		}
		delete es._value;
	}

	/**
	 * @param {Object} es - Expression statement object
	 */
	_callExpressionHandler(token, es) {
		switch (token.data.value) {
			case this._symbols.COMMAND_END:
				delete es.expression.right;
				this._AST.body.push(es);
				this._next(this._parce);
				break;
			default:
				this._next(this._binaryExpressionHandler, es, false);
		}
	}

	/**
	 * Collect array of tokens then feed it to the RPN
	 * @param {Object} es - Expression statement object
	 */
	_binaryExpressionHandler(token, es) {
		switch (es.expression.type) {
			// Handle arguments of function call expression
			case this.statements.CallExpression:
				switch (token.data.value) {
					case this._symbols.BR_CLOSE:
					case this._symbols.COMMA: {
						if (es.expression.right.prepareToRPN.length <= 1) {
							if (es.expression.right.prepareToRPN.length == 0) {
								throw new Error('Argument is empty');
							}
							es.expression.arguments.push(es.expression.right.prepareToRPN[0]);
						} else {
							let transformed = RPN.transform(es.expression.right.prepareToRPN);
							let expressionTree = this._parseRPN(transformed, [], 0, {
								type: 'BinaryExpression',
								operation: undefined,
								left: undefined,
								right: null,
							});
							es.expression.arguments.push(expressionTree);
						}
						es.expression.right.prepareToRPN = [];
						this._next(this._callExpressionHandler, es);
						break;
					}
					default: {
						es.expression.right.prepareToRPN.push(token.data.value);
						this._next(this._binaryExpressionHandler, es);
					}
				}
				break;
			// Handle left part of assignment expression and binary expression
			case this.statements.AssignmentExpression:
			case this.statements.BinaryExpression:
				switch (token.data.value) {
					case this._symbols.COMMAND_END: {
						let transformed = RPN.transform(es.expression.right.prepareToRPN);
						delete es.expression.right.prepareToRPN;
						let expressionTree = this._parseRPN(transformed, [], 0, {
							type: 'BinaryExpression',
							operation: undefined,
							left: undefined,
							right: null,
						});
						es.expression.right = expressionTree;
						this._AST.body.push(es);
						this._next(this._parce);
						break;
					}
					default: {
						es.expression.right.prepareToRPN.push(token.data.value);
						this._next(this._binaryExpressionHandler, es);
					}
				}
				break;
			default:
				throw new Error('(_binaryExpressionHandler error) Unknown statement expression type');
		}
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

module.exports = Parcer;
