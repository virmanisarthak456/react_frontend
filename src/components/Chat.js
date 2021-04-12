import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import '../chat.css';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.socket = io.connect('http://54.237.158.65:5000');
    this.userEmail = null;
    this.state = {
      messages: [],
      typedMessage: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user !== this.props.user) {
      this.userEmail = this.props.user.email;
      this.setupConnections();
    }
  }

  setupConnections = () => {
    const context = this;

    if (this.userEmail) {
      this.socket.on('connect', function () {
        console.log('connection established using sockets...!');

        context.socket.emit('join_room', {
          user_email: this.userEmail,
          chatroom: 'codeial',
        });

        context.socket.on('user_joined', function (data) {
          console.log('a user joined!', data);
        });
      });

      this.socket.on('receive_message', function (data) {
        const { messages } = context.state;
        const messageObject = {};
        messageObject.content = data.message;

        if (data.user_email === context.userEmail) {
          messageObject.self = true;
        }

        context.setState({
          messages: [...messages, messageObject],
          typedMessage: '',
        });
      });
    }
  };

  handleSubmit = () => {
    const { typedMessage } = this.state;
    if (typedMessage && this.userEmail) {
      this.socket.emit('send_message', {
        message: typedMessage,
        user_email: this.userEmail,
        chatroom: 'codeial',
      });
    }
  };

  render() {
    const { messages, typedMessage } = this.state;
    return (
      <div className="chat-container">
        <div className="chat-header">
          Chat
          <img
            src="https://www.iconsdb.com/icons/preview/white/minus-5-xxl.png"
            alt=""
            height={17}
          />
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div
              className={
                message.self
                  ? 'chat-bubble self-chat'
                  : 'chat-bubble other-chat'
              }
            >
              {message.content}
            </div>
          ))}
        </div>
        <div className="chat-footer">
          <input
            type="text"
            value={typedMessage}
            onChange={(e) => this.setState({ typedMessage: e.target.value })}
          />
          <button onClick={this.handleSubmit}>Submit</button>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ auth }) {
  return {
    user: auth.user,
  };
}
export default connect(mapStateToProps)(Chat);
