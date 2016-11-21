var express = require('express'),
	neo4j = require('neo4j-driver').v1,
	router = express.Router();

var neo4jUrl = process.env.NEO4J_URL || 'bolt://localhost';
var neo4jLogin = process.env.NEO4J_LOGIN || 'neo4j';
var neo4jPasswd = process.env.NEO4J_PASSWD || 'olh234';


var driver = neo4j.driver(neo4jUrl,
              neo4j.auth.basic(neo4jLogin,neo4jPasswd));
var session = driver.session();

router.get('/relationships/delivery-method-production-center', function(req, res) {
	session
    .run("MATCH (de:deliveryMethod), (cp:productionCenter)  return cp.name, de.name LIMIT 25")
    .then(function (result) {
      var relationshipsArr = [];
      result.records.forEach(function (record) {
        console.log(record);
        relationshipsArr.push({
          productionCenter: record._fields[0],
          deliveryMethod: record._fields[1],
        });
      });

      session.close();
      res.render('relationships/delivery-method-production-center',{
        relationships: relationshipsArr
      });
    })
});
var session = driver.session();

router.get('/relationships/product-production-center', function(req, res) {
	session
    .run("MATCH (cp:productionCenter), (pr:product)  return pr.name, cp.name")
    .then(function (result) {
      var relationshipsArr = [];
      result.records.forEach(function (record) {
        console.log(record);
        relationshipsArr.push({
          productionCenter: record._fields[0],
          product: record._fields[1],
        });
      });

      session.close();
      res.render('relationships/product-production-center',{
        relationships: relationshipsArr
      });
    })
});

module.exports = router
