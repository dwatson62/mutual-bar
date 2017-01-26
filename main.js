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
    google.maps.event.addDomListener(window, 'load', setupAutoComplete);
  }

  function setupAutoComplete() {
    new google.maps.places.Autocomplete($('#address')[0]);
  }

  function codeAddress() {
    var sAddress = $('#address').val();
    geocoder.geocode( { 'address': sAddress }, function(data, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(data[0].geometry.location);
        createMarker(sAddress);
        displayLocation(sAddress);
      } else {
        alert("Geocode failed for the following reason: " + status);
      }
      $('#address').val('');
      if (markers.length === 2) {
        $('.submit').attr('disabled', true);
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
    var radius = 'radius=30000&';
    var limit = 'limit=5';
    var midpoint = google.maps.geometry.spherical.interpolate(markers[0].position, markers[1].position, 0.5);
    var ll = 'll=' + midpoint.lat() + ',' + midpoint.lng() + '&';
    var request = url + id + secret + ll + section + radius + limit + '&v=20140806' + '&m=foursquare';
    return request;
  }

  function getBars() {
    $.get(makeRequest(), function(data) {
      var bars = data.response.groups[0].items;
      if (bars.length) {
        var firstBar = bars[0];
        map.setCenter(new google.maps.LatLng(firstBar.venue.location.lat, firstBar.venue.location.lng));
        for (var i in bars) {
          createMarker(bars[i].name);
          displayBar(bars[i]);
        }
      } else {
        noResults();
      }
    });
  }

  function noResults() {
    $('.results').append("<p>No bars were found, please try again.</p>");
  }

  function displayBar(bar) {
    $('.results').append("<h4 class='bar-name'></h4>" +
                          "<p class='bar-description'></p>" +
                          "<p class='bar-address'></p>" +
                          "<p class='bar-tip italic'></p>");

    $('.bar-name:last').html(bar.venue.name);
    $('.bar-description:last').html(bar.reasons.items[0].summary);
    $('.bar-address:last').html(bar.venue.location.formattedAddress.join(', '));
    $('.bar-tip:last').html(bar.tips[0].text);
  }

  function displayLocation(address) {
    $('.locations').append("<p class='location-name'></p>");
    $('.location-name:last').html(address);
  }

  function resetAll() {
    markers = [];
    $('.locations').empty();
    $('.results').empty();
    $('.submit').attr('disabled', false);
    map.setCenter(new google.maps.LatLng(51.498848,-0.281128));
  }

  $('.submit').click(function() {
    codeAddress();
  });

  $('.reset').click(function() {
    resetAll();
  });
});
