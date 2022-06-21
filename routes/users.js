const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

//import user model
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Login Page
router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) =>{
    const {username, email, password } = req.body;
    const notes = [];

    let errors = [];

    //Check required fields
    if(!username || !email || !password){
         errors.push({msg: 'Please fill in all fields'});
    }

    // Check pass length
    if(password.length < 6) {
        errors.push({msg: 'Password should be at least 6 characters'});
    }

    if(errors.length > 0) {
        res.render('register', {
            errors
        });
    }

    else {
        // validation passed
        User.findOne( { username : username})
        .then(user => {
            if(user){
                //User already exists
                errors.push({msg: 'User already exists'});
                res.render('register', { errors });
            }
            else {
                const newUser = new User({
                    username,
                    email,
                    password,
                    notes,
                });

                // Encrypt password
                bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    newUser.password = hash;
                    // Save new user
                    newUser.save()
                    .then(user => {
                        req.flash('succes_msg', 'You successfully registered!');
                        res.redirect('login');
                    })
                    .catch(err => console.log(err));
                }))
            }
            
        })
    }
});

// Login Handle
router.post('/login',(req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) throw(err);
    });
    req.flash('success_msg','You are logged out');
    res.redirect('/users/login');
    
});

//Create new note
router.post('/create',(req, res) => {
    const note = {title: req.body.newNote};

    User.findOneAndUpdate(
        {username: req.user.username},
        {$push: {notes: note}},
        {upsert: true}
    )
    .then(res.redirect('/'))
    .catch(err => console.log(err));
});

//Delete Note
router.delete('/delete/:id',(req,res) =>{
    const deleteID = req.params.id;
    var allnotes= req.user.notes.filter((e) => {
        return e.id != deleteID;
    });

    User.findOneAndUpdate(
        {username: req.user.username},
        {$set: {notes: allnotes}},
        {upsert: true}
    )
    .then(res.json({ redirect: '/' }))
    .catch(err => console.log(err));
});


module.exports = router;    