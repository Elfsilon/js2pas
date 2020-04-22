const modal = document.querySelector('.modal-ast');
const astButton = document.querySelector('.ast-button');
const closeButton = document.querySelector('.close-modal');
const translateButton = document.querySelector('.translate-button');

const jsEditor = document.querySelector('.js');
const pasEditor = document.querySelector('.pas');

// import Lexer from './modules/Lexer';

astButton.addEventListener('click', () => {
    console.log('click');

    modal.style.display = 'flex';
});

closeButton.addEventListener('click', () => {
    console.log('click');
    modal.style.display = 'none';
});

translateButton.addEventListener('click', () => {
    console.log(jsEditor.textContent);

    const lex = new Lexer();
    let tokens = lex.getTokens(lex.parse(jsEditor.textContent));

    const parser = new Parser(tokens);
    let ast = parser.parseTokens();

    const compiler = new Compiler();
    let compiled = compiler.compile(ast);

    console.log(compiled);
});