var model = {
	businessTypes: ['art_gallery', 'museum'],
	businessArraysObj: {
		artArray: [],
		museumArray: []
		// all: []
	},
	flickrImagesObj: {
		artArray: [],
		museumArray: []
	},
	drawnMap: {},
	mapCenter: {},
	infoWin: new google.maps.InfoWindow(),
	businessNamesArray: [],
	textArrayNew: []
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
	setupFlickrArray: function(addFlickrImages) {
		console.log('inside flickr');
		console.log(addFlickrImages);

		var placeName = '';
		var placeLat = null;
		var placeLng = null;
		var placeUrlEncodedName = null;
		var photoSrcUrl = '';
		var photoImageTag = '';

		var fillFlickrArrays = function (i, type, image) {
			console.log('inside fill arrays');
			console.log(image);
			if (type == 'artArray') {
				model.flickrImagesObj.artArray[i] = image;
			}
			if (type == 'museumArray') {
				model.flickrImagesObj.museumArray[i] = image;
			}
		};

		var processJSON = function (response, index, type, fillArrays) {
			$.getJSON(response, function(data) {
				console.log('inside getJSON');

				if (data.photos.total > 1) {
					var photoArrayItem = data.photos.photo[1];
					var farmId = photoArrayItem.farm;
					var serverId = photoArrayItem.server;
					var photoId = photoArrayItem.id;
					var secret = photoArrayItem.secret;

					photoSrcUrl = 'https://farm' + farmId + '.staticflickr.com/' + serverId + '/' + photoId + '_' + secret + '_n.jpg';
					photoImageTag = '<img src="' + photoSrcUrl + '" />';

					console.log(type);
					console.log(photoImageTag);
				}						
				
				fillArrays(index, type, photoImageTag);
			});
		};

		var flickrAPI = function(name, lat, lng, type, i) {
			apiResponse = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=4c1c3a64fcef86837a9839120dcd9da9&text=' + name + '&content_type=1&accuracy=13&tag_mode=all&min_upload_date=2014&media=photos&lat=' + lat + '&lon=' + lng + '&format=json&nojsoncallback=1';

			processJSON(apiResponse, i, type, fillFlickrArrays);
		};

		model.businessArraysObj.artArray.forEach(function(value, index, array) {
			console.log('inside bArtArray');

			var marker = value;
			var i = index;
			var type = 'artArray';

			placeName = marker.title;
			placeLat = marker.lat;
			placeLng = marker.lng;
			placeUrlEncodedName = encodeURIComponent(placeName);

			(function(samePlaceUrlEncodedName, samePlaceLat, samePlaceLng, sameType, sameI) {
				flickrAPI(samePlaceUrlEncodedName, samePlaceLat, samePlaceLng, sameType, sameI);
			})(placeUrlEncodedName, placeLat, placeLng, type, i);
		});

		model.businessArraysObj.museumArray.forEach(function(value, index, array) {
			console.log('inside bMuseumArray');

			var marker = value;
			var i = index;
			var type = 'museumArray';

			placeName = marker.title;
			placeLat = marker.lat;
			placeLng = marker.lng;
			placeUrlEncodedName = encodeURIComponent(placeName);

			(function(samePlaceUrlEncodedName, samePlaceLat, samePlaceLng, sameType, sameI) {
				flickrAPI(samePlaceUrlEncodedName, samePlaceLat, samePlaceLng, sameType, sameI);
			})(placeUrlEncodedName, placeLat, placeLng, type, i);
		});

		addFlickrImages();
	},
	addMarkerListener: function(marker, name, id, tag, image) {
		google.maps.event.addListener(marker, 'click', function() {
			marker.infoWin();
		});
	},	
	setupBusinessMarkers: function(value, index, array) {
		var renderedMap = model.drawnMap;
		var mapCenter = model.mapCenter;
		var type = value;		

		var service = new google.maps.places.PlacesService(renderedMap);
		var request = {
			location: mapCenter,
			radius: '6200',
			types: [type]
		};

		function createMarkersArray(results, status) {
			function createMarkers(populateFlickrArray) {
				// console.log(results);
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					for (var i = 0; i < results.length; i++) {
						var lat = results[i].geometry.location.lat();
						var lng = results[i].geometry.location.lng();
						var latLngPosition = new google.maps.LatLng(lat, lng);
						var placeId = results[i].place_id;
						var title = results[i].name;
						var placeUrlEncodedName = encodeURIComponent(title);
						var photoSrcUrl = '';
						var marker = view.renderMarker(renderedMap, lat, lng, latLngPosition, placeId, title);

						// model.businessArraysObj.all.length = 0;

						// populate artArray, museumArray
						if (type == 'art_gallery') {
							console.log(type + ' and ' + marker.title);

							(function(sameMap, samePos, sameId, sameTitle, sameMarker, sameI) {
								model.businessArraysObj.artArray[sameI] = sameMarker;
								marker.setMap(null);								

								if (sameI == 19) {
									console.log('sameI is ' + sameI);

									octopus.setupFlickrArray(view.renderFlickrImages);
								}
								view.renderArtListItem(sameMap, samePos, sameId, sameTitle);
								octopus.addMarkerListener(sameMarker, sameTitle, sameId);
							})(renderedMap, latLngPosition, placeId, title, marker, i);
						}
						if (type == 'museum') {
							console.log(type + ' and ' + marker.title);

							(function(sameMap, samePos, sameId, sameTitle, sameMarker, sameI) {

								model.businessArraysObj.museumArray[i] = marker;
								marker.setMap(null);								
								if (sameI == 19) {
									console.log('sameI is ' + sameI);

									octopus.setupFlickrArray(view.renderFlickrImages);
								}								
								view.renderMuseumListItem(sameMap, samePos, sameId, sameTitle);
								octopus.addMarkerListener(sameMarker, sameTitle, sameId);
							})(renderedMap, latLngPosition, placeId, title, marker, i);
						}

						// if (i == 19) {
						// 	console.log('i is ' + i);
						// 	octopus.setupFlickrArray();			
						// }
					}
				}
			}

			createMarkers(octopus.setupFlickrArray);
		}

		service.nearbySearch(request, createMarkersArray); 
	},
	inputCheckboxListeners: function() {
		var elTag = null;

		model.businessTypes.forEach(function(element, index, array) {	
			elTag = document.getElementById(element);
			elTag.addEventListener('change', function() {
				if (this.checked) {
					console.log(element + ' is checked');

					if (element == 'art_gallery') {
						document.getElementById('business-list').style.top = '22%';
						model.businessArraysObj.artArray.forEach(function(element, index, array) {
							element.setMap(model.drawnMap);
						});
						document.getElementById('art-galleries').style.display = 'block';

						if (document.getElementById('museum').checked == false) {
							document.getElementById('museums').style.display = 'none';
						}
					}
					if (element == 'museum') {
						document.getElementById('business-list').style.top = '22%';
						model.businessArraysObj.museumArray.forEach(function(element, index, array) {
							element.setMap(model.drawnMap);
						});
						document.getElementById('museums').style.display = 'block';

						if (document.getElementById('art_gallery').checked == false) {
							document.getElementById('art-galleries').style.display = 'none';
						}	
					}
				}
				if (!this.checked) {
					console.log(element + ' is NOT checked');

					if (document.getElementById('art_gallery').checked == false && document.getElementById('museum').checked == false) {
						console.log('both are false');
						document.getElementById('business-list').style.bottom = '-999px';	
						document.getElementById('business-list').style.top = null;	
					}

					if (element == 'art_gallery') {
						model.businessArraysObj.artArray.forEach(function(element, index, array) {
							element.setMap(null);
						});
						document.getElementById('art-galleries').style.display = 'none';
					}
					if (element == 'museum') {
						model.businessArraysObj.museumArray.forEach(function(element, index, array) {
							element.setMap(null);	
						});
						document.getElementById('museums').style.display = 'none';
					}
				}
			});
		});
	},
	inputCityListener: function() {
		var cityInput = document.getElementById('city-input-form');

		function inputCityListenerCallback(e) {
			e.stopPropagation();
			e.preventDefault();

			document.getElementById('search-box').innerHTML = '';
			document.getElementById('business-list').style.bottom = '-999px';	
			document.getElementById('business-list').style.top = null;
			document.getElementById('filtered-businesses').innerHTML = '';
						
			var artCheckboxInput = document.getElementById('art_gallery');
			var museumCheckboxInput = document.getElementById('museum');
			var city = document.getElementById('city-input').value;
			var cityToArray = city.split(' ');
			var cityToString = cityToArray.join('+');
			var cityLat = null;
			var cityLng = null;
			
			var serverBasedAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + cityToString + '&key=AIzaSyB4mgEnfU7A2ngaDKEJBbsIs7qLxT7ULCg';


			artCheckboxInput.disabled = false;
			museumCheckboxInput.disabled = false;

			view.clearMarkers();

			$.getJSON(serverBasedAPI, function(data) {
				console.log(data);

			    if (data.status == 'ZERO_RESULTS' || city == '') {
			    	alert('Enter a valid address');
			    } else {
		    		cityLat = data.results[0].geometry.location.lat;
		    		cityLng = data.results[0].geometry.location.lng;

		    		var mapObj = new octopus.Map(cityLat, cityLng);
		    		var drawnMap = view.renderMap(mapObj.mapOptions);
					var userMarker = view.renderUserMarker(drawnMap, mapObj.mapCenter);

					google.maps.event.addListener(userMarker, 'click', function() {
						model.infoWin.setContent('You are here');
						model.infoWin.open(drawnMap, this);
					});

					view.clearMarkers();
					view.uncheckCheckboxes();
					view.showCheckboxes();
					model.drawnMap = drawnMap;
					model.mapCenter = mapObj.mapCenter;


			   		model.businessTypes.forEach(octopus.setupBusinessMarkers);
				}
	    	}).fail(function() {
	    		console.log('Check your internet connection');
	    	});

			octopus.businessFilterListener();
	    }

		cityInput.addEventListener('submit', inputCityListenerCallback);
	},
	businessSearch: function() {
		console.log(model.textArrayNew);

		var len = model.textArrayNew.length;
		var itExistsArray = [];

		function filterNamesArray(namesArray) {
			console.log(namesArray);

			itExistsArray = namesArray.filter(checkItem);

			function checkItem(el, i) {
				for (var i = 0; i < len; i++) {
					var regexp = new RegExp(model.textArrayNew[i], 'gi');
					var element = el.marker.title;

					console.log(el.marker.title);
					console.log(i);
					console.log(regexp);

					if (element.match(regexp)) {
						console.log('its true ' + element);
						return true;
					}
				}
			}
			console.log(itExistsArray);

			if (itExistsArray.length > 0) {

				view.renderBSearchRes(itExistsArray);
			}
		}

		function populateNamesArray(checkArray) {
			model.businessNamesArray = [];
			model.businessNamesArray.length = 0;

			if (document.getElementById('art_gallery').checked) {
				for (var i = 0; i < model.businessArraysObj.artArray.length; i++) {
					var businessObj = {};

					businessObj.marker = model.businessArraysObj.artArray[i];
					businessObj.type = 'art_gallery';
					businessObj.imageTag = model.flickrImagesObj.artArray[i];

					model.businessNamesArray.push(businessObj);
				}

				document.getElementById('art_gallery').addEventListener('change', octopus.businessSearch);				
				document.getElementById('museum').addEventListener('change', octopus.businessSearch);
			}

			if (document.getElementById('museum').checked) {
				for (var i = 0; i < model.businessArraysObj.museumArray.length; i++) {
					var businessObj = {};

					businessObj.marker = model.businessArraysObj.museumArray[i];
					businessObj.type = 'museum';
					businessObj.imageTag = model.flickrImagesObj.museumArray[i];

					model.businessNamesArray.push(businessObj);
				}

				document.getElementById('art_gallery').addEventListener('change', octopus.businessSearch);				
				document.getElementById('museum').addEventListener('change', octopus.businessSearch);
			}

			if (!document.getElementById('art_gallery').checked) {
				document.getElementById('art_gallery').addEventListener('change', octopus.businessSearch);				
				document.getElementById('museum').addEventListener('change', octopus.businessSearch);
			}

			if (!document.getElementById('museum').checked) {
				document.getElementById('art_gallery').addEventListener('change', octopus.businessSearch);				
				document.getElementById('museum').addEventListener('change', octopus.businessSearch);
			}

			console.log(model.textArrayNew);
			checkArray(model.businessNamesArray);
		}

		populateNamesArray(filterNamesArray);
	},
	clearBusinessLists: function(e) {
		e.preventDefault();
		e.stopPropagation();

		var allArtListItems = document.getElementById('art-galleries');
		var allMuseumListItems = document.getElementById('museums');

		document.getElementById('filtered-businesses').innerHTML = '';

		allArtListItems.style.display = 'none';
		allMuseumListItems.style.display = 'none';		
	},
	userInputRegExp: function(e) {
		e.preventDefault();
		e.stopPropagation();

		var allArtListItems = document.getElementById('art-galleries');
		var allMuseumListItems = document.getElementById('museums');
		var artCheckboxInput = document.getElementById('art_gallery');
		var museumCheckboxInput = document.getElementById('museum');

		model.textArrayNew = [];
		model.textArrayNew.length = 0;

		// get value of input
		var searchBoxText = document.getElementById('search-box').firstChild.firstChild.value;		
		var textArray = searchBoxText.split(' ');
		// var textArrayNew = [];
		document.getElementById('filtered-businesses').innerHTML = '';

		function checkIgnored(word) {
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
		}

		console.log(textArray);

		if (searchBoxText == '') {
			console.log(searchBoxText);

			artCheckboxInput.disabled = false;
			museumCheckboxInput.disabled = false;

			if (document.getElementById('art_gallery').checked) {
				console.log('art is checked');
				allArtListItems.style.display = 'block';
			} else {
				console.log('art nothing');
			}

			if (document.getElementById('museum').checked) {
				console.log('museum is checked');
				allMuseumListItems.style.display = 'block';
			} else {
				console.log('museum nothing');
			}
		} else {
			console.log('searchBox not empty');
			console.log(textArray);
			
			artCheckboxInput.disabled = true;
			museumCheckboxInput.disabled = true;

			for (var i = 0; i < textArray.length; i++) {
				var str = textArray[i];
				var regPatt = /[A-z0-9]/g;
				var result = str.match(regPatt);
				var resultNew = result.join('');

				if (checkIgnored(resultNew)) {
					console.log('new result is ' + resultNew);
					model.textArrayNew.push(resultNew);
				}
			}
		}

		octopus.businessSearch();
	},
	businessFilterListener: function() {
		var searchBox = document.getElementById('search-box');
		var formEl = document.createElement('form');
		var inputEl = document.createElement('input');

		formEl.appendChild(inputEl);
		inputEl.setAttribute('type', 'textarea');
		inputEl.setAttribute('placeholder', 'filter businesses');
		inputEl.setAttribute('id', 'filter-input');


		searchBox.appendChild(formEl);

		searchBox.addEventListener('submit', octopus.userInputRegExp);
		searchBox.addEventListener('click', octopus.clearBusinessLists);
	},
	geoSuccess: function(pos) {
		console.log(pos);

		var initLat = pos.coords.latitude;
		var initLng = pos.coords.longitude;

		var mapObj = new octopus.Map(initLat, initLng);
		var drawnMap = view.renderMap(mapObj.mapOptions);
		var userMarker = view.renderUserMarker(drawnMap, mapObj.mapCenter);

		google.maps.event.addListener(userMarker, 'click', function() {
			model.infoWin.setContent('You are here');
			model.infoWin.open(drawnMap, this);
		});

		view.clearMarkers();
		view.showCheckboxes();
		model.drawnMap = drawnMap;
		model.mapCenter = mapObj.mapCenter;
		console.log('inside geoSuccess');

	   		model.businessTypes.forEach(octopus.setupBusinessMarkers);
	},
	init: function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(octopus.geoSuccess);
		} else {
			console.log("Geolocation not enabled");

			octopus.geoSuccess({
				coords: {
					latitude: 34.0611581,
					longitude: -118.31076039999999
				}
			})
		}

		octopus.inputCityListener();
		octopus.inputCheckboxListeners();
		octopus.businessFilterListener();

		view.uncheckCheckboxes();
		console.log('init done');
	},
	renderAll: function() {
		console.log('beginning to render everything');

		// view.renderMarkerImages();
		// view.renderArtList();
		// view.renderMuseumList();
	}	
};

