const fs = require('fs').promises;

class Compiler {
	constructor() {
		this._title = 'program;\n';
		this._var = ['var: '];
		this._body = ['begin\n'];
		this._types = {
			VariableDeclaration: 'VariableDeclaration',
		};
	}

	compile(ast) {
		ast.body.forEach((node) => {
			switch (node.type) {
				case this._types.VariableDeclaration:
					this._variableDeclarationHandler(node);
					break;
				default:
					throw new Error('Unknown type of AST node');
			}
		});
		return this._join();
	}

	_variableDeclarationHandler(vd) {
		vd.declarations.forEach((dec) => {
			this._var.push(dec.id, ', ');
			this._body.push(`\t${dec.id} := ${dec.init};\n`);
		});
	}

	_join() {
		this._var[this._var.length - 1] = ';\n';
		this._var = this._var.join('');
		this._body.push('end.');
		this._body = this._body.join('');
		return [this._title, this._var, this._body].join('');
	}

	async save(data, file = 'output.pas') {
		await fs.writeFile(file, data);
	}
}

module.exports = Compiler;
