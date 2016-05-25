var geocoder = new google.maps.Geocoder();
var markers = [];
var map;

$(document).ready(function() {
  setupMap();

  function setupMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 51.498848, lng: -0.281128 },
      zoom: 16
    });
  }

  function codeAddress() {
    var sAddress = $('#address').val();
    geocoder.geocode( { 'address': sAddress }, function(data, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(data[0].geometry.location);
        createMarker(sAddress);
      } else {
        alert("Geocode failed for the following reason: " + status);
      }
      $('#address').val('');
      if (markers.length === 2) {
        getBars();
      }
    });
  }

  function createMarker(title) {
    var marker = new google.maps.Marker({
      position: map.center,
      map: map,
      title: title
    });
    markers.push(marker);
  }

  function makeRequest() {
    var url = 'https://api.foursquare.com/v2/venues/explore?';
    var id = 'client_id=1U2GGP2JKZLANWGM4PDRLSTVK5LJQWKKVGW4QZUXM4A4AS41&';
    var secret = 'client_secret=J20YY325QXD0RCFOKVTJQEHUICM15TDXJ2M55RGC23FG4PDJ&';
    var section = 'section=drinks&';
    var limit = 'limit=5';
    var midpoint = google.maps.geometry.spherical.interpolate(markers[0].position, markers[1].position, 0.5);
    var ll = 'll=' + midpoint.lat() + ',' + midpoint.lng() + '&';
    var request = url + id + secret + ll + section + limit + '&v=20140806' + '&m=foursquare';
    return request;
  }

  function getBars() {
    $.get(makeRequest(), function(data) {
      var bars = data.response.groups[0].items;
      var firstBar = bars[0].venue;
      map.setCenter(new google.maps.LatLng(firstBar.location.lat, firstBar.location.lng));
      createMarker(firstBar.name);
    });
  }

  $('#address').change(function() {
    codeAddress();
  });

  $('.submit').click(function() {
    getBars();
  });
});