var view = {
	uncheckCheckboxes: function() {
		document.getElementById('art_gallery').checked = false;
		document.getElementById('museum').checked = false;
	},
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
	renderFlickrImages: function() {
		model.businessArraysObj.artArray.forEach(function(value, index, array) {
			var marker = value;
			var name = marker.title;
			var i = index;


			marker.infoWin = function() {
				var imageTag = model.flickrImagesObj.artArray[i];
				console.log(imageTag);
				console.log(model.flickrImagesObj.artArray[i]);
				console.log('updating infoWin to say art2');
				
				model.infoWin.setContent(name + '-art2<br />' + imageTag);
				model.infoWin.open(model.drawnMap, this);
			};
		});
		model.businessArraysObj.museumArray.forEach(function(value, index, array) {
			var marker = value;
			var name = marker.title;
			var i = index;


			marker.infoWin = function() {
				var imageTag = model.flickrImagesObj.museumArray[i];
				console.log(imageTag);
				console.log(model.flickrImagesObj.museumArray[i]);
				console.log('updating infoWin to say museum2');
				
				model.infoWin.setContent(name + '-museum2<br />' + imageTag);
				model.infoWin.open(model.drawnMap, this);
			};
		});		
	},
	renderMarker: function(map, lat, lng, markerPos, placeId, name, imageTag) {
		return new google.maps.Marker({
			map: map,
			lat: lat,
			lng: lng,
			position: markerPos,
			placeId: placeId,
			title: name,
			infoWin: function() {
				model.infoWin.setContent(name);
				model.infoWin.open(model.drawnMap, this);	
			}
		});
	},
	renderArtListItem: function(map, markerPos, placeId, name) {
		var artGalleriesListUL = document.getElementById('art-galleries');
		var artListTag = document.createElement('li');	
		
		artListTag.innerHTML = '<a id="' + placeId + '">' + name + '</a>';
		artGalleriesListUL.appendChild(artListTag);
	},
	renderMuseumListItem: function(map, markerPos, placeId, name) {
		var museumListUL = document.getElementById('museums');
		var museumListTag = document.createElement('li');	
		
		museumListTag.innerHTML = '<a id="' + placeId + '">' + name + '</a>';
		museumListUL.appendChild(museumListTag);
	},	
	renderBSearchRes: function(array) {
		console.log(array);

		var filteredUl = document.getElementById('filtered-businesses');
		
		for (var i = 0; i < array.length; i++) {
			var bName = array[i].marker.title;
			var bId = array[i].marker.placeId;
			var filteredListTag = document.createElement('li');
			var imageTag = array[i].imageTag;
			var marker = array[i].marker;

			filteredListTag.innerHTML = '<a id="' + bId + '">' + bName + '</a>';
			console.log(filteredUl);
			filteredUl.appendChild(filteredListTag);

			document.getElementById(bId).addEventListener('click', (function(sameName, sameMarker, sameImageTag) {
				return function() {
					model.infoWin.setContent(sameName + '<br />' + sameImageTag);
					model.infoWin.open(model.drawnMap, sameMarker);		
					console.log('i hear click 2');										
				}
			})(bName, array[i].marker, imageTag));

			google.maps.event.addListener(marker, 'click', (function(sameTitle, sameImageTag) {
				return function() {
					model.infoWin.setContent(sameTitle + '<br/>' + sameImageTag);
					model.infoWin.open(model.drawnMap, this);								
				}
			})(marker.title, imageTag));			
		}
	},
	showCheckboxes: function() {
		var checkboxParent = document.getElementById('art_gallery').parentNode.parentNode;
		
		checkboxParent.style.display = 'inline';
	},
	clearMarkers: function() {
		// console.log('starting to clear');

		var businessArrays = model.businessArraysObj;
		var flickrImageArrays = model.flickrImagesObj;

		var filteredBusinessesListUL = document.getElementById('filtered-businesses');
		var artGalleriesListUL = document.getElementById('art-galleries');
		var museumsListUL = document.getElementById('museums');

		filteredBusinessesListUL.innerHTML = '';
		artGalleriesListUL.innerHTML = '';
		museumsListUL.innerHTML = '';

		// setMap to null to initially hide all markers
		// businessArrays.all.forEach(function(listItem) {
		// 	listItem.setMap(null);
		// });
		businessArrays.artArray.forEach(function(listItem) {
			listItem.setMap(null);
		});
		businessArrays.museumArray.forEach(function(listItem) {
			listItem.setMap(null);
		});

		// empty all business arrays and set length to 0 to begin from scratch
		businessArrays.all = [];
		businessArrays.artArray = [];
		businessArrays.museumArray = [];

		businessArrays.all.length = 0;
		businessArrays.artArray.length = 0;
		businessArrays.museumArray.length = 0;

		// empty all flickr image arrays and set length to 0 to begin from scratch
		flickrImageArrays.artArray = [];
		flickrImageArrays.museumArray = [];

		flickrImageArrays.artArray.length = 0;
		flickrImageArrays.museumArray.length = 0;		

	}	
};

octopus.init();