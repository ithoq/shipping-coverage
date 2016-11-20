var express = require('express')
  , router = express.Router()

router.use(require('./products'))
// router.use('/cars', require('./cars'))

router.get('/', function(req, res) {
  res.render('index')
})

router.get('/teste', function(req, res) {
  res.send('teste page')
})

router.get('/about', function(req, res) {
  res.send('Learn about us')
})

module.exports = router