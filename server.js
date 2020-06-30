var config = require('./server/config/config');
const Sentry = require('@sentry/node');
const beeline = require('honeycomb-beeline')({
  dataset: config.get('env'),
  serviceName: "sfc",
  express: {
    userContext: ["id", "username"],
    parentIdSource: 'X-Honeycomb-Trace',
    traceIdSource: 'X-Honeycomb-Trace'
  }
});

var express = require('express');

const logger = require('./server/utils/logger')

var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var proxy = require('express-http-proxy');          // for service public/download content

// app config
var AppConfig = require('./server/config/appConfig');

// caching middleware - ref and transactional
var cacheMiddleware = require('./server/utils/middleware/noCache');
var refCacheMiddleware = require('./server/utils/middleware/refCache');

// security libraries
var helmet = require('helmet');
var xssClean = require('xss-clean');
var sanitizer = require('express-sanitizer');

// API metrics
var swStats = require('swagger-stats');

var routes = require('./server/routes/index');
var locations = require('./server/routes/locations');
var postcodes = require('./server/routes/postcodes');
var services = require('./server/routes/services');
var registration = require('./server/routes/registration');
var establishments = require('./server/routes/establishments');
var ownershipRequest = require('./server/routes/ownershipRequest');
var linkParent = require('./server/routes/parentSubLinking');
var jobs = require('./server/routes/jobs');
var la = require('./server/routes/la');
var feedback = require('./server/routes/feedback');
var login = require('./server/routes/login');
var ethnicity = require('./server/routes/ethnicity');
var country = require('./server/routes/country');
var nationality = require('./server/routes/nationalities');
var qualification = require('./server/routes/qualifications');
var recruitedFrom = require('./server/routes/recruitedFrom');
var user = require('./server/routes/accounts/user');
var workerLeaveReasons = require('./server/routes/workerReason');
var serviceUsers = require('./server/routes/serviceUsers');
var workingTrainingCategories = require('./server/routes/workerTrainingCategories');
var nurseSpecialism = require('./server/routes/nurseSpecialism');
var availableQualifications = require('./server/routes/availableQualifications');
var approvals = require('./server/routes/approvals');

// admin route
var admin = require('./server/routes/admin');

// reports
var ReportsRoute = require('./server/routes/reports/index');

var errors = require('./server/routes/errors');

// Kinesis and SNS
const AWSKinesis = require('./server/aws/kinesis');
const AWSsns = require('./server/aws/sns');
AWSKinesis.initialise(config.get('aws.region'));
AWSsns.initialise(config.get('aws.region'));

// test only routes - helpers to setup and execute automated tests
var testOnly = require('./server/routes/testOnly');

var app = express();
app.use(Sentry.Handlers.requestHandler());

/* public/download - proxy interception */
const publicDownloadBaseUrl = config.get('public.download.baseurl');
app.use('/public/download', proxy(
    publicDownloadBaseUrl,
    {
        proxyReqPathResolver: function (req) {
          const updatedPath = publicDownloadBaseUrl + req.url;
          //console.log("public/download proxy API request to: ", `${updatedPath}`)
          return updatedPath;
        }
    }
));

// redirect the admin application
app.use('/admin', (req, res) => {
  res.redirect(301, config.get('admin.url'));
});

/*
 * security - incorproate helmet & xss-clean (de facto/good practice headers) across all endpoints
 */

// exclude middleware for given API path - used to exclude xss-clean to be able to demonstrate express-sanitizer on /api/test
var unless = function(root, path, middleware) {
    return function(req, res, next) {
        const rootRegex = new RegExp('^' + root);
        const excludePathRegex = new RegExp('^' + root + '/' + path);

        // first, if the exclude root, simply move on
        if (excludePathRegex.test(req.path)) {
            return next();
        } else if (rootRegex.test(req.path)) {
            // matches on the root path, and is not excluded
            return middleware(req, res, next);
        } else {
            // doesn't match the root path, so move on
            return next();
        }
    };
};

// disable Helmet's caching - because we control that directly - cahcing is not enabled by default; but explicitly disabling it here
// set frame policy to deny
// only use on '/api' endpoint, because these changes may otherwise impact on the UI.
app.use('/api', helmet({
    noCache: false,
    frameguard: {
        action: 'deny'
    },
    contentSecurityPolicy : {
        directives: {
            defaultSrc: ["'self'"]
        }
    }
}));

