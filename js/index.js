var map;
var center; 
var url = "https://spreadsheets.google.com/feeds/list/1eIxoc4h6B2nTdDAitHkviJH5rtH-MNyBaEUS7zHmKk0/od6/public/values?alt=json";
var data = []; 
var gc;
var markers = new Array();
var normalPinURL = "http://dailybruin.com/images/2015/05/pin.png";
var highlightedPinURL = "http://dailybruin.com/images/2015/05/highlighted-pin.png";
var currentIndex = 9; 
var highlightedPin = null;

// google.maps.event.addDomListener(window, 'load', initialize);


function initialize() {
  gc = new google.maps.Geocoder;
  gc.geocode( { 'address' : 'University of California, Los Angeles, CA' }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      center = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());

      map = new google.maps.Map(document.getElementById('content-map'), {
        streetViewControl: false, // hide the yellow Street View pegman
        scaleControl: false, // allow users to zoom the Google Map
        panControl: false,
        navigationControl: false,
        mapTypeControl: false,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: center,
        zoom: 9
      });

      populateMap(); 
    }
  })

  // var test = new google.maps.LatLng(34.0113485, -117.8864209000000);
  // var marker = new google.maps.Marker({
  //   position: test,
  //   title: "0"
  // });

  // marker.setMap(map);

}

var populateMap = function() {
  $.getJSON(url, function(json){
    data = format(json); 

    var bubbles = []; 

    $.each(data, function (index, value){
      var loc; 

      // var bubble = '<a><span class="content-bubble" id="' + index + '">' + index + '</span></a>';
      // // bubbles.push(bubble);
      // $(bubble).click(function() {
      //   console.log('clicked!')
      // })

      var bubble = document.createElement("BUTTON");        
      var t = document.createTextNode(index + 1);      
      bubble.className = "content-bubble";
      bubble.id = index; 
      bubble.appendChild(t);
      $(bubble).click(function() {
        clickMarker(bubble.id);
      })

      $('#content-nav').append(bubble);

      gc.geocode( { 'address' : data[index].address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          loc = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
        }

        markers[markers.length] = new google.maps.Marker({
          position: loc,
          map: map,
          draggable: false,
          // title: "0",
          animation: google.maps.Animation.DROP,
          icon: normalPinURL
        });

        var markerIndex = markers.length-1;
        google.maps.event.addListener(markers[markerIndex], 'click', function() {
          clickMarker(markerIndex);
        });
      });
    });

    // $('#content-nav > li').sortElements(function(a, b){
    //     return $(a).find('.name').text() > $(b).find('.name').text() ? 1 : -1;
    // });
  }); 



}

function clickMarker(i) {
  // refresh the box
  panToIndex(i);
  $('#flex-place').html(data[i].cafe);
  $('#flex-address').html(data[i].address);
}

function panToIndex(i) {
  m = markers[i];
  if(!m)
    return;
  currentIndex = i;
  if(highlightedPin)
    highlightedPin.setIcon(normalPinURL);
  m.setIcon(highlightedPinURL);
  highlightedPin = m;
  map.panTo(m.position);
}

function format(data){
  var result = [];
  var elem = {};
  var real_keyname = '';
  $.each(data.feed.entry.reverse(), function(i, entry) {
    elem = {};
    $.each(entry, function(key, value){

      // fields that were in the spreadsheet start with gsx$
      if (key.indexOf("gsx$") == 0)
      {
        // get everything after gsx$
        formattedKey = key.substring(4);
        elem[formattedKey] = value['$t'];
      }
    });
    result.push(elem);
  });
  return result;
}
