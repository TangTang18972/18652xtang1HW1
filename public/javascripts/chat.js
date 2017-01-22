var socket;
var myname;
window.onload = function () {
//for leave functioin.
    document.getElementById('leave').onclick = function () {
        socket.emit('leave', myname);
        window.open("about:blank","_self").close()
    };
//detect the send button to transfer message to server
    document.getElementById('form').onsubmit = function () {
        var input = document.getElementById('input');
        if(input.value == "") return false;
        var mydate = new Date().toUTCString();
        msgInput(myname, input.value, mydate);
        socket.emit('msg', input.value, mydate);
        input.value = '';
        return false;
    }
  socket = io.connect();

// ask for a nickname
  socket.on('connect', function () {
    while(!myname || myname.trim() == "") {
        myname =  prompt('Please enter your name?');
    }
    socket.emit('join', myname);

//show history chat log
    socket.on('initial', function (rows) {
       for(var i = 0; i < rows.length; i++) {
           msgInput(rows[i].name, rows[i].content, rows[i].date);
       }
    });
  });
//add message of someone joined
  socket.on('welcome', function (msg) {
        var li = document.createElement('li');
        li.innerHTML = msg;
        document.getElementById('OnlineInfo').appendChild(li);
  });
//add message of someone leave
  socket.on('leave', function (msg) {
      var li = document.createElement('li');
      li.className = 'welcome';
      li.innerHTML = msg;
      document.getElementById('OnlineInfo').appendChild(li);
  });
//add message from one of the chater
  socket.on('msg', msgInput);
  function msgInput(from, text, mydate) {
    var h1 = document.createElement('h1');
    h1.innerHTML = '&nbsp;&nbsp;'+ from + '&nbsp;&nbsp;on&nbsp;&nbsp;' + mydate + '&nbsp;&nbsp;:';
    var p = document.createElement('p');
    p.innerHTML =  text ;
    var innnerDiv = document.createElement('div');
    innnerDiv.className = 'paragraph';
    innnerDiv.appendChild(h1);
    innnerDiv.appendChild(p);
    var div = document.getElementById('chat');
    div.appendChild(innnerDiv);
    return p;
  }




};


