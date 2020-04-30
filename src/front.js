const js2pasAPI = 'http://localhost:3000';

const modalTokens = document.querySelector('.modal-tokens');
const tokenButton = document.querySelector('.tokens-button');
const closeTokens = document.querySelector('.close-modal-tokens');

const modal = document.querySelector('.modal-ast');
const astButton = document.querySelector('.ast-button');
const closeButton = document.querySelector('.close-modal');

const translateButton = document.querySelector('.translate-button');

const astTokens = document.querySelector('.ast-tokens');
const astEditor = document.querySelector('.ast-json');
const jsEditor = document.querySelector('.js');
const pasEditor = document.querySelector('.pas');


function sendRequest(method, url, body = null) {
    let headers = {
        'Content-Type': 'application/json',
    };

    return fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: headers,
        body: JSON.stringify(body)
    }).then(res => {
        return res.json();
    });
}


tokenButton.addEventListener('click', () => {
    modalTokens.style.display = 'flex';
});

astButton.addEventListener('click', () => {
    modal.style.display = 'flex';
});

closeTokens.addEventListener('click', () => {
    modalTokens.style.display = 'none';
});

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

translateButton.addEventListener('click', () => {

    let prog = `function fun1(a, b) {
        let c = a + b;
    }
    
    let c = a + b;
    
    if (a > b) {
        let b = 0;
    } else {
        r = f;
    }`;

    let text = jsEditor.textContent;
    sendRequest('POST', js2pasAPI, {
        source: text
    }).then(data => {
        console.log(data);
        pasEditor.textContent = data.compiled;
        astEditor.textContent = JSON.stringify(data.AST, undefined, 2);
        astTokens.textContent = JSON.stringify(data.tokens, undefined, 2)
    });
});