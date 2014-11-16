'use strict';

var configurator = require('../index.js');

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

// sample tests
describe('CONFIGURATOR', function() {
  'use strict';
  var hostsObj1, hostsObj2, hostsObj3, defaultHostsObj, configObj1, configObj2;

  hostsObj1 = {
    dev   : 'dev',
    test  : 'test',
    stage : 'stage',
    prod  : 'prod'
  };

  hostsObj2 = {
    mike  : 'dev69',
    simon : 'dev22',
    dev   : 'dev',
    test  : 'test',
    stage : 'stage',
    prod  : '.*'
  };

  hostsObj3 = {
    dev   : [ 'dev', 'localhost', '127.0.0.1' ],
    test  : 'test',
    stage : [ 'stage', '^stg17$' ],
    prod  : '.*'
  };

  defaultHostsObj = {
    dev   : 'dev',
    test  : 'test',
    stage : 'stage',
    prod  : '.*'
  };

  configObj1 = {
    a: 1,
    b: {
      b1: 21,
      b2: 22
    },
    c_CONFIGURATOR: {
      default: '3Default',
      dev: '3Dev',
      prod: '3Prod'
    },
    d_CONFIGURATOR: {
      default: {
        d1: '41Default',
        d2: '42Default'
      },
      dev: {
        d1: '41Dev'
      },
      prod: {
        d1: '41Prod',
        d3: '43ProdEXTRA'
      }
    },
    e: [ 5, 5, 5, 5, 5 ],
    f: {
      f1: '61',
      f2_CONFIGURATOR: {
        default: '62Default',
        dev: '62Dev',
        prod: '62Prod'
      },
      f3: '63'
    }
  };

  configObj2 = {
    "fromEmail": "seeit@seeit.com",
    "amazonS3": {
      "baseUrl": "https://s3-us-west-2.amazonaws.com/com.company.project",
      "defaultImageFileName": "DEFAULT-IMAGE.png"
    },
    "session_CONFIGURATOR": {
      "default": {
        "secret": "abc",
        "maxAge": "3000000000"
      },
      prod: {
        "maxAge": "1000000000"
      }
    },
    "db_CONFIGURATOR": {
      "dev": {
        "hostName" : "testdb",
        "port"     : 6614,
        "userName" : "seeitcoretest",
        "password" : "password"
      },
      "test": {
        "hostName" : "testdb",
        "port"     : 6614,
        "userName" : "seeitcoretest",
        "password" : "password"
      },
      "stage": {
        "hostName" : "proddb",
        "port"     : 6614,
        "userName" : "seeitcore",
        "password" : "password"
      },
      "prod": {
        "hostName" : "proddb",
        "port"     : 6614,
        "userName" : "seeitcore",
        "password" : "password"
      } 
    }
  };
  
  describe('.getEnvironment()', function() {

    it('should return null if no hostName is given', function() {
      assert.equal(configurator.private.getEnvironment(null, { dummy: 'DUMMY' }), null);
    });

    it('should return null if no hostsObj is given', function() {
      assert.equal(configurator.private.getEnvironment('someHost', null), null);
    });

    it('should return null if matching key not found in hostsObj', function() {
      assert.equal(configurator.private.getEnvironment('unfoundHost', hostsObj1), null);
    });

    it('should return "dev" for "dev69" for hostsObj1', function() {
      assert.equal(configurator.private.getEnvironment('dev69', hostsObj1), 'dev');
    });

    it('should return "test" for "test01" for hostsObj1', function() {
      assert.equal(configurator.private.getEnvironment('test01', hostsObj1), 'test');
    });

    it('should return "stage" for "stage01" for hostsObj1', function() {
      assert.equal(configurator.private.getEnvironment('stage01', hostsObj1), 'stage');
    });

    it('should return "simon" for "dev22" for hostsObj2', function() {
      assert.equal(configurator.private.getEnvironment('dev22', hostsObj2), 'simon');
    });

    it('should return "dev" for "dev55" for hostsObj2', function() {
      assert.equal(configurator.private.getEnvironment('dev55', hostsObj2), 'dev');
    });

    it('should return "test" for "test02" for hostsObj2', function() {
      assert.equal(configurator.private.getEnvironment('test02', hostsObj2), 'test');
    });

    it('should return "prod" for "seeit01" for hostsObj2', function() {
      assert.equal(configurator.private.getEnvironment('seeit01', hostsObj2), 'prod');
    });

    it('should return "dev" for "dev55" for hostsObj3', function() {
      assert.equal(configurator.private.getEnvironment('dev55', hostsObj3), 'dev');
    });

    it('should return "dev" for "localhost" for hostsObj3', function() {
      assert.equal(configurator.private.getEnvironment('localhost', hostsObj3), 'dev');
    });

    it('should return "stage" for "stg17" for hostsObj3', function() {
      assert.equal(configurator.private.getEnvironment('stg17', hostsObj3), 'stage');
    });

    it('should return "prod" for "BLAHstg17BLAH" for hostsObj3', function() {
      assert.equal(configurator.private.getEnvironment('prod', hostsObj3), 'prod');
    });

  });

  describe('.getValueForEnvironment', function() {

    it('should return null if environment and default not found in valObj', function() {
      assert.equal(configurator.private.getValueForEnvironment({}, 'dev'), null);
    });

    it('should return default value if environment home found but default found in valObj', function() {
      assert.equal(configurator.private.getValueForEnvironment({ default: 'DEFAULT', prod: 'PROD' }, 'dev'), 'DEFAULT');
    });

    it('should return environment-specific value if environment home and default found in valObj and non-object values', function() {
      assert.equal(configurator.private.getValueForEnvironment({ default: 'DEFAULT', prod: 'PROD' }, 'prod'), 'PROD');
    });

    it('should return environment-specific values overlayed on default object values if object values', function() {
      assert.deepEqual(configurator.private.getValueForEnvironment({ default: { a: 1, b: 2 }, prod: { a: 11 } }, 'prod'), { a: 11, b: 2 });
    });

    it('should return extra environment-specific values not present in default object values when on that kind of host', function() {
      assert.deepEqual(configurator.private.getValueForEnvironment({ default: { a: 1, b: 2 }, prod: { a: 11, c: 3 } }, 'prod'), { a: 11, b: 2, c: 3 });
    });

    it('should not return extra environment-specific values not present in default object values when not on that kind of host', function() {
      assert.deepEqual(configurator.private.getValueForEnvironment({ default: { a: 1, b: 2 }, prod: { a: 11, c: 3 } }, 'dev'), { a: 1, b: 2 });
    });

  });

  describe('.hardenConfigObject', function() {
    
    it('hardening configObj1.a should always give 1: dev', function() {
      assert.equal(configurator.private.hardenConfigObject(configObj1.a, '_CONFIGURATOR', 'dev'), 1);
    });
    it('hardening configObj1.a should always give 1: test', function() {
      assert.equal(configurator.private.hardenConfigObject(configObj1.a, '_CONFIGURATOR', 'test'), 1);
    });
    it('hardening configObj1.a should always give 1: stage', function() {
      assert.equal(configurator.private.hardenConfigObject(configObj1.a, '_CONFIGURATOR', 'stage'), 1);
    });
    it('hardening configObj1.a should always give 1: prod', function() {
      assert.equal(configurator.private.hardenConfigObject(configObj1.a, '_CONFIGURATOR', 'prod'), 1);
    });
    
    it('hardening configObj1.b should always give { b1: 21, b2: 22}: dev', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1.b, '_CONFIGURATOR', 'dev'), { b1: 21, b2: 22 });
    });
    it('hardening configObj1.b should always give { b1: 21, b2: 22}: test', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1.b, '_CONFIGURATOR', 'test'), { b1: 21, b2: 22 });
    });
    it('hardening configObj1.b should always give { b1: 21, b2: 22}: stage', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1.b, '_CONFIGURATOR', 'stage'), { b1: 21, b2: 22 });
    });
    it('hardening configObj1.b should always give { b1: 21, b2: 22}: prod', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1.b, '_CONFIGURATOR', 'prod'), { b1: 21, b2: 22 });
    });
    
    it('hardening configObj1.c should give 3Dev on dev', function() {
      assert.equal(configurator.private.hardenConfigObject(configObj1, '_CONFIGURATOR', 'dev').c, '3Dev');
    });
    it('hardening configObj1.c should give 3Default on test', function() {
      assert.equal(configurator.private.hardenConfigObject(configObj1, '_CONFIGURATOR', 'test').c, '3Default');
    });
    it('hardening configObj1.c should give 3Default on stage', function() {
      assert.equal(configurator.private.hardenConfigObject(configObj1, '_CONFIGURATOR', 'stage').c, '3Default');
    });
    it('hardening configObj1.c should give 3Prod on prod', function() {
      assert.equal(configurator.private.hardenConfigObject(configObj1, '_CONFIGURATOR', 'prod').c, '3Prod');
    });

    it('hardening configObj1.d should give {d1:41Dev, d2:42Default} on dev', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1, '_CONFIGURATOR', 'dev').d, { d1:'41Dev', d2:'42Default' });
    });
    it('hardening configObj1.d should give {d1:41Default, d2:42Default} on test', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1, '_CONFIGURATOR', 'test').d, { d1:'41Default', d2:'42Default'} );
    });
    it('hardening configObj1.d should give {d1:41Default, d2:42Default} on stage', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1, '_CONFIGURATOR', 'stage').d, { d1:'41Default', d2:'42Default'} );
    });
    it('hardening configObj1.d should give {d1:41Prod, d2:42Default, d3:43ProdEXTRA} on prod', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1, '_CONFIGURATOR', 'prod').d, { d1:'41Prod', d2:'42Default', d3:'43ProdEXTRA'} );
    });

    it('hardening configObj1.e should always give [5,5,5,5,5]: dev', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1.e, '_CONFIGURATOR', 'dev'), [5,5,5,5,5]);
    });
    it('hardening configObj1.e should always give [5,5,5,5,5]: test', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1.e, '_CONFIGURATOR', 'test'), [5,5,5,5,5]);
    });
    it('hardening configObj1.e should always give [5,5,5,5,5]: stage', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1.e, '_CONFIGURATOR', 'stage'), [5,5,5,5,5]);
    });
    it('hardening configObj1.e should always give [5,5,5,5,5]: prod', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1.e, '_CONFIGURATOR', 'prod'), [5,5,5,5,5]);
    });
    
    it('hardening configObj1.f should give {f1:61, f2:62Dev, f3:63} on dev', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1, '_CONFIGURATOR', 'dev').f, { f1:'61', f2:'62Dev', f3:'63' });
    });
    it('hardening configObj1.f should give {f1:61, f2:62Default, f3:63} on test', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1, '_CONFIGURATOR', 'test').f, { f1:'61', f2:'62Default', f3:'63' } );
    });
    it('hardening configObj1.f should give {f1:61, f2:62Default, f3:63} on stage', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1, '_CONFIGURATOR', 'stage').f, { f1:'61', f2:'62Default', f3:'63' } );
    });
    it('hardening configObj1.f should give {f1:61, f2:62Prod, f3:63} on prod', function() {
      assert.deepEqual(configurator.private.hardenConfigObject(configObj1, '_CONFIGURATOR', 'prod').f, { f1:'61', f2:'62Prod', f3:'63' } );
    });
      
  });

  describe('.init', function() {

    it('configObj1.a should always be 1: dev', function() {
      assert.equal(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'dev'}).a, 1);
    });
    it('configObj1.a should always be 1: test', function() {
      assert.equal(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'test'}).a, 1);
    });
    it('configObj1.a should always be 1: stage', function() {
      assert.equal(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'stage'}).a, 1);
    });
    it('configObj1.a should always be 1: prod', function() {
      assert.equal(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'prod'}).a, 1);
    });

    it('configObj1.b should always be {b1:11, b2:22}: dev', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'dev'}).b, { b1:21, b2:22 });
    });
    it('configObj1.b should always be {b1:11, b2:22}: test', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'test'}).b, { b1:21, b2:22 });
    });
    it('configObj1.b should always be {b1:11, b2:22}: stage', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'stage'}).b, { b1:21, b2:22 });
    });
    it('configObj1.b should always be {b1:11, b2:22}: prod', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'prod'}).b, { b1:21, b2:22 });
    });
    
    it('configObj1.c should be 3Dev on dev', function() {
      assert.equal(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'dev'}).c, '3Dev');
    });
    it('configObj1.c should be 3Default on test', function() {
      assert.equal(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'test'}).c, '3Default');
    });
    it('configObj1.c should be 3Default on stage', function() {
      assert.equal(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'stage'}).c, '3Default');
    });
    it('configObj1.c should be 3Prod on prod', function() {
      assert.equal(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'prod'}).c, '3Prod');
    });
    
    it('configObj1.d should be {d1:41Dev, d2:42Default} on dev', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'dev'}).d, { d1:'41Dev', d2:'42Default' });
    });
    it('configObj1.d should be {d1:41Default, d2:42Default} on test', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'test'}).d, { d1:'41Default', d2:'42Default'});
    });
    it('configObj1.d should be {d1:41Default, d2:42Default} on stage', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'stage'}).d, { d1:'41Default', d2:'42Default'});
    });
    it('configObj1.d should be {d1:41Prod, d2:42Default, d3:43ProdEXTRA} on prod', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env: 'prod'}).d, { d1:'41Prod', d2:'42Default', d3:'43ProdEXTRA'});
    });
    
    it('configObj1.e should always be [5,5,5,5,5]: dev', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env:'dev'}).e, [5,5,5,5,5]);
    });
    it('configObj1.e should always be [5,5,5,5,5]: test', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env:'test'}).e, [5,5,5,5,5]);
    });
    it('configObj1.e should always be [5,5,5,5,5]: stage', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env:'stage'}).e, [5,5,5,5,5]);
    });
    it('configObj1.e should always be [5,5,5,5,5]: prod', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env:'prod'}).e, [5,5,5,5,5]);
    });
    
    it('configObj1.f should be {f1:61, f2:62Dev, f3:63} on dev', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env:'dev'}).f, { f1:'61', f2:'62Dev', f3:'63' });
    });
    it('configObj1.f should be {f1:61, f2:62Default, f3:63} on test', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env:'test'}).f, { f1:'61', f2:'62Default', f3:'63' });
    });
    it('configObj1.f should be {f1:61, f2:62Default, f3:63} on stage', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env:'stage'}).f, { f1:'61', f2:'62Default', f3:'63' });
    });
    it('configObj1.f should be {f1:61, f2:62Prod, f3:63} on prod', function() {
      assert.deepEqual(configurator.init({config: configObj1, hosts: defaultHostsObj, env:'prod'}).f, { f1:'61', f2:'62Prod', f3:'63' });
    });
  });

});
