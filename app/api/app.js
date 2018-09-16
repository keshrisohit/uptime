/**
 * Module dependencies.
 */
var express    = require('express');
var Check      = require('../../models/check');
var CheckEvent = require('../../models/checkEvent');

var app = module.exports = express();

var debugErrorHandler = function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

// middleware
//app.use(app.router);

if(process.env.NODE_ENV === 'production') {
  app.use(express.errorHandler());
  // additional prod environemtn configuration
}


if(process.env.NODE_ENV === 'development') {
  app.use(debugErrorHandler)
  // additional prod environemtn configuration
}


if(process.env.NODE_ENV === 'test') {
  app.use(debugErrorHandler)
  // additional prod environemtn configuration
}




// up count
var upCount;
var refreshUpCount = function(callback) {
  var count = { up: 0, down: 0, paused: 0, total: 0 };
  Check
  .find()
  .select({ isUp: 1, isPaused: 1 })
  .exec(function(err, checks) {
    if (err) return callback(err);
    checks.forEach(function(check) {
      count.total++;
      if (check.isPaused) {
        count.paused++;
      } else if (check.isUp) {
        count.up++;
      } else {
        count.down++;
      }
    });
    upCount = count;
    callback();
  });
};

Check.on('afterInsert', function() { upCount = undefined; });
Check.on('afterRemove', function() { upCount = undefined; });
CheckEvent.on('afterInsert', function() { upCount = undefined; });

app.get('/checks/count', function(req, res, next) {
  if (upCount) {
    res.json(upCount);
  } else {
    refreshUpCount(function(err) {
      if (err) return next(err);
      res.json(upCount);
    });
  }
});

// Routes

require('./routes/check')(app);
require('./routes/tag')(app);
require('./routes/ping')(app);

// route list
app.get('/', function(req, res) {
  var routes = [];
  for (var verb in app.routes) {
    app.routes[verb].forEach(function(route) {
      routes.push({method: verb.toUpperCase() , path: app.route + route.path});
    });
  }
  res.json(routes);
});

if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
