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
	self.markersArray = ko.observableArray();
	self.markerNamesArray = ko.observableArray();  

	self.businessTypes = [
		{ type: 'art_gallery', plainName: 'art galleries' },
		{ type: 'book_store', plainName: 'book stores' },
		{ type: 'cafe', plainName: 'cafes' },
		{ type: 'museum', plainName: 'museums' }
	];

	self.selectedBusinessTypes = ko.observableArray([]);
	self.artGalleryArray = ko.observableArray([]);
	self.bookStoreArray = ko.observableArray([]);
	self.cafeArray = ko.observableArray([]);
	self.museumArray = ko.observableArray([]);

	self.service = ko.observable();
	self.infoWindow = ko.observable();
	self.request = ko.observable({});
	// self.mapMarkersArray = ko.observableArray([]);

	//-- BEHAVIOR --//
	// geocodes address and renders map of user's inputted city
	self.geocodeCity = function(d, evt) {
		console.log('new city');
		console.log(self.city());
		console.log(self.selectedBusinessTypes());

		self.addressToArray = ko.observable(self.city().split(' '));
		self.addressToString = ko.observable(self.addressToArray().join('+'));
		self.serverBasedAPI = ko.observable('https://maps.googleapis.com/maps/api/geocode/json?address=' + self.addressToString() + '&key=AIzaSyB4mgEnfU7A2ngaDKEJBbsIs7qLxT7ULCg');

		self.userEnteredLat = ko.observable();
		self.userEnteredLng = ko.observable();

		$.getJSON(self.serverBasedAPI(), function(data) {
			console.log(data);
			console.log(data.status);
		    if (data.status == 'ZERO_RESULTS' || self.city() == '') {
		    	alert('Enter a valid address');
		    	// self.initialize();
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

	// renders Google Maps marker for city's center (user's position)
	self.drawUserMarker = ko.computed(function() {
		self.userMarker = ko.observable();
		self.infoWindow = ko.observable();

		// check to see make sure map object has loaded before rendering userMarker
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

	// render markers for Google Places that match business types listed in API request,
	// initially set to ['art_gallery', 'book_store', 'cafe', 'museum']
	self.drawBusinessMarkers = ko.computed(function() {
		// check to see make sure map object has loaded before rendering markers
		if (Object.keys(self.map()).length != 0) {
			console.log('business markers rendering');

			self.service(new google.maps.places.PlacesService(self.mapDrawn()));
			self.request({
				location: self.mapCenter(),
				radius: '6200',
				types: self.selectedBusinessTypes()
			});

			var createMarker = function(results, status) {
				if (status == google.maps.places.PlacesServiceStatus.OK
					&& self.selectedBusinessTypes().length != 0) {

					// test: delete all markers here
					// console.log all current markers and map
					// then setup to clear all markers
					for (var i = 0; i < self.markersArray().length; i++) {
						self.markersArray()[i].setMap(null);
						self.markersArray([]);
					}
					console.log(self.markersArray());

					// for (var i = 0; i < self.mapMarkersArray().length; i++) {
					// 	self.mapMarkersArray[i].setMap(null);
					// }
					// self.mapMarkersArray([]);
					// console.log(self.mapMarkersArray());

					for (var i = 0; i < results.length; i++) {
						console.log(results.length);
						console.log(results[i]);
						console.log(self.markersArray());
						
						var bNamePlaceIdArray = [];

						self.marker = ko.observable(new google.maps.Marker({
					    	position: results[i].geometry.location,
					    	map: self.map(),
					    	placeId: results[i].place_id,
					    	title: results[i].name
					    }));

					    // self.mapMarkersArray.push(self.marker);

						bNamePlaceIdArray.push(results[i].name);
						bNamePlaceIdArray.push(results[i].place_id);

						// populate markersArray and markerNamesArray
						// self.markersArray.push(bNamePlaceIdArray);
						self.markersArray.push(self.marker());

		    		    google.maps.event.addListener(self.marker(), 'click', (function(sameString, sameMarker) {
		    		    	return function() {
		    		    		console.log(sameString);

								var infowindow = new google.maps.InfoWindow({
									content: sameString
								});		
								    		    		
			    		    	infowindow.open(self.map(), sameMarker);
		    		    	}
						})(bNamePlaceIdArray[0], self.marker()));

		    		    document.getElementById(bNamePlaceIdArray[1]).addEventListener('click', (function(sameId){
		    		    	return function() {
			    		    	console.log('found place id');
			    		    	console.log(sameId);
		    		    	}
		    		    })(bNamePlaceIdArray[1]));

		    		    // test: console.log markers array to make sure they exist, then delete below
		    		    // console.log(self.mapMarkersArray());

					}
				}
			};

			if (self.selectedBusinessTypes().length == 0) {
				console.log('empty array');
			} else {
				console.log('non-empty array');
				self.service().nearbySearch(self.request(), createMarker);
			}

		}
	});

	// initializes knockout properties, renders map
	self.initialize = ko.computed(function() {
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
};

ko.applyBindings(new MapViewModel());
