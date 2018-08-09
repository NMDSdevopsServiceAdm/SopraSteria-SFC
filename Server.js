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

				res.write('<script>$(document).ready(function(){$("#btn1").click(function(){$.ajax({url: "http://localhost:3000/cqcresult",dataType:"text",type: "GET",success: function(data){$("#div2").html(data);}, error: function(req, st, err){alert(req + st + err);}});});});</script>');
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
		 });
	   
		fss.move(oldpath, newpath, function (err) {
		   if (err) throw err;
		
		
		// Validation schema goes here. Validation is using a node js module called csv validator
		const csvFilePath = newpath;
	    const headers = {
				name: '', // any string
				phone: 1, // any number
				email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ // RegExp
				
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

		res.write('<!DOCTYPE html><html><head></head><body>');
		res.write('<form id="sbform" action="fileupload" method="post" enctype="multipart/form-data">');
		res.write('<legend><b>Browse & Upload File (CI and CD working)</legend>');
		res.write('<fieldset style="border: 2px solid #F37622; width: 30px">');
		res.write('<input type="file" name="filetoupload" tabindex="1"><br>');
		res.write('<button id="btns" type="submit" tabindex="2" >submit</>');
		res.write('</fieldset>');
		res.write('</form>');
		res.write('<legend><b>Messages</legend>');	
		res.write('<fieldset>');	
		res.write('<button id="btn">Click Refresh</button>');		
		res.write('<div id="div1"><h2></h2></div>');
		res.write('</fieldset>');
			
		res.write('</body>');
		res.write('<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>');
		
		//res.write('<script>$(document).ready(function(){$("#btn").click(function(){$.ajax({url: "https://serverjs.cloudapps.digital/result",dataType:"text",type: "GET",success: function(data){$("#div1").html(data);}, error: function(req, st, err){alert(req + st + err);}});});});</script>');
		
		res.write('<script>$(document).ready(function(){$("#btn").click(function(){$.ajax({url: "http://localhost:3000/result",dataType:"text",type: "GET",success: function(data){$("#div1").html(data);}, error: function(req, st, err){alert(req + st + err);}});});});</script>');
			
		return res.end();
   }
});

server.listen(port, () => {
  console.log(`Server running on ${port}/`);
});