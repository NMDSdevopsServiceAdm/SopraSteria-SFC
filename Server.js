const http = require('http');
var formidable = require('formidable');
var path = require('path');
var fss = require('fs-extra')
const csv = require('csv-validator');
var fs = require('fs');
const AWS = require('aws-sdk');
//AWS.config.loadFromPath('config.json');
var util = require('util');

const port = process.env.PORT || 3000;


const server = http.createServer((req, res) => {
   
    if (req.url == '/result') {	
	
		fs.readFile('log.txt', function(err, buf) {
		res.write(buf.toString());
		res.end();
	});  
	
	  return 
    }
  
	if (req.url == '/cqcresult') {	
	
		fs.readFile('location.txt', function(err, buf) {
		res.write(buf.toString());
		res.end();
	});  
	
	  return 
    }
	
   if (req.url == '/cqc') {	
	
		const https = require('https');		
		res.write('<!DOCTYPE html><html><head></head><body>');	
		res.write('<legend><b>Locations</legend>');	
		res.write('<fieldset>');	
		res.write('<button id="btn1">extract location</button>');
		res.write('<div id="div2"><h2></h2></div>');
		res.write('</fieldset></body>');
		res.write('<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>');
					
		https.get('https://api.cqc.org.uk/public/v1/locations', (resp) => {
		let data = '';
 
		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
		data += chunk;
		});
 
		// The whole response has been received. Print out the result.
		resp.on('end', () => {
			console.log(JSON.parse(data).locations);
			var logFile = fs.createWriteStream('location.txt');						
			logFile.write(util.format(JSON.parse(data).locations));	
			
			//fs.readFile('location.txt', function(err, buf) {
			//res.write(JSON.parse(data).locations);
			//});

		});
		
	
		//res.write('<script>$(document).ready(function(){$("#btn1").click(function(){ $.get("location.txt", function(data1) { alert(data1) }, "text"); });});</script>');

		res.write('<script>$(document).ready(function(){$("#btn1").click(function(){$.ajax({url: "https://devtest.cloudapps.digital/cqcresult",dataType:"text",type: "GET",success: function(data){$("#div2").html(data);}, error: function(req, st, err){alert(req + st + err);}});});});</script>');
				
		res.end();
 
		}).on("error", (err) => {
		  console.log("Error: " + err.message);
		});	
			
			
	
	
	  return 
    }
   if (req.url == '/fileupload') {
	   
	  var form = new formidable.IncomingForm();

     form.parse(req, function (err, fields, files) {
		var oldpath = files.filetoupload.path;   	 
		var newpath =  path.resolve('./').replace(/\\/g, '/') + '/' + files.filetoupload.name;
	    var absolutepath = path.resolve('./').replace(/\\/g, '/') + '/' ;
		
		fss.remove(newpath, function (err) {
		 if (err) throw err;
		 console.log();
		 });
	   
		fss.move(oldpath, newpath, function (err) {
		   if (err) throw err;
		
		
		// Validation schema goes here. Validation is using a node js module called csv validator
		const csvFilePath = newpath;
	    const headers = {
	//test
				name: '', // any string
				phone: 1, // any number
				email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // RegExp
				
			//worker_qualification.csv
				id: 1, //any number
				worker_id: 1, //any number
				phone: 1, //any number
				qualification_level: 1, //any number
				achieve_date: /^([0-9]{4})$/, //yyyy
				achievestatus: 1, //any number
				notes: '', //any string
				date_qualification: /^((?:0[1-9]|[1-2][0-9]|3[0-1])\-(?:0[1-9]|1[0-2])\-([0-9]{4})\s+(?:2[0-3]|[0-1][0-9]):[0-5][0-9]:[0-5][0-9])$/,//ddmmyyyy mmhhss
				source: '', //any string

			//worker_training.csv
				training_category_id: 1, //any number
				training_name: '', //any string

				};

		
		
		//Start of csv validation using abovee schema
		csv(csvFilePath, headers)
		.then(function()  //If successfull
		{
			var logFile = fs.createWriteStream('log.txt');						
			logFile.write('Validations Successful!' + '\n');	

			//block the code temporarily till AWS account sort out
			//AWS Code----configuring parameters
			 // var s3 = new AWS.S3();
		     // var params = {
			 // Bucket: 'nmsdexcel',
			    // Body : fs.createReadStream(newpath),
			    // Key : files.filetoupload.name
			  // };
			  // s3.upload(params, function (err, data) {
			  // // handle error
			    // if (err) {
				  // console.log("upload Error", err);
			    // }

			    // //success
			    // if (data) {
				  // console.log("Uploaded in:", data.Location);
			    // }
			   // });
			   
			console.log			
		})	
		.catch(function (err) //Failed validation message 
		{	
			 // var s3 = new AWS.S3();	
			 // var params = {
			   // Bucket: 'nmsdexcel',
			   // Body : fs.createReadStream(newpath),
			   // Key : files.filetoupload.name
			 // };
			 // s3.upload(params, function (er, data) {
			   // //handle error
			   // if (er) {
				 // console.log("upload Error", err);
			   // }

			   // //success
			   // if (data) {
				 // console.log("Uploaded in:", data.Location);

			 var util = require('util');
			 var logFile = fs.createWriteStream('log.txt');
											
			// logFile.write('There are some validation errors! Open the link to see the details' +' ' + '<a>' + data.Location + '<\a> \n');
			 logFile.write('There are some validation errors! Open the link to see the details');
			 
					
			var logFileerr = fs.createWriteStream('error.txt');
			logFileerr.write(util.format(err) + '\n');

				 // var paramse = {
				   // Bucket: 'nmsdexcel',
				   // Body : fs.createReadStream(absolutepath + 'error.txt'),
				   // Key : 'error.txt'
				 // };
				 // console.log(absolutepath);
				 
				 //block the code temporarily till AWS account sort out
				 // s3.upload(paramse, function (err, data) {
				 // //handle error
				 // if (err) {
					 // console.log("upload Error", err);
				 // }
				 // });	
			   //}
			 });
		
		
			//var logFile = fs.createWriteStream('log.txt');											
			//logFile.write('There are some validation errors! Open the link to see the details' +' ' + '<a>' +  '<\a> \n');
			//console.error
		});		//end of csv validation
		
		res.write('file uploaded Successfully!');
		res.write('Running validations...');	  
		res.end();
		
		});//this is file move command; all has to go under due async
		
	 //});
   }
   else {
	   res.statusCode = 200;

//download csv
const pg = require('pg');
const pool = new pg.Pool({
user: 'postgres',
host: '127.0.0.1',
database: 'postgres',
password: '36Surrey',
port: '5432'});

function download(){
	pool.query("Copy (SELECT CASE WHEN e.localidentifier IS NULL THEN To_Char(e.id, '99999999') WHEN length(e.localidentifier) = 0 THEN To_Char(e.id, '999999999') ELSE e.localidentifier END AS LOCALESTID, wp.worker_id AS UNIQUEWORKERID, 'UNCHECKED' As STATUS, w.localidentifier AS DISPLAYID, w.postcode AS POSTCODE, CASE WHEN w.gender IS NULL THEN 3 ELSE w.gender END AS GENDER, CASE WHEN w.ethnicity = -1 THEN NULL ELSE W.Ethnicity END AS ETHNICITY, w.nationality, CASE WHEN W.Nationality = '826' THEN NULL WHEN W.IsBritishCitizen = -1 THEN 999  WHEN W.IsBritishCitizen = 0 THEN 2  ELSE W.IsBritishCitizen END AS BRITISHCITIZENSHIP, w.countryofbirth, w.yearofentry, w.disabled AS DISABLED, l3.Value AS INDSTATUS, CASE WHEN w.inductiondate > current_timestamp OR NOT l3.Value = '1' THEN ''  ELSE To_Char(w.inductiondate, 'dd/mm/yyyy') END AS INDDATE, l10.Value AS CARECERT, CASE WHEN w.carecertificatecomplete IS NULL OR l10.Value <> '1' THEN '' ELSE To_Char(w.carecertificatecomplete, 'dd/MM/yyyy') END AS CARECERTDATE, l4.Value AS RECSOURCE, To_Char(w.startdate, 'dd/mm/yyyy') AS STARTDATE, CASE WHEN W.IsApprentice = -1 THEN 999  WHEN W.IsApprentice = 0 THEN 2  ELSE W.IsApprentice END AS Apprentice, l6.Value AS EMPLSTATUS, l7.Value AS FULLTIME, CASE WHEN W.ZeroHourContract = -1 THEN 999 /* Not Known */ WHEN W.ZeroHourContract = 0 THEN 2 /* No */ ELSE W.ZeroHourContract END AS ZeroHrCont, CASE WHEN w.dayssick > 365 THEN ''  WHEN w.dayssick = -1 THEN '999' ELSE To_Char(w.dayssick, '999.9') END AS DAYSSICK, l8.Value AS SALARYINT, CASE WHEN l8.Value = '1' OR l8.Value = '2' THEN w.salary ELSE null END AS SALARY, CASE WHEN l8.Value = '3' AND wp.hourlyrate >= 4.5 OR wp.hourlyrate <= 20 THEN To_Char(wp.hourlyrate, '00.00')  ELSE '' END AS HOURLYRATE, l9.Value AS MAINJOBROLE, CASE WHEN l9.IsOther = 1 THEN wp.otherdescription ELSE '' END AS MAINJRDESC, To_Char(CASE WHEN wp.contractedhours > 65 THEN null WHEN wp.contractedhours = -1 THEN 999 WHEN l7.Value = '1' AND wp.contractedhours = 0 THEN 0 WHEN l7.Value = '1' AND wp.contractedhours < 24 THEN null WHEN l7.Value = '2' AND wp.contractedhours > 40 THEN null ELSE wp.contractedhours END, '999.9') AS CONTHOURS, To_Char(CASE WHEN wp.additionalhours > 65 THEN null WHEN wp.additionalhours = -1 THEN 999 WHEN wp.additionalhours > (2 * wp.contractedhours) THEN null ELSE wp.additionalhours END, '999.9') AS ADDLHOURS, wp.jobrolecategory AS NMCREG, wp.jobrolespecialisms AS NURSESPEC, CASE WHEN W.SocialCareQualification = 1 THEN '1' || ';' || CASE WHEN W.SocialCareQualLevel = -1 THEN '999' ELSE L11.Value END WHEN W.SocialCareQualification = 0 THEN '2' WHEN W.SocialCareQualification = -1 THEN '999' ELSE '' END AS SCQUAL, CASE WHEN W.NonSocialCareQualification = 1 THEN '1' || ';' || CASE WHEN W.NonSocialCareQualLevel = -1 THEN '999' ELSE L12.Value END WHEN W.NonSocialCareQualification = 0 THEN '2' WHEN W.NonSocialCareQualification = -1 THEN '999' ELSE '' END AS NONSCQUAL, CASE WHEN W.NoQualsWT = 1 THEN 1 ELSE NULL END AS NOQUALWT FROM nmds_live_owner.Establishment E INNER JOIN nmds_live_owner.provision p ON p.establishment_id = e.id INNER JOIN nmds_live_owner.worker_provision wop ON wop.provision_id = p.id INNER JOIN nmds_live_owner.worker wor ON wor.id = wop.worker_id LEFT OUTER JOIN nmds_live_owner.lookupitem l3 ON l3.id = wor.inductionstatus LEFT OUTER JOIN nmds_live_owner.lookupitem l4 ON l4.id = wor.sourcerecruited LEFT OUTER JOIN nmds_live_owner.lookupitem l5 ON l5.id = wor.continuity LEFT OUTER JOIN nmds_live_owner.lookupitem l6 ON l6.id = wor.employmentstatus LEFT OUTER JOIN nmds_live_owner.lookupitem l7 ON l7.id = wor.fulltime LEFT OUTER JOIN nmds_live_owner.lookupitem l8 ON l8.id = wor.salaryinterval LEFT OUTER JOIN nmds_live_owner.lookupitem l9 ON l9.id = wop.jobrole LEFT OUTER JOIN nmds_live_owner.lookupitem l10 ON l10.id = wor.carecertificate LEFT OUTER JOIN nmds_live_owner.LookupItem L11 ON L11.Id = Wor.SocialCareQualLevel LEFT OUTER JOIN nmds_live_owner.LookupItem L12 ON L12.Id = Wor.NonSocialCareQualLevel, nmds_live_owner.WORKER W  INNER JOIN nmds_live_owner.WORKER_PROVISION WP ON W.ID = WP.WORKER_ID AND WP.Provision_ID IN (12008)  LEFT OUTER JOIN ( SELECT WQ.Worker_ID, Trim(To_Char(Row_Number() over (PARTITION BY WQ.Worker_ID ORDER BY WQ.Worker_ID), '00')) AS rn, WQ.Qualification_Level_ID || ';' || WQ.AchieveDate AS QualData, WQ.Notes  FROM nmds_live_owner.Worker_Qualification WQ INNER JOIN nmds_live_owner.Worker W ON W.ID = WQ.Worker_ID INNER JOIN nmds_live_owner.Worker_Provision WP ON WP.Worker_ID = W.ID WHERE WQ.AchieveStatus = 1 AND WP.Provision_ID IN (12008) ) A ON W.ID = A.Worker_ID limit 10) To 'C:/New folder/SopraSteria-SFC-master/postgre-node/test/test.csv' With CSV DELIMITER ','", (err, res) => {
	console.log(err, res);
	pool.end();
	})
}
	//establishment
		res.write('<!DOCTYPE html><html><head></head><body>');
		res.write('<form id="sbform" action="fileupload" method="post" enctype="multipart/form-data">');
		res.write('<legend><b>Establishment</legend>');
		res.write('<fieldset style="border: 2px solid #F37622; width: 30px">');
		res.write('<input type="file" name="filetoupload" tabindex="1"><br>');
		res.write('<button id="btns" type="submit" tabindex="2">Upload</>');
		res.write('<button onclick="download()">Download</button>');
		res.write('</fieldset>');
		res.write('</form>');
	//worker
		res.write('<legend><b>Worker</legend>');
		res.write('<fieldset style="border: 2px solid #F37622; width: 30px">');
		//res.write('<input type="file" name="filetoupload1" tabindex="1"><br>');
		res.write('<button id="btns11">Choose file</>');
		res.write('<button id="btns1">Upload</>');
		res.write('<button id="btns-dl1">Download</>');
		res.write('</fieldset>');
		res.write('</form>');
	//worker qualification
		res.write('<form id="sbform2" action="fileupload" method="post" enctype="multipart/form-data">');
		res.write('<legend><b>Worker Qualification</legend>');
		res.write('<fieldset style="border: 2px solid #F37622; width: 30px">');
		//res.write('<input type="file" name="filetoupload2" tabindex="7"><br>');
		//res.write('<button id="btns2" type="submit" tabindex="8" >Upload</>');
		res.write('<button id="btns-dl2" type="download" tabindex="9">Download</>');
		res.write('</fieldset>');
		res.write('</form>');
	//message
		res.write('<legend><b>Messages</legend>');	
		res.write('<fieldset>');	
		res.write('<button id="btn">Click Refresh</button>');
		res.write('<div id="div1"><h2></h2></div>');
		res.write('</fieldset></body>');

		res.write('<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>');
		
		//res.write('<script>$(document).ready(function(){$("#btn").click(function(){$.ajax({url: "https://serverjs.cloudapps.digital/result",dataType:"text",type: "GET",success: function(data){$("#div1").html(data);}, error: function(req, st, err){alert(req + st + err);}});});});</script>');
		
		res.write('<script>$(document).ready(function(){$("#btn").click(function(){$.ajax({url: "https://devtest.cloudapps.digital/result",dataType:"text",type: "GET",success: function(data){$("#div1").html(data);}, error: function(req, st, err){alert(req + st + err);}});});});</script>');
			
		return res.end();
   }
});

server.listen(port, () => {
  console.log(`Server running on ${port}/`);
});