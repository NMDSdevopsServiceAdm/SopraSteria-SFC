var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


// API metrics
var swStats = require('swagger-stats');
// var apiSpec = require('swagger.json');


var routes = require('./server/routes/index');
var locations = require('./server/routes/locations');
var postcodes = require('./server/routes/postcodes');
var services = require('./server/routes/services');
var registration = require('./server/routes/registration');
var tmpLogin = require('./server/routes/tmpLogin');
var establishments = require('./server/routes/establishments');
var jobs = require('./server/routes/jobs');
var la = require('./server/routes/la');
var feedback = require('./server/routes/feedback');

var errors = require('./server/routes/errors');

// test only routes - helpers to setup and execute automated tests
var testOnly = require('./server/routes/testOnly');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, '/server/views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'dist/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));

// instrument routes
app.use(swStats.getMiddleware({
        //swaggerSpec:apiSpec,
        uriPath: '/metrics',
        name: 'ADS-WDS',
        version: '1.0.0',
        //ip: '127.0.0.1',
        timelineBucketDuration: 60000,
        durationBuckets: [50, 100, 200, 500, 1000, 5000],
        requestSizeBuckets: [500, 5000, 15000, 50000],
        responseSizeBuckets: [600, 6000, 6000, 60000],
    })
);


// app.use('/', routes);
app.use('/api/locations', locations);
app.use('/api/postcodes', postcodes);
app.use('/api/services', services);
app.use('/api/registration', registration);
app.use('/api/errors', errors);
app.use('/api/login', tmpLogin);
app.use('/api/establishment', establishments);
app.use('/api/jobs', jobs);
app.use('/api/localAuthority', la);
app.use('/api/feedback', feedback);
app.use('/api/test', testOnly);

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


var debug = require('debug')('server');

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'));

console.log('Listening on port: ' + app.get('port'));

module.exports = app;