// encodes all URL parameters
app.use(unless('/api', 'test', xssClean()));

/*
 * end security
 */

// view engine setup
app.set('views', path.join(__dirname, '/server/views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'dist/favicon.ico')));
app.use(morgan('short', { stream: {write: (text) => { logger.info(text.replace(/\n$/, '')); } } }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/*
 * security - removes unwanted HTML from data
 */

app.use('/api/test', sanitizer());       // used as demonstration on test routes only

/*
 * end security
 */

 // metrics should not be available in 'production' style environments like tets and UAT.
if (process.env.NODE_ENV !== 'production') {
    app.use(swStats.getMiddleware({
            //swaggerSpec:apiSpec,
            uriPath: '/apimetrics',
            name: 'ADS-WDS',
            version: '1.0.0',
            //ip: '127.0.0.1',
            timelineBucketDuration: 60000,
            durationBuckets: [50, 100, 200, 500, 1000, 5000],
            requestSizeBuckets: [500, 5000, 15000, 50000],
            responseSizeBuckets: [600, 6000, 6000, 60000],
        })
    );
}

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));

// open/reference endpoints
app.use('/api/services', [refCacheMiddleware.refcache, services]);
app.use('/api/ethnicity', [refCacheMiddleware.refcache, ethnicity]);
app.use('/api/country', [refCacheMiddleware.refcache, country]);
app.use('/api/nationality', [refCacheMiddleware.refcache, nationality]);
app.use('/api/qualification', [refCacheMiddleware.refcache, qualification]);
app.use('/api/recruitedFrom', [refCacheMiddleware.refcache, recruitedFrom]);
app.use('/api/jobs', [refCacheMiddleware.refcache, jobs]);
app.use('/api/localAuthority', [refCacheMiddleware.refcache, la]);
app.use('/api/worker/leaveReasons', [refCacheMiddleware.refcache, workerLeaveReasons]);
app.use('/api/serviceUsers', [refCacheMiddleware.refcache, serviceUsers]);
app.use('/api/trainingCategories', workingTrainingCategories);
app.use('/api/nurseSpecialism', [refCacheMiddleware.refcache, nurseSpecialism]);
app.use('/api/availableQualifications', [refCacheMiddleware.refcache, availableQualifications]);

// transaction endpoints
app.use('/api/errors', errors);
app.use('/api/locations', [cacheMiddleware.nocache, locations]);
app.use('/api/postcodes', [cacheMiddleware.nocache, postcodes]);
app.use('/api/registration', [cacheMiddleware.nocache, registration]);
app.use('/api/login', [cacheMiddleware.nocache, login]);
app.use('/api/establishment', [cacheMiddleware.nocache,establishments]);
app.use('/api/ownershipRequest', [cacheMiddleware.nocache,ownershipRequest]);
app.use('/api/parentLinkingDetails', [cacheMiddleware.nocache,linkParent]);
app.use('/api/feedback', [cacheMiddleware.nocache, feedback]);
app.use('/api/test', [cacheMiddleware.nocache,testOnly]);
app.use('/api/user', [cacheMiddleware.nocache, user]);
app.use('/api/reports', [cacheMiddleware.nocache, ReportsRoute]);

app.use('/api/admin', [cacheMiddleware.nocache, admin]);
app.use('/api/approvals', [cacheMiddleware.nocache, approvals]);

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.use(Sentry.Handlers.errorHandler());

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

const startApp = () => {
    if (config.get('honeycomb.write_key')) {
      beeline._apiForTesting().honey.writeKey = config.get('honeycomb.write_key');
    }
    if (config.get('sentry.dsn')) {
      Sentry.init({ dsn: config.get('sentry.dsn'), environment: config.get('env') });
    }
    logger.start();
    const listenPort = parseInt(config.get('listen.port'), 10);
    app.set('port', listenPort);
    app.listen(app.get('port'));
    console.log('Listening on port: ' + app.get('port'));
};

if (AppConfig.ready) {
    startApp();
} else {
    AppConfig.on(AppConfig.READY_EVENT, () => {
        startApp();
    });
}

module.exports = app;
