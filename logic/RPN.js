class RPN {
	static _priority = {
		'(': -2,
		')': -1,
		'||': 0,
		'|': 0,
		'&&': 1,
		'&': 1,
		'!': 2,
		'>': 3,
		'<': 3,
		'<=': 3,
		'>=': 3,
		'==': 3,
		'+': 4,
		'-': 4,
		'*': 5,
		'/': 5,
		'**': 6,
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

module.exports = RPN;
