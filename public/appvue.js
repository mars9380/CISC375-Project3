var url = "";
function Prompt() {
    $("#dialog-form").dialog({
        autoOpen: true,
        modal: true,
        width: "360px",
        buttons: {
            "Ok": function() {
                var prompt_input = $("#prompt_input");
                Init(prompt_input.val());
                $(this).dialog("close");
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        }
    });
}
function Init(crime_api_url) {
    var app = new Vue({
        el: '#app',
        data: {
            test: [],
            map: null,
            tileLayer: null,
            layers: [],
            currentCenter: "",
            placeholder: 'Search...',
            inputSearch: "",
            marker: L.marker([0,0])
        },
        mounted() {
            this.initMap();
        },
        methods: {
            initMap() {
                var southWest = L.latLng(44.882299, -93.212903),
                northEast = L.latLng(44.992038, -93.004937),
                bounds = L.latLngBounds(southWest, northEast);
                this.map = L.map('map', {
                    maxBounds: bounds,
                    maxBoundsViscosity: 1.0
                }).setView([44.9537, -93.0900], 12);
                this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    {
                        minZoom: 12,
                        maxZoom: 18,
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
                    }
                );
    
                this.tileLayer.addTo(this.map);
    
                L.control.scale().addTo(this.map);     
                this.map.on('moveend', function() {
                    let center = app.map.getCenter();
                    app.inputSearch = center.lat + ", " + center.lng;
                });
    
                axios.get(crime_api_url + '/incidents?start_date=2019-10-01&end_date=2019-10-31').then(response => {
                    let data = response.data;
                    crimesNeighborhoods = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
                    for (key in data) {
                        crimesNeighborhoods[data[key].neighborhood_number - 1] = crimesNeighborhoods[data[key].neighborhood_number - 1] + 1;
                        
                    }
                    L.circle([44.928881, -93.022750],{radius:2300}).addTo(this.map).bindPopup('<h2>Conway/Battlecreek/Highwood</h2> <p>' + crimesNeighborhoods[0] + ' crimes</p>');
                    L.circle([44.977668, -93.025349],{radius:1600}).addTo(this.map).bindPopup('<h2>Greater East Side</h2> <p>' + crimesNeighborhoods[1] + ' crimes</p>');
                    L.circle([44.931308, -93.076756],{radius:1700}).addTo(this.map).bindPopup('<h2>West Side</h2> <p>' + crimesNeighborhoods[2] + ' crimes</p>');
                    L.circle([44.955949, -93.057700],{radius:1300}).addTo(this.map).bindPopup("<h2>Dayton's Bluff</h2> <p>" + crimesNeighborhoods[3] + ' crimes</p>');
                    L.circle([44.976976, -93.068340],{radius:1600}).addTo(this.map).bindPopup('<h2>Payne/Phalen</h2> <p>' + crimesNeighborhoods[4] + ' crimes</p>');
                    L.circle([44.977874, -93.111747],{radius:1800}).addTo(this.map).bindPopup('<h2>North End</h2> <p>' + crimesNeighborhoods[5] + ' crimes</p>');
                    L.circle([44.960046, -93.118139],{radius:800}).addTo(this.map).bindPopup('<h2>Thomas/Dale(Frogtown)</h2> <p>' + crimesNeighborhoods[6] + ' crimes</p>');
                    L.circle([44.948551, -93.127261],{radius:800}).addTo(this.map).bindPopup('<h2>Summit/University</h2> <p>' + crimesNeighborhoods[7] + ' crimes</p>');
                    L.circle([44.926661, -93.123107],{radius:1000}).addTo(this.map).bindPopup('<h2>West Seventh</h2> <p>' + crimesNeighborhoods[8] + ' crimes</p>');
                    L.circle([44.982435, -93.146639],{radius:1300}).addTo(this.map).bindPopup('<h2>Como</h2> <p>' + crimesNeighborhoods[9] + ' crimes</p>');
                    L.circle([44.954781, -93.160824],{radius:1000}).addTo(this.map).bindPopup('<h2>Hamline/Midway</h2> <p>' + crimesNeighborhoods[10] + ' crimes</p>');
                    L.circle([44.973499, -93.196289],{radius:1500}).addTo(this.map).bindPopup('<h2>St. Anthony</h2> <p>' + crimesNeighborhoods[11] + ' crimes</p>');
                    L.circle([44.948338, -93.176720],{radius:800}).addTo(this.map).bindPopup('<h2>Union Park</h2> <p>' + crimesNeighborhoods[12] + ' crimes</p>');
                    L.circle([44.934305, -93.175612],{radius:800}).addTo(this.map).bindPopup('<h2>Macalester-Groveland</h2> <p>' + crimesNeighborhoods[13] + ' crimes</p>');
                    L.circle([44.912627, -93.177139],{radius:1500}).addTo(this.map).bindPopup('<h2>Highland</h2> <p>' + crimesNeighborhoods[14] + ' crimes</p>');
                    L.circle([44.939976, -93.135901],{radius:600}).addTo(this.map).bindPopup('<h2>Summit Hill</h2> <p>' + crimesNeighborhoods[15] + ' crimes</p>');
                    L.circle([44.947470, -93.091801],{radius:600}, {color: "red"}).addTo(this.map).bindPopup('<h2>Capital River</h2> <p>' + crimesNeighborhoods[16] + ' crimes</p>');
                });
    
    
    
    
    
    
    
            },
            search() {
                var inBounds = false;
                var north = 44.992038;
                var east = -93.004937;
                var south = 44.882299;
                var west = -93.212903;
                if (this.inputSearch.split(",").length == 2) {
                    let cords = this.inputSearch.split(",");
                    let lat = parseFloat(cords[0]);
                    let lng = parseFloat(cords[1]);
                    if (lat > south && lat < north && lng > west && lng < east) {
                        inBounds = true;
                    }
                    if (inBounds) {
                        this.marker.setLatLng({lat, lng}).addTo(this.map);
                        this.map.flyTo(this.marker.getLatLng(), 16);
                    } else {
                        if (lat < south) {
                            lat = south;
                        }
                        if (lat > north) {
                            lat = north;
                        }
                        if (lng < west) {
                            lng = west;
                        }
                        if (lng > east) {
                            lng = east;
                        }
                        this.marker.setLatLng({lat, lng}).addTo(this.map);
                        this.map.flyTo(this.marker.getLatLng(), 16);
                    }
                } else {
                    axios.get('https://nominatim.openstreetmap.org/search?format=json&q=' + this.inputSearch + ' Minnesota').then(response => {
                        if (response.data[0] != undefined) {
                            let lat  = response.data[0]['lat'];
                            let lng = response.data[0]['lon'];
                            axios.get('https://nominatim.openstreetmap.org/reverse?format=geojson&lat=' + lat + '&lon=' + lng).then(response => {
                                if (response.data['features'] != undefined && lat > south && lat < north && lng > west && lng < east) {
                                    this.inputSearch = response.data['features'][0]['properties']['display_name'];
                                    inBounds = true;
                                }
                                if (inBounds) {
                                    this.marker.setLatLng({lat, lng}).addTo(this.map);
                                    this.map.flyTo(this.marker.getLatLng(), 16);
                                } else {
                                    if (lat < south) {
                                        lat = south;
                                    }
                                    if (lat > north) {
                                        lat = north;
                                    }
                                    if (lng < west) {
                                        lng = west;
                                    }
                                    if (lng > east) {
                                        lng = east;
                                    }
                                    this.marker.setLatLng({lat, lng}).addTo(this.map);
                                    this.map.flyTo(this.marker.getLatLng(), 16);
                                }
                            });
    
                        }
        
                    });
                }
            },
        },
      });
    
    
    var table = new Vue({
        el: '#table',
        data: {
            originalCases: [],
            marker: L.marker([0,0])
        },
        mounted() {
            this.getData();
            this.updateTable();
        },
        methods: {
            getData() {
                axios.get(crime_api_url + '/incidents?start_date=2019-10-01&end_date=2019-10-31').then(response => {
                    let data = response.data;
                    for (key in data) {
                        item = data[key];
                        item.case_number = key;
                        item.isVisible = true;
                        if ((item.code >= 100 && item.code <= 499) || (item.code > 800 && item.code <= 899)) {
                            item.color = 'red';
                        } else if ((item.code >= 500 && item.code <= 800) || (item.code >= 900 && item.code <= 1500)) {
                            item.color = 'blue';
                        } else if (item.code >= 1800 && item.code <= 10000) {
                            item.color = 'green';
                        } else {
                            item.color = 'yellow';
                        }
                        table.originalCases.push(item);
                        
                    }
                    axios.get(crime_api_url + '/codes').then(response => {
                        let codes = response.data;
                        for (let i = 0; i < this.originalCases.length; i++) {
                            this.originalCases[i].incident = codes["C" + this.originalCases[i].code];
                        }
                        axios.get(crime_api_url + '/neighborhoods').then(response => {
                            let neighborhoods = response.data;
                            for (let i = 0; i < this.originalCases.length; i++) {
                                this.originalCases[i].neighborhood_number = neighborhoods["N" + this.originalCases[i].neighborhood_number];
                            }
                        });
                    });
                });
            },
            updateTable() {
                app.map.on('moveend', function() {
                            if (table.originalCases.length != 0) {
                                if (typeof table.originalCases[0].neighborhood_number === 'string') {
                                    let bounds = app.map.getBounds();
                                    let north = bounds.getNorth();
                                    let east = bounds.getEast();
                                    let south = bounds.getSouth();
                                    let west = bounds.getWest();
                                    neighborhoodCords = { "Conway/Battlecreek/Highwood" : [44.928881, -93.022750], "Greater East Side" : [44.977668, -93.025349],
                                     "West Side" : [44.931308, -93.076756], "Dayton's Bluff" : [44.955949, -93.057700], "Payne/Phalen" : [44.976976, -93.068340],
                                      "North End" : [44.977874, -93.111747], "Thomas/Dale(Frogtown)" : [44.960046, -93.118139], "Summit/University" : [44.948551, -93.127261],
                                      "West Seventh" : [44.926661, -93.123107], "Como" : [44.982435, -93.146639], "Hamline/Midway" : [44.954781, -93.160824], 
                                      "St. Anthony" : [44.973499, -93.196289], "Union Park" : [44.948338, -93.176720], "Macalester-Groveland" : [44.934305, -93.175612], 
                                      "Highland" : [44.912627, -93.177139], "Summit Hill" : [44.939976, -93.135901], "Capitol River" : [44.947470, -93.091801]};
                                    
                                    for (let i = 0; i < table.originalCases.length; i++) {
                                        let lat = neighborhoodCords[table.originalCases[i].neighborhood_number][0];
                                        let lng = neighborhoodCords[table.originalCases[i].neighborhood_number][1];
                                        if (lat > south && lat < north && lng > west && lng < east) {
                                            table.originalCases[i].isVisible = true;
                                        } else { 
                                            table.originalCases[i].isVisible = false;
                                        }
                                    }
                                }
                            }
    
                  
                });
            },
            placeMarker(date, time, incident, block) {
                block = block.split(" ");
                firstPiece = block[0];
                if (firstPiece[firstPiece.length] = 'X') {
                    var north = 44.992038;
                    var east = -93.004937;
                    var south = 44.882299;
                    var west = -93.212903;
                    found = false;
                    markerSet = false;
                    let i = 0;
                    while (i < 10) {
                        if(found != true) {
                            let replaced = firstPiece.replace('X',i+"");
                            let search = replaced + " ";
                            for (let j = 1; j < block.length; j++) {
                                search = search + block[j] + " ";
                            }
                            axios.get('https://nominatim.openstreetmap.org/search?format=json&q=' + search + ' Minnesota').then(response => {
                                if (response.data[0] != undefined) {
                                    let lat  = response.data[0]['lat'];
                                    let lng = response.data[0]['lon'];
                                    if (lat > south && lat < north && lng > west && lng < east) {
                                        found = true;
                                        if (markerSet != true) {
                                            this.marker.setLatLng({lat, lng}).addTo(app.map).bindPopup("<p>Date: " + date + "</p><p>Time: " + time + "</p><p>Incident: " + incident + "</p><button type='button'>Delete Marker</button>");
                                            markerSet = true;
                                        }
                                    }
                                    
                                }
                            });
                        }
                        i++;
                    } 
                } else {
                    axios.get('https://nominatim.openstreetmap.org/search?format=json&q=' + block + ' Minnesota').then(response => {
                        if (response.data[0] != undefined) {
                            let lat  = response.data[0]['lat'];
                            let lng = response.data[0]['lon'];
                            if (lat > south && lat < north && lng > west && lng < east) {
                                this.marker.setLatLng({lat, lng}).addTo(app.map).bindPopup("<p>Date: " + date + "</p><p>Time: " + time + "</p><p>Incident: " + incident + "</p><button type='button'>Delete Marker</button>");
                            }
                            
                        }
                    });
                }
            }
        }
    
    
    });
}
