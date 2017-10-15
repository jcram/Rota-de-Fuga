/*
  Esta função deve determinar a rota da origem até o ponto de destino
  e desenha-la no mapa.Verifique o link abaixo para mais informações:
  https://developers.google.com/maps/documentation/javascript/directions?hl=pt-br#DirectionsRequests

  Obs: as variaveis origem e destino são objetos com os atributos longitude e latitude.
  Para acessar esses atributos basta fazer origem.longitude ou origem.latitude.
*/
function criarRota(origem, destino) {
    var start = new google.maps.LatLng(origem.latitude, origem.longitude);
    var end = new google.maps.LatLng(destino.latitude, destino.longitude);

    var request = {
        origin: start,
        destination: end,
        travelMode: 'WALKING'
    };
    directionsService.route(request, function (result, status) {
        if (status == 'OK') { directionsDisplay.setDirections(result);
        }else{
            alert('Desculpe, nao foi possivel desenhar a Rota');
        }
    });
}
