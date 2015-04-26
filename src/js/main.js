var model = {
	businessTypes: ['art_gallery', 'museum', 'book_store', 'cafe'],
	businessArraysObj: {
		artArray: [],
		museumArray: [],
		bookArray: [],
		cafeArray: []
	},
	drawnMap: {},
	mapCenter: {}
};

var octopus = {
	Map: function(lat, lng) {
		this.mapCenter = new google.maps.LatLng(lat, lng); 
		this.mapOptions = {
			center: this.mapCenter,
			zoom: 13,
			zoomControl: false,
			mapTypeControl: false,
			streetViewControl: false
		};
	},
	UserMarker: function(renderedMap, mapCenter, title) {
		this.renderedMap = renderedMap;

		// userPos is the same as the mapCenter
		this.userPos = mapCenter;
		this.title = title;
	},
	twentyBusinessMarkers: function(element, index, array) {
		// renderedMap, mapCenter, type, bizType
		console.log(element);
		console.log(index);
		console.log(array);

		var renderedMap = model.drawnMap;
		var mapCenter = model.mapCenter;
		var type = element;		
		console.log(renderedMap);

		var service = new google.maps.places.PlacesService(renderedMap);
		var request = {
			location: mapCenter,
			radius: '6200',
			types: [type]
		};

		function twentyBusinessList(type) {
			if (type == 'art_gallery') {
				for (var i = 0; i < model.businessArraysObj.artArray.length; i++) {
					var businessName = model.businessArraysObj.artArray[i].title;
					var idAttrVal = model.businessArraysObj.artArray[i].placeId;

					view.renderArtList(businessName, idAttrVal);				
				}
			} else if (type == 'museum') {
				for (var i = 0; i < model.businessArraysObj.museumArray.length; i++) {
					var businessName = model.businessArraysObj.museumArray[i].title;
					var idAttrVal = model.businessArraysObj.museumArray[i].placeId;

					view.renderMuseumList(businessName, idAttrVal);								
				}
			} else if (type == 'book_store') {
				for (var i = 0; i < model.businessArraysObj.bookArray.length; i++) {
					var businessName = model.businessArraysObj.bookArray[i].title;
					var idAttrVal = model.businessArraysObj.bookArray[i].placeId;

					view.renderBookList(businessName, idAttrVal);			
				}
			} else if (type == 'cafe') {
				for (var i = 0; i < model.businessArraysObj.cafeArray.length; i++) {
					var businessName = model.businessArraysObj.cafeArray[i].title;
					var idAttrVal = model.businessArraysObj.cafeArray[i].placeId;					

					view.renderCafeList(businessName, idAttrVal);				
				}
			}
		}

		function createMarkersArray(results, status) {
			// console.log(results);
			// console.log(status);

			if (status == google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					var lat = results[i].geometry.location.k;
					var lng = results[i].geometry.location.D;
					var latLngPosition = new google.maps.LatLng(lat, lng);
					var placeId = results[i].place_id;
					var title = results[i].name;

					if (type == 'art_gallery') {
						var marker = view.renderMarker(renderedMap, latLngPosition, placeId, title);
						model.businessArraysObj.artArray[i] = marker;
					} else if (type == 'museum') {
						var marker = view.renderMarker(renderedMap, latLngPosition, placeId, title);
						model.businessArraysObj.museumArray[i] = marker;						
					} else if (type == 'book_store') {
						var marker = view.renderMarker(renderedMap, latLngPosition, placeId, title);
						model.businessArraysObj.bookArray[i] = marker;						
					} else if (type == 'cafe') {
						var marker = view.renderMarker(renderedMap, latLngPosition, placeId, title);
						model.businessArraysObj.cafeArray[i] = marker;						
					}

					if (i == 19) {
						twentyBusinessList(type);
					}
				}
			}
		}

		service.nearbySearch(request, createMarkersArray); 
	},
	inputCityListener: function() {
		var cityInput = document.getElementById('city-input-form');

		function inputCityListenerCallback(e) {
			e.stopPropagation();
			e.preventDefault();

			var city = document.getElementById('city-input').value;
			var cityToArray = city.split(' ');
			var cityToString = cityToArray.join('+');
			var cityLat = null;
			var cityLng = null;
			
			var serverBasedAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + cityToString + '&key=AIzaSyB4mgEnfU7A2ngaDKEJBbsIs7qLxT7ULCg';

			view.clearMarkers(model.businessArraysObj);

			$.getJSON(serverBasedAPI, function(data) {
				console.log(data);

			    if (data.status == 'ZERO_RESULTS' || city == '') {
			    	alert('Enter a valid address');
			    } else {
		    		cityLat = data.results[0].geometry.location.lat;
		    		cityLng = data.results[0].geometry.location.lng;

		    		var mapObj = new octopus.Map(cityLat, cityLng);
		    		var drawnMap = view.renderMap(mapObj.mapOptions);

		    		// marker position is the same as mapCenter
		    		var cityCenterMarkerObj = new octopus.UserMarker(drawnMap, mapObj.mapCenter);

		    		view.renderUserMarker(drawnMap, mapObj.mapCenter);
					model.drawnMap = drawnMap;
					model.mapCenter = mapObj.mapCenter;
			   		model.businessTypes.forEach(octopus.twentyBusinessMarkers);
				}
	    	}).fail(function() {
	    		console.log('Check your internet connection');
	    	});
	    }

		cityInput.addEventListener('submit', inputCityListenerCallback);
	},
	geoSuccess: function(pos) {
		var initLat = pos.coords.latitude;
		var initLng = pos.coords.longitude;

		var mapObj = new octopus.Map(initLat, initLng);
		var drawnMap = view.renderMap(mapObj.mapOptions);

		// userPos is the same as the mapCenter
		var userMarkerObj = new octopus.UserMarker(drawnMap, mapObj.mapCenter);
		
		view.renderUserMarker(drawnMap, mapObj.mapCenter);
		model.drawnMap = drawnMap;
		model.mapCenter = mapObj.mapCenter;
   		model.businessTypes.forEach(octopus.twentyBusinessMarkers);
	},
	init: function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(octopus.geoSuccess);
		} else {
			console.log("Geolocation not enabled");
		}

		octopus.inputCityListener();
		console.log('init done');
	}	
};

