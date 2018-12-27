var express = require('express');
var router = express.Router();
var concatenateAddress = require('../utils/concatenateAddress').concatenateAddress;
const bodyParser = require('body-parser');


const { Client } = require('pg');

// TODO - copied from model/index.js; this will be removed when registration is refactored to using sequelize''
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
// allow override of any config value from environment variable
config.host = process.env.DB_HOST ?  process.env.DB_HOST : config.host;
config.port = process.env.DB_PORT ?  process.env.DB_PORT : config.port;
config.database = process.env.DB_NAME ?  process.env.DB_NAME : config.database;
config.username = process.env.DB_USER ?  process.env.DB_USER : config.username;
config.password = process.env.DB_PASS ?  process.env.DB_PASS : config.password;


const client = new Client({
  user: config.username,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
});

// Check if service exists
router.get('/service/:name', function (req, res) {
  client.connect() 
  var serviceNameSelect = 'SELECT * FROM cqc."services" where "name" = $1 Limit 1'
  client.query(serviceNameSelect,[req.params.name],function(err,result) {         
        if (result.rowCount == 0) {
          res.json({
            status: '0',
            message: 'name not found',
          });

        } else {
          res.json({
            status: '1',
            message: 'name found',
          });
        }                 
  })

});

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/username/:username', function (req, res) {
  client.connect()
  var UserNameSelect = 'SELECT * FROM cqc."Login" where "Username" = $1 Limit 1'

  client.query(UserNameSelect,[req.params.username],function(err,result) {         
        if (result.rowCount == 0) {
          res.json({
            status: '0',
            message: 'Username not found',
          });

        } else {
          res.json({
            status: '1',
            message: 'Username found',
          });
        }                 
  })

});

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/estbname/:name', function (req, res) {
  client.connect()
  var UserNameSelect = 'SELECT * FROM cqc."Establishment" where "Name" = $1 Limit 1'   
  client.query(UserNameSelect,[req.params.name],function(err,result) {         
        if (result.rowCount == 0) {
          res.json({
            status: '0',
            message: 'Establishment name not found',
          });

        } else {
          res.json({
            status: '1',
            message: 'Establishment name found',
          });
        }          
     
  })

});

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/estb/:name&:locationid', function (req, res) {
  client.connect()
  var UserNameSelect = 'SELECT * FROM cqc."Establishment" where "Name" = $1 and "LocationID" = $2 Limit 1'
  var Userdata = {
    Name : req.params.name,
    locationid : req.params.locationid,
  }

  client.query(UserNameSelect, [Userdata.Name,Userdata.locationid],function(err,result) {
    if (result.rows.length == 0) {
      res.json({
        status: '0',
        message: 'Establishment not found',
      });

    } else {
      res.json({
        status: '1',
        message: 'Establishment found',
      });
    }              
  })
  
});

