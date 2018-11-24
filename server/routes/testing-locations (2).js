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
        var nextID = getNextAvailableID(data);

        var newLocation = {
          uid: nextID,
          locationId: req.body.locationId,
          locationName: req.body.locationName,
          addressLine1: req.body.addressLine1,
          addressLine2: req.body.addressLine2,
          townCity: req.body.townCity,
          county: req.body.county,
          postalCode: req.body.postalCode,
          mainService: req.body.gacServiceTypes,
          isRegulated: req.body.isRegulated,
          fullname: req.body.user.fullname,
          jobTitle: req.body.user.jobTitle,
          emailAddress: req.body.user.emailAddress,
          contactNumber: req.body.user.contactNumber,
          username: req.body.user.username,
          password: req.body.user.password,
          securityQuestion: req.body.user.securityQuestion,
          securityAnswer: req.body.user.securityAnswer
        };

        data.push(newLocation);

        saveLocationData(data);

//        res.set('Content-Type', 'application/json');
        res.status(201).send(newLocation);
    });


/* CRUD locations API by uid */
router.route('/:id')

  .get(function (req, res) {

    //console.log(res);

    var data = getLocationData();

    var matchingLocations = data.filter(function (item) {
      return item.uid == req.params.id;
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
            return e.uid;
        }).indexOf(parseInt(req.params.id, 10));

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
          return item.uid == req.params.id;
        });

        if (matchingLocations.length === 0) {
            res.sendStatus(404);
        } else {

          var LocationToUpdate = matchingLocations[0];

          LocationToUpdate.locationName = req.body.locationName,
          LocationToUpdate.addressLine1 = req.body.addressLine1,
          LocationToUpdate.addressLine2 = req.body.addressLine2,
          LocationToUpdate.townCity = req.body.townCity,
          LocationToUpdate.county = req.body.county,
          LocationToUpdate.postalCode = req.body.postalCode,
          LocationToUpdate.mainService = req.body.gacServiceTypes,
          LocationToUpdate.isRegulated = req.body.isRegulated,
          LocationToUpdate.fullname = req.body.user.fullname,
          LocationToUpdate.jobTitle = req.body.user.jobTitle,
          LocationToUpdate.emailAddress = req.body.user.emailAddress,
          LocationToUpdate.contactNumber = req.body.user.contactNumber,
          LocationToUpdate.username = req.body.user.username,
          LocationToUpdate.password = req.body.user.password,
          LocationToUpdate.securityQuestion = req.body.user.securityQuestion,
          LocationToUpdate.securityAnswer = req.body.user.securityAnswer

          saveLocationData(data);
          res.sendStatus(204);

        }
  });

// CRUD Location API by locationId
router.route('/lid/:locationId')

  .get(function (req, res) {

    //console.log(res);

    var data = getLocationData();

    var matchingLocationIDs = data.filter(function (item) {
      return item.locationId == req.params.locationId;
    });

    if (matchingLocationIDs.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(matchingLocationIDs);
    }
  })


// CRUD Location API by postalCode
//router.route('/pc/:postcode')

//  .get(function (req, res) {

//    var data = getLocationData();

//    var matchingPostCodes = data.filter(function (item) {
//      return item.postcode === req.params.postalCode;
//    });

//    if (matchingPostCodes.length === 0) {
//      res.sendStatus(404);
//    } else {
//      res.send(matchingPostCodes);
//    }
//  })
router.route('/pc/:postcode')

  .get(function (req, res) {

    //console.log(res);

    var data = getLocationData();

    var matchingPostCodes = data.filter(function (item) {
      console.log("item " + item);
      return item.postalCode == req.params.postalCode;
    });

    if (matchingPostCodes.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(matchingPostCodes);
    }
  })


function getNextAvailableID(allLocations) {

    var maxID = 0;

    allLocations.forEach(function(element, index, array) {

        if (element.uid > maxID) {
            maxID = element.uid;
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
