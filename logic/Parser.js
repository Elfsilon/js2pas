class ValueDeclaration {
	constructor() {}
}

class StatementExpression {}

class Parcer {
	constructor(tokens) {
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
		if (token.data.value == this._triggers.ValueDeclaration) {
			let VariableDeclaration = {
				type: 'VariableDeclaration',
				declarations: [{}],
				kind: 'let',
			};
			this._next(this._variableDeclarationHandler, VariableDeclaration);
		} else {
			console.log('This is expression statement', token.data.value);
			this._next(this._parce);
		}
	}

	// Trace the same variables
	// Use previous token for detecting syntax errors
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
}

module.exports = Parcer;
