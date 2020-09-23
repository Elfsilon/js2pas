const fs = require('fs').promises;

class Compiler {
    constructor() {
        this._types = {
            VariableDeclaration: 'VariableDeclaration',
            FunctionDeclaration: 'FunctionDeclaration',
            WhileStatement: 'WhileStatement',
            ForStatement: 'ForStatement',
            IfStatement: 'IfStatement',
            ExpressionStatement: 'ExpressionStatement',
            ArrayExpression: 'ArrayExpression',
            AssignmentExpression: 'AssignmentExpression',
            CallExpression: 'CallExpression',
            BinaryExpression: 'BinaryExpression',
            BlockStatement: 'BlockStatement',
        };
    }

    compile(ast) {
        console.log('COMPILE STARTED');
        return this._blockHandler(ast.body.body, true);
    }

    _blockHandler(body, haveTitle = false, tabs = 0, handlIf = false) {
        let res = {
            body: [],
        };
        if (!handlIf) {
            res.body = ['begin\n'];
            res.functions = [];
            res.variables = ['var: '];
        }
        body.forEach((node) => {
            switch (node.type) {
                case this._types.VariableDeclaration:
                    {
                        let vd = this._variableDeclarationHandler(node);
                        if (!handlIf) {
                            res.variables = res.variables.concat(vd.variables);
                        }
                        res.body = res.body.concat(vd.body);
                        break;
                    }
                case this._types.FunctionDeclaration:
                    {
                        let params = node.params.join(', ');
                        res.functions.push(
                            `procedure ${node.name}(${params});\n${this._blockHandler(node.body.body, false, tabs + 1)}`
                        );
                        // res.functions.push(`${this._blockHandler(node.body.body, false, tabs + 1)}`);
                        break;
                    }
                case this._types.ForStatement:
                    {
                        let forBody = this._blockHandler(node.body.body);
                        forBody = forBody.split('\n');
                        forBody.splice(forBody.indexOf('end;'), 0, node.update + ';');
                        forBody = forBody.join('\n');

                        res.body.push(`\n${node.init}\n`); //need handler
                        res.body.push(`while ${this._binaryHandler(node.test)} do\n`);
                        res.body.push(`${forBody}\n`);
                        // res.body.push(`${this._binaryHandler(node.body.body)}\n`);
                        break;
                    }
                case this._types.WhileStatement:
                    {
                        res.body.push(`\nwhile ${this._binaryHandler(node.condition)} do\n`);
                        res.body.push(`${this._blockHandler(node.body.body, false, tabs + 2)}\n`);
                        break;
                    }
                case this._types.IfStatement:
                    {
                        res.body.push(`\tif ${this._binaryHandler(node.condition)} then begin\n`);
                        res.body.push(`\t${this._blockHandler(node.consequent.body, false, tabs + 2, true)}\tend;\n`);
                        res.body.push(`\telse begin\n\t${this._blockHandler(node.alternate.body, false, tabs + 2, true)}\tend;\n`);
                        break;
                    }
                case this._types.ExpressionStatement:
                    {
                        switch (node.expression.type) {
                            case this._types.ArrayExpression:
                                {
                                    res.body.push(`\t${node.expression.target}[${node.expression.index}];\n`);
                                    break;
                                }
                            case this._types.BinaryExpression:
                                {
                                    res.body.push(`\t${this._binaryHandler(node.expression)};\n`);
                                    break;
                                }
                            case this._types.AssignmentExpression:
                                {
                                    if (typeof node.expression.right == 'object') {
                                        res.body.push(`\t${node.expression.left} = ${this._binaryHandler(node.expression.right)};\n`);
                                    } else {
                                        res.body.push(`\t${node.expression.left} = ${node.expression.right};\n`);
                                    }
                                    break;
                                }
                            case this._types.CallExpression:
                                {
                                    res.body.push(`\t${node.expression.name}(${this._argumentsHandler(node.expression.arguments)});\n`);
                                    break;
                                }
                            default:
                                {
                                    throw new Error('(_blockHandler error) <Unknown type of ExpressionStatement>');
                                }
                        }
                        break;
                    }
                default:
                    throw new Error('(_blockHandler error) <Unknown type of AST node>');
            }
        });

        if (handlIf) {
            return res.body.join('');
        }
        return this._joinBlock(res, haveTitle, handlIf);
    }

    _joinBlock(data, haveTitle, handlIf) {
        // console.log(data);
        if (!handlIf) {
            if (data.variables.length == 1) {
                data.variables = [''];
            } else {
                data.variables[data.variables.length - 1] = ':integer;\n';
            }
        } else {
            data.variables = [''];
        }
        data.variables = data.variables.join('');

        data.functions.join('');

        if (haveTitle) {
            data.body.push('end.\n\n');
            data.body = data.body.join('');
            return ['program;\n', data.variables, data.functions, data.body].join('');
        } else {
            data.body.push('end;\n\n');
            data.body = data.body.join('');
            // console.log(data.variables);

            let t = [data.variables, data.functions, data.body].join('');
            // console.log(t);

            return t;
        }
    }

    _variableDeclarationHandler(tree) {
        let res = {
            variables: [],
            body: [],
        };
        tree.declarations.forEach((dec) => {
            res.variables.push(dec.id, ', ');
            if (typeof dec.init === 'object') {
                res.body.push(`\t${dec.id} := ${this._binaryHandler(dec.init)};\n`);
            } else {
                res.body.push(`\t${dec.id} := ${dec.init};\n`);
            }
        });
        return res;
    }

    _argumentsHandler(args) {
        let res = '';
        args.forEach((arg) => {
            if (typeof arg == 'object') {
                res += this._binaryHandler(arg) + ', ';
            } else {
                res += arg + ', ';
            }
        });
        return res.slice(0, res.length - 2);
    }

    _binaryHandler(tree) {
        if (typeof tree.right === 'object') {
            return `${tree.left} ${tree.operation} ${this._binaryHandler(tree.right)}`;
        } else {
            return `${tree.left} ${tree.operation} ${tree.right}`;
        }
    }

    _join() {
        this._var[this._var.length - 1] = ';\n';
        this._var = this._var.join('');
        this._functions.join('');
        this._body.push('end.');
        this._body = this._body.join('');
        return [this._title, this._var, this._functions, this._body].join('');
    }

    async save(data, file = 'output.pas') {
        await fs.writeFile(file, data);
    }
}

module.exports = Compiler;