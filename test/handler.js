
/* global describe, it */

var fs = require("fs");

var index = require("../index");

describe('index.js', function() {
  describe('#handler()', function() {
    it('mock data should result in a success', function(done) {
      var event = JSON.parse(fs.readFileSync("test/assets/event.json"));
      var context = {
        succeed: function() {
          done();
        }
      };
      var overrides = {
        s3: {
          copyObject: function(options, callback) {
            callback(null);
          },
          getObject: function(options, callback) {
            callback(null, {Body: "email data"});
          }
        },
        ses: {
          sendRawEmail: function(options, callback) {
            callback(null, {status: "ok"});
          }
        },
        config: {
          emailBucket: "bucket",
          emailKeyPrefix: "prefix/",
          forwardMapping: {
            "info@example.com": [
              "jim@example.com"
            ]
          }
        }
      };
      index.handler(event, context, overrides);
    });

    it('should report failure for default data', function(done) {
      var event = JSON.parse(fs.readFileSync("test/assets/event.json"));
      var context = {
        fail: function() {
          done();
        }
      };
      index.handler(event, context);
    });

    it('should accept functions as steps', function(done) {
      var event = {};
      var context = {};
      var overrides = {
        steps: [
          function(data) {
            if (data && data.context) {
              done();
            }
          }
        ]
      };
      index.handler(event, context, overrides);
    });

    it('should report failure for invalid steps', function(done) {
      var event = {};
      var context = {
        fail: function() {
          done();
        }
      };
      var overrides = {
        steps: [
          1,
          ['test']
        ]
      };
      index.handler(event, context, overrides);
    });

    it('should report failure for steps passing an error', function(done) {
      var event = {};
      var context = {
        fail: function() {
          done();
        }
      };
      var overrides = {
        steps: [
          function(data, next) {
            next(true);
          }
        ]
      };
      index.handler(event, context, overrides);
    });
  });
});
