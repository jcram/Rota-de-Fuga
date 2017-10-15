/*
  Esta função procura os postos policiais mais perto da posição atual.
  Alguns atributos necessários para a pesquisa:
    'type' igual a 'police'
    'rankBy' igual a 'distancia'
  retorne um objeto posicao que contem a latitude e longitude do posto policial mais proximo.
  Verifique o link abaixo para mais informações:
  https://developers.google.com/maps/documentation/javascript/places?hl=pt-br#place_search_requests

  Obs: a variavel pos é um objeto com os atributos longitude e latitude.
  Para acessar esses atributos basta fazer pos.latitude ou pos.longitude, caso necessário.
*/
var police;

function nearbyPolices(pos) {
    var position = new google.maps.LatLng(pos.latitude, pos.longitude);
    var request = {
        location: position,
        type: "police",
        rankBy: google.maps.places.RankBy.DISTANCE
    }
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) { 
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        police = {latitude: results[0].geometry.location.lat(), longitude: results[0].geometry.location.lng()};
    }
}
