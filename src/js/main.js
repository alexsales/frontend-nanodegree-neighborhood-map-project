function Map(position) {
	var self = this;
	
	self.lat = ko.observable(position.coords.latitude);
	self.lng = ko.observable(position.coords.longitude);
	self.mapCenter = ko.observable(new google.maps.LatLng(self.lat(), self.lng())); 
	self.mapOptions = ko.observable({
		center: self.mapCenter(),
		zoom: 13,
		zoomControl: false,
		mapTypeControl: false,
		streetViewControl: false
	});
}

function MapViewModel() {
	//-- DATA --//
	var self = this;

	self.markersArray = ko.observableArray();
	self.markerNamesArray = ko.observableArray();

	//-- BEHAVIOR --//
	self.noGeoLoc = function() {
    	console.log('no geolocation');
	};

   	self.renderMapAndUser = function(pos) {
    	var mapObj = new Map(pos);
		var infoWindow = new google.maps.InfoWindow();

    	var drawMap = function(_mapObj, _drawUserMarker, _drawGooglePlaces) {	
    		var mapDrawn = new google.maps.Map(document.getElementById('map-canvas'), _mapObj.mapOptions());

    		_drawUserMarker(mapDrawn);
    		_drawGooglePlaces(mapDrawn);
    	};

    	var drawUserMarker = function(_mapDrawn) {
    		console.log('rendering user position');
		    
		    var map = _mapDrawn;

		    var userMarker = new google.maps.Marker({
		    	position: mapObj.mapCenter(),
		    	map: map,
		    	title: 'You are here!'
		    });

		    google.maps.event.addListener(userMarker, 'click', function() {
				infoWindow.setContent('You are here');
				infoWindow.open(map, this);
			});
    	};

    	var drawGooglePlaces = function(_mapDrawn) {
    		console.log('rendering Google Places');

    		var service = new google.maps.places.PlacesService(_mapDrawn);		
			var request = {
				location: mapObj.mapCenter(),
				radius: '6200',
				types: ['art_gallery', 'book_store', 'cafe', 'museum']
			};	

			var createMarker = function(placeObj) {
				var placeLocation = placeObj.geometry.location;
				var map = _mapDrawn;
				var marker = new google.maps.Marker({
					position: placeLocation,
					map: map,
					title: placeObj.name
				});

				self.markersArray.push(placeObj);
				self.markerNamesArray.push(placeObj.name);

				google.maps.event.addListener(marker, 'click', function() {
					infoWindow.setContent(placeObj.name);
					infoWindow.open(map, this);
				});
			};

			var callback = function(results, status) {
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					for (var i = 0; i < results.length; i++) {
						createMarker(results[i]);
						// createNewPlaceObj(results[i]);
					}
					// renderFlickr(placeNameArray);
				}
			};

		    service.nearbySearch(request, callback);
    	};

    	drawMap(mapObj, drawUserMarker, drawGooglePlaces);
    };

	// Check if geolocation is enabled in user's browser
	self.initialize = function() {
	    if (navigator.geolocation) {
	        // Send getCurrentPosition server response to success callback
	        navigator.geolocation.getCurrentPosition(self.renderMapAndUser);
	    } else {
	        self.noGeoLoc();
	    }
	};

	google.maps.event.addDomListener(window, 'load', self.initialize);
}

ko.applyBindings(new MapViewModel);
