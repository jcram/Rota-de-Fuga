/*
  Inicialização do mapa. O mapa deve inicializar proximo à posição atual do usuário.
  Para tanto, será necessário chamar a função posicaoAtual e usar o retorno da função
  para colocar o ponto no mapa. Verifique o link abaixo para mais informações:
  https://developers.google.com/maps/documentation/javascript/adding-a-google-map?hl=pt-br
*/
var map;
var directionsDisplay;
var directionsService;
var ultimaPosicaoConhecida;
var timeRotaDeFuga;

function initMap() {

    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });
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
            }else{
                closeModal();
            }
        } else {
            alert('Desculpe, nao foi possivel desenhar a Rota');
        }
    });
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
            ultimaPosicaoConhecida = new google.maps.LatLng(,-43.9369648);
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
