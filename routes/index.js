const express = require('express');
const { ensureAuthenticated } = require('../config/auth');

const router = express.Router();

router.get('/', ensureAuthenticated, (req, res) => res.render('index', {
    username: req.user.username,
    notes: req.user.notes
}));
router.get('/index', ensureAuthenticated, (req, res) => res.render('index', {
    username: req.user.username,
    notes: req.user.notes
}));

module.exports = router;