var map;

// renderizaçao de rotas.
var directionsDisplay;
var directionsService;
// armazena a ultima posiçao conhecido do usuario.
var ultimaPosicaoConhecida;

// tempo de execucao da funcionalidade rota de fuga.
var timeRotaDeFuga;

var polylines;
var MIN_DIST_POINTS = 0.8;

// armazena a posiçao que o usuario selecionou no mapa. e apenas usada na funcionalidade fui roubado.
var markerPosicaoRoubo;
var positionRoubo;

// variaveis utilizadas para a pesquisa de lugares.
var autocomplete;
var autocompleteModal;
var place;

// ==================> funçoes de inicializaçao de mapa <====================
function initMap() {

    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -19.9321584,
            lng: -43.9401944
        },
        zoom: 17
    });

    directionsDisplay.setMap(map);

    map.setOptions({
        minZoom: 15,
        maxZoom: 18
    });
}

function initMapMapaDeCalor() {
    initMap();
    map.addListener('zoom_changed', function () {
        var zoom = map.getZoom();
        loadRotas(zoom, renderRoutes);
    });
    loadRotas(map.getZoom(), renderRoutes);
}

function initMapTimeLine() {
    initMapFuiRoubado();
    initAutocomplete();
}

function initMapFuiRoubado() {
    initMap();

    markerPosicaoRoubo = new google.maps.Marker();

    map.addListener('click', function (event) {
        var origin = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
        var request = {
            origin: origin,
            destination: origin,
            travelMode: 'WALKING'
        };
        directionsService.route(request, function (results, status) {
            if (status == "OK") {
                var address = results.routes[0].legs[0].start_address.split(",");
                positionRoubo = {
                    lat: results.routes[0].legs[0].start_location.lat(),
                    lng: results.routes[0].legs[0].start_location.lng(),
                    endereco: address[0] + " -" + address[1].split("-")[1] + ", Belo Horizonte"
                }
                if (!markerPosicaoRoubo.getMap()) {
                    markerPosicaoRoubo.setMap(map);
                }
                markerPosicaoRoubo.setPosition(positionRoubo);
            }

        });
    });
}

function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete((document.getElementById('autocomplete')), {
        types: ['geocode']
    });
    autocomplete.addListener('place_changed', function () {
        place = autocomplete.getPlace();
    });
    autocompleteModal = new google.maps.places.Autocomplete((document.getElementById('autocomplete-modal')), {
        types: ['geocode']
    });
    autocompleteModal.addListener('place_changed', function () {
        place = autocompleteModal.getPlace();
    });
}

// ====================> Funcoes Onde fui roubado <============================
function salvarPosicao() {
    if (!markerPosicaoRoubo.getMap()) {
        showMsg("warning", " Selecione o local", "Atençao!");
    } else {
        var dataRoubo = new Date($("#date-roubo").val());
        var time = $("#time-roubo").val();
        dataRoubo.setDate(dataRoubo.getDate() + 1);
        dataRoubo.setHours(time.split(":")[0]);
        dataRoubo.setMinutes(time.split(":")[1]);
        salvarPost(0, $("#descricao").val(), "anonimo", positionRoubo, dataRoubo, tratarRespostaSalvarPost);
    }
}

function tratarRespostaSalvarPost() {
    var pos = {
        lat: positionRoubo.lat,
        lng: positionRoubo.lng
    };
    updateRotaDePericulosidade(pos);
    markerPosicaoRoubo.setMap(null);
    document.getElementById("form-fui-roubado").reset();
    $("#fui-roubado").modal("hide");
    showMsg("success", " Roubo reportado com sucesso", "Sucesso!");
    carregarTimeLine();
}

function openFuiRoubado() {
    $("#fui-roubado #tab1").css("display", "block");
    $("#fui-roubado #tab2").css("display", "none");
    $("#fui-roubado").modal("show");
    $("#myNavbar").toggle();
}

function nextTab() {
    $("#tab1").toggle("left");
    $("#tab2").toggle("left", function () {
        google.maps.event.trigger(map, "resize");
    });
}

function previousTab() {
    $("#tab2").toggle("left");
    $("#tab1").toggle("left");
}

