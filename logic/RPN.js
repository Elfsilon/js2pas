class RPN {
	static _priority = {
		'(': -1,
		')': -1,
		'+': 0,
		'-': 0,
		'*': 1,
		'/': 1,
		'**': 2,
	};

	static transform(expression) {
		if (!expression) {
			return [];
		}
		let output = [];
		let stack = [];
		expression.forEach((sym) => {
			if (sym in RPN._priority) {
				if (stack.length > 0) {
					if (sym == '(') {
						stack.push(sym);
					} else if (sym == ')') {
						while (stack[stack.length - 1] != '(') {
							output.push(stack.pop());
						}
						stack.pop();
					} else if (RPN._priority[stack[stack.length - 1]] < RPN._priority[sym]) {
						stack.push(sym);
					} else {
						while (RPN._priority[stack[stack.length - 1]] >= RPN._priority[sym]) {
							output.push(stack.pop());
						}
						stack.push(sym);
					}
				} else {
					stack.push(sym);
				}
			} else {
				output.push(sym);
			}
		});
		while (stack.length > 0) {
			output.push(stack.pop());
		}
		return output;
	}
}

const operations = ['+', '-', '*', '/', '**'];

function parseRPN(tokens, stack, i, obj) {
	if (operations.includes(tokens[i])) {
		obj.operation = tokens[i];
		if (!obj.right) {
			console.log('one time');

			obj.right = stack.pop();
		}
		obj.left = stack.pop();
		if (i == tokens.length - 1) {
			return obj;
		}
		return parseRPN(tokens, stack, i + 1, {
			type: 'BinaryExpression',
			operation: undefined,
			left: undefined,
			right: obj,
		});
	} else {
		stack.push(tokens[i]);
		return parseRPN(tokens, stack, i + 1, obj);
	}
}

const fs = require('fs').promises;

let str = '( a + a + a ) / c + d';
let expr = str.split(' ');
let transformed = RPN.transform(expr);
let tree = parseRPN(transformed, [], 0, {
	type: 'BinaryExpression',
	operation: undefined,
	left: undefined,
	right: null,
});
console.log(JSON.stringify(tree));
fs.writeFile('tree.json', JSON.stringify(tree)).then();

module.exports = RPN;
