var model = {
	position: ko.observable(),
	lat: ko.observable(),
	lng: ko.observable(),
	mapOptions: ko.observable(),
	drawnMap: ko.observable(),
	userMarker: ko.observable(),
	artMarkersArray: ko.observableArray([]),
	museumMarkersArray: ko.observableArray([]),
	infoWin: new google.maps.InfoWindow(),
	showCheckboxes: ko.observable(false),
	showMap: ko.observable(false),
	showFilterInputBox: ko.observable(false),
	artCheckbox: ko.observable(false),
	museumCheckbox: ko.observable(false),
	cityInput: ko.observable(''),
	searchTermsArray: ko.observableArray([]),
	businessNamesArray: ko.observableArray([]),
	filteredArray: ko.observableArray([])
};

var helperFunctions = {
	fillArtMarkersArray: function(data, status) {
		var len = data.length;
		console.log(data);

		if (status == google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < len; i++) {
				var lat = data[i].geometry.location.lat();
				var lng = data[i].geometry.location.lng();
				var latLng = new google.maps.LatLng(lat, lng);
				var placeId = data[i].place_id;
				var title = data[i].name;
				var placeUrlEncodedName = encodeURIComponent(title);
				var photoSrcUrl = '';
				var marker = new google.maps.Marker({
					map: model.drawnMap(),
					position: latLng,
					title: title,
					placeId: placeId,
					infoWin: function() {
						model.infoWin.setContent(title);
						model.infoWin.open(model.drawnMap(), this);
					}
				});

				model.artMarkersArray.push(marker);
			}
			console.log(model.artMarkersArray());
			helperFunctions.addArtMarkerListener(model.artMarkersArray());
		}
	},
	fillMuseumMarkersArray: function(data, status) {
		var len = data.length;
		console.log(data);

		if (status == google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < len; i++) {
				var lat = data[i].geometry.location.lat();
				var lng = data[i].geometry.location.lng();
				var latLng = new google.maps.LatLng(lat, lng);
				var placeId = data[i].place_id;
				var title = data[i].name;
				var placeUrlEncodedName = encodeURIComponent(title);
				var photoSrcUrl = '';
				var marker = new google.maps.Marker({
					map: model.drawnMap(),
					position: latLng,
					title: title,
					placeId: placeId,
					infoWin: function() {
						model.infoWin.setContent(title);
						model.infoWin.open(model.drawnMap(), this);
					}
				});

				model.museumMarkersArray.push(marker);
			}
			console.log(model.museumMarkersArray());
			helperFunctions.addMuseumMarkerListener(model.museumMarkersArray());
		}
	},
	addUserMarkerListener: function(marker) {
		google.maps.event.addListener(marker, 'click', function() {
			marker.infoWin();
		});
	},
	addArtMarkerListener: function(data) {
		for (var i = 0; i < data.length; i++) {
			var marker = data[i];

			google.maps.event.addListener(marker, 'click', (function(sameMarker) {
				return function() {
					sameMarker.infoWin();
				}
			})(marker));
		}
	},
	addMuseumMarkerListener: function(data) {
		for (var i = 0; i < data.length; i++) {
			var marker = data[i];

			google.maps.event.addListener(marker, 'click', (function(sameMarker) {
				return function() {
					sameMarker.infoWin();
				}
			})(marker));
		}
	},
	hideShowMarkers: ko.computed(function() {
		if (!model.artCheckbox()) {
			model.artMarkersArray().forEach(function(markerItem) {
				markerItem.setMap(null);
			});
		}

		if (!model.museumCheckbox()) {
			model.museumMarkersArray().forEach(function(markerItem) {
				markerItem.setMap(null);
			});
		}

		if (model.artCheckbox()) {
			model.artMarkersArray().forEach(function(markerItem) {
				markerItem.setMap(model.drawnMap());
			});
		}

		if (model.museumCheckbox()) {
			model.museumMarkersArray().forEach(function(markerItem) {
				markerItem.setMap(model.drawnMap());
			});
		}
	}),
	addFlickrImages: function(marker, name, lat, lng, arr, i) {
		apiResponse = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=4c1c3a64fcef86837a9839120dcd9da9&text=' + name + '&content_type=1&accuracy=13&tag_mode=all&min_upload_date=2014&media=photos&lat=' + lat + '&lon=' + lng + '&format=json&nojsoncallback=1';

		$.getJSON(apiResponse, function(data) {
			// console.log('inside getJSON');

			if (data.photos.total > 1) {
				var photoArrayItem = data.photos.photo[1];
				var farmId = photoArrayItem.farm;
				var serverId = photoArrayItem.server;
				var photoId = photoArrayItem.id;
				var secret = photoArrayItem.secret;

				photoSrcUrl = 'https://farm' + farmId + '.staticflickr.com/' + serverId + '/' + photoId + '_' + secret + '_n.jpg';
				photoImageTag = '<img src="' + photoSrcUrl + '" />';

				// console.log(type);
				// console.log(photoImageTag);
				// console.log(marker);
				// console.log(name);
				console.log(i);
				console.log(photoImageTag);
				console.log(marker);
				console.log(arr);

				arr()[i].infoWin = (function(samePhotoImageTag) {
					return function() {
						model.infoWin.setContent(name + '<br/>' + samePhotoImageTag);
						model.infoWin.open(model.drawnMap(), this);						
					}
				})(photoImageTag);

				// marker.infoWin.setContent(name + '<br/>2' + 'photoImageTag');
			} else {
				arr()[i].infoWin = function() {
				model.infoWin.setContent(name);
				model.infoWin.open(model.drawnMap(), this);
				}						
			}
			// fillArrays(index, type, photoImageTag);
		});		
	},	
	checkIgnored: function(word) {
		console.log('the word is ' + word);

		switch (word) {
			case 'the':
				return false;
				break;
			case 'in':
				return false;
				break;
			case 'a':
				return false;
				break;
			case 'for':
				return false;
				break;
			case 'of':
				return false;
				break;
			case 'on':
				return false;
				break;
			default:
				return true;
		}
	},	
	clearMarkers: function() {
		// console.log('starting to clear');

		var artCheckboxInput = document.getElementById('art_gallery');
		var museumCheckboxInput = document.getElementById('museum');

		model.artMarkersArray([]);
		model.artMarkersArray().length = 0;

		model.museumMarkersArray([]);
		model.museumMarkersArray().length = 0;

		document.getElementById('filter-input').value = '';

		artCheckboxInput.disabled = false;
		museumCheckboxInput.disabled = false;
		model.artCheckbox(false);
		model.museumCheckbox(false);
	}
};

