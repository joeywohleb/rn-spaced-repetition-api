'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

mongoose.connect('mongodb://spaced-repetition-db:27017/spaced-repetition');

const UserSchema = new Schema({
    id: ObjectId,
    email: String,
    password: String,
    date: Date,
});
const User = mongoose.model('User', UserSchema);

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App
const app = express()
    .use(
        bodyParser.urlencoded({
            extended: true,
        }),
    )
    .use(bodyParser.json());

app.get('/', (req, res) => {
    mongoose.connect('mongodb://spaced-repetition-db:27017/spaced-repetition', (err) => {
        if (err) {
            res.json(err.toString());
        }

        User.find({}).exec(function(err, users) {
            if (err) {
                res.json(err.toString());
            } else {
                res.json(users);
            }
        });
    });
});

app.post('/register', (req, res) => {
    mongoose.connect('mongodb://spaced-repetition-db:27017/spaced-repetition', (err) => {
        if (err) {
            res.json(err.toString());
        }

        User.findOne({
            email: req.body.email,
        }).exec(function(err, book) {
            if (err) {
                res.json(err.toString());
            } else {
                if (book) {
                    res.json('email already registered');
                } else {
                    var newUser = new User();
                    newUser.email = req.body.email;
                    newUser.password = bcrypt.hashSync(req.body.password);
                    newUser.date = new Date();

                    newUser.save(function(err, user) {
                        if (err) {
                            res.json('error saving user');
                        } else {
                            res.json(user);
                        }
                    });
                }
            }
        });
    });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
