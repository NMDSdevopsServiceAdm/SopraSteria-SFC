'use strict';

// This file abstracts away details of how to easily and safely run a query
// using the existing database connection pool, but avoiding most of the
// complexity introduced by Sequelize.

// Used to easily validate the parameters to the query
const ajv = (new (require('ajv'))());

// Shorthand for hasOwnProperty that also works with bare objects
const hasProp = (obj, prop) =>
  Object.prototype.hasOwnProperty.bind(obj)(prop);

// A nice succinct way to validate the query parameters
const schema = {
  type: 'object',
  required: ['replacements', 'type'],
  additionalProperties: false,
  properties: {
    replacements: {
      type: 'object'
    },
    type: {
      type: 'string'
    }
  }
};

const invalidQueryParameters = 'Invalid query parameters';

// Prevents accidental sql injection by ensuring *named* query
// replacements are always used and there are no comments
// also column names must be specified (select * is filtered out)
const mustUseReplacementsRegex = /(\*|--|[?'0-9])/g;

// The main project file exports the db connection pool
const db = rfr('server/models');

// listen for the db ready event, and let the queries we've queued up all run when it's recieved
let subscribers = []; // Pub/sub FTW!
db.status.on(db.status.READY_EVENT, () => {
  console.log('Resolving queued queries:', subscribers.length);

  subscribers.forEach(elem => elem());

  subscribers = [];
});

// Needed to satisfy Sequelize's QueryTypes stuff
const { QueryTypes } = require('sequelize');

// Export sequelize's querytypes param for convienience
exports.QueryTypes = QueryTypes;

// Export our query function
exports.query = async (query, params) => {
  try {
    // Use ajv.compile in this closure so the validation errors won't be global
    const validate = ajv.compile(schema);

    // Validate the parameters to ensure replacements are always used
    if (!validate(params)) {
      // log out the validation errors for debugging
      console.log(invalidQueryParameters, validate.errors);

      throw new Error(invalidQueryParameters);
    }

    // Assert that the query type is in sequelize's list
    if (!hasProp(QueryTypes, params.type)) {
      throw new Error(`Invalid query type: ${params.type}`);
    }

    // Ensure the query doesn't have any hard coded values or comments in it
    if (mustUseReplacementsRegex.test(query)) {
      throw new Error(`Hard coded values, comments and * are not allowed: ${query}`);
    }

    // Everything's ok to run, but the connection pool hasn't been initialised yet.
    // Return a promise in the meantime
    if (!(db.status.ready)) {
      return (new Promise(resolve => {
        subscribers.push(resolve);
      }))
        .then(() => db.sequelize.query(query, params));
    }

    return db.sequelize.query(query, params);
  } catch(e) {
    return Promise.reject(e);
  }
};
