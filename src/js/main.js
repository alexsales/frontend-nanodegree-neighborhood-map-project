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
	self.mapCenter = ko.observable();
    self.mapOptions = ko.observable({});
    self.map = ko.observable({});

	//-- BEHAVIOR --//
	// geocodes address and renders map of user's inputted city
	self.geocodeCity = function(d, evt) {
		console.log('new city');
		console.log(self.city());

		self.addressToArray = ko.observable(self.city().split(' '));
		self.addressToString = ko.observable(self.addressToArray().join('+'));
		self.serverBasedAPI = ko.observable('https://maps.googleapis.com/maps/api/geocode/json?address=' + self.addressToString() + '&key=AIzaSyB4mgEnfU7A2ngaDKEJBbsIs7qLxT7ULCg');

		self.userEnteredLat = ko.observable();
		self.userEnteredLng = ko.observable();

		$.getJSON(self.serverBasedAPI(), function(data) {
		    if (data.status == 'ZERO_RESULTS') {
		    	//console.log('Enter a valid address');
		    	self.initialize();
		    } else {
				console.log(data);

	    		self.userEnteredLat(data.results[0].geometry.location.lat);
	    		self.userEnteredLng(data.results[0].geometry.location.lng);

			    self.mapCenter(new google.maps.LatLng(self.userEnteredLat(), self.userEnteredLng()));
			    self.mapOptions({
					center: self.mapCenter(),
					zoom: 13,
					zoomControl: false,
					mapTypeControl: false,
					streetViewControl: false
			    });
			    self.map(new google.maps.Map(document.getElementById('map-canvas'),
			        self.mapOptions()));
		    }
    	}).fail(function() {
    		console.log('Check your internet connection');
    	});
	};

	self.drawUserMarker = ko.computed(function() {
		self.userMarker = ko.observable();
		self.infoWindow = ko.observable();

		if (Object.keys(self.map()).length != 0) {
			console.log('rendering user position');
			console.log(self.mapCenter());
			console.log(self.map());

		    self.userMarker(new google.maps.Marker({
		    	position: self.mapCenter(),
		    	map: self.map(),
		    	title: 'You are here!'
		    }));

		    self.infoWindow(new google.maps.InfoWindow());

		    google.maps.event.addListener(self.userMarker(), 'click', function() {
				self.infoWindow().setContent('You are here');
				self.infoWindow().open(self.map(), this);
			});
		}
	});

	// initializes knockout properties, renders map
	self.initialize = ko.computed(function () {
		if (navigator.geolocation) {
	    	var success = function (pos) {
	    		self.pos(pos.coords);
	    		self.lat(pos.coords.latitude);
	    		self.lng(pos.coords.longitude);
	    		self.mapObj(new Map(self.lat(), self.lng()));
	    		self.mapDrawn(new google.maps.Map(document.getElementById('map-canvas'), self.mapObj().mapOptions()));
	    		self.mapCenter(new google.maps.LatLng(self.lat(), self.lng()));
	    		self.mapOptions({
					center: self.mapCenter(),
					zoom: 13,
					zoomControl: false,
					mapTypeControl: false,
					streetViewControl: false
			    });
			    self.map(new google.maps.Map(document.getElementById('map-canvas'),
			        self.mapOptions()));
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
