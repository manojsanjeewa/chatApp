import React from "react";
import io from "socket.io-client";
import LoginForm from "./LoginForm.js";

class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            message: '',
            messages: [],
            socket: null,
            user: null,
            connectedUsers: [],
            activeUser: null,
            disabledSubmit: true 
        };
    }

    componentWillMount() {
        this.initSocket();
    }

    componentDidMount() {

    }

    initSocket = () => {
        const socket = io('localhost:5000');
        socket.on('connect', () => {
            console.log('Connected')
        })

        socket.on('RECEIVE_MESSAGE', function (data) {
            this.addMessage(data);
            let user;
            if(data.to){
               
                user = { id: data.messageFrom, name: data.author };
            }else{
                user = { id: data.messageTo, name: data.receiver };
            }
            
            this.activateUser(user);
        }.bind(this));


        socket.on('USER_CONNECTED', function (data) {
            let userArr = data;
            let connected = [];
            for (var key in userArr) {
                if (userArr.hasOwnProperty(key)) {
                    connected.push(userArr[key]);
                }
            }
            if (this.state.user !== null) {
                connected = connected.filter(function (u) {
                    return u.id != this.state.user.id;
                }.bind(this));
            }
            this.setState({ connectedUsers: connected });
        }.bind(this));

        this.setState({ socket });
    }

    addMessage = (data) => {
        this.setState({ messages: [...this.state.messages, data] });
    };

    sendMessage = ev => {
        ev.preventDefault();
        this.state.socket.emit('SEND_MESSAGE', {
            author: this.state.user.name,
            receiver: this.state.activeUser.name,
            userId: this.state.user.id,
            message: this.state.message,
            messageFrom: this.state.user.id,
            messageTo: this.state.activeUser.id
        })
        this.setState({ message: '' });
    }

    activateUser = (user) => {
        this.state.connectedUsers.forEach(function (usser) {

            if (user.id == usser.id) {
                usser.isActive = true;
            } else {
                usser.isActive = false;
            }
        });
        this.setState({ activeUser: user });
        this.setState({ disabledSubmit: false });
    }


    setUser = (user) => {
        const { socket } = this.state
        socket.emit('USER_CONNECTED', user);
        this.setState({ user: user });
        this.setState({ username: user.name });
    }


    render() {
        const { user } = this.state;
        const { socket } = this.state;
        const { disabledSubmit } = this.state;
        return (
            <div className="container">
                {
                    !user ?
                        <LoginForm socket={this.state.socket} setUser={this.setUser} />
                        :
                        <div className="sub-container">
                            <div className="row">
                                <div className="col-8">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="card">
                                                <div className="card-body">
                                                    <h3>{this.state.username}</h3>
                                                    <div className="card-title">First Select a user to chat with</div>
                                                    <hr />
                                                    <div className="messages">
                                                        {this.state.messages.map(message => {
                                                            return (
                                                                <div >{message.author}: {message.message}</div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="card-footer">

                                                    <input type="text" placeholder="Message" className="form-control" value={this.state.message} onChange={ev => this.setState({ message: ev.target.value })} />
                                                    <br />
                                                    <button onClick={this.sendMessage} className="btn btn-primary form-control"  disabled={disabledSubmit}>Send</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="card">
                                                <div className="messages" >
                                                    <h4>Users Online</h4>
                                                    {
                                                        this.state.connectedUsers.length > 0 ?
                                                            this.state.connectedUsers.map(user => {
                                                                return (
                                                                    <div className={(user.isActive ? "usersList activeUser" : "usersList")} onClick={() => this.activateUser(user)} key={user.id} >{user.name}</div>
                                                                )
                                                            })
                                                            : "No online users."
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                }
            </div>

        );
    }
}

export default Chat;