// =====================> Funcoes da Time Line <========================
function pesquisarPostsModal(){
    $("#pesquisarPostsModal").modal("hide");
    pesquisarPosts();
}
function pesquisarPosts() {
    if (place) {
        var ti = new Date().getMilliseconds();
        $("#myModal").modal("show");
        var raio = $("#myRange").val();
        var dataInicio = new Date($("#data-inicio").val());
        var dataFim = new Date($("#data-fim").val());
        loadAllPosts(function (snapshot) {
            if (!snapshot.val()) {
                msgNenhumPostEncontrado();
            } else {
                var posts = filter(snapshot, place, raio, dataInicio, dataFim);
                document.getElementById("list_posts").innerHTML = "";
                for (var i = posts.length - 1; i > -1; i--) {
                    post(post.id, posts[i]);
                }
            }
            var tf = new Date().getMilliseconds() - ti;
            if (tf < 700) {
                setTimeout(function () {
                    $("#myModal").modal("hide")
                }, 2000 - tf);
            } else {
                $("#myModal").modal("hide");
            }
            scrollTop();
        });
    }
}

function filter(snapshot, place, raio, dataI, dataF) {
    var posts = [];
    var ti = dataI.getTime();
    var tf = dataF.getTime();

    // limites da pesquisa.
    var minLat = addKmToLat(place.geometry.location.lat(), (raio * -1) / 1000);
    var maxLat = addKmToLat(place.geometry.location.lat(), raio / 1000);
    var minLng = addKmToLng(place.geometry.location.lng(), place.geometry.location.lat(), (raio * -1) / 1000);
    var maxLng = addKmToLng(place.geometry.location.lng(), place.geometry.location.lat(), raio / 1000);

    snapshot.forEach(function (child) {
        var post = child.val();
        if (estaInclusoNaPesquisa(post, ti, tf, minLat, maxLat, minLng, maxLng)) {
            post.id = child.key;
            posts.push(post);
        }
    });
    return posts;
}

function estaInclusoNaPesquisa(post, ti, tf, minLat, maxLat, minLng, maxLng) {
    var data = new Date(post.dataDoRoubo);
    var t = data.getTime();
    if (t < ti || t > tf)
        return false;
    if (post.posicao.lat < minLat || post.posicao.lat > maxLat)
        return false;
    if (post.posicao.lng < minLng && post.posicao.lng > maxLng)
        return false;
    return true;
}

function addKmToLat(lat, km) {
    return lat + (km / 6378) * (180 / Math.PI);
}

function addKmToLng(lng, lat, km) {
    return lng + (km / 6378) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
}

function updateRaio() {
    $("#value-raio").html($("#myRange").val() + " metros");
}

function carregarTimeLine() {
    document.getElementById("list_posts").innerHTML = "";
    buscarPosts(5, function (snapshot) {
        if (!snapshot.val()) {
            msgNenhumPostEncontrado();
        } else {
            var keys = [];
            var posts = [];
            var i = 0;
            snapshot.forEach(function (child) {
                keys[i] = child.key;
                posts[i] = child.val();
                i++
            });
            for (var j = i - 1; j > -1; j--) {
                post(keys[j], posts[j]);
            }
            scrollTop();
        }
    });
}

function msgNenhumPostEncontrado() {

    var msg = document.createElement("div");
    msg.className = "empty-time-line";
    msg.innerHTML = "Nenhum post encontrado     ";

    var listagem = document.getElementById("list_posts");
    listagem.appendChild(msg);
}

function post(id, post) {
    var row = document.createElement("div");
    row.className="row";
    var divPost = document.createElement("div");
    divPost.className = "col-xs-12 col-sm-8 col-sm-offset-4 col-md-6 col-md-offset-4 col-lg-6 col-lg-offset-3 post";
    divPost.id = id;
    divPost.appendChild(criarHeader(post));
    divPost.appendChild(criarFooter(post));
    divPost.appendChild(criarBody(post));
    divPost.appendChild(criarComentario());
    row.appendChild(divPost);
    document.getElementById("list_posts").appendChild(row);
}

