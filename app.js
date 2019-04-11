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
var io = require('socket.io').listen(serv);

app.use(express.static(path.join(__dirname, 'client')));
app.use('/client', express.static(__dirname + "/client"));

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

SOCKET_LIST = {}

io.sockets.on('connection', function(socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    const course_titles = Object.keys(courses);
    socket.on('getAutoComplete', function (req) {
        let arr = []
        let i = 0
        while (i<course_titles.length && arr.length<10){
            if (course_titles[i].substr(0, req.key.length).toUpperCase() === req.key.toUpperCase()) {
                arr.push(course_titles[i].substring(0,8) + course_titles[i][9] + " " + courses[course_titles[i]].courseTitle)
            }
            i++;
        }
        console.log(arr)
        socket.emit("sendAutoComplete", {res: arr})

    });


})

serv.listen(process.env.PORT || 2000);
console.log("Server started.");