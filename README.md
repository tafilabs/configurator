Configurator
============

Configurator is a node.js module that provides a simple way to create and use configuration 
files (JSON files) that:

* abstracts logical "environments" such as development, test, staging, and production
* contain a mix of environment-specific and "universal" settings
* keep things as DRY as possible:
    * Non-environment-specific configuration settings do not need to be repeated.
      (Environment-specific settings are overlayed over "default" settings for all environments.)
    * An environment can "inherit" and override settings for another environment
      (Example: a set of developer environments can inherit from a shared "development environment.)
* allow configuration defaults and environment-specific overrides to be specified together in a single 
  file rather than across multiple files, for easier maintenance and fewer defects
* supports encrpyted passwords

## Installation

  Use an appropriate git version tag to install the desired version of this package.

    $ npm install --save https://github.com/tafilabs/configurator.git#v1.0.1

  Using a git remote url to specify this package can also be used in a 'package.json' file
  to specify this package as a dependency:

  ```
{
  "dependencies": {
    ...
    "configurator": "https://github.com/tafilabs/configurator.git#v1.0.1",
    ...
  }
}
```

A list of tags for this repository is available on GitHub.

## Example Usage

```
var configurator, config;

configurator = require('configurator');
config = configurator.init({
    config : require('config.json'), 
    hosts  : require('hosts.json'),
    env    : (process.env.NODE_ENV || '').toLowerCase()
});

console.log('----------------------------------------------------------------------');
console.log('Using ' + config['__CONFIGURATOR_ENV__'] + ' configuration settings (My Project Name)...');
console.log('----------------------------------------------------------------------');
console.log(config);
console.log('----------------------------------------------------------------------');

...config.foo.bar...
```

Note that this example allows an environment variable, NODE_ENV, to be used to override the environment that 
will otherwise be used based on the current hostname (as returned by os.hostname()). You can leave 
the env key out of the configurator.init() call (in which case the environment of the current host will be
used), or hard-code it to a specific environment (for testing, say).

## Hosts File Syntax

Your hosts.json file should be a regular JSON file containing one top-level object. This object
should contain one or more key-value pairs where the keys are "environments" (e.g.,
"dev", "test", "stage", "prod"). The values for each key should either be:

* A regular expression string (suitable for use like: var re = new RegExp(\<s\>))
* An array of regular expression strings
* An object with two keys, 'parent' (which holds another environment name) and 'hosts' 
  (which holds a value of one of the previous two types) (See below.)

The regular expressions (values) should match (or not match) **hostnames** (as returned by os.hostname()).

**Note that the "FIRST" matching entry in the hosts file/object will be the one used.**
(The order of key processing is not well defined.)

## Sample hosts.json file

```
{
  "ernie" : { "parent": "dev", "hosts: "dev01" },
  "bert"  : { "parent": "dev", "hosts: "dev02" },
  "dev"   : "dev",
  "test"  : "test",
  "stage" : [ "stage", "stg17" ],
  "prod"  : ".*"
}
```

See below for information about the default hosts.json file that will be used if you
do not supply one.

Comments:

* A development environment, dev, is specified, as are two "child" environments, ernie and bert.
  The config.json file could specify some values for the dev environment, which would be shared
  by both the ernie and bert environments, and/or can specify values for either/both the ernie
  or bert environments, which would override any set for the dev environment.
* The machine "stg17" is to be considered a stage machine (along with any machine with 'stage' 
  in its name) even though its name does not contain the string 'stage'.
* Any other host would be treated as a production environment.

## Config File Syntax

Your config.json file should be a regular JSON file containing one top-level object. This object 
(with some post-processing; see below) is returned by configurator.init(). Any key-value pairs may
be included in the config object, including arbitrarily-nested value objects containing other 
key-value pairs, etc.

If the value for a given key is not environment-specific, simply use the (universal) value as the value
for the key in question (or an entire JSON object if a set of values is organized into a
"sub-object").

**If the value for a given key *is* environment-specific, suffix the key with "_CONFIGURATOR" and 
then organize the value(s) for the key into an object that has one or more keys that 
are either 'default' or one of the environment keys in your hosts.json file.**

NOTE: You may also use your own suffix string other than "_CONFIGURATOR"; If you do, be sure to pass 
the suffix string you use as the value for the key 'prefix' when calling configurator.init().

NOTE: It is assumed that no environment-specific keys (suffixed with _CONFIGURATOR or similar)
will exist under an evironment-specific key. That is, while environment-specific keys may
appear anywhere in the config file (depth-wise), there cannot be one within a child node
of another one.

## Sample config.json file

```
{

  timeout: 3000,
  
  "amazonS3": {
    "baseUrl": "https://s3-us-west-2.amazonaws.com/com.company.project",
    "defaultImageFileName": "DEFAULT-IMAGE.png"
  },
  
  "session_CONFIGURATOR": {
    "default": {
      "secret": "abc",
      "maxAge": "10000"
    },
    prod: {
      "maxAge": "3000"
    }
  },
  
  "db_CONFIGURATOR": {
    "dev": {
      "hostName" : "testdb",
      "port"     : 1234,
      "userName" : "bananamantest",
      "password" : "password"
    },
    "test": {
      "hostName" : "testdb",
      "port"     : 1234,
      "userName" : "bananamantest",
      "password" : "password"
    },
    "stage": {
      "hostName" : "proddb",
      "port"     : 5678,
      "userName" : "bananaman",
      "password" : "password"
    },
    "prod": {
      "hostName" : "proddb",
      "port"     : 5678,
      "userName" : "bananaman",
      "password" : "password"
    } 
  }
  
}
```

Comments:

* The config.timeout value will be 3000 for all environments. This is an example of a "simple" or 
  "normal" atomic value for a key.
* The config.amazonS3.baseUrl and config.amazonS3.defaultImageImageFileName values will be as given 
  for all environments. This is an example of a "simple" or "normal" set of values grouped under a 
  sub-object for organizational purposes.
* The session.maxAge value will be 10000 on all environments except on production where it will be 3000.
* The session.secret value will be 'abc' on all environments because it is provided in the default key's value.
* The db settings will be as shown. E.g., the production database will be used on stage and prod environments 
  while the test database will be used on dev and test environments.


## API

The configurator object returned by require('configurator') has a single method:

```
config = configurator.init({
    config   : <configObject>,
    hosts    : <hostsObject>,
    env      : <envString>,
    suffix   : <suffixString>
});
```

Notes:

* Only the config key-value pair is required; it contains your configuration information.
  That said, you probably also need your own hosts key-value pair. (See below for information
  about the default hosts object that will be used if you do not specify one.)
* Instantiated objects should be passed for config and hosts (not file names). 
  You can use require('<fileName>') to create/produce these.
* If no hosts key-value pair is given, a default hosts object will be used (see below).
* If no env key-value is given, the environment of the current hostname (as defined by the hosts 
  object) will be used. This is the "normal" mode of operation.
* A key ('__CONFIGURATOR_ENVIRONMENT__') will be added to the configuration object indicating 
  which environment was used for hardening.
* If no suffix is given, '_CONFIGURATOR' will be used/expected as the suffix string on keys within 
  the configuration file for which you have specified environment-specific values.

### Default Hosts Object

If no hosts key-value pair is provided to the configurator.init() call, this is the hosts object that 
will be used:

```
{
  "dev"   : "dev",
  "test"  : "test",
  "stage" : "stage",
  "prod"  : ".*"
}
```

Note that this means that any hostname that doesn't contain 'dev', 'test', or 'stage' will be treated as a 
production environment.
 
## Running Tests

 To run the test suite, first invoke the following command within the repo, which installs the development dependencies:

     $ npm install

 then run the tests:

     $ npm test
