const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getStandings } = require('../controllers/standingsController');

router.get('/', authenticate, getStandings);

module.exports = router;
