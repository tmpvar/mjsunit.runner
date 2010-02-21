var sys = require("sys");
process.mixin(GLOBAL, require("mjsunit"));

exports.run = function(testSuites) {

  // Setup ARGS
  var args = {};

  var current = "";

  for (var i=0; i<process.ARGV.length; i++)
  {
    current = process.ARGV[i];
    if (current.substring(0,2) === "--") {
      if (process.ARGV[i+1]) {
        if (process.ARGV[i+1].substring(0,1) === "-") {
          args[current.substring(2)] = true;
        } else {
          args[current.substring(2)] = process.ARGV[++i] || true;
        }
      } else {
        args[current.substring(2)] = true;
      }
    } else if (current.substring(0,1) === "-") {
      args[current.substring(1)] = process.ARGV[++i] || true;
    }
  }


  var errors = [];
  var total = 0;

  var runTest  = function(suiteName, suite, test) {
    total++;
    GLOBAL.builder.contentType   = suite.contentType;
    GLOBAL.builder.type          = suite.type;
    GLOBAL.builder.testDirectory = suiteName; 
     
    try {
      suite.cases[test].call(GLOBAL);
    } catch (e) {
      suite.errors.push({ method: test, error: e});
      errors.push({ method: test, error: e});
    }
  };

  var runSuite = function(suiteName) {
    for (var test in tests[suiteName].cases)
    {
      if (tests[suiteName].cases.hasOwnProperty(test)) {
        tests[suiteName].total++;
        runTest(suiteName, tests[suiteName], test);
      }
    }
  }

  if (args.suite) {
    if (tests[args.suite]) {
      if (args.test) {
        runTest(args.suite, tests[args.suite], args.test);
      } else {
        runSuite(args.suite);
      }
    } else {
      sys.puts("Invalid Suite Name\n\n Existing suites:")
      for (var suiteName in tests) {
        if (tests.hasOwnProperty(suiteName)) {
          sys.puts("  " + suiteName);
        }
      }
      sys.puts("");
      process.exit(1);
    }

  } else {
    
    for (suiteName in tests)
    {
      if (tests.hasOwnProperty(suiteName)) {
        runSuite(suiteName);
      }
    }
  }

  if (args.verbose) {
    for (var i = 0; i<errors.length; i++)
    {
      sys.puts('"' + errors[i].error.message + " (#" + errors[i].error.code + " " + errors[i].error.type + " in " + errors[i].method + ')');
      sys.puts(errors[i].error.stack);
    }
  }

  if (args.suite) {
    sys.puts(" ");
    sys.puts(errors.length + " of " + total + " failed (" + Math.round(((total-errors.length)/total)*100)  + "% success)" );
    sys.puts(" ");
  } else {
  var numerator, denominator, percent;
  sys.puts("");

  var padName = function(name) {
    while(name.length < 13) {
      name+=" ";
    }
    return name;
  }

  for (var suiteName in tests)
  {
    if (tests.hasOwnProperty(suiteName)) {
      numerator   = tests[suiteName].total - tests[suiteName].errors.length;
      denominator = tests[suiteName].total;
      percent     = Math.round((numerator / denominator)*100,2);
      sys.puts(padName(suiteName) + "\t" + numerator + "/" + denominator + "\t\t" + percent + "% passing");
    }
  }

  sys.puts("--------------------------------------------");
  numerator   = total-errors.length;
  denominator = total;
  percent     = Math.round((numerator / denominator)*100,2);
  sys.puts("TOTALS:\t\t" + numerator + "/" + denominator + "\t" + percent + "% passing\r\n");
  }
};
