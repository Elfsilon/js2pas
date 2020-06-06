# What is it?
It's a simple translator from js to pascal. One of my university tasks. 
In this projects are my attempts to understand what is under the hood.

# How to use it?
It's pretty simple. I'm learning to build an easy to understand and easily 
expandable structure.

## Step 1:
Clone this repo and type ``` node index.js ``` *(It's just a test)*

## Step 2:
Link to your project all modules from logic folder 
```javascript
const Lexer = require('./logic/Lexer');
const Parcer = require('./logic/Parser');
const Compiler = require('./logic/Compiler');
```
## Step 3:
Create a Lexer instance and call method parce with scr to your js file
```javascript
const lex = new Lexer();
lex.parse(src).then((parced) => {});
```

## Last steps:
***parced*** - is returned array of tokens you have to feed it to the 
constructor of Parser object and then get the AST tree from ``` parceTokens() ``` method:
```javascript
const parser = new Parcer(tokens);
let ast = parser.parseTokens();
```
***AST*** tree object need to pass to the compile method of Compile object and save it with ``` save(src) ``` method:
```javascript
const compiler = new Compiler();
let compiled = compiler.compile(ast);
compiler.save(compiled).then(() => console.log('\x1b[34m', 'Succesfully compiled', '\x1b[0m'));
```

# Have a good luck, dude!

### TODO:
- [x] Create main structure
- [x] Create Lexer
- [x] Create structure of Parser
- [x] Add handler of variable declaration
- [x] Create compiler structure
- [x] Add compile of variable declaration
- [x] Add possibility to save program to the file
- [x] Add handler of if/else statement
- [x] Add handler of for statement
- [x] Add handler of while statement
- [x] Add handler of do-while statement
- [x] Add handler of function declaration
- [x] Finish the compile method
- [ ] Create syntax analyzer
