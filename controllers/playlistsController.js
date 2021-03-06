const express = require('express')
const router = express.Router()

const db = require('../models')


// Redirect to New Playlist
router.get('/', (req, res) => {
    db.Playlist.find()
        .populate('user')
        .exec((err, allPlaylists) => {
            if (err) return console.log(err);
            const context = {
                allPlaylists,
                loggedIn: req.session.user
            }
            res.render('playlists', context)
        })
})

// New Playlist 
router.get('/new', (req, res) => {
    db.User.find({}, (err, allUsers) => {
        if (err) return console.log(err);
        const context = {
            allUsers,
            loggedIn: req.session.user
        }
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

// // Create Song
// router.post('/:playlistId', (req, res) => {
//     db.Playlist.findById(req.params.playlistId, (err, foundPlaylist) => {
//         if (err) return console.log(err);
//         console.log(req.body);
//         foundPlaylist.songs.push(req.body);
//         foundPlaylist.save((err, savedSong) => {
//             if (err) return console.log(err);
//             res.redirect(`../playlists/${foundPlaylist._id}`);
//         })
//     })
// })

// Show Playlist
router.get('/:playlistId', (req, res) => {
    const playlistId = req.params.playlistId;
    db.Playlist.findById(playlistId)
        .populate('user')
        .populate('songs')
        .exec((err, foundPlaylist) => {
            if (err) return console.log(err);
            if (!req.session.user) {
                const context = {
                    foundPlaylist,
                    loggedIn: req.session.user,
                    userLoggedIn: false
                }
                res.render('playlists/show', context);
            }
            else {
                const context = {
                    foundPlaylist,
                    loggedIn: req.session.user,
                    userLoggedIn: req.session.user._id == foundPlaylist.user._id
                };
                res.render('playlists/show', context);
            }

        });
});

// Edit Playlist
router.get('/:playlistId/edit', (req, res) => {
    db.Playlist.findById(req.params.playlistId, (err, foundPlaylist) => {
        if (err) return console.log(err);
        const context = {
            foundPlaylist,
            loggedIn: req.session.user
        };
        res.render('playlists/edit', context);
    })

})

// // New Song
// router.get('/:playlistId/newSong', (req, res) => {
//     db.Playlist.findById(req.params.playlistId, (err, foundPlaylist) => {
//         if (err) return console.log(err);
//         const context = {
//             foundPlaylist,
//             loggedIn: req.session.user
//         };
//         res.render('playlists/newSong', context);
//     })
// })

// Update Playlist
router.put('/:playlistId', (req, res) => {
    db.Playlist.findByIdAndUpdate(
        req.params.playlistId,
        req.body,
        (err, updatedPlaylist) => {
            if (err) return console.log(err);
            res.redirect(`/playlists/${updatedPlaylist._id}`)
        })
})

// Delete Playlist
router.delete('/:playlistId', (req, res) => {
    const playlistId = req.params.playlistId;
    db.Playlist.findByIdAndDelete(playlistId, (err, deletedPlaylist) => {
        if (err) return console.log(err);
        db.Song.deleteMany({ _id: { $in: deletedPlaylist.songs } }, (err, result) => {
            db.User.findOne({ playlists: playlistId }, (err, foundUser) => {
                if (err) return console.log(err);
                foundUser.playlists.remove(playlistId);
                foundUser.save((err, updatedUser) => {
                    if (err) return console.log(err);
                    res.redirect('/playlists')
                })
            })

        })
    })
})


module.exports = router