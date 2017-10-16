/*
  Inicialização do mapa. O mapa deve inicializar proximo à posição atual do usuário.
  Para tanto, será necessário chamar a função posicaoAtual e usar o retorno da função
  para colocar o ponto no mapa. Verifique o link abaixo para mais informações:
  https://developers.google.com/maps/documentation/javascript/adding-a-google-map?hl=pt-br
*/
var map;
var directionsDisplay;
var directionsService;

function initMap() {

    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    // insira seu codigo abaixo.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -34.397,
            lng: 150.644
        },
        zoom: 17
    });
    posicaoAtual();
    // nao remova a linha abaixo.
    directionsDisplay.setMap(map);
}

function rotaDeFuga() {
    posicaoAtual();
    nearbyPolices();
}

function nearbyPolices() {
    var center = map.getCenter();
    var origem = new google.maps.LatLng(center.lat(), center.lng());
    var request = {
        location: origem,
        type: "police",
        rankBy: google.maps.places.RankBy.DISTANCE
    }
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var destino = new google.maps.LatLng(results[0].geometry.location.lat(),
                results[0].geometry.location.lng());
            criarRota(origem, destino);
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
        } else {
            alert('Desculpe, nao foi possivel desenhar a Rota');
        }
    });
}

function posicaoAtual() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            map.setCenter({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
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
