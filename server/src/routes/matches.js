const router = require('express').Router();
const auth = require('../middleware/auth');
const { getMatches, getMatch, syncMatches } = require('../controllers/matchController');

router.get('/', auth, getMatches);
router.get('/:id', auth, getMatch);
router.post('/sync', auth, syncMatches);

module.exports = router;
