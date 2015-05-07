var model = {
	businessTypes: ['art_gallery', 'museum'],
	businessArraysObj: {
		artArray: [],
		museumArray: [],
		all: []
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
	UserMarker: function(renderedMap, mapCenter, title) {
		this.renderedMap = renderedMap;

		// userPos is the same as the mapCenter
		this.userPos = mapCenter;
		this.title = title;
	},
	flickrImages: function (type, callback) {	
		console.log(type);

		if (type == 'art_gallery') {
			var artArray = model.businessArraysObj.artArray;
			for (var i = 0; i < 20; i++) {
				// console.log(artArray);
				var placeName = artArray[i].title;
				var placeLat = artArray[i].position.lat();
				var placeLng = artArray[i].position.lng();
				var placeUrlEncodedName = encodeURIComponent(placeName);
				var photoSrcUrl = '';
				var photoImageTag = '';
				console.log(i);

				apiResponse = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=4c1c3a64fcef86837a9839120dcd9da9&text=' + placeUrlEncodedName + '&content_type=1&accuracy=13&tag_mode=all&min_upload_date=2014&media=photos&lat=' + placeLat + '&lon=' + placeLng + '&format=json&nojsoncallback=1';

				// get a Flickr image
				function processArtjSON(apiResponse, i) {
					console.log('inside art gallery json');
					$.getJSON(apiResponse, function(data) {
						console.log(data);
						// console.log(i);

						if (data.photos.total > 1) {
							var photoArrayItem = data.photos.photo[1];
							var farmId = photoArrayItem.farm;
							var serverId = photoArrayItem.server;
							var photoId = photoArrayItem.id;
							var secret = photoArrayItem.secret;

							photoSrcUrl = 'https://farm' + farmId + '.staticflickr.com/' + serverId + '/' + photoId + '_' + secret + '_n.jpg';
							photoImageTag = '<img src="' + photoSrcUrl + '" />';

							model.flickrImagesObj.artArray[i] = photoImageTag;
							console.log(model.flickrImagesObj.artArray);
							// console.log('flickr1');
							console.log(photoImageTag);
							console.log(i);
							// flickrImagesObj.flickrArt[inputCityListener]
							callback(type, photoImageTag, i);
					
						}
					});
				}

				console.log('calling art gallery json');
				processArtjSON(apiResponse, i);
			}
		}
		if (type == 'museum') {
			var museumArray = model.businessArraysObj.museumArray;

			for (var i = 0; i < 20; i++) {
				// console.log(artArray);
				var placeName = museumArray[i].title;
				var placeLat = museumArray[i].position.lat();
				var placeLng = museumArray[i].position.lng();
				var placeUrlEncodedName = encodeURIComponent(placeName);
				var photoSrcUrl = '';
				var photoImageTag = '';
				console.log(i);

				apiResponse = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=4c1c3a64fcef86837a9839120dcd9da9&text=' + placeUrlEncodedName + '&content_type=1&accuracy=13&tag_mode=all&min_upload_date=2014&media=photos&lat=' + placeLat + '&lon=' + placeLng + '&format=json&nojsoncallback=1';

				// get a Flickr image
				function processMuseumjSON(apiResponse, i) {
					$.getJSON(apiResponse, function(data) {
						console.log(data);
						// console.log(i);

						if (data.photos.total > 1) {
							var photoArrayItem = data.photos.photo[1];
							var farmId = photoArrayItem.farm;
							var serverId = photoArrayItem.server;
							var photoId = photoArrayItem.id;
							var secret = photoArrayItem.secret;

							photoSrcUrl = 'https://farm' + farmId + '.staticflickr.com/' + serverId + '/' + photoId + '_' + secret + '_n.jpg';
							photoImageTag = '<img src="' + photoSrcUrl + '" />';

							model.flickrImagesObj.museumArray[i] = photoImageTag;
							console.log(model.flickrImagesObj.artArray);
							// console.log('flickr1');
							console.log(photoImageTag);
							console.log(i);
							// flickrImagesObj.flickrArt[inputCityListener]
							callback(type, photoImageTag, i);
					
						} 
					});
				}

				processMuseumjSON(apiResponse, i);
			}
		}
	},
	twentyBusinessList: function (type, imageTag, i) {
		console.log(i);
		console.log(imageTag);
		if (type == 'art_gallery') {
				var businessName = model.businessArraysObj.artArray[i].title;
				var idAttrVal = model.businessArraysObj.artArray[i].placeId;

				console.log('flickr2');
				console.log(imageTag);
				
				document.getElementById('art-galleries').style.display = 'none';
				view.renderArtList(businessName, idAttrVal, model.businessArraysObj.artArray[i], imageTag);
		}
		if (type == 'museum') {
				var businessName = model.businessArraysObj.museumArray[i].title;
				var idAttrVal = model.businessArraysObj.museumArray[i].placeId;

				document.getElementById('museums').style.display = 'none';
				view.renderMuseumList(businessName, idAttrVal, model.businessArraysObj.museumArray[i], imageTag);		
		}
	},
	twentyBusinessMarkers: function(element, index, array) {
		// renderedMap, mapCenter, type, bizType
		// console.log(element);
		// console.log(index);
		// console.log(array);

		var renderedMap = model.drawnMap;
		var mapCenter = model.mapCenter;
		var type = element;		
		// console.log(renderedMap);

		var service = new google.maps.places.PlacesService(renderedMap);
		var request = {
			location: mapCenter,
			radius: '6200',
			types: [type]
		};
		var infoWin = new google.maps.InfoWindow();

		function createMarkersArray(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < 20; i++) {					
					var lat = results[i].geometry.location.lat();
					var lng = results[i].geometry.location.lng();
					var latLngPosition = new google.maps.LatLng(lat, lng);
					var placeId = results[i].place_id;
					var title = results[i].name;
					var placeUrlEncodedName = encodeURIComponent(title);
					var photoSrcUrl = '';

					// populate artArray, museumArray
					if (type == 'art_gallery') {
						var marker = view.renderMarker(renderedMap, latLngPosition, placeId, title);
						console.log(marker);

						model.businessArraysObj.all.length = 0;
						model.businessArraysObj.artArray[i] = marker;
						marker.setMap(null);
						// document.getElementById('art-galleries').style.display = 'none';
					}
					if (type == 'museum') {
						var marker = view.renderMarker(renderedMap, latLngPosition, placeId, title);

						model.businessArraysObj.all.length = 0;
						model.businessArraysObj.museumArray[i] = marker;
						marker.setMap(null);
						// document.getElementById('museums').style.display = 'none';
					}

					// when finish populating any of the arrays, setup flickr iamges and ul business-list
					if (i == 19) {
						console.log(type);
						octopus.flickrImages(type, octopus.twentyBusinessList);
					}
				}

				// // lastly, concat all of the above arrays, and for each marker, addListener and infoWindow
				// model.businessArraysObj.all = model.businessArraysObj.artArray.concat(model.businessArraysObj.museumArray);
				// model.businessArraysObj.all.forEach(function(element, index, array) {
				// 	google.maps.event.addListener(element, 'click', (function(sameTitle) {
				// 		return function() {
				// 			model.infoWin.setContent(sameTitle);
				// 			model.infoWin.open(model.drawnMap, this);								
				// 		}
				// 	})(element.title));		
				// });
		
			}
		}

		service.nearbySearch(request, createMarkersArray); 
	},
	inputCheckboxListeners: function() {
		model.businessTypes.forEach(function(element, index, array) {
			var elTag = document.getElementById(element);
			
			elTag.addEventListener('change', function() {
				if (this.checked) {
					console.log(element + ' is checked');

					if (element == 'art_gallery') {
						document.getElementById('business-list').style.top = '22%';

						model.businessArraysObj.artArray.forEach(function(element, index, array) {
							element.setMap(model.drawnMap);
						});
						document.getElementById('art-galleries').style.display = 'block';
						// octopus.flickrImages('art_gallery', octopus.twentyBusinessList)
					}
					if (element == 'museum') {
						document.getElementById('business-list').style.top = '22%';

						model.businessArraysObj.museumArray.forEach(function(element, index, array) {
							element.setMap(model.drawnMap);
						});
						document.getElementById('museums').style.display = 'block';
						// octopus.flickrImages('art_gallery', octopus.twentyBusinessList)
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
			
			var artCheckboxInput = document.getElementById('art_gallery');
			var museumCheckboxInput = document.getElementById('museum');
			var city = document.getElementById('city-input').value;
			var cityToArray = city.split(' ');
			var cityToString = cityToArray.join('+');
			var cityLat = null;
			var cityLng = null;
			
			var serverBasedAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + cityToString + '&key=AIzaSyB4mgEnfU7A2ngaDKEJBbsIs7qLxT7ULCg';

			document.getElementById('business-list').style.bottom = '-999px';	
			document.getElementById('business-list').style.top = null;
			document.getElementById('filtered-businesses').innerHTML = '';

			artCheckboxInput.disabled = false;
			museumCheckboxInput.disabled = false;

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
					var userMarker = view.renderUserMarker(drawnMap, mapObj.mapCenter);

					google.maps.event.addListener(userMarker, 'click', function() {
						model.infoWin.setContent('You are here');
						model.infoWin.open(drawnMap, this);
					});

					view.clearMarkers(model.businessArraysObj);
					view.checkCheckboxes();
					view.showCheckboxes();
					model.drawnMap = drawnMap;
					model.mapCenter = mapObj.mapCenter;
			   		model.businessTypes.forEach(octopus.twentyBusinessMarkers);
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
		// console.log(model.businessArraysObj.artArray);
		// console.log(model.businessArraysObj.museumArray);

		var len = model.textArrayNew.length;
		// var businessNamesArray = [];
		var itExistsArray = [];

		function filterNamesArray(namesArray) {
			console.log(namesArray);

			itExistsArray = namesArray.filter(checkItem);

			function checkItem(el, i) {
				for (var i = 0; i < len; i++) {
					console.log(el.marker.title);
					console.log(i);
					
					var regexp = new RegExp(model.textArrayNew[i], 'gi');
					console.log(regexp);
					
					var element = el.marker.title;
					// console.log(element);

					if (element.match(regexp)) {
						console.log('its true ' + element);
						return true;
					}
					// return true;
				}
			}
			console.log(itExistsArray);

			if (itExistsArray.length > 0) {
				// view.clearMarkers(model.businessArraysObj);
				// octopus.clearBusinessLists();
				view.renderBSearchRes(itExistsArray);
			}
		}

		function populateNamesArray(checkArray) {
			model.businessNamesArray = [];
			model.businessNamesArray.length = 0;

			if (document.getElementById('art_gallery').checked) {
				// var itExistsArray = businessNamesArray.filter(checkItem);
				for (var i = 0; i < model.businessArraysObj.artArray.length; i++) {
					var businessObj = {};

					businessObj.marker = model.businessArraysObj.artArray[i];
					businessObj.type = 'art_gallery';
					businessObj.imageTag = model.flickrImagesObj.artArray[i];

					model.businessNamesArray.push(businessObj);
					// model.businessNamesArray = model.businessNamesArray.concat(model.businessArraysObj.artArray);
					// console.log(model.businessArraysObj.artArray);
				}
				console.log(model.businessNamesArray);

				document.getElementById('art_gallery').addEventListener('change', octopus.businessSearch);				
				document.getElementById('museum').addEventListener('change', octopus.businessSearch);
			}

			if (document.getElementById('museum').checked) {
				// var itExistsArray = businessNamesArray.filter(checkItem);
				for (var i = 0; i < model.businessArraysObj.museumArray.length; i++) {
					var businessObj = {};

					businessObj.marker = model.businessArraysObj.museumArray[i];
					businessObj.type = 'museum';
					businessObj.imageTag = model.flickrImagesObj.museumArray[i];

					model.businessNamesArray.push(businessObj);
					// model.businessNamesArray = model.businessNamesArray.concat(model.businessArraysObj.artArray);
					// console.log(model.businessArraysObj.artArray);
				}
				console.log(model.businessNamesArray);

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
		// console.log(itExistsArray);
		// view.renderBSearchRes(itExistsArray);
	},
	clearBusinessLists: function(e) {
		e.preventDefault();
		e.stopPropagation();

		var allArtListItems = document.getElementById('art-galleries');
		var allMuseumListItems = document.getElementById('museums');

		document.getElementById('filtered-businesses').innerHTML = '';

		allArtListItems.style.display = 'none';
		// console.log(allArtListItems.children);
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

		// console.log(allArtListItems.innerHTML);
		// console.log(allMuseumListItems.innerHTML);

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
		var initLat = pos.coords.latitude;
		var initLng = pos.coords.longitude;

		var mapObj = new octopus.Map(initLat, initLng);
		var drawnMap = view.renderMap(mapObj.mapOptions);

		// userPos is the same as the mapCenter
		var userMarkerObj = new octopus.UserMarker(drawnMap, mapObj.mapCenter);
		var userMarker = view.renderUserMarker(drawnMap, mapObj.mapCenter);

		google.maps.event.addListener(userMarker, 'click', function() {
			model.infoWin.setContent('You are here');
			model.infoWin.open(drawnMap, this);
		});

		view.clearMarkers(model.businessArraysObj);
		view.showCheckboxes();
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
		octopus.inputCheckboxListeners();
		octopus.businessFilterListener();

		view.checkCheckboxes();
		console.log('init done');
	}	
};

var view = {
	checkCheckboxes: function() {
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
	renderMarker: function(map, markerPos, placeId, name) {
		return new google.maps.Marker({
			map: map,
			position: markerPos,
			placeId: placeId,
			title: name
		});
	},
	renderArtList: function(name, id, marker, imageTag) {
		console.log(imageTag);
		var artGalleriesListUL = document.getElementById('art-galleries');
		var artListTag = document.createElement('li');

		artListTag.innerHTML = '<a id="' + id + '">' + name + '</a>';
		artGalleriesListUL.appendChild(artListTag);

		document.getElementById(id).addEventListener('click', (function(sameName, sameMarker, sameImageTag) {
			return function() {
				model.infoWin.setContent(sameName + '<br />' + sameImageTag);
				model.infoWin.open(model.drawnMap, sameMarker);	
				console.log('i hear click 1');
			}
		})(name, marker, imageTag));

		google.maps.event.addListener(marker, 'click', (function(sameTitle, sameImageTag) {
			return function() {
				model.infoWin.setContent(sameTitle + '<br/>' + sameImageTag);
				model.infoWin.open(model.drawnMap, this);							
			}
		})(marker.title, imageTag));			
	},
	renderMuseumList: function(name, id, marker, imageTag) {
		console.log(imageTag);
		var museumsListUL = document.getElementById('museums');
		var museumListTag = document.createElement('li');

		museumListTag.innerHTML = '<a id="' + id + '">' + name + '</a>';
		museumsListUL.appendChild(museumListTag);

		document.getElementById(id).addEventListener('click', (function(sameName, sameMarker, sameImageTag) {
			return function() {
				model.infoWin.setContent(sameName + '<br />' + sameImageTag);
				model.infoWin.open(model.drawnMap, sameMarker);		
				console.log('i hear click 2');										
			}
		})(name, marker, imageTag));

		google.maps.event.addListener(marker, 'click', (function(sameTitle, sameImageTag) {
			return function() {
				model.infoWin.setContent(sameTitle + '<br/>' + sameImageTag);
				model.infoWin.open(model.drawnMap, this);								
			}
		})(marker.title, imageTag));		
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
	clearMarkers: function(arraysObj) {
		console.log('starting to clear');

		var artGalleriesListUL = document.getElementById('art-galleries');
		var museumsListUL = document.getElementById('museums');

		artGalleriesListUL.innerHTML = '';
		museumsListUL.innerHTML = '';

		arraysObj.artArray.forEach(function(listItem) {
			listItem.setMap(null);
		});
		arraysObj.museumArray.forEach(function(listItem) {
			listItem.setMap(null);
		});

		arraysObj.artArray.length = 0;
		arraysObj.museumArray.length = 0;
	},
	showCheckboxes: function() {
		console.log(model.drawnMap);
		var checkboxParent = document.getElementById('art_gallery').parentNode.parentNode;
		checkboxParent.style.display = 'inline';
	}
};

octopus.init();