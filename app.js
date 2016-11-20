var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver').v1;


var app = express();


// view engine

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j','olh234'));

var session = driver.session();



app.get('/', function (req, res) {
  session
    .run('MATCH (n:product) RETURN n LIMIT 25')
    .then(function (result) {
      var productsArr = [];
      result.records.forEach(function (record) {
        productsArr.push({
          id: record._fields[0].identity.low,
          name: record._fields[0].properties.name,
          sku: record._fields[0].properties.sku,

        });
        console.log(record._fields[0].properties);
      });

      session
        .run("MATCH (n:productionCenter) RETURN n LIMIT 25")
        .then(function (result2) {
          var centerArr = [];
          result2.records.forEach(function (record) {
            centerArr.push({
              id: record._fields[0].identity.low,
              name: record._fields[0].properties.name,
              zip: record._fields[0].properties.zip,
            });
          });

          res.render('index',{
            products: productsArr,
            productionCenter: centerArr,
          });
        })
    })
    .catch(function (err) {
      console.log(err);
    });
});


app.post('/product/add', function (req, res) {
  var name = req.body.product_name;
  var price = req.body.product_price;
  var sku = req.body.product_sku;
  var weight = req.body.product_weight;

var createProductQuery = "CREATE (n:product {name:{productName},price:{productPrice}, weight:{productWeight}, sku:{productSku}}) RETURN n.name"; 
  session
    .run(createProductQuery, {productName:name, productPrice:price, productWeight:weight, productSku:sku})
    .then(function (result) {
      res.redirect('/');
      session.close();
    })
    .catch(function (err) {
      console.log(err);
    });

});


app.post('/production-center/add', function (req, res) {
  var name = req.body.center_name;
  var zip = req.body.center_zip;

var createProductQuery = "CREATE (n:productionCenter {name:{centerName},zip:{centerZip}}) RETURN n.name"; 
  session
    .run(createProductQuery, {centerName:name, centerZip:zip})
    .then(function (result) {
      res.redirect('/');
      session.close();
    })
    .catch(function (err) {
      console.log(err);
    });

});




app.post('/production-center/product/add', function (req, res) {
  var centerName = req.body.center_name;
  var productName = req.body.product_name;

var createProductQuery = "MATCH (pc:productionCenter {name:{centerName}}),(p:product {name:{productName}}) MERGE (pc)-[r:make]->(p) return pc, p"; 
  session
    .run(createProductQuery, {centerName:centerName, productName:productName})
    .then(function (result) {
      res.redirect('/');
      session.close();
    })
    .catch(function (err) {
      console.log(err);
    });

});


app.listen(3000);
console.log('server started at port 3000');

module.exports = app;
