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
    usuario = user;
    redirect(extractActualPage(), user);
});

firebase.auth().getRedirectResult().then(function (result) {
    if (result.credential) {
        token = result.credential.accessToken;
    }
   console.log("firebase.auth().getRedirectResult() Redirecionando Time Line");
}).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
});

/*
    Extrai em qual pagina o usuario esta navegando.
*/
function extractActualPage() {
    var url = window.location.href;
    var indexBarra = url.lastIndexOf("/");
    if (indexBarra == url.length + 1)
        return "";
    return url.substring(indexBarra + 1);
}

/*
    redireciona para paginas especifica dependendo do estado de login do usuario
*/
function redirect(pg, user) {
    console.log(pg + " " + user);
    if (pg != "login.html" && pg != "inscrever.html") {
        if (!user){
            console.log("Redirecionando Login");
        }
//            window.location = "login.html";
    } else if (user) {
//            window.location = "time-line.html";
            console.log("Redirecionando Time Line");
    }
}


function createUser(email, senha) {
    firebase.auth().createUserWithEmailAndPassword(email, senha).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
    });
}

function signInWithGmail() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}

function signIn(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password).then(function (result) {
        console.log(result);
    }).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
    });
}

function signInWithFacebook() {
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}

function signOut() {
    firebase.auth().signOut().then(function () {
        console.log("Redirecionando Login");
    }).catch(function (error) {
        // enviar mensagem para o usuario
    });
}
