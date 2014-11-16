var   _  = require('underscore')
    , os = require('os');

var   defaultSuffixStr
    , defaultHostsObj
    , configObj
    , hostsObj
    , suffixStr
    , hostName
    , environment;

defaultSuffixStr = '_CONFIGURATOR';

defaultHostsObj = {
  development : 'dev',
  test        : 'test',
  staging     : 'stage',
  production  : '.*'
};



// Return the FIRST key (environment) in hostsObj that has a regexp string value that matches the given hostName
// NOTE: This is not, theoretically, deterministic!
getEnvironment = function(hostName, hostsObj) {
  'use strict';
  var environment, re;

  if ( ! hostName ) { return null; }
  if ( ! hostsObj ) { return null; }

  environment = null;
  _.each(hostsObj, function(val, key) {
    if ( _.isString(val) ) {
      re = new RegExp(val);
      if ( re.test(hostName) ) {
      	if ( environment === null ) {
          environment = key;
        } 
      }
    } else if ( _.isArray(val) ) {
      _.each(val, function(subVal) {
        re = new RegExp(subVal);
        if ( re.test(hostName) ) {
          if ( environment === null ) {
            environment = key;
          }
        }
      });
    }
  });

  return environment;
};



// Return the value for the key <environment> within valObj overlayed on top of
// the value for the key's 'parent' environment overlayed on top of
// the value for the key 'default' within valObj
// Assumes that the valObj given has an optional default key and one or more
// environment names as keys (not intended for use with any ol' object)
getValueForEnvironment = function(valObj, environment) {
  'use strict';
  var val;
  
  val = null;
  // Start with a 'default' value, if there is one
  if ( valObj.hasOwnProperty('default') ) {
    val = valObj.default;
  }
  // Overlay host environment-specific value, if there is one
  if ( valObj.hasOwnProperty(environment) ) {
  	if ( ( _.isObject(val) ) && ( _.isObject(valObj[environment]) ) ) {
      // "Overlay" environment-specific keys on top of default keys
      val = _.extend(val, valObj[environment]);
    } else {
      // Complete replacement value that replaces any default value
      val = valObj[environment];
    }
  }

  return val;
};



// Returns deep copy of given configObj but where any/all keys (recursively) that have
// the suffixStr suffix suffix on them "processed" so that:
// - the key is replaced by the key without the suffix string (e.g., foo_DSCO -> foo)
// - the value is replaced by the results of calling getValueForEnvironment()
//   on the value. That is, take the appropriate environment-specific value
//   (after having used any default value, if present).
hardenConfigObject = function(originalConfigObj, suffixStr, environment) {
  'use strict';
  var configObj;
  
  // Deep copy given configObj so as to not mutate it. Not fast, but probably okay.
  configObj = JSON.parse(JSON.stringify(originalConfigObj));
  
  if ( configObj === null ) {
  	return null;
  } else if ( typeof configObj === 'undefined' ) {
  	return undefined;
  } else if ( _.isArray(configObj) ) {
    return _.map(configObj, function(item) { return hardenConfigObject(item, suffixStr, environment); });
  } else if ( _.isObject(configObj) ) {
    _.each(configObj, function(val, key) {
      if ( key.indexOf(suffixStr, key.length - suffixStr.length) !== -1 ) {
        // Key (environment) ends with suffixStr... deployment specific!)
        delete configObj[key];
        configObj[key.substr(0, key.indexOf(suffixStr))] = getValueForEnvironment(val, environment);
      } else {
        // A "regular" key... not deployment specific
        configObj[key] = hardenConfigObject(val, suffixStr, environment);
      }
    });
  } else {
  	return configObj;
  }
  return configObj;
};



// * pConfigObj is mandatory
// * If no pHostsObj is given, a default hosts object will be used
// * If no pSuffixStr is given, '_DSCO' will be used
// * If no pEnvironment is given, the environment of the 
//   current hostname (using os.hostname()) will be used

// Main entry point
// Returns hardened configuration object based on provided config object.
// Returns null if args is null or if args.config is null.
// Arguments:
// - args.config - Mandatory
// - args.hosts  - Optional; defaultHostsObj will be used if not specified
// - args.env    - Optional; environment of current host will be used if not specified
// - args.suffix - Optional; '_CONFIGURATOR' will be used if not specified
init = function(args) {
  'use strict';
  var configObj, hostsObj, suffixStr, hostName, environment;

  if ( ! args ) { return null; }
  if ( ! args.config ) { return null; }

  configObj = args.config;
  hostsObj  = args.hosts || defaultHostsObj;
  hostName  = os.hostname();
  environment = args.env || getEnvironment(hostName, hostsObj);
  suffixStr = args.suffix || defaultSuffixStr;

  configObj = hardenConfigObject(configObj, suffixStr, environment);
  configObj['__CONFIGURATOR_ENVIRONMENT__'] = environment;
  return configObj;
}



// Only for unit testing purposes
exports.private = {};
exports.private.getEnvironment         = getEnvironment;
exports.private.getValueForEnvironment = getValueForEnvironment;
exports.private.hardenConfigObject     = hardenConfigObject;

// Public API
exports.init = init;
