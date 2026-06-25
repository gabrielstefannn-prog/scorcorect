const router = require('express').Router();
const auth = require('../middleware/auth');
const { upsertPrediction, getMatchPredictions, getUserPredictions } = require('../controllers/predictionController');

router.post('/', auth, upsertPrediction);
router.get('/match/:matchId', auth, getMatchPredictions);
router.get('/user/:userId', auth, getUserPredictions);

module.exports = router;
