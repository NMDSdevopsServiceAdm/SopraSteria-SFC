var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var proxy = require('express-http-proxy');
var app = express();

const apiEndpoint = process.env.API_PROXY || 'https://sfcdev.cloudapps.digital';

app.get('/api/mock', function(req, res) {
    console.log("Hitting endpoint /api/mock")
    res.send({
        mock: "our world"
    });
});
app.use('/api', proxy(
    apiEndpoint,
    {
        proxyReqPathResolver: function (req) {
          const updatedPath = '/api' + req.url;
          console.log("Proxy API request to: ", `${apiEndpoint}${updatedPath}`)
          return updatedPath;
        }
    }
));

// view engine setup
app.set('views', path.join(__dirname, '/server/views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'dist/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));

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

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));

console.log('Listening on port: ' + app.get('port'));

module.exports = app;
