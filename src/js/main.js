var Map = function (lat, lng) {
	this.lat = ko.observable(lat);
	this.lng = ko.observable(lng);
	this.mapCenter = ko.observable(new google.maps.LatLng(this.lat(), this.lng())); 
	this.mapOptions = ko.observable({
		center: this.mapCenter(),
		zoom: 13,
		zoomControl: false,
		mapTypeControl: false,
		streetViewControl: false
	});
};

var MapViewModel = function() {
	//-- DATA --//
	var self = this;

	self.city = ko.observable('');
	self.pos = ko.observable();
	self.lat = ko.observable();
	self.lng = ko.observable();
	self.mapObj = ko.observable();
	self.mapDrawn = ko.observable();

	//-- BEHAVIOR --//
	// geocodes address and renders map of user's inputted city
	self.geocodeCity = function(d, evt) {
		console.log('new city');
		console.log(self.city());

		var addressToArray = self.city().split(' ')
		var addressToString = addressToArray.join('+');
		var serverBasedAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + addressToString + '&key=AIzaSyB4mgEnfU7A2ngaDKEJBbsIs7qLxT7ULCg';

		var userEnteredLat = 0;
		var userEnteredLng = 0;
	    var userCenter = {};
	    var mapOptions = {};
	    var map = {};

		$.getJSON(serverBasedAPI, function(data) {
		    if (data.status == 'ZERO_RESULTS') {
		    	//console.log('Enter a valid address');
		    	self.initialize();
		    } else {
				console.log(data);

	    		userEnteredLat = data.results[0].geometry.location.lat;
	    		userEnteredLng = data.results[0].geometry.location.lng;
			    userCenter = new google.maps.LatLng(userEnteredLat, userEnteredLng);
			    mapOptions = {
					center: userCenter,
					zoom: 13,
					zoomControl: false,
					mapTypeControl: false,
					streetViewControl: false
			    };
			    map = new google.maps.Map(document.getElementById('map-canvas'),
			        mapOptions);
			    // var userMarker = new google.maps.Marker({
			    // 	position: userCenter2,
			    // 	map: map2,
			    // 	title: 'You are here!'
			    // });

			    // renderMarkers(userCenter2, map2);
	    		// // console.log('userEnteredLoc ' + userEnteredLoc);
		    }
    	}).fail(function() {
    		console.log('Check your internet connection');
    	});
	};

	// initializes knockout properties, renders map
	self.initialize = ko.computed(function () {
		if (navigator.geolocation) {
	    	var success = function (pos) {
	    		self.pos(pos.coords);
	    		self.lat(pos.coords.latitude);
	    		self.lng(pos.coords.longitude);
	    		self.mapObj(new Map(self.lat(), self.lng()));
	    		self.mapDrawn(new google.maps.Map(document.getElementById('map-canvas'), self.mapObj().mapOptions()));
	    	};

	        navigator.geolocation.getCurrentPosition(success);
	    } else {
	        noGeoLoc();
	    }
	});








  //  	self.renderMapAndUser = function(pos) {
  //   	var mapObj = new Map(pos);
		// var infoWindow = new google.maps.InfoWindow();

  //   	var drawMap = function(_mapObj, _drawUserMarker, _drawGooglePlaces) {	
  //   		var mapDrawn = new google.maps.Map(document.getElementById('map-canvas'), _mapObj.mapOptions());

  //   		_drawUserMarker(mapDrawn);
  //   		_drawGooglePlaces(mapDrawn);
  //   	};

  //   	var drawUserMarker = function(_mapDrawn) {
  //   		console.log('rendering user position');
		    
		//     var map = _mapDrawn;

		//     var userMarker = new google.maps.Marker({
		//     	position: mapObj.mapCenter(),
		//     	map: map,
		//     	title: 'You are here!'
		//     });

		//     google.maps.event.addListener(userMarker, 'click', function() {
		// 		infoWindow.setContent('You are here');
		// 		infoWindow.open(map, this);
		// 	});
  //   	};

  //   	var drawGooglePlaces = function(_mapDrawn) {
  //   		console.log('rendering Google Places');

  //   		var service = new google.maps.places.PlacesService(_mapDrawn);		
		// 	var request = {
		// 		location: mapObj.mapCenter(),
		// 		radius: '6200',
		// 		types: ['art_gallery', 'book_store', 'cafe', 'museum']
		// 	};	

		// 	var createMarker = function(placeObj) {
		// 		var placeLocation = placeObj.geometry.location;
		// 		var map = _mapDrawn;
		// 		var marker = new google.maps.Marker({
		// 			position: placeLocation,
		// 			map: map,
		// 			title: placeObj.name
		// 		});

		// 		self.markersArray.push(placeObj);
		// 		self.markerNamesArray.push(placeObj.name);

		// 		google.maps.event.addListener(marker, 'click', function() {
		// 			infoWindow.setContent(placeObj.name);
		// 			infoWindow.open(map, this);
		// 		});
		// 	};

		// 	var callback = function(results, status) {
		// 		if (status == google.maps.places.PlacesServiceStatus.OK) {
		// 			for (var i = 0; i < results.length; i++) {
		// 				createMarker(results[i]);
		// 				// createNewPlaceObj(results[i]);
		// 			}
		// 			// renderFlickr(placeNameArray);
		// 		}
		// 	};

		//     service.nearbySearch(request, callback);
  //   	};

  //   	drawMap(mapObj, drawUserMarker, drawGooglePlaces);
  //   };

	// Check if geolocation is enabled in user's browser
	// self.initialize = ko.computed(function() {
	//     if (navigator.geolocation) {
	//         // Send getCurrentPosition server response to success callback
	//         navigator.geolocation.getCurrentPosition(self.renderMapAndUser);
	//     } else {
	//         self.noGeoLoc();
	//     }
	// });

	// google.maps.event.addDomListener(window, 'load', self.initialize);
};

ko.applyBindings(new MapViewModel());
