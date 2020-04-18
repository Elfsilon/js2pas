class P {
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

	_binaryExpressionHandler() {
		let token = this._nextToken();
		let expression = [];
		while (token != this._symbols.COMMAND_END) {
			expression.push(token);
			token = this._nextToken();
		}
		return this._parseRPN(RPN.transform(prepareToRPN), [], 0, {
			type: 'BinaryExpression',
			operation: undefined,
			left: undefined,
			right: null,
		});
	}

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

let p = new P(['a', '+', 'b', ';']);
console.log(p._binaryExpressionHandler());
