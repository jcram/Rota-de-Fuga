var btn = document.getElementsByClassName("btn-auth")[0];
btn.addEventListener('click', createUser);
btn.disabled = true;
document.getElementById("email").addEventListener("blur", validarEmail);
document.getElementById("senha").addEventListener("blur", validarSenha);
document.getElementById("email").addEventListener("keyup", validarEmail);
document.getElementById("senha").addEventListener("keyup", validarSenha);


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
        window.location = "login.html";
    }
});

function createUser() {
    if (document.getElementById("alert-email").style.display == "block") return;
    if (validarEmail && validarSenha) {
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
}

function signIn() {
    auth.signInWithEmailAndPassword(email, password).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
    });
}

function validarEmail() {
    var email = document.getElementById("email");
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(email.value)) {
        displayAlert(email, null)
    } else {
        displayAlert(email, null);
        displayAlert(email, "Email invalido");
    }
    changeDisableStateButton();
}

function validarSenha() {
    var senha = document.getElementById("senha");
    if (senha.value && senha.value.length >= 6) {
        displayAlert(senha, null);
    } else {
        displayAlert(senha, "A senha deve conter no minimo 6 caracteres.");
    }
    changeDisableStateButton();
}

function displayAlert(element, msg) {
    var alert = document.getElementById("alert-" + element.id);
    if (msg) {
        alert.innerHTML = msg;
        alert.style.display = "block";
        element.parentElement.style.border = "1px solid #E42046";
    } else {
        alert.style.display = "none";
        element.parentElement.style.border = "1px solid #b6f35cff";
    }
}

function changeDisableStateButton() {
    var alertaDeEmail = document.getElementById("alert-email").style.display == "none";
    var alertaDeSenha = document.getElementById("alert-senha").style.display == "none";
    console.log(alertaDeEmail);
    console.log(alertaDeSenha);
    console.log(!(alertaDeEmail && alertaDeSenha));
    btn.disabled = !(alertaDeEmail && alertaDeSenha);
}
