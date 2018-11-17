var express = require('express');
var fs = require('fs');
var datafile = 'server/data/locations.json';
var router = express.Router();

/* GET all locations and POST new locations */
router.route('/')
    .get(function(req, res) {
        var data = getLocationData();
        res.send(data);
    })

    .post(function(req, res) {

        var data = getLocationData();
        //var nextID = getNextAvailableID(data);

        var newLocation = {
            locationId: req.body.locationId,
            locationName: req.body.locationName,
            postalCode: req.body.postalCode,
        };

        data.push(newLocation);

        saveLocationData(data);

//        res.set('Content-Type', 'application/json');
        res.status(201).send(newLocation);
    });


/* GET, PUT and DELETE individual locations */
router.route('/:id')

    .get(function(req, res) {

        console.log('Retrieving location id: ' + req.params.locationId);

        var data = getLocationData();

        var matchingLocations = data.filter(function(item) {
            return item.locationId == req.params.locationId;
        });

        if (matchingLocations.length === 0) {
            res.sendStatus(404);
        } else {
          res.send(matchingLocations[0]);
        }
    })

    .delete(function(req, res) {

        var data = getLocationData();

        var pos = data.map(function(e) {
            return e.locationId;
        }).indexOf(parseInt(req.params.locationId, 10));

        if (pos > -1) {
            data.splice(pos, 1);
        } else {
            res.sendStatus(404);
        }

        saveLocationsData(data);
        res.sendStatus(204);

    })

    .put(function(req, res) {

        var data = getLocationData();

        var matchingLocations = data.filter(function(item) {
          return item.locationId == req.params.locationId;
        });

        if (matchingLocations.length === 0) {
            res.sendStatus(404);
        } else {

          var LocationToUpdate =  matchingLocations[0];
            LocationToUpdate.locationId = req.body.locationId;
            LocationToUpdate.locationName = req.body.locationName;
            LocationToUpdate.postalCode = req.body.postalCode;

            saveLocationData(data);
            res.sendStatus(204);

        }
    });

function getNextAvailableID(allLocations) {

    var maxID = 0;

    allLocations.forEach(function(element, index, array) {

        if (element.locationId > maxID) {
            maxID = element.locationId;
        }

    });

    return ++maxID;

}

function getLocationData() {
    var data = fs.readFileSync(datafile, 'utf8');
    return JSON.parse(data);
}

function saveLocationData(data) {
    fs.writeFile(datafile, JSON.stringify(data, null, 4), function (err) {
        if (err) {
            console.log(err);
        }
    });
}

module.exports = router;