router.route('/')
  .get(async function(req, res) {
    res.json({
      status: 'API id Working',
      message: 'Registration API',
    });
  })

  .post(async function(req, res) {
    //retrieve the incoming json //skipping the model generation and mapping
    // var  insertModel = req.body;

    //basic validation
    if(JSON.stringify(req.body) == '{}') {
			res.status(404);
			res.json({
				"success" : 0,
				"message" : "Parameters missing"
			});
			return false;
	  }

    var Estblistmentdata = {
         Name : req.body[0].locationName,
         Address : concatenateAddress(req.body[0].addressLine1, req.body[0].addressLine2, req.body[0].townCity, req.body[0].county),
         LocationID: req.body[0].locationId,
         PostCode: req.body[0].postalCode,
         MainService: req.body[0].mainService,
         MainServiceId : null,
         IsRegulated: req.body[0].isRegulated
    };
    var Userdata = {
        FullName : req.body[0].user.fullname,
        JobTitle : req.body[0].user.jobTitle,
        Email    : req.body[0].user.emailAddress,
        Phone    : req.body[0].user.contactNumber,
        DateCreated: new Date(),
        EstablishmentID:0,
        AdminUser: true
    };
    var Logindata = {
        RegistrationId:0,
        UserName: req.body[0].user.username,
        Password: req.body[0].user.password,
        SecurityQuestion: req.body[0].user.securityQuestion,
        SecurityQuestionAnswer: req.body[0].user.securityAnswer,
        Active:true,
        InvalidAttempt:0
    };
   
    //sql
    var EstablishmentInsert = 'INSERT INTO cqc."Establishment" ("Name", "Address", "LocationID", "PostCode", "MainServiceId", "IsRegulated") VALUES ($1,$2,$3,$4,$5,$6) RETURNING "EstablishmentID"';
    var EstablishmentSelect = 'SELECT * FROM cqc."Establishment" where "Name" = $1 Limit 1';
    var UserInsert = 'INSERT INTO cqc."User"("FullName", "JobTitle", "Email", "Phone", "DateCreated", "EstablishmentID", "AdminUser") VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING "RegistrationID"';
    var UserSelect = 'SELECT * FROM cqc."User" where "FullName" = $1 Limit 1';
    var LoginInsert = 'INSERT INTO cqc."Login"("RegistrationID", "Username", "Password", "SecurityQuestion", "SecurityQuestionAnswer", "Active", "InvalidAttempt") VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING "ID"';

     //db connection
    client.connect();

    // there are multiple steps to regiastering a new user/establishment. They must be done in entirety (all or nothing).
    // 1. looking the main service; to get ID
    // 2. Create Establishment record, to get Establishment ID
    // 3. Create User record (using Establishment ID) to get Registration ID
    // 4. Create Login record (using Registration ID)

    // if any part fails, it all fails. So wrap into a single transaction; commit on success and rollback on failure.

    // this could fail because:
    //  1. Unexpected error - database connection/database state
    //  2. Establishment table constraints fail - name is not unique
    //  3. Login table constraints fail - username is not unique
    const errOnService = new Error("Registration: Failed to identify main service");
    const errOnEstablishment = new Error("Registration: Failed to create Establishment");
    const errOnUser = new Error("Registration: Failed to create User");
    const errOnLogin = new Error("Registration: Failed to create Login");

    try {
      const serviceNameSelect = 'SELECT * FROM cqc."services" where "name" = $1 Limit 1';

      let serviceResults = null;
      try {
        serviceResults = await client.query(serviceNameSelect,[Estblistmentdata.MainService]);

        if (serviceResults.rowCount > 0) {
          Estblistmentdata.MainServiceId = serviceResults.rows[0].id
        }
      } catch (err) {
        // TODO: need a better method of handling error
        console.err(err);
        throw errOnService;
      }
      
      let establishmentID = null;
      try {
        await client.query('BEGIN');
        // forced error - in absence of unit tests
        //throw new Error("Totally forced")
        const result = await client.query(EstablishmentInsert, [Estblistmentdata.Name,Estblistmentdata.Address,Estblistmentdata.LocationID,Estblistmentdata.PostCode,Estblistmentdata.MainServiceId,Estblistmentdata.IsRegulated]);
        establishmentID = result.rows[0].EstablishmentID;

      } catch (err) {
        // TODO: need a better method of handling error
        console.error(err);
        throw errOnEstablishment;
      }

      let registrationID = null;
      try {
        // forced error - in absence of unit tests
        //throw new Error("Totally forced")
        const result = await client.query(UserInsert,[Userdata.FullName,Userdata.JobTitle,Userdata.Email,Userdata.Phone,Userdata.DateCreated,establishmentID,1]);
        registrationID = result.rows[0].RegistrationID;

      } catch (err) {
        // TODO: need a better method of handling error
        console.error(err);
        throw errOnUser;
      }

      let loginID = null;
      try {
        // forced error - in absence of unit tests
        //throw new Error("Totally forced")
        const result = await client.query(LoginInsert,[registrationID, Logindata.UserName, Logindata.Password,Logindata.SecurityQuestion,Logindata.SecurityQuestionAnswer,1,0]);
        loginID = result.rows[0].ID;

        // gets this far with no error
        await client.query('COMMIT');

      } catch (err) {
        // TODO: need a better method of handling error
        console.error(err);
        throw errOnLogin;
      }

      // gets here on success
      res.status(200);
      res.json({
        "success" : 1,
        "message" : "Record added Successfully",
        "establishmentId" : establishmentID
      });

    } catch (err) {
      // failed to fully register a new user/establishment - full rollback
      console.error("Registration: rolling back all changes");
      await client.query('ROLLBACK');
      res.status(500);
      res.json({
        "success" : 0,
        "message" : err.message
      });
    } finally {
      client.end;
    }
  })
;  // ends router.route('/')

module.exports = router;
