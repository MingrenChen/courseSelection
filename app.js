"use strict"
var bodyParser = require('body-parser');
var request = require('request');
var http = require('http');
var path = require('path')
function jsonParse() {
    var parse = bodyParser.json();
    return function (req, res, next) {
        req.headers['content-type'] = 'application/json';
        parse(req, res, next)
    }
}

const fs = require('fs');

let courses_raw = fs.readFileSync('course.json');
let courses = JSON.parse(courses_raw);

var express = require('express');
var app = express();
var serv = require('http').Server(app);


app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", 'https//localhost:8080');
    res.header('Access-Control-Allow-Methods', 'POST, GET');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.static(path.join(__dirname, 'client')));
app.use('/client', express.static(__dirname + "/client"));



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
    res.send(courses[req.params.courseTitle])
})




serv.listen(process.env.PORT || 8080);
console.log("Server started.");