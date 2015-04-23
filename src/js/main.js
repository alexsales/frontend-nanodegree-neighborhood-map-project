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
	var infowindow = new google.maps.InfoWindow();
	var imageArtArray = [];
	var imageMuseumArray = [];
	var imageBookArray = [];
	var imageCafeArray = [];

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
		{ type: 'museum', plainName: 'museums' },
		{ type: 'book_store', plainName: 'book stores' },
		{ type: 'cafe', plainName: 'cafes' }

	];

	self.selectedBusinessTypes = ko.observableArray([]);
	self.artGalleryArray = ko.observableArray([]);
	self.bookStoreArray = ko.observableArray();
	self.cafeArray = ko.observableArray([]);
	self.museumArray = ko.observableArray([]);

	self.service = ko.observable();
	self.infoWindow = ko.observable();
	self.request = ko.observable({});

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

		clearArtGalleryMarkers();
		clearMuseumMarkers();
		clearBookStoreMarkers();
		clearCafeMarkers();

		$('#art_gallery').prop('checked', false);
		$('#museum').prop('checked', false);
		$('#book_store').prop('checked', false);
		$('#cafe').prop('checked', false);
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

	var createFlickrPlaces = function(googlePlace, index, style) {
		// console.log('Flickr:')
		console.log(googlePlace);

	    var placeName = googlePlace.name;
	    var placeLat = googlePlace.geometry.location.k;
	    var placeLon = googlePlace.geometry.location.D;
	    var placeUrlEncodedName = encodeURIComponent(placeName);
	   	var photoSrcUrl = '';
	   	var photoImageTag = '';

	    apiResponse = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=4c1c3a64fcef86837a9839120dcd9da9&text=' + placeUrlEncodedName + '&content_type=1&accuracy=13&tag_mode=all&min_upload_date=2014&media=photos&lat=' + placeLat + '&lon=' + placeLon + '&format=json&nojsoncallback=1';

	    // get random image and push to flickrImageArray
	    $.getJSON(apiResponse, function(data) {
	    	console.log(data);

	    	if (data.photos.total > 1) {
		    	console.log(data.photos.photo[1]);

		    	var farmId = data.photos.photo[1].farm;
		        var serverId = data.photos.photo[1].server;
		        var photoId = data.photos.photo[1].id;
		        var secret = data.photos.photo[1].secret;

				// photoSrcUrl = '2cool';	
		        photoSrcUrl = 'https://farm' + farmId + '.staticflickr.com/' + serverId + '/' + photoId + '_' + secret + '_n.jpg';
		        photoImageTag += '<img src=' + photoSrcUrl + ' />'
			}

			if (style == 'art gallery') {
				imageArtArray[index] = photoImageTag;
			} else if (style == 'museum') {
				imageMuseumArray[index] = photoImageTag;
			} else if (style == 'book store') {
				imageBookArray[index] = photoImageTag;
			} else {
				imageCafeArray[index] = photoImageTag;
			}
	    });
	};

	// art galleries
	var displayArtGalleryMarkers = function() {
		console.log('inside displayArts func');
		console.log(self.artGalleryArray());
		
		self.service(new google.maps.places.PlacesService(self.mapDrawn()));
		self.request({
			location: self.mapCenter(),
			radius: '6200',
			types: ['art_gallery']
		});

		function listArtGalleries() {
			var artGalleriesUl = $('#art-galleries');

			for (var i = 0; i < self.artGalleryArray().length; i++) {
				var idAttrVal = self.artGalleryArray()[i].placeId;
				var marker = self.artGalleryArray()[i];
				var businessName = self.artGalleryArray()[i].title;
				var listItem = '<li><a id="' + idAttrVal + '">' + businessName + '</a></li>';

				artGalleriesUl.append(listItem);

				document.getElementById(idAttrVal).addEventListener('click', (function(sameTitle, sameMarker, sameI) {	
	    		    	return function() {
	    		    		console.log(imageArtArray);
	    		    		console.log(sameI)

	    		    		infowindow.setContent(sameTitle + '<br />' + imageArtArray[sameI]);
		    		    	infowindow.open(self.map(), sameMarker);
		    		    	$('#business-list li a').css('color', 'inherit');
		    		    	$(this).css('color', '#EF0012');		    		    	
	    		    	}
					})(marker.title, marker, i)
				);
			}

			artGalleriesUl.css('display', 'normal');
		};

		function createMarkers(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					var idAttrVal = '';

					createFlickrPlaces(results[i], i, 'art gallery');
					console.log(results);
					console.log(results[i]);

					marker = new google.maps.Marker({
						position: results[i].geometry.location,
						map: self.map(),
						placeId: results[i].place_id,
						title: results[i].name
					});
					self.artGalleryArray.push(marker);	
					console.log(self.artGalleryArray());

					idAttrVal = self.artGalleryArray()[i].placeId;

	    		    google.maps.event.addListener(marker, 'click', (function(sameTitle, sameMarker, sameI, sameIdAttrVal) {	
	    		    	return function() {
	    		    		console.log(imageArtArray);
	    		    		console.log(sameI)

	    		    		infowindow.setContent(sameTitle + '<br />' + imageArtArray[sameI]);
		    		    	infowindow.open(self.map(), sameMarker);
		    		    	$('#business-list li a').css('color', 'inherit');
				    		    	$('#'+sameIdAttrVal).css('color', '#EF0012');  	
	    		    	}
					})(marker.title, marker, i, idAttrVal));	

				}
			}
			if (self.artGalleryArray().length != 0) {
				listArtGalleries();
			}
		};
		self.service().nearbySearch(self.request(), createMarkers);
	};

	var clearArtGalleryMarkers = function() {
		var artGalleriesUl = $('#art-galleries');

		for (var i = 0; i < self.artGalleryArray().length; i++) {
			self.artGalleryArray()[i].setMap(null);
		}

		artGalleriesUl.html('');
		self.artGalleryArray.removeAll();
	};

	$('#art_gallery').change(function() {
			if (this.checked) {
				console.log('this is checked');
				displayArtGalleryMarkers();
				$('#business-list').show();
			}
			if (!this.checked) {
				console.log('this NOT checked');
				clearArtGalleryMarkers();

				if ($('input:checked').length == 0) {
					$('#business-list').hide();				
				}
			}
	});

	// museums
	var displayMuseumMarkers = function() {
		console.log('inside displayMuseums func');
		console.log(self.museumArray());

		self.service(new google.maps.places.PlacesService(self.mapDrawn()));
		self.request({
			location: self.mapCenter(),
			radius: '6200',
			types: ['museum']
		});

		function listMuseums() {
			var museumsUl = $('#museums');

			for (var i = 0; i < self.museumArray().length; i++) {
				var idAttrVal = self.museumArray()[i].placeId;
				var marker = self.museumArray()[i];
				var businessName = self.museumArray()[i].title;
				var listItem = '<li><a id="' + idAttrVal + '">' + businessName + '</a></li>';			

				museumsUl.append(listItem);

				document.getElementById(idAttrVal).addEventListener('click', (function(sameTitle, sameMarker, sameI) {	
	    		    	return function() {
	    		    		console.log(imageMuseumArray);
	    		    		console.log(sameI)

	    		    		infowindow.setContent(sameTitle + '<br />' + imageMuseumArray[sameI]);
		    		    	infowindow.open(self.map(), sameMarker);
		    		    	$('#business-list li a').css('color', 'inherit');
		    		    	$(this).css('color', '#EF0012');		    		    	
	    		    	}
					})(marker.title, marker, i)
				);			
			}

			museumsUl.css('display', 'normal');				
		};

		function createMarkers(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					var idAttrVal = '';

					createFlickrPlaces(results[i], i, 'museum');
					console.log(results);
					console.log(results[i]);

					marker = new google.maps.Marker({
						position: results[i].geometry.location,
						map: self.map(),
						placeId: results[i].place_id,
						title: results[i].name
					});	
					self.museumArray.push(marker);	
					console.log(self.museumArray());

					idAttrVal = self.museumArray()[i].placeId;

	    		    google.maps.event.addListener(marker, 'click', (function(sameTitle, sameMarker, sameI, sameIdAttrVal) {	
	    		    	return function() {
	    		    		console.log(imageMuseumArray);
	    		    		console.log(sameI)

	    		    		infowindow.setContent(sameTitle + '<br />' + imageMuseumArray[sameI]);
		    		    	infowindow.open(self.map(), sameMarker);
		    		    	$('#business-list li a').css('color', 'inherit');
		    		    	$('#'+sameIdAttrVal).css('color', '#EF0012');    		    	
	    		    	}
					})(marker.title, marker, i, idAttrVal));	

				}
			}
			if (self.museumArray().length != 0) {
				listMuseums();
			}
		};
		self.service().nearbySearch(self.request(), createMarkers);
	};

	var clearMuseumMarkers = function() {
		var museumsUl = $('#museums');

		for (var i = 0; i < self.museumArray().length; i++) {
			self.museumArray()[i].setMap(null);
		}

		museumsUl.html('');
		self.museumArray.removeAll();
	};

	$('#museum').change(function() {
		if (this.checked) {
			console.log('this is checked');
			displayMuseumMarkers();
			$('#business-list').show();
		}
		if (!this.checked) {
			console.log('this NOT checked');
			clearMuseumMarkers();

			if ($('input:checked').length == 0) {
				$('#business-list').hide();				
			}
		}
	});

	// book stores
	var displayBookStoreMarkers = function() {
		console.log('inside displayBooks func');
		console.log(self.bookStoreArray());

		self.service(new google.maps.places.PlacesService(self.mapDrawn()));
		self.request({
			location: self.mapCenter(),
			radius: '6200',
			types: ['book_store']
		});

		function listBookStores() {
			var bookStoresUl = $('#book-stores');

			for (var i = 0; i < self.bookStoreArray().length; i++) {
				var idAttrVal = self.bookStoreArray()[i].placeId;
				var marker = self.bookStoreArray()[i];
				var businessName = self.bookStoreArray()[i].title;
				var listItem = '<li><a id="' + idAttrVal + '">' + businessName + '</a></li>';

				bookStoresUl.append(listItem);

				document.getElementById(idAttrVal).addEventListener('click', (function(sameTitle, sameMarker, sameI) {	
	    		    	return function() {
	    		    		console.log(imageBookArray);
	    		    		console.log(sameI)

	    		    		infowindow.setContent(sameTitle + '<br />' + imageBookArray[sameI]);
		    		    	infowindow.open(self.map(), sameMarker);
		    		    	$('#business-list li a').css('color', 'inherit');
		    		    	$(this).css('color', '#EF0012');		    		    	
	    		    	}
					})(marker.title, marker, i)
				);				
			}

			bookStoresUl.css('display', 'normal');
		};

		function createMarkers(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					var idAttrVal = '';

					createFlickrPlaces(results[i], i, 'book store');
					console.log(results);
					console.log(results[i]);

					marker = new google.maps.Marker({
						position: results[i].geometry.location,
						map: self.map(),
						placeId: results[i].place_id,
						title: results[i].name
					});	
					self.bookStoreArray.push(marker);	
					console.log(self.bookStoreArray());

					idAttrVal = self.bookStoreArray()[i].placeId;

	    		    google.maps.event.addListener(marker, 'click', (function(sameTitle, sameMarker, sameI, sameIdAttrVal) {	
	    		    	return function() {
	    		    		console.log(imageBookArray);
	    		    		console.log(sameI)

	    		    		infowindow.setContent(sameTitle + '<br />' + imageBookArray[sameI]);
		    		    	infowindow.open(self.map(), sameMarker);
							$('#business-list li a').css('color', 'inherit');
							$('#'+sameIdAttrVal).css('color', '#EF0012');
	    		    	}
					})(marker.title, marker, i, idAttrVal));	

				}
			}
			if (self.bookStoreArray().length != 0) {
				listBookStores();
			}
		};
		self.service().nearbySearch(self.request(), createMarkers);
	};

	var clearBookStoreMarkers = function() {
		var bookStoresUl = $('#book-stores');

		for (var i = 0; i < self.bookStoreArray().length; i++) {
			self.bookStoreArray()[i].setMap(null);
		}

		bookStoresUl.html('');
		self.bookStoreArray.removeAll();
	};

	$('#book_store').change(function() {
		if (this.checked) {
			console.log('this is checked');
			displayBookStoreMarkers();
			$('#business-list').show();
		}
		if (!this.checked) {
			console.log('this NOT checked');
			clearBookStoreMarkers();

			if ($('input:checked').length == 0) {
				$('#business-list').hide();				
			}
		}
	});

	// cafes
	var displayCafeMarkers = function() {
		console.log('inside displayCafes func');
		console.log(self.cafeArray());

		self.service(new google.maps.places.PlacesService(self.mapDrawn()));
		self.request({
			location: self.mapCenter(),
			radius: '6200',
			types: ['cafe']
		});

		function listCafes() {
			var cafesUl = $('#cafes');

			for (var i = 0; i < self.cafeArray().length; i++) {
				var idAttrVal = self.cafeArray()[i].placeId;
				var marker = self.cafeArray()[i];
				var businessName = self.cafeArray()[i].title;
				var listItem = '<li><a id="' + idAttrVal + '">' + businessName + '</a></li>';

				cafesUl.append(listItem);

				document.getElementById(idAttrVal).addEventListener('click', (function(sameTitle, sameMarker, sameI) {	
	    		    	return function() {
	    		    		console.log(imageCafeArray);
	    		    		console.log(sameI)

	    		    		infowindow.setContent(sameTitle + '<br />' + imageCafeArray[sameI]);
		    		    	infowindow.open(self.map(), sameMarker);
		    		    	$('#business-list li a').css('color', 'inherit');
		    		    	$(this).css('color', '#EF0012');
	    		    	}
					})(marker.title, marker, i)
				);				
			}

			cafesUl.css('display', 'normal');				
		};

		function createMarkers(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					var idAttrVal = '';

					createFlickrPlaces(results[i], i, 'cafe');
					console.log(results);
					console.log(results[i]);

					marker = new google.maps.Marker({
						position: results[i].geometry.location,
						map: self.map(),
						placeId: results[i].place_id,
						title: results[i].name
					});	
					self.cafeArray.push(marker);	
					console.log(self.cafeArray());

					idAttrVal = self.cafeArray()[i].placeId;

	    		    google.maps.event.addListener(marker, 'click', (function(sameTitle, sameMarker, sameI, sameIdAttrVal) {	
	    		    	return function() {
	    		    		console.log(imageCafeArray);
	    		    		console.log(sameI)

	    		    		infowindow.setContent(sameTitle + '<br />' + imageCafeArray[sameI]);
		    		    	infowindow.open(self.map(), sameMarker);
							$('#business-list li a').css('color', 'inherit');
							$('#'+sameIdAttrVal).css('color', '#EF0012');
	    		    	}
					})(marker.title, marker, i, idAttrVal));	

				}
			}
			if (self.cafeArray().length != 0) {
				listCafes();
			}
		};
		self.service().nearbySearch(self.request(), createMarkers);
	};

	var clearCafeMarkers = function() {
		var cafesUl = $('#cafes');

		for (var i = 0; i < self.cafeArray().length; i++) {
			self.cafeArray()[i].setMap(null);
		}

		cafesUl.html('');
		self.cafeArray.removeAll();
	};

	$('#cafe').change(function() {
		if (this.checked) {
			console.log('this is checked');
			displayCafeMarkers();
			$('#business-list').show();
		}
		if (!this.checked) {
			console.log('this NOT checked');
			clearCafeMarkers();

			if ($('input:checked').length == 0) {
				$('#business-list').hide();				
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

			    $(':checkbox').parent().parent().css('display', 'inline');
	    	};

	        navigator.geolocation.getCurrentPosition(success);
	    } else {
	        noGeoLoc();
	    }
	});
};

ko.applyBindings(new MapViewModel());
