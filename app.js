var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var express = require('express')
    , sio = require('socket.io')
    , http = require('http');
var mysql = require('mysql');
var db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'Xiao',
    password: '8448094',
    database: 'homework'
});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', function (req, res) {
    res.redirect('./index.html');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// create the server
var server = http.createServer(app);
server.listen(1993,'127.0.0.1');
var io = sio.listen(server);

//when someone connect, braodcast it and print history log from mysql for the new joiner
io.sockets.on('connection', function (socket) {
    socket.on('join', function (name) {
        socket.myname = name;
        socket.broadcast.emit('welcome', name + ' joined the chat.');
        db.query("SELECT * FROM chatlog", function (err, rows) {
            socket.emit('initial', rows);
        })
    });
//when someone send one message broadcast it and store it in mysql
    socket.on('msg', function (msg, mydate) {
        socket.broadcast.emit('msg', socket.myname, msg, mydate);
        db.query("INSERT INTO chatlog(name, date, content) VALUES(?, ?, ?)",
            [socket.myname, mydate, msg],
            function (err) {
                if(err) throw err;
            }
        )
    });
//when some one leave broadcast it
    socket.on('leave', function (myname) {
        socket.broadcast.emit('leave', myname + ' left the chat.');
    })
});
module.exports = app;
