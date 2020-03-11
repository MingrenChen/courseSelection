"use strict"
var bodyParser = require('body-parser');
var request = require('request');
var http = require('http');
var path = require('path')
var cors = require('cors')
const https = require('https');
const fs = require('fs');

function jsonParse() {
    var parse = bodyParser.json();
    return function (req, res, next) {
        req.headers['content-type'] = 'application/json';
        parse(req, res, next)
    }
}

let YEAR = 2019

var express = require('express');
var app = express();
app.use(cors())

app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, authorization, x-http-method-override');

    next()
});


app.use(express.static(path.join(__dirname, 'client')));
app.use('/client', express.static(__dirname + "/client"));


app.get("/api", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.send({1:2})
})

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
let ips = []


app.get('/getautocomplete/:keyword?',function(req, res) {
    let ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
    if (!ips.includes(ip)) {
        ips.push(ip)
        console.log(ip + " came in")
    }
    let keyword = req.params.keyword;
    if (!keyword){
        res.send([])
    }
    let url = 'https://timetable.iit.artsci.utoronto.ca/api/' + YEAR + '9/courses?org=&code=' + keyword;

    https.get(url, (value) => {
        let rawData = '';
        value.on('data', (chunk) => { rawData += chunk; });
        value.on('end', () => {
            try {
                const courses = JSON.parse(rawData);
                res.send(Object.keys(courses).map(courseId => {
                    let result = {}
                    result[courseId] = courses[courseId]
                    return result
                }))
            } catch (e) {
                console.error(e.message);
            }
        });

    })});

app.get('/course/:courseTitle', function (req, res) {
    console.log("ask for course " + req.params.courseTitle)

    let url = 'https://timetable.iit.artsci.utoronto.ca/api/' + YEAR + '9/courses?org=&code=' +
        req.params.courseTitle.split('-')[0] +
        '&section=' +
        req.params.courseTitle.split('-')[1]
    https.get(url, (value) => {
        let rawData = '';
        value.on('data', (chunk) => { rawData += chunk; });
        value.on('end', () => {
            try {
                const course = JSON.parse(rawData);
                res.send(course)
            } catch (e) {
                console.error(e.message);
            }
        });

    })
    // res.send(course)
})


app.listen(process.env.PORT || 2000);
console.log("Server started at " + process.env.PORT);