function criarHeader(post) {
    var headerPost = document.createElement("div");
    headerPost.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12 header-post";

    var endereco = document.createElement("div");
    endereco.className = "col-xs-8 col-sm-8 col-md-8 col-lg-8 endereco-header-post";
    endereco.innerHTML = post.posicao.endereco;

    var data = document.createElement("div");
    data.innerHTML = formatDate(new Date(post.dataDoRoubo));
    data.className = "col-xs-4 col-sm-4 col-md-4 col-lg-4 data-header-post";

    headerPost.appendChild(endereco);
    headerPost.appendChild(data);

    return headerPost;
}

function formatDate(data) {
    var dataFormatada = "" + data.getHours() + "h" + data.getMinutes() + " ";
    var day = "" + data.getDate();
    var month = "" + (data.getMonth() + 1);
    if (day.length == 1) {
        dataFormatada += "0" + day;
    } else {
        dataFormatada += day;
    }
    dataFormatada += "/";
    if (month.length == 1) {
        dataFormatada += "0" + month;
    } else {
        dataFormatada += month;
    }
    dataFormatada += "/" + data.getFullYear();
    return dataFormatada;
}

function criarBody(post) {

    var bodyPost = document.createElement("div");
    bodyPost.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12 body-post";

    var photos = document.createElement("div");
    photos.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12 photos-post";

    var mainPhoto = createContainerPhoto(45, "col-xs-6 col-sm-6 col-md-6 col-lg-6 main-photo-post", post.posicao);

    var auxPhotos = document.createElement("div");
    auxPhotos.className = "col-xs-6 col-sm-6 col-md-6 col-lg-6 aux-photo-post";

    var auxPhoto1 = createContainerPhoto(90, "col-xs-6 col-sm-6 col-md-6 col-lg-6 photo-post", post.posicao);
    var auxPhoto2 = createContainerPhoto(135, "col-xs-6 col-sm-6 col-md-6 col-lg-6 photo-post", post.posicao);

    photos.appendChild(mainPhoto);
    auxPhotos.appendChild(auxPhoto1);
    auxPhotos.appendChild(auxPhoto2);
    photos.appendChild(auxPhotos);
    bodyPost.appendChild(photos);

    return bodyPost;
}

function createContainerPhoto(heading, classeDiv, posicao) {
    var containerPhoto = document.createElement("div");
    containerPhoto.className = classeDiv;
    var img = document.createElement("img");
    img.setAttribute("src", getUrlPhoto(heading, posicao.lat, posicao.lng));
    img.addEventListener('click', function () {
        showPictureFull(this);
    });
    img.className = "img-post";
    containerPhoto.appendChild(img);
    return containerPhoto;
}

function criarComentario() {
    var comentarioPost = document.createElement("div");
    comentarioPost.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12 comentario-post";
    var a = document.createElement("a");
    var icon = document.createElement("span");
    icon.className = "glyphicon glyphicon-comment";
    a.appendChild(icon);
    var descricao = document.createElement("span");
    descricao.innerHTML = " Comentar";
    icon.appendChild(descricao);
    comentarioPost.appendChild(a);
    return comentarioPost;
}

function criarFooter(post) {
    var footerPost = document.createElement("div");
    footerPost.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12 footer-post";
    var content = document.createElement("div");
    content.innerHTML = post.descricao;
    content.className = "col-xs-12 col-sm-12 col-md-12 col-lg-12";
    footerPost.appendChild(content);
    return footerPost;
}

//=========> funcoes do Mapa de Calor <==================
// =======> Renderizador do mapa de calor <====================
function renderRoutes(snapshot) {
    if (polylines) {
        for (i = polylines.length - 1; i > -1; i--) {
            polylines[i].setMap(null);
        }
    }
    polylines = [];

    snapshot.forEach(function (childSnapshot) {
        var r = childSnapshot.val();
        // usa a funçao sigmoid para determinar se esta tendendo para vermelho ou para amarelo.
        var n = 1 / (1 + Math.pow(Math.E, -1 * r.periculosidade));
        // aplica uma regra de tres para converter em decimal e depois para hexadecimal.
        var hex = Math.round(255 * n).toString(16);
        // cria a cor.
        var color = "#FF" + hex + "00";
        var polyline = new google.maps.Polyline({
            path: google.maps.geometry.encoding.decodePath(r.overViewPolyline),
            map: map,
            strokeColor: color,
            strokeOpacity: 0.5,
            strokeWeight: 6
        });
        polylines.push(polyline);
    });
}