var mapViewModel = {
	initialize: ko.computed(function() {
		var success = function(data) {
			model.position(data);
			model.lat(model.position().coords.latitude);
			model.lng(model.position().coords.longitude);
		};

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(success);
		} else {
			console.log('geolocation not enabled');
		}
	}),
	updateLatLng: function() {
		var city = document.getElementById('city-input').value;
		console.log(city);
		var cityToArray = city.split(' ');
		var cityToString = cityToArray.join('+');

		var serverBasedAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + cityToString + '&key=AIzaSyB4mgEnfU7A2ngaDKEJBbsIs7qLxT7ULCg';

		$.getJSON(serverBasedAPI, function(data) {
			if (data.status != 'ZERO_RESULTS' && city != '') {
				console.log(data);
		
				helperFunctions.clearMarkers();

	    		model.lat(data.results[0].geometry.location.lat);
	    		model.lng(data.results[0].geometry.location.lng);
			} else {
				var success = function(data) {
					model.position(data);
					model.lat(model.position().coords.latitude);
					model.lng(model.position().coords.longitude);
				};

				helperFunctions.clearMarkers();				

				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(success);
				} else {
					alert('There was an error in determining your location. Please (1)enable geolocation AND/OR (2)enter a valid city and state.');
				}				
			}
		}).fail(function() {
			alert('There was an error in determining your location. Please check your internet connection.');
		});
	},
	makeMapOptions: ko.computed(function() {
		var mapCenter = new google.maps.LatLng(model.lat(), model.lng());

		model.mapOptions({
			center: mapCenter,
			zoom: 13,
			zoomControl: false,
			mapTypeControl: false,
			streetViewControl: false
		});

		console.log(model.mapOptions());
	}),
	makeMapObj: ko.computed(function() {
		model.drawnMap(new google.maps.Map(document.getElementById('map-canvas'), model.mapOptions()));
		console.log(model.drawnMap());

		if (document.getElementById('map-canvas').innerHTML != '') {
			model.showCheckboxes(true);
			model.showMap(true);
		}
	}),
	makeUserMarker: ko.computed(function() {
		model.userMarker(new google.maps.Marker({
			map: model.drawnMap(),
			position: model.drawnMap().center,
			title: 'You are here!',
			infoWin: function() {
				model.infoWin.setContent(this.title);
				model.infoWin.open(model.drawnMap(), this)
			}
		}));

		helperFunctions.addUserMarkerListener(model.userMarker());
	}),	
	setupArtArray: ko.computed(function() {
		var service = new google.maps.places.PlacesService(model.drawnMap());
		var request = {
			location: model.drawnMap().center,
			radius: '6200',
			types: ['art_gallery']
		};

		service.nearbySearch(request, helperFunctions.fillArtMarkersArray);
	}),
	setupMuseumArray: ko.computed(function() {
		var service = new google.maps.places.PlacesService(model.drawnMap());
		var request = {
			location: model.drawnMap().center,
			radius: '6200',
			types: ['museum']
		};

		service.nearbySearch(request, helperFunctions.fillMuseumMarkersArray);
	}),
	listClickCallback: function(marker) {
		marker.infoWin();
	},
	updateShowFilterInput: ko.computed(function() {
		if (model.artCheckbox() || model.museumCheckbox()) {
			model.showFilterInputBox(true);
			document.getElementById('business-list').style.bottom = '11%';
		} else if (!model.artCheckbox() && !model.museumCheckbox()) {
			model.showFilterInputBox(false);
			document.getElementById('business-list').style.bottom = '-999px';			
		} else {
			model.showFilterInputBox(true);
			document.getElementById('business-list').style.bottom = '11%';			
		}
	}),
	normalizeSearchTerm: function() {
		var searchBoxText = document.getElementById('filter-input').value;
		var textArray = searchBoxText.split(' ');

		var artCheckboxInput = document.getElementById('art_gallery');
		var museumCheckboxInput = document.getElementById('museum');

		var artGalleriesListUL = document.getElementById('art-galleries');
		var museumsListUL = document.getElementById('museums');	

		model.filteredArray([]);
		model.searchTermsArray([]);

		if (searchBoxText == '') {
			console.log('searchBox is empty');

			artCheckboxInput.disabled = false;
			museumCheckboxInput.disabled = false;
			
			// model.filteredArray().length = 0;
			document.getElementById('filtered-businesses').innerHTML = '';
			console.log(model.filteredArray());
			console.log(model.searchTermsArray());

			if (model.artCheckbox()) {
				artGalleriesListUL.style.display = 'block';
			}
			if (model.museumCheckbox()) {
				museumsListUL.style.display = 'block';				
			}

			model.artMarkersArray().forEach(function(markerItem) {
				markerItem.setMap(model.drawnMap());
			});
			model.museumMarkersArray().forEach(function(markerItem) {
				markerItem.setMap(model.drawnMap());
			});			

			return false;
		} else {
			console.log('searchBox not empty');

			artCheckboxInput.disabled = true;
			museumCheckboxInput.disabled = true;

			artGalleriesListUL.style.display = 'none';
			museumsListUL.style.display = 'none';

			model.artMarkersArray().forEach(function(markerItem) {
				markerItem.setMap(null);
			});
			model.museumMarkersArray().forEach(function(markerItem) {
				markerItem.setMap(null);
			});

			for (var i = 0; i < textArray.length; i++) {
				var str = textArray[i];
				var regPatt = /[A-z0-9]/g;
				var result = str.match(regPatt);
				var resultNew = result.join('');

				if (helperFunctions.checkIgnored(resultNew)) {
					model.searchTermsArray.push(resultNew);
					console.log('new search string is ' + model.searchTermsArray());
				}
			}

			return false;
		}
	},
	businessSearch: ko.computed(function() {
		var searchArray = model.searchTermsArray();
		var searchLen = searchArray.length;
		console.log(searchLen);

		function checkItem(marker, i) {
			// console.log('howdy');

			for (var i = 0; i < searchLen; i++) {
				var regexp = new RegExp(searchArray[i], 'gi');
				var name = marker.title;

				// console.log(name);
				console.log(i);
				console.log(regexp);

				if (name.match(regexp)) {
					console.log('a match: ' + name);

					marker.setMap(model.drawnMap());
					
					return true;
				}
			}			
		}

		if (model.artCheckbox() && !model.museumCheckbox()) {
			console.log('museum checkbox not checked');
			model.filteredArray(model.artMarkersArray().filter(checkItem));
		} else if (!model.artCheckbox() && model.museumCheckbox()) {
			console.log('art checkbox not checked');
			model.filteredArray(model.museumMarkersArray().filter(checkItem));
		} else if (model.artCheckbox() && model.museumCheckbox()) {
			console.log('both checked');
			model.filteredArray(model.artMarkersArray().concat(model.museumMarkersArray()).filter(checkItem));
		} else {
			// both not checked
			model.filteredArray({ title: 'no matching businesses found' });
		}
	}),
	setupFlickrAPI: ko.computed(function() {
		model.artMarkersArray().forEach(function(marker, index, array) {
			var marker = marker;
			var name = marker.title;
			var lat = marker.position.lat();
			var lng = marker.position.lng();
			var arr = model.artMarkersArray;
			var i = index;
			// var infoW = marker.infoWin;

			console.log(arr);

			// helperFunctions.addFlickrImages(marker, name, lat, lng, array, i);

			(function(sameMarker, sameName, sameLat, sameLng, sameArr, sameI) {
				return helperFunctions.addFlickrImages(sameMarker, sameName, sameLat, sameLng, sameArr, sameI);
			})(marker, name, lat, lng, arr, i);
		});
		model.museumMarkersArray().forEach(function(marker, index, array) {
			var marker = marker;
			var name = marker.title;
			var lat = marker.position.lat();
			var lng = marker.position.lng();
			var arr = model.museumMarkersArray;
			var i = index;
			// var infoW = marker.infoWin;

			console.log(arr);

			// helperFunctions.addFlickrImages(marker, name, lat, lng, array, i);

			(function(sameMarker, sameName, sameLat, sameLng, sameArr, sameI) {
				return helperFunctions.addFlickrImages(sameMarker, sameName, sameLat, sameLng, sameArr, sameI);
			})(marker, name, lat, lng, arr, i);
		});		

		// model.museumMarkersArray().forEach(function(marker, index, array) {
		// 	name = marker.title;
		// 	lat = marker.position.lat();
		// 	lng = marker.position.lng();
		// 	(function(sameMarker, sameName, sameLat, sameLng) {
		// 		return function() {
		// 			addFlickrImages(sameMarker, sameName, sameLat, sameLng);
		// 		};
		// 	})(marker, name, lat, lng);
		// });		

	})
};

ko.applyBindings(mapViewModel);
