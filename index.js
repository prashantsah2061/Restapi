const express = require('express');       // load express module
const nedb = require("nedb-promises");    // load nedb module

const app = express();                    // init app
const db = nedb.create('users.jsonl');    // init db

app.use(express.static('public'));        // enable static routing to "./public" folder
app.use(express.json());                  // automatically decode JSON requests and encode JSON responses

// Get all users
app.get('/users', (req, res) => {
    db.find()
        .then(users => res.json(users))
        .catch(error => res.json({ error }));
});

// Get single user by username
app.get('/users/:username', (req, res) => {
    db.findOne({ username: req.params.username })
        .then(user => {
            if (user) {
                res.json(user);
            } else {
                res.json({ error: 'Username not found.' });
            }
        })
        .catch(error => res.json({ error }));
});

// Register new user
app.post('/users', (req, res) => {
    const { username, password, email, name } = req.body;
    
    // Check if all required fields are present
    if (!username || !password || !email || !name) {
        return res.json({ error: 'Missing fields.' });
    }

    // Check if username already exists
    db.findOne({ username })
        .then(existingUser => {
            if (existingUser) {
                return res.json({ error: 'Username already exists.' });
            }
            
            // Create new user
            return db.insertOne({ username, password, email, name })
                .then(newUser => res.json(newUser));
        })
        .catch(error => res.json({ error }));
});

// Update user
app.patch('/users/:username', (req, res) => {
    db.updateOne(
        { username: req.params.username },
        { $set: req.body }
    )
    .then(result => {
        if (result.numAffected === 0) {
            res.json({ error: 'Something went wrong.' });
        } else {
            res.json({ ok: true });
        }
    })
    .catch(error => res.json({ error }));
});

// Delete user
app.delete('/users/:username', (req, res) => {
    db.deleteOne({ username: req.params.username })
        .then(result => {
            if (result.numAffected === 0) {
                res.json({ error: 'Something went wrong.' });
            } else {
                res.json({ ok: true });
            }
        })
        .catch(error => res.json({ error }));
});

// default route
app.all('*',(req,res)=>{res.status(404).send('Invalid URL.')});

// start server
app.listen(3000,()=>console.log("Server started on http://localhost:3000"));
