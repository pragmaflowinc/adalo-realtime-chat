import React, { Component } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { ChatMessage } from "./ChatMessage";
import { RealTimeChatProps } from "./generated";
import { InputBox } from "./InputBox";
import * as Ably from "ably";

class RealTimeChat extends Component<
  RealTimeChatProps,
  {
    messages: any[];
    ably?: Ably.Realtime;
    channel?: Ably.Types.RealtimeChannelCallbacks;
    oneTimeUpdate: boolean;
  }
> {
  constructor(props: RealTimeChatProps) {
    super(props);
    const sampleMessages = [{
      message: "First Message",
      createdDate: new Date(),
      senderId: this.props.clientId
    }, {
      message: "Second Message",
      createdDate: new Date(),
      senderId: `${this.props.clientId}+1`
    }]
    this.state = {
      oneTimeUpdate: (this.props.adaloMessages?.length || 0) > 0,
      messages: !!props.editor ? sampleMessages : this.props.adaloMessages?.map(message => message.messageData) || [],
    };
    this.onMessage = this.onMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }
  onMessage(message: Ably.Types.Message) {
    this.setState((state) => {
      return { messages: [message.data, ...state.messages] };
    });
  }
  sendMessage(message: string) {
    if (this.state.channel && this.props.subscriptionKey) {
      this.state.channel.publish(this.props.subscriptionKey, {
        message,
        senderId: this.props.clientId,
        createdDate: new Date().toISOString()
      });
			if (this.props.onSend) {
				this.props.onSend(message)
			}
    }
  }
  componentDidMount() {
    if (!this.props.editor) {
      const AblyRealtime = new Ably.Realtime({
        key: this.props.apiKey,
        clientId: this.props.clientId,
      });
      this.setState({ ably: AblyRealtime });
      if (this.props.channelName) {
        const channel = AblyRealtime.channels.get(this.props.channelName);
				this.setState({ channel });
        if (channel && this.props.subscriptionKey) {
          channel.subscribe(this.props.subscriptionKey, this.onMessage);
        }
      }
    }
  }
  componentDidUpdate(prevProps: RealTimeChatProps) {
    if (!this.props.editor) {

      if (this.state.messages.length === 0 && (this.props.adaloMessages || [])?.length > 0) {
        this.setState({ messages: this.props.adaloMessages?.map(message => message.messageData) || []})
      }
      if (
        this.state.channel &&
        this.props.subscriptionKey &&
        this.props.subscriptionKey !== prevProps.subscriptionKey
      ) {
        this.state.channel.unsubscribe(
          prevProps.subscriptionKey,
          this.onMessage
        );
        this.state.channel.subscribe(
          this.props.subscriptionKey,
          this.onMessage
        );
      }
    }
  }
  componentWillUnmount() {
    if (!this.props.editor) {
      if (this.state.channel) {
        this.state.channel.unsubscribe(
          this.props.subscriptionKey,
          this.onMessage
        );
      }
      if (this.state.ably) {
        this.state.ably.close();
      }
    }
  }
  render() {
    console.log(this.props)
    return (
      <View style={{ backgroundColor: this.props.backgroundColor, flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={{
            height: this.props._height,
            width: this.props._width
          }}
        >
          <FlatList
            style={{ flex: 1 }}
            data={this.state.messages}
            renderItem={({ item }) => <ChatMessage receiverStyle={this.props.receivedChatWindow} senderStyle={this.props.senderChatWindow} myId={this.props.clientId || ''} message={item} />}
            keyExtractor={(item) => `item!.id`}
            inverted
          />
          <InputBox inputStyle={this.props.inputStyle} buttonStyles={this.props.sendButton} sendMessage={this.sendMessage} />
        </View>
      </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default RealTimeChat;
