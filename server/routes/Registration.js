var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');

//var connectionString = 'tcp://sfcadmin:sfcadmin123@3.8.78.161:5432/sfcdevdb';

const { Pool, Client } = require('pg')
const client = new Client({
  user: 'sfcadmin',
  host: '3.8.78.161',
  database: 'sfcdevdb',
  password: 'sfcadmin123',
  port: 5432,
})


router.route('/')
    .get(async function(req, res) {
      res.json({
              status: 'API id Working',
              message: 'Registration API',
           });
    })

    .post(function(req, res) {

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

    //validate has to be 1 user
    if(JSON.stringify(req.body.user.length) >= 2) {
			res.status(404);
			res.json({
				"success" : 0,
				"message" : "More than 2 users found"
			});
			return false;
	  	}
      //check for duplicate establisment and user.

     var Estblistmentdata = {
         Name : req.body.locationName,
         Address : req.body.addressLine1 + " " + req.body.addressLine2 + " " + req.body.towncity + " " + req.body.county,
         LocationID: req.body.locationId,
         PostCode: req.body.postalCode,
         MainService: req.body.mainService,
         IsRegulated: req.body.isRegulated
      } 
     var Userdata = {
        FullName : req.body.user[0].fullname,
        JobTitle : req.body.user[0].jobTitle,
        Email    : req.body.user[0].emailAddress,
        Phone    : req.body.user[0].contactNumber,
        DateCreated: new Date(),
        EstablishmentID:0,
        AdminUser: true
      }
     var Logindata = {
        RegistrationId:0,
        UserName: req.body.user[0].username,
        Password: req.body.user[0].password,
        SecurityQuestion: req.body.user[0].securityQuestion,
        SecurityQuestionAnswer: req.body.user[0].securityAnswer,
        Active:true,
        InvalidAttempt:0
      }
   
    //sql
    var EstablishmentInsert = 'INSERT INTO cqc."Establishment" ("Name", "Address", "LocationID", "PostCode", "MainService", "IsRegulated") VALUES ($1,$2,$3,$4,$5,$6)'
    var EstablishmentSelect = 'SELECT * FROM cqc."Establishment" where "Name" = $1 Limit 1'
    var UserInsert = 'INSERT INTO cqc."User"("FullName", "JobTitle", "Email", "Phone", "DateCreated", "EstablishmentID", "AdminUser") VALUES ($1,$2,$3,$4,$5,$6,$7)'
    var UserSelect = 'SELECT * FROM cqc."User" where "FullName" = $1 Limit 1'
    var LoginInsert = 'INSERT INTO cqc."Login"("RegistrationID", "Username", "Password", "SecurityQuestion", "SecurityQuestionAnswer", "Active", "InvalidAttempt") VALUES ($1,$2,$3,$4,$5,$6,$7)'

     //db connection
    client.connect()
    client.query(EstablishmentInsert, [Estblistmentdata.Name,Estblistmentdata.Address,Estblistmentdata.LocationID,Estblistmentdata.PostCode,Estblistmentdata.MainService,Estblistmentdata.IsRegulated])
    .then(function(){
     
      client.query(EstablishmentSelect, [Estblistmentdata.Name],function(err,result) {
        // done(); // closing the connection;
         if(err){             
             res.status(400).send(err);
         }
          client.query(UserInsert,[Userdata.FullName,Userdata.JobTitle,Userdata.Email,Userdata.Phone,Userdata.DateCreated,result.rows[0].EstablishmentID,1],function(err,result) {
            // done(); // closing the connection;
           // estid = result.rows[0].EstablishmentID;
            if(err){             
                res.status(400).send(err);
            } 

                //login // retrive user by name and establisment ;;could be issue as we dont know the if fullname is unique
                client.query(UserSelect, [Userdata.FullName],function(err,result) {               
                if(err){             
                    res.status(400).send(err);
                }
                
                client.query(LoginInsert,[result.rows[0].RegistrationID, Logindata.UserName, Logindata.Password,Logindata.SecurityQuestion,Logindata.SecurityQuestionAnswer,1,0],function(err,result) {
                  // done(); // closing the connection;
                  if(err){             
                      res.status(400).send(err);
                  }
                    res.status(200);
                    res.json({
                    "success" : 1,
                    "message" : "Record added Successfully"
                    });  
                });

                //login end
           
            // user insert
            // res.status(200);
            // res.json({
            // "success" : 1,
            // "message" : "Record added Sucessfully"

            });     
         });
         //res.send(result.rows);
     }); 
    })//end of then without semi
       //do not return here till all finish 
      // res.status(201);
      // res.json({
      //   "success" : 1,
      //   "message" : "Record added Sucessfully"
      // });  

    .catch(function(err) {
        res.status(404);
        res.json({
          "success" : 0,
          "message" : err.message
        });
      });
     
  });    
    // client.query(EstablishmentInsert, [Estblistmentdata.Name,Estblistmentdata.Address,Estblistmentdata.LocationID,Estblistmentdata.PostCode,Estblistmentdata.MainService,Estblistmentdata.IsRegulated])
    // .then(function(){
    
    //   client.query(EstablishmentSelect,[Estblistmentdata.Name], function (err, result) {
    //       if (err) throw err; 
    //       console.log(result)
          
    //   });   

    //   res.status(201);
    //   res.json({
    //     "success" : 1,
    //     "message" : "Record added Sucessfully"
    //   });
    // })
    // .catch( function(err) {
    //     res.status(404);
    //     res.send({
    //       "success" : 0,
    //       "message" : err.message
    //     });
    //   });


      ///////////working

      // client.query('INSERT INTO cqc."TestTable" values($1)', [data.text])
      // .then(function(){
      //     res.status(201);
      //     res.json({
      //       "success" : 1,
      //       "message" : "Record added Sucessfully"
      //     });
      //   })
      //   .catch( function(err) {
      //     res.status(404);
      //     res.send({
      //       "success" : 0,
      //       "message" : err.message
      //     });
      //   });
      
  


      //working one
      // client.query('SELECT * from cqc."pcodedata"', (err, res) => {
      //   if (err) {
      //     console.log(err.stack)
      //   } else {
      //     console.log(res.rows[0].uprn)
      //   }
      // })
      //  // console.log(req);
      //   res.send(201, req.body.name);


// // Set default API response
// router.get('/', function (req, res) {
//   res.json({
//      status: 'API id Working',
//      message: 'Registration API',
//   });


// });

// router.post('/', function(req, res){
//   console.log(req);
//   res.send(201, req.body);
// });

module.exports = router;