// =======> Calculador de rotas de periculosidade <==============
function updateRotaDePericulosidade(c) {
    extrairRuaDaPosicao(c, buscarTodasRotasNaRua);
}

function extrairRuaDaPosicao(position, callback) {
    var geocoder = new google.maps.Geocoder;
    var infowindow = new google.maps.InfoWindow;
    geocoder.geocode({
        'location': position
    }, function (results, status) {
        if (status === 'OK') {
            var rua = results[0].address_components[1].short_name;
            position.rua = rua;
            callback(position);
        }
    });
}

function calcNovaRota(snapshot, c) {
    var rotas1 = [];
    var rotas2 = [];
    var pos = {
        lat: c.lat,
        lng: c.lng
    };

    // seleciona todas as rotas que o ponto c nao esta contido.
    snapshot.forEach(function (childSnapshot) {
        var r = childSnapshot.val();
        r.id = childSnapshot.key;
        if (r.posicao_a.lat < pos.lat || r.posicao_b.lat > pos.lat) {
            rotas1.push(r);
        } else {
            rotas2.push(r);
        }
    });

    // define os novos pontos a e b de cada rota.
    var updates = selectRotasParaAtualizar(rotas1, pos);


    if (updates.length == 0) {
        var r;
        if (rotas2.length > 0) {
            r = rotas2[0];
        } else {
            r = {
                id: 0,
                posicao_a: pos,
                posicao_b: pos,
                periculosidade: 7,
                rua: c.rua
            };
        }
        updates.push(r);
    }
    updatePolylines(updates);
}

function selectRotasParaAtualizar(rotas, pos) {
    var updates = [];
    for (var i = 0; i < rotas.length; i++) {
        var r = rotas[i];
        var dac = calcDistancia(r.posicao_a, pos);
        var dbc = calcDistancia(r.posicao_b, pos);

        if (dac <= MIN_DIST_POINTS && ((dac == dbc && r.posicao_a.lat < pos.lat) || (dac < dbc))) {
            r.posicao_a = pos
            updates.push(r);
        } else if (dbc <= MIN_DIST_POINTS && ((dac == dbc && r.posicao_a.lat > pos.lat) || (dac >= dbc))) {
            r.posicao_b = pos;
            updates.push(r);
        }
    }
    return updates;
}

function updatePolylines(rotas) {
    for (var i = 0; i < rotas.length; i++) {
        var r = rotas[i];

        var origin = new google.maps.LatLng(r.posicao_a.lat, r.posicao_a.lng);
        var destination = new google.maps.LatLng(r.posicao_b.lat, r.posicao_b.lng);
        var request = {
            origin: origin,
            destination: destination,
            travelMode: 'WALKING'
        };
        directionsService.route(request, function (results, status) {
            if (status == "OK") {
                r.overViewPolyline = results.routes[0].overview_polyline;
                var d = results.routes[0].legs[0].distance.value;
                if (d > 0) {
                    r.periculosidade = (r.periculosidade - 1) * d * 0.005;
                }
                saveRota(r, function () {
                    if (r.id == rotas[rotas.length - 1].id) {
                        unificaRotas(rotas);
                        loadRotas(map.getZoom(), renderRoutes);
                    }
                })
            }
        });
    }
}

function unificaRotas(rotas) {
    var i = 0;
    var j;
    var merged = false;
    while (i < rotas.length - 1 && !merged) {
        var r1 = rotas[i];
        var a1 = r1.posicao_a;
        var b1 = r1.posicao_b;
        j = i + 1;
        while (j < rotas.length && !merged) {
            var r2 = rotas[j];
            var a2 = r2.posicao_a;
            var b2 = r2.posicao_b;
            if (a1.lat == b2.lat && a1.lng == b2.lng || calcDistancia(b2, a1) <= MIN_DIST_POINTS) {
                mergeRoutes(r2, r1, a2, b1);
                merged = true;
            } else if (b1.lat == a2.lat && b1.lng == a2.lng || calcDistancia(b1, a2) <= MIN_DIST_POINTS) {
                mergeRoutes(r1, r2, a1, b2);
                merged = true;
            }
            j++;
        }
        i++;
    }
}

