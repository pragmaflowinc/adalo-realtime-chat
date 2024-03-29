import React, { useState } from "react";
import { StyleSheet, Dimensions, View, Text, Image } from "react-native";
import { IReceivedChatWindow, ISenderChatWindow } from "./generated";

export type ChatMessageProps = {
  message: {
    senderId: string,
    message: string,
    createdDate: string
  };
  myId: String;
  senderStyle?: ISenderChatWindow
  receiverStyle?: IReceivedChatWindow
};

export const ChatMessage = (props: ChatMessageProps) => {   
  const { message, myId } = props;
  const isMyMessage = () => {
    return message.senderId === myId;
  };
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.messageBox,
          {
            borderRadius: isMyMessage() ? props.senderStyle?.borderRadius || 0 : props.receiverStyle?.borderRadius || 0,
            backgroundColor: isMyMessage() ? props.senderStyle?.backgroundColor : props.receiverStyle?.backgroundColor,
            marginLeft: isMyMessage() ? props.senderStyle?.marginLeft : props.receiverStyle?.marginLeft,
            marginRight: isMyMessage() ? props.senderStyle?.marginRight : props.receiverStyle?.marginRight,
            padding: isMyMessage() ? props.senderStyle?.padding : props.receiverStyle?.padding
          },
        ]}
      >

        <Text style={[styles.message, { color: isMyMessage() ? props.senderStyle?.textColor : props.receiverStyle?.textColor }]}>{message.message}</Text>
        <Text style={[styles.time, { color: isMyMessage() ? props.senderStyle?.textColor : props.receiverStyle?.textColor }]}>{new Date(message.createdDate).toLocaleDateString()} {new Date(message.createdDate).toLocaleTimeString()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  messageBox: {
    padding: 10,
  },
  name: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  message: {
    width: "100%",
  },
  media: {
    width: "100%",
    height: Dimensions.get("screen").width,
    marginVertical: 10,
  },
  time: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "gray",
  },
});
