const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
// const validator = require('../controllers/validator');

router.get('/iot',recordController.Dist);
router.get('/graph',recordController.graph);
// router.get('/graph2',recordController.graph2);



module.exports = router;