function mergeRoutes(r1, r2, a, b) {
    r1.posicao_a = a;
    r1.posicao_b = b;
    r1.periculosidade = (r1.periculosidade + r2.periculosidade) / 2;
    updatePolylines([r1]);
    removeRota(r2.id);
}

function calcDistancia(a, b) {
    return Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2));
}

//=========> metodos Rota de Fuga <==================
function rotaDeFuga() {
    timeRotaDeFuga = new Date().getMilliseconds();
    posicaoAtual();
    nearbyPolices();
}

function nearbyPolices() {
    var request = {
        location: ultimaPosicaoConhecida,
        type: "police",
        rankBy: google.maps.places.RankBy.DISTANCE
    }
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var destino = new google.maps.LatLng(results[0].geometry.location.lat(),
                results[0].geometry.location.lng());
            criarRota(ultimaPosicaoConhecida, destino);
        }
    });
}

function criarRota(origem, destino) {
    var request = {
        origin: origem,
        destination: destino,
        travelMode: 'WALKING'
    };
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(result);
            var o = result.routes[0].legs[0].start_location;
            createMarker({
                lat: o.lat(),
                lng: o.lng()
            }, map, "images/point-icon.svg");
            var d = result.routes[0].legs[0].end_location;
            createMarker({
                lat: d.lat(),
                lng: d.lng()
            }, map, "images/police-icon.svg");
            var time = new Date().getMilliseconds() - timeRotaDeFuga;
            if (time < 700) {
                setTimeout(closeModal, 2000 - time);
            } else {
                closeModal();
            }
        } else {
            alert('Desculpe, nao foi possivel desenhar a Rota merda!!');
        }
    });
}

//=========> funcoes auxiliares <==================

function geocodingReverse(position, callback) {
    var geocoder = new google.maps.Geocoder;
    var infowindow = new google.maps.InfoWindow;
    geocoder.geocode({
        'location': position
    }, callback);
}

function closeModal() {
    $("#myModal").modal("hide");
}

function createMarker(position, map, icon) {
    var markerDestino = new google.maps.Marker({
        position: position,
        map: map,
        icon: icon
    });
}

function posicaoAtual() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            ultimaPosicaoConhecida = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(ultimaPosicaoConhecida);
        }, function () {
            handleLocationError(true, map);
        });
    } else {
        handleLocationError(false, map);
    }
}

function handleLocationError(browserHasGeolocation, map) {
    var infoWindow = new google.maps.InfoWindow({
        map: map
    });
    infoWindow.setPosition(map.getCenter());
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}

function scrollTop() {
    $("html, body").animate({
        scrollTop: 0
    }, "slow");
}

function showMsg(type, conteudo, titulo) {
    var msg = document.getElementById("top-msg");
    var close = document.createElement("a");
    var title = document.createElement("strong");
    var content = document.createElement("span");

    msg = document.createElement("div");
    msg.className = "alert alert-" + type + " alert-dismissable fade in small-font";

    close.href = "#";
    close.className = "close";
    close.setAttribute("data-dismiss", "alert");
    close.setAttribute("aria-label", "close");
    close.innerHTML = "&times;";

    title.innerHTML = titulo;
    content.innerHTML = conteudo;

    msg.appendChild(close);
    msg.appendChild(title);
    msg.appendChild(content);

    var containerMsg = document.getElementById("msg-space");
    containerMsg.innerHTML = "";
    containerMsg.appendChild(msg);
}

function showPictureFull(img) {
    var modalBody = $("#modalFullPicture div.modal-body");
    modalBody.html("");
    var clone = img.cloneNode(true);
    clone.className = "img-full";
    modalBody.append(clone);
    $("#modalFullPicture").modal("show");
}

function getUrlPhoto(heading, latitude, longitude) {
    var url = "https://maps.googleapis.com/maps/api/streetview?size=600x300";
    url = url + "&location=" + latitude + ",%20" + longitude;
    url = url + "&heading=" + heading;
    url = url + "&key=AIzaSyAd4OjL_svF-V6cM5JALyM5uNubQRRZPmk";
    return url;
}