var view = {
	renderMap: function(options) {
		var mapCanvas = document.getElementById('map-canvas');
		
		return new google.maps.Map(mapCanvas, options);
	},
	renderUserMarker: function(map, center) {
		return new google.maps.Marker({
			map: map,
			position: center,
			title: "You are here!"
		});
	},
	renderMarker: function(map, markerPos, placeId, name) {
		return new google.maps.Marker({
			map: map,
			position: markerPos,
			placeId: placeId,
			title: name
		});
	},
	renderArtList: function(name, id) {
		var artGalleriesListUL = document.getElementById('art-galleries');
		var artListTag = document.createElement('li');

		artListTag.innerHTML = '<li><a id="' + id + '">' + name + '</a></li>';
		artGalleriesListUL.appendChild(artListTag);			
	},
	renderMuseumList: function(name, id) {
		var museumsListUL = document.getElementById('museums');
		var museumListTag = document.createElement('li');

		museumListTag.innerHTML = '<li><a id="' + id + '">' + name + '</a></li>';
		museumsListUL.appendChild(museumListTag);	
	},
	renderBookList: function(name, id) {
		var bookStoresListUL = document.getElementById('book-stores');
		var bookListTag = document.createElement('li');

		bookListTag.innerHTML = '<li><a id="' + id + '">' + name + '</a></li>';
		bookStoresListUL.appendChild(bookListTag);		
	},
	renderCafeList: function(name, id) {
		var cafesListUL = document.getElementById('cafes');
		var cafeListTag = document.createElement('li');

		cafeListTag.innerHTML = '<a id="' + id + '">' + name + '</a>';
		cafesListUL.appendChild(cafeListTag);	
	},
	clearMarkers: function(arraysObj) {
		console.log('starting to clear');

		var artGalleriesListUL = document.getElementById('art-galleries');
		var museumsListUL = document.getElementById('museums');
		var bookStoresListUL = document.getElementById('book-stores');
		var cafesListUL = document.getElementById('cafes');

		artGalleriesListUL.innerHTML = '';
		museumsListUL.innerHTML = '';
		bookStoresListUL.innerHTML = '';
		cafesListUL.innerHTML = '';

		arraysObj.artArray.forEach(function(listItem) {
			listItem.setMap(null);
		});
		arraysObj.museumArray.forEach(function(listItem) {
			listItem.setMap(null);
		});
		arraysObj.bookArray.forEach(function(listItem) {
			listItem.setMap(null);
		});
		arraysObj.cafeArray.forEach(function(listItem) {
			listItem.setMap(null);
		});

		arraysObj.artArray.length = 0;
		arraysObj.museumArray.length = 0;
		arraysObj.bookArray.length = 0;
		arraysObj.cafeArray.length = 0;
	}
};

octopus.init();