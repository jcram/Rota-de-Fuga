var btn = document.getElementsByClassName("btn-auth")[0];
btn.disabled = true;

if (btn.id == "btn-cadastrar") {
    btn.addEventListener("click", inscrever);
} else if (btn.id == "btn-login") {
    btn.addEventListener("click", logar);
}
document.getElementById("google-icon").addEventListener("click", signInWithGmail);
document.getElementById("email").addEventListener("blur", validarEmail);
document.getElementById("senha").addEventListener("blur", validarSenha);
document.getElementById("email").addEventListener("keyup", validarEmail);
document.getElementById("senha").addEventListener("keyup", validarSenha);

function inscrever(){
    var email = document.getElementById("email").value;
    var senha = document.getElementById("senha").value;
    createUser(email, senha);
}

function logar(){
    var email = document.getElementById("email").value;
    var senha = document.getElementById("senha").value;
    signIn(email, senha);
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
