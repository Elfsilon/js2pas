const RPN = require('./RPN');

class Parcer {
	constructor(tokens) {
		this.statements = {
			VariableDeclaration: 'VariableDeclaration',
			AssignmentExpression: 'AssignmentExpression',
			CallExpression: 'CallExpression',
			BinaryExpression: 'BinaryExpression',
		};
		this._operations = ['+', '-', '*', '/', '**'];
		this._symbols = {
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
			ValueDeclaration: 'let',
			IfStatement: 'if',
		};
		this._tokenTypes = {
			Service: 'Service',
			Identifier: 'Identifier',
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
			case this._tokenTypes.Service:
				switch (token.data.value) {
					case this._triggers.ValueDeclaration:
						let VariableDeclaration = {
							type: 'VariableDeclaration',
							declarations: [{}],
							kind: 'let',
						};
						this._next(this._variableDeclarationHandler, VariableDeclaration);
						break;
					default:
						console.log('This is expression statement', token.data.value);
						this._next(this._parce);
				}
				break;
			// If identifier
			case this._tokenTypes.Identifier:
				console.log('Give control to statement handler');
				let ExpressionStatement = {
					type: 'ExpressionStatement',
					expression: null,
					_value: token.data.value,
				};
				this._next(this._expressionStatementHandler, ExpressionStatement);
				break;
			default:
				console.log(token);

				throw new Error('Invalid token type');
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
			case 'Identifier':
				vd.declarations[vd.declarations.length - 1].id = token.data.value;
				break;
			case 'Literal':
				vd.declarations[vd.declarations.length - 1].init = token.data.value;
				break;
			case 'Separator':
				switch (token.data.value) {
					case ';':
						this._AST.body.push(vd);
						this._next(this._parce);
						break;
					case ',':
						vd.declarations.push({});
						break;
					default:
						throw new Error('Unknown separator in variable declaration');
				}
				break;
			case 'Operation':
				// ---
				break;
			default:
				throw new Error('Unknown token type in variable declaration');
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
			case '=':
				es.expression = {
					type: 'AssignmentExpression',
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
					type: 'BinaryExpression',
					left: es._value,
					right: { prepareToRPN: [] }, // prepareRPN is temp
				};
				this._next(this._binaryExpressionHandler, es);
				break;
			case this._symbols.BR_OPEN:
				es.expression = {
					type: 'CallExpression',
					name: es._value,
					arguments: [],
					right: { prepareToRPN: [] }, // Temp
				};
				// this._current--; // crutch
				this._next(this._callExpressionHandler, es);
				break;
			default:
				throw new Error('Unexpected identifier value');
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
				throw new Error('Unknown statement expression type');
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
