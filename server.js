// Built-in Node.js modules
var fs = require('fs')
var path = require('path')
// NPM modules
var express = require('express')
var sqlite3 = require('sqlite3')
var convert = require('xml-js')
var bodyParser = require('body-parser')
var cors = require('cors');

var public_dir = path.join(__dirname, 'public');
var template_dir = path.join(__dirname, 'templates');
var db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');


var app = express();
var port = 8034;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

var db = new sqlite3.Database(db_filename, sqlite3.OPEN, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});

app.use(express.static(public_dir));

// GET request handler for '/codes'
app.get('/codes', (req, res) => {

    var codes = {};
    var codeList;
    if (req.query.code != undefined) {
        codeList = req.query.code.split(",");
    } else {
        codeList = [];
    }

    db.all("SELECT * FROM Codes", (err,rows) => {
        if (codeList.length == 0) {
            for (let i = 0; i < rows.length; i++) {
                codes['C' + rows[i].code] = rows[i].incident_type; 
            }
        } else {
            for (let i = 0; i < rows.length; i++) {
                for (let j = 0; j < codeList.length; j++) {
                    if (rows[i].code == parseInt(codeList[j])) {
                        codes['C' + rows[i].code] = rows[i].incident_type; 
                    }
                }
            }
        }
        if (req.query.format == "xml") {
            var options = {compact: true, spaces: 4};
            var xmlHeader = '<?xml version="1.0" encoding="UTF-8" ?>\n';
            res.type('xml').send(xmlHeader + "<Codes>\n" + convert.js2xml(codes,options) + "\n</Codes>");
        } else {
            res.type('json').send(JSON.stringify(codes, null, 4)); 
        }
        
    });
});

// GET request handler for '/neighborhoods'
app.get('/neighborhoods', (req, res) => {
    var neighborhoods = {};
    var idList;
    if (req.query.id != undefined) {
        idList = req.query.id.split(",");
    } else {
        idList = [];
    }
    db.all("SELECT * FROM Neighborhoods", (err,rows) => {
        if (idList.length == 0) {
            for (let i = 0; i < rows.length; i++) {
                neighborhoods['N' + rows[i].neighborhood_number] = rows[i].neighborhood_name;  
            }
        } else {
            for (let i = 0; i < rows.length; i++) {
                for (let j = 0; j < idList.length; j++) {
                    if (rows[i].neighborhood_number == parseInt(idList[j])) {
                        neighborhoods['N' + rows[i].neighborhood_number] = rows[i].neighborhood_name;  
                    }
                }
            }
        }
        if (req.query.format == "xml") {
            var options = {compact: true, spaces: 4};
            var xmlHeader = '<?xml version="1.0" encoding="UTF-8" ?>\n';
            res.type('xml').send(xmlHeader + "<Neighborhoods>\n" + convert.js2xml(neighborhoods,options) + "\n</Neighborhoods>");
        } else {
            res.type('json').send(JSON.stringify(neighborhoods, null, 4)); 
        }
    });
});

// GET request handler for '/incidents'
app.get('/incidents', (req, res) => {
    var allIncidents = {};
    var startDate = 0;
    var endDate;
    var codeList;
    var gridList;
    var idList;
    var limit;

    db.all("SELECT * FROM Incidents ORDER BY date_time DESC", (err,rows) => {
        for(let i = 0; i < rows.length; i++) {
            let dateTime = rows[i].date_time.split("T");
            allIncidents['I' + rows[i].case_number] = {
                "date": dateTime[0],
                "time": dateTime[1],
                "code": rows[i].code,
                "incident": rows[i].incident,
                "police_grid": rows[i].police_grid,
                "neighborhood_number": rows[i].neighborhood_number,
                "block": rows[i].block
            }
        }
        if (req.query.start_date != undefined) {
            startDate = req.query.start_date.replace("-","");
            startDate = parseInt(startDate.replace("-",""));
            for (key in allIncidents) {
                let currIncidentDate = allIncidents[key].date.replace("-","");
                currIncidentDate = parseInt(currIncidentDate.replace("-",""));
                if (currIncidentDate < startDate) {
                    delete allIncidents[key];
                }
            }
        }
        if (req.query.end_date != undefined) {
            endDate = req.query.end_date.replace("-","");
            endDate = parseInt(endDate.replace("-",""));
            for (key in allIncidents) {
                let currIncidentDate = allIncidents[key].date.replace("-","");
                currIncidentDate = parseInt(currIncidentDate.replace("-",""));
                if (currIncidentDate > endDate) {
                    delete allIncidents[key];
                }
            }
        }
        if (req.query.code != undefined) {
            codeList = req.query.code.split(",");
            let newIncidents = {};
            for (key in allIncidents) {
                for (let i = 0; i < codeList.length; i++) {
                    if (allIncidents[key].code == codeList[i]) {
                        newIncidents[key] = allIncidents[key];
                    }
                }
            }
            allIncidents = newIncidents;
        }
        if (req.query.grid != undefined) {
            gridList = req.query.grid.split(",");
            let newIncidents = {};
            for (key in allIncidents) {
                for (let i = 0; i < gridList.length; i++) {
                    if (allIncidents[key].police_grid == gridList[i]) {
                        newIncidents[key] = allIncidents[key];
                    }
                }
            }
            allIncidents = newIncidents;
        }
        if (req.query.id != undefined) {
            idList = req.query.id.split(",");
            let newIncidents = {};
            for (key in allIncidents) {
                for (let i = 0; i < idList.length; i++) {
                    if (allIncidents[key].neighborhood_number == idList[i]) {
                        newIncidents[key] = allIncidents[key];
                    }
                }
            }
            allIncidents = newIncidents;
        }
        if (req.query.limit != undefined) {
            limit = req.query.limit;
            let newIncidents = {};
            let iterator = 0;
            for (key in allIncidents) {
                if (iterator < limit) {
                    newIncidents[key] = allIncidents[key];
                } else {
                    break;
                }
                iterator = iterator + 1;
            } 
            allIncidents = newIncidents;
        } else {
            limit = 10000;
            let newIncidents = {};
            let iterator = 0;
            for (key in allIncidents) {
                if (iterator < limit) {
                    newIncidents[key] = allIncidents[key];
                } else {
                    break;
                }
                iterator = iterator + 1;
            } 
            allIncidents = newIncidents;
        }

        if (req.query.format == "xml") {
            var options = {compact: true, spaces: 4};
            var xmlHeader = '<?xml version="1.0" encoding="UTF-8" ?>\n';
            res.type('xml').send(xmlHeader + "<Incidents>\n" + convert.js2xml(allIncidents,options) + "\n</Incidents>");
        } else {
            res.type('json').send(JSON.stringify(allIncidents, null, 4)); 
        }
    });
});


// PUT request handler for '/new-incident'
app.put('/new-incident', (req, res) => {
    
    db.all("SELECT case_number FROM Incidents WHERE case_number = ?", [req.body.case_number], (err, rows) => {
        if (rows.length == 0) {
            db.run("INSERT INTO Incidents (case_number, date_time, code, incident, police_grid, neighborhood_number, block) VALUES (?,?,?,?,?,?,?)", [req.body.case_number, req.body.date_time, parseInt(req.body.code,10), req.body.incident, parseInt(req.body.police_grid,10), parseInt(req.body.neighborhood_number, 10), req.body.block], (err) => {
                if (err) {
                    res.status(500).send('Error: data format invalid\n');
                } else {
                    res.status(200).send('Incident Successfully added\n');
                }
           });
        } else {
            res.status(500).send('Error: case number already exists\n');
        }      
    });
});


var server = app.listen(port);