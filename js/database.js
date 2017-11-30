var config = {
    apiKey: "AIzaSyC3jg6oX-UNkTfjfttrDpEBocqSK7DmVCg",
    authDomain: "rota-de-fuga.firebaseapp.com",
    databaseURL: "https://rota-de-fuga.firebaseio.com",
    projectId: "rota-de-fuga",
    storageBucket: "rota-de-fuga.appspot.com",
    messagingSenderId: "194503795991"
};

firebase.initializeApp(config);

function salvarPost(id, descricao, usuario, posicaoDoRoubo, data, callback) {
    var id;
    if (id == "0") {
        id = newKey("/posts/");
    }
    var post = {
        descricao: descricao,
        usuario: usuario,
        posicao: posicaoDoRoubo,
        dataDoRoubo: data.toString(),
        data: new Date().toString()
    };
    update("/posts/" + id, post, callback);
}

function saveRota(r, callback) {
    var id = r.id;
    if (r.id == "0") {
        id = newKey("/rotas/")
    }
    var rota = {
        posicao_a: r.posicao_a,
        posicao_b: r.posicao_b,
        periculosidade: r.periculosidade,
        rua: r.rua,
        overViewPolyline: r.overViewPolyline
    };
    update("/rotas/" + id, rota, callback);
}

function newKey(path) {
    return firebase.database().ref().child(path).push().key;
}

function update(path, data, callback) {
    firebase.database().ref(path).update(data).then(callback);
}

function removeRota(id) {
    firebase.database().ref("/rotas/" + id).remove();
}

function loadAllPosts(callback) {
    firebase.database().ref("/posts/").once('value', callback);
}

function buscarPosts(limite, callback) {
    firebase.database().ref("/posts/").limitToLast(limite).once("value", callback);
}

function loadRotas(zoom, renderFunction) {
    var a;
    if (zoom > 16) {
        firebase.database().ref('/rotas/').once('value', renderFunction);
    } else if (zoom == 16) {
        firebase.database().ref('/rotas/').orderByChild("periculosidade").endAt(1).once('value', renderFunction);
    } else {
        firebase.database().ref('/rotas/').orderByChild("periculosidade").endAt(-1).once('value', renderFunction);
    }
}

function buscarTodasRotasNaRua(c) {
    firebase.database().ref("/rotas/").orderByChild("rua").equalTo(c.rua).once("value", function (snapshot) {
        calcNovaRota(snapshot, c);
    });
}
