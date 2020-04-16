const RPN = require('./RPN');

class Parcer {
	constructor(tokens) {
		this._operations = ['+', '-', '*', '/', '**'];
		this._symbols = {
			COMMAND_END: ';',
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

	_next(callback, obj = null) {
		this._current++;
		if (this._tokens[this._current] === undefined || this._current == this._tokens.length) {
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
				let AssignmentExpression = {
					type: 'AssignmentExpression',
					left: es._value,
					rigth: { prepareToRPN: [] },
				};
				delete es._value;
				es.expression = AssignmentExpression;
				this._next(this._binaryExpressionHandler, es);
				break;
			case '(':
				let CallExpression = {
					type: 'CallExpression',
					name: es._value,
					arguments: [],
				};
				delete es._value;
				es.expression = CallExpression;
				this._next(this._callExpressionHandler, es);
				break;
			default:
				throw new Error('Unexpected identifier value');
		}
	}

	/**
	 * Collect array of tokens then feed it to the RPN
	 * @param {Object} es - Expression statement object
	 */
	_binaryExpressionHandler(token, es) {
		switch (token.data.value) {
			case this._symbols.COMMAND_END:
				let transformed = RPN.transform(es.expression.rigth.prepareToRPN);
				delete es.expression.rigth.prepareToRPN;
				let expressionTree = this._parseRPN(transformed, [], 0, {
					type: 'BinaryExpression',
					operation: undefined,
					left: undefined,
					right: null,
				});
				es.expression.rigth = expressionTree;
				this._AST.body.push(es);
				this._next(this._parce);
				break;
			default:
				es.expression.rigth.prepareToRPN.push(token.data.value);
				this._next(this._binaryExpressionHandler, es);
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

	/**
	 *
	 * @param {Object} es - Expression statement object
	 * @todo Handle all in brackets (give handle each arg to _binaryExpressionHandler)
	 */
	_callExpressionHandler(token, es) {
		console.log('Inside call expression handler');
	}
}

module.exports = Parcer;
