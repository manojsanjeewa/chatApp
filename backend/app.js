var express = require('express');
var socket = require('socket.io');
const uuidv4 = require('uuid/v4');
var app = express();

let connectedUsers = {}

server = app.listen(5000, function(){
    console.log('server is running on port 5000')
});

io = socket(server);
io.on('connection', (socket) => {
    socket.on('SEND_MESSAGE', function(data){
         io.to(data.messageFrom).emit("RECEIVE_MESSAGE", data);
         data.to = true;
         io.to(data.messageTo).emit("RECEIVE_MESSAGE", data);
         
         
    })
    socket.on('VERIFY_USER', (nickname, callback)=>{
        if(isUser(connectedUsers, nickname)){
            callback({ isUser: true, user: null });
        }else{
            callback({ isUser: false, user: createUser({name: nickname, id : socket.id})});
        }
    })
    socket.on('USER_CONNECTED', (user) =>{
      connectedUsers = addUser(connectedUsers, user)
      socket.user = user;
      io.emit('USER_CONNECTED', connectedUsers);
    });
});

const createUser = ({name= "", id=""}= {})=> ({
        id,
        name
})

function addUser(userList, user){
  let newList = Object.assign({}, userList);
  newList[user.name] = user;
  return newList;
}

function removeUser(userList, username){
  let newList  = Object.assign({}, userList);
  delete newList[username];
  return newList;
}

function isUser(userList, username){
    return username in userList; 
}

