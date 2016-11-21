var express = require('express'),
    neo4j = require('neo4j-driver').v1,
    router = express.Router()

  var neo4jUrl = process.env.NEO4J_URL || 'bolt://localhost';
  var neo4jLogin = process.env.NEO4J_LOGIN || 'neo4j';
  var neo4jPasswd = process.env.NEO4J_PASSWD || 'olh234';


  var driver = neo4j.driver(neo4jUrl,
                neo4j.auth.basic(neo4jLogin,neo4jPasswd));
  var session = driver.session();


router.use(require('./products'))
router.use(require('./production-center'))
router.use(require('./delivery-method'))
router.use(require('./relationships'))

router.get('/', function(req, res) {
  session
    .run("MATCH (n) RETURN DISTINCT count(labels(n)) as total, labels(n) as name;")
    .then(function (result2) {
      var dashboadArr = [];
      var collorType = {productionCenter:'blue', deliveryMethod:'green', product:'red', period:'purple'}
      result2.records.forEach(function (record) {
        dashboadArr.push({
          total: record._fields[0].low,
          name: record._fields[1][0],
          type: collorType[record._fields[1][0]]
        });
      });
      console.log(dashboadArr);
      session.close();
      res.render('index',{
        dashboad: dashboadArr
      });
    });
});

router.get('/teste', function(req, res) {
  res.send('teste page')
});

router.get('/about', function(req, res) {
  res.send('Learn about us')
});

module.exports = router
