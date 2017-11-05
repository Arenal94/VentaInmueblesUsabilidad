var marker;
function myMap() {
    var mapProp= {
        center:new google.maps.LatLng(40.416775,-3.703790),
        zoom:5,
    };
    var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
    var geocoder = new google.maps.Geocoder;

    google.maps.event.addListener(map, "dblclick", function(event) {
        if(marker!=undefined){
            marker.setMap(null)
        }
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
            map: map,
            title: 'Ubicación de la vivienda'
        });
        geocodeLatLng(geocoder, map)
    });

}
function geocodeLatLng(geocoder, map) {
    geocoder.geocode({'location': marker.position}, function(results, status) {
        if (status === 'OK') {
            if (results[1]) {
                $("#lat").val(marker.getPosition().lat());
                $("#lng").val(marker.getPosition().lng());
                $("#ubicacion").val(results[1].formatted_address);
            } else {
                window.alert('No results found');
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}