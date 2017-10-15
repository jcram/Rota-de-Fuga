var police;

function rotaDeFuga() {
    var pos = posicaoAtual();
    nearbyPolices(pos);
}

function nearbyPolices(pos) {
    var position = new google.maps.LatLng(pos.latitude, pos.longitude);
    var request = {
        location: position,
        type: "police",
        rankBy: google.maps.places.RankBy.DISTANCE
    }
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            criarRota(pos, {
                latitude: results[0].geometry.location.lat(),
                longitude: results[0].geometry.location.lng()
            });
        }
    });
}

function criarRota(origem, destino) {
    var start = new google.maps.LatLng(origem.latitude, origem.longitude);
    var end = new google.maps.LatLng(destino.latitude, destino.longitude);

    var request = {
        origin: start,
        destination: end,
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
