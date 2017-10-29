var btn = document.getElementsByClassName("btn-auth")[0];
btn.disabled = true;

if (btn.id == "btn-cadastrar") {
    btn.addEventListener("click", createUser);
} else if (btn.id == "btn-login") {
    btn.addEventListener("click", signIn);
}
document.getElementById("google-icon").addEventListener("click", signInWithGmail);
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
var usuario;
var token;
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        usuario = user;
        window.location = "time-line.html";
    }
});

firebase.auth().getRedirectResult().then(function (result) {
    if (result.credential) {
        token = result.credential.accessToken;
    }
    usuario = result.user;
}).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
});


function createUser() {
    var inputEmail = document.getElementById("email");
    var senha = document.getElementById("senha").value;
    firebase.auth().createUserWithEmailAndPassword(email, senha).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
    });
}

function signInWithGmail() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}

function signIn() {
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
    });
}

function validarEmail() {
    var email = document.getElementById("email");
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(email.value)) {
        displayAlert(email, null);
    } else {
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
    btn.disabled = !(alertaDeEmail && alertaDeSenha);
}
