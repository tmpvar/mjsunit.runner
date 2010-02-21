Mjsunit test runner
===================

Provides an easy way to hook into mjsunit and start running tests immediately.


Usage Example
-------------

  var suites = {
    "core"   : { 
      cases: require("./core").tests
    }
  };

  require("mjsunit.runner/lib/runner").run(suites);
