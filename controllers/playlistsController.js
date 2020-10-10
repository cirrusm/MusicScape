const express = require('express')
const router = express.Router()

const db = require('../models')


// Redirect to New Playlist
router.get('/', (req, res) => {
    db.Playlist.find({}, (err, allPlaylists) => {
        if (err) return console.log(err);
        const context = { allPlaylists }
        res.render('playlists',context)
    })
})

// New Playlist 
router.get('/new', (req, res) => {
    db.User.find({}, (err, allUsers) => {
        if (err) return console.log(err);
        const context = { allUsers }
        res.render('playlists/new', context);
    })
})

// Create Playlist
router.post('/', (req, res) => {
    db.Playlist.create(req.body, (err, newPlaylist) => {
        if (err) return console.log(err);
        db.User.findById(req.body.user, (err, foundUser) => {
            if (err) return console.log(err);
            foundUser.playlists.push(newPlaylist._id);
            foundUser.save((err, savedUser) => {
                if (err) return console.log(err);
                res.redirect(`../users/${foundUser._id}`);
            })
        })
    })
})

// Show Playlist
router.get('/:playlistId', (req, res) => {
    const playlistId = req.params.playlistId;
    db.Playlist.findById(playlistId)
        .populate('user')
        .exec((err, foundPlaylist) => {
            if (err) return console.log(err);
            const context = { foundPlaylist };
            res.render('playlists/show', context);
        });
});
module.exports = router