var express = require('express'),
	neo4j = require('neo4j-driver').v1,
	router = express.Router();

var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j','olh234'));

var session = driver.session();

router.get('/product', function(req, res) {
	session
    .run("MATCH (n:product) RETURN n LIMIT 25")
    .then(function (result2) {
      var productsArr = [];
      result2.records.forEach(function (record) {
        productsArr.push({
          id: record._fields[0].identity.low,
          name: record._fields[0].properties.name,
          sku: record._fields[0].properties.sku,
          price: record._fields[0].properties.price,
          weight: record._fields[0].properties.weight,
        });
      });

      session.close();
      res.render('product',{
        products: productsArr
      });
    })
});

router.get('/product/new', function (req, res) {
  res.render('product/new');
});

router.post('/product/new', function (req, res) {
  var name = req.body.name;
  var price = req.body.price;
  var sku = req.body.sku;
  var weight = req.body.weight;

  var createProductQuery = "CREATE (n:product {name:{productName},price:{productPrice}, weight:{productWeight}, sku:{productSku}}) RETURN n.name"; 
  session
    .run(createProductQuery, {productName:name, productPrice:price, productWeight:weight, productSku:sku})
    .then(function (result) {
      res.redirect('/product');
      session.close();
    })
    .catch(function (err) {
      console.log(err);
    });

});

router.get('/product/:sku', function (req, res) {
  var getProductQuery = "MATCH (p:product {sku:{productSku}}) RETURN p"; 
  var sku = req.params.sku;
  session
    .run(getProductQuery, {productSku:String(sku)})
    .then(function (result) {
      var productObject = {
        product: {
          id:result.records[0]._fields[0].identity.low,
          sku:result.records[0]._fields[0].properties.sku,
          name:result.records[0]._fields[0].properties.name,
          price:result.records[0]._fields[0].properties.price,
          weight:result.records[0]._fields[0].properties.weight,
        }
      }
      session.close();
      res.render('product/edit',productObject);
    })
    .catch(function (err) {
      console.log(err);
    });
});

router.post('/product/:sku', function (req, res) {
  var updateProductQuery = "MATCH (p:product {sku:{productSku}}) SET p.name = {productName}, p.price = {productPrice}, p.weight = {productWeight} RETURN p"; 
  var sku = req.params.sku;
  var name = req.body.name;
  var price = req.body.price;
  var weight = req.body.weight;

  session
    .run(updateProductQuery, {productSku:String(sku), productName:name, productPrice:price, productWeight:weight})
    .then(function (result) {
      res.redirect('/product');
      session.close();
    })
    .catch(function (err) {
      console.log(err);
    });
});

router.delete('/product/:sku', function (req, res) {
  var deleteProductQuery = "MATCH (p:product {sku:{productSku}}) delete p RETURN p"; 
  var sku = req.params.sku;
  session
    .run(deleteProductQuery, {productSku:String(sku)})
    .then(function (result) {
      res.redirect('/product');
      session.close();
    })
    .catch(function (err) {
      console.log(err);
    });
});

module.exports = router