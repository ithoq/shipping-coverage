var express = require('express'),
	neo4j = require('neo4j-driver').v1,
	router = express.Router();

var neo4jUrl = process.env.NEO4J_URL || 'bolt://localhost';
var neo4jLogin = process.env.NEO4J_LOGIN || 'neo4j';
var neo4jPasswd = process.env.NEO4J_PASSWD || 'olh234';


var driver = neo4j.driver(neo4jUrl,
              neo4j.auth.basic(neo4jLogin,neo4jPasswd));
var session = driver.session();

router.get('/production-center', function(req, res) {
	session
    .run("MATCH (n:productionCenter) RETURN n LIMIT 25")
    .then(function (result2) {
      var cppArr = [];
      result2.records.forEach(function (record) {
        cppArr.push({
          id: record._fields[0].identity.low,
          code: record._fields[0].properties.code,
          name: record._fields[0].properties.name,
          zip: record._fields[0].properties.zip,
        });
      });

      session.close();
      res.render('production-center',{
        cpps: cppArr
      });
    })
});

router.get('/production-center/new', function (req, res) {
  res.render('production-center/new');
});

router.post('/production-center/new', function (req, res) {
  var name = req.body.name;
  var code = req.body.code;
  var zip = req.body.zip;

  var createCppQuery = "CREATE (n:productionCenter {name:{cppName},code:{cppCode}, zip:{cppZip}}) RETURN n.name";
  session
    .run(createCppQuery, {cppName:name, cppCode:code, cppZip:zip})
    .then(function (result) {
      res.redirect('/production-center');
      session.close();
    })
    .catch(function (err) {
      console.log(err);
    });

});

router.get('/production-center/:code', function (req, res) {
  var getCppQuery = "MATCH (p:productionCenter {code:{cppCode}}) RETURN p";
  var code = req.params.code;
  session
    .run(getCppQuery, {cppCode:String(code)})
    .then(function (result) {
      var cppObject = {
        cpp: {
          code:result.records[0]._fields[0].properties.code,
          name:result.records[0]._fields[0].properties.name,
          zip:result.records[0]._fields[0].properties.zip,
        }
      }
      session.close();
      res.render('production-center/edit',cppObject);
    })
    .catch(function (err) {
      console.log(err);
    });
});

router.post('/production-center/:code', function (req, res) {
  var updateProductQuery = "MATCH (p:productionCenter {code:{cppCode}}) SET p.name = {cppName}, p.zip = {cppZip} RETURN p";
  var code = req.params.code;
  var name = req.body.name;
  var zip = req.body.zip;

  session
    .run(updateProductQuery, {cppCode:String(code), cppName:name, cppZip:zip})
    .then(function (result) {
      res.redirect('/production-center');
      session.close();
    })
    .catch(function (err) {
      console.log(err);
    });
});

router.delete('/production-center/:code', function (req, res) {
  var deleteCppQuery = "MATCH (p:productionCenter {code:{cppCode}}) delete p RETURN p";
  var code = req.params.code;
  session
    .run(deleteCppQuery, {cppCode:String(code)})
    .then(function (result) {
      res.send(result);
      session.close();
    })
    .catch(function (err) {
      console.log(err);
    });
});

module.exports = router
