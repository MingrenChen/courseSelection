"use strict"
var bodyParser = require('body-parser');
var request = require('request');
var https = require('https');
var path = require('path')
var cors = require('cors')
const fs = require('fs');
const crypto = require("crypto")

var privateKey = fs.readFileSync('privatekey.pem').toString();
var certificate = fs.readFileSync('certificate.pem').toString();

var credentials = crypto.createCredentials({key: privateKey, cert: certificate});

function jsonParse() {
    var parse = bodyParser.json();
    return function (req, res, next) {
        req.headers['content-type'] = 'application/json';
        parse(req, res, next)
    }
}

let courses_raw = fs.readFileSync('course.json');
let courses = JSON.parse(courses_raw);

var express = require('express');
var app = express();
var httpsServer = https.createServer(credentials, app);
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


app.get('/getautocomplete/:keyword',function(req, res) {
    let ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
    if (!ips.includes(ip)) {
        ips.push(ip)
        console.log(ip + " came in")
    }
    let keyword = req.params.keyword
    const course_titles = Object.keys(courses);
    let arr = []
    let i = 0
    while (i<course_titles.length && arr.length<10){
        if (course_titles[i].substr(0, keyword.length).toUpperCase() === keyword.toUpperCase()) {
            arr.push(course_titles[i].substring(0,8) + course_titles[i][9] + " " + courses[course_titles[i]].courseTitle)
        }
        i++;
    }
    res.send(arr)
});

app.get('/course/:courseTitle', function (req, res) {
    console.log("ask for course " + req.params.courseTitle)
    res.send(courses[req.params.courseTitle])
})




httpsServer.listen(2000);
console.log("Server started at " + process.env.PORT);
