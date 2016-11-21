var express = require('express'),
	neo4j = require('neo4j-driver').v1,
	router = express.Router();

var neo4jUrl = process.env.NEO4J_URL || 'bolt://localhost';
var neo4jLogin = process.env.NEO4J_LOGIN || 'neo4j';
var neo4jPasswd = process.env.NEO4J_PASSWD || 'olh234';


var driver = neo4j.driver(neo4jUrl,
              neo4j.auth.basic(neo4jLogin,neo4jPasswd));
var session = driver.session();

router.get('/delivery-method', function(req, res) {
	session
    .run("MATCH (n:deliveryMethod) RETURN n LIMIT 25")
    .then(function (result2) {
      var deliveryMethodArr = [];
      result2.records.forEach(function (record) {
        deliveryMethodArr.push({
          id: record._fields[0].identity.low,
          code: record._fields[0].properties.code,
          name: record._fields[0].properties.name,
          type: record._fields[0].properties.type,
        });
      });

      session.close();
      res.render('delivery-method',{
        deliveryMethods: deliveryMethodArr
      });
    })
});

router.get('/delivery-method/new', function (req, res) {
  res.render('delivery-method/new');
});

router.post('/delivery-method/new', function (req, res) {
  var name = req.body.name;
  var code = req.body.code;
  var type = req.body.type;

  var createCppQuery = "CREATE (n:deliveryMethod {name:{deliveryMethodName},code:{deliveryMethodCode}, type:{deliveryMethodType}}) RETURN n.name";
  session
    .run(createCppQuery, {deliveryMethodName:name, deliveryMethodCode:code, deliveryMethodType:type})
    .then(function (result) {
      res.redirect('/delivery-method');
      session.close();
    })
    .catch(function (err) {
      console.log(err);
    });

});

router.get('/delivery-method/:code', function (req, res) {
  var getCppQuery = "MATCH (p:deliveryMethod {code:{deliveryMethodCode}}) RETURN p";
  var code = req.params.code;
  session
    .run(getCppQuery, {deliveryMethodCode:String(code)})
    .then(function (result) {
      var deliveryMethodObject = {
        deliveryMethod: {
          code:result.records[0]._fields[0].properties.code,
          name:result.records[0]._fields[0].properties.name,
          type:result.records[0]._fields[0].properties.type,
        }
      }
      session.close();
      res.render('delivery-method/edit',deliveryMethodObject);
    })
    .catch(function (err) {
      console.log(err);
    });
});

router.post('/delivery-method/:code', function (req, res) {
  var updateProductQuery = "MATCH (p:deliveryMethod {code:{deliveryMethodCode}}) SET p.name = {deliveryMethodName}, p.type = {deliveryMethodType} RETURN p";
  var code = req.params.code;
  var name = req.body.name;
  var type = req.body.type;

  session
    .run(updateProductQuery, {deliveryMethodCode:String(code), deliveryMethodName:name, deliveryMethodType:type})
    .then(function (result) {
      res.redirect('/delivery-method');
      session.close();
    })
    .catch(function (err) {
      console.log(err);
    });
});

router.delete('/delivery-method/:code', function (req, res) {
  var deleteCppQuery = "MATCH (p:deliveryMethod {code:{deliveryMethodCode}}) delete p RETURN p";
  var code = req.params.code;
  session
    .run(deleteCppQuery, {deliveryMethodCode:String(code)})
    .then(function (result) {
      res.send(result);
      session.close();
    })
    .catch(function (err) {
      console.log(err);
    });
});

module.exports = router
