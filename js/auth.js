document.getElementById("btn-criar-conta").addEventListener('click', createUser);
document.getElementById("btn-criar-conta").disabled = true;
document.getElementById("confirmacao-senha").addEventListener("keyup", compararSenhas);

var config = {
    apiKey: "AIzaSyAnZTBIEmUzSixubXQoib5_a2r1LfK9qXg",
    authDomain: "rota-de-fuga-teste.firebaseapp.com",
    databaseURL: "https://rota-de-fuga-teste.firebaseio.com",
    projectId: "rota-de-fuga-teste",
    storageBucket: "rota-de-fuga-teste.appspot.com",
    messagingSenderId: "63327819122"
};
firebase.initializeApp(config);
var auth = firebase.auth();
var email;
var uid;
auth.onAuthStateChanged(function (user) {
    if (user) {
        email = user.email;
        uid = user.uid;
    } else {
        window.location = "/login.html";
    }
});

function createUser() {
    var inputEmail = document.getElementById("email");
    var senha = document.getElementById("senha").value;
    auth.createUserWithEmailAndPassword(email, senha).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.log(errorCode);
        console.log(errorMessage);
    });
}

function signIn() {
    auth.signInWithEmailAndPassword(email, password).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        // mensagem de erro.
    });
}


function compararSenhas() {
    var inputSenha = document.getElementById("senha");
    var inputConfirmacao = document.getElementById("confirmacao-senha");
    var btn = document.getElementById("btn-criar-conta");
    if (inputSenha.value && inputSenha.value == inputConfirmacao.value) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}