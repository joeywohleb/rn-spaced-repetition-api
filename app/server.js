'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');

const config = require('../config');

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
const ONE_WEEK = 7 * 24 * 60 * 60;

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
        if (err) return res.status(500).send(err.toString());

        User.find({}).exec(function(err, users) {
            if (err) return res.status(500).send(err.toString());

            res.json(users);
        });
    });
});

app.post('/register', (req, res) => {
    mongoose.connect('mongodb://spaced-repetition-db:27017/spaced-repetition', (err) => {
        if (err) res.status(500).json(err.toString());

        User.findOne({
            email: req.body.email,
        }).exec(function(err, book) {
            if (err) return res.status(500).json(err.toString());
            if (book) return res.status(409).send('Email already registered.');

            var newUser = new User();
            newUser.email = req.body.email;
            newUser.password = bcrypt.hashSync(req.body.password);
            newUser.date = new Date();

            newUser.save(function(err, user) {
                if (err) return res.status(500).json(err.toString());

                const token = jwt.sign({ id: user.id }, config.privateKey, {
                    expiresIn: ONE_WEEK,
                });

                res.status(200).send({ token });
            });
        });
    });
});

app.post('/login', (req, res) => {
    mongoose.connect('mongodb://spaced-repetition-db:27017/spaced-repetition', (err) => {
        if (err) return res.status(500).json(err.toString());

        User.findOne({ email: req.body.email }, (err, user) => {
            if (err) return res.status(500).send(err.toString());
            if (!user) return res.status(404).send('User not found.');

            const valid = bcrypt.compareSync(req.body.password, user.password);

            if (!valid) return res.status(401).send({ token: null });

            const token = jwt.sign({ id: user.id }, config.privateKey, {
                expiresIn: ONE_WEEK,
            });

            res.status(200).send({ token });
        });
    });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
