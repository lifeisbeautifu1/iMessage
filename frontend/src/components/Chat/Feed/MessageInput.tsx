import { useMutation } from "@apollo/client";
import { Box, Input } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { ObjectID } from "bson";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { SendMessageArguments } from "../../../../../backend/src/util/types";
import MessageOperations from "../../../graphql/operations/message";
import { send } from "process";
import { MessagesData } from "../../../util/types";

type Props = {
  conversationId: string;
};

const MessageInput = ({ conversationId }: Props) => {
  const [messageBody, setMessageBody] = useState("");

  const { data: session } = useSession();

  const [sendMessage] = useMutation<
    { sendMessage: boolean },
    SendMessageArguments
  >(MessageOperations.Mutatiton.sendMessage);

  const onSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (session?.user) {
        const {
          user: { id: senderId },
        } = session;
        const messageId = new ObjectID().toString();
        const newMessage: SendMessageArguments = {
          id: messageId,
          body: messageBody,
          senderId,
          conversationId,
        };
        setMessageBody("");
        const { data, errors } = await sendMessage({
          variables: {
            ...newMessage,
          },
          optimisticResponse: {
            sendMessage: true,
          },
          update: (cache) => {
            const existing = cache.readQuery<MessagesData>({
              query: MessageOperations.Query.messages,
              variables: {
                conversationId,
              },
            }) as MessagesData;
            cache.writeQuery<
              MessagesData,
              {
                conversationId: string;
              }
            >({
              query: MessageOperations.Query.messages,
              variables: {
                conversationId,
              },
              data: {
                ...existing,
                messages: [
                  {
                    id: messageId,
                    body: messageBody,
                    senderId: session?.user?.id,
                    conversationId,
                    sender: {
                      id: session?.user?.id,
                      username: session?.user.username,
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                  ...existing.messages,
                ],
              },
            });
          },
        });
        if (!data?.sendMessage || errors) {
          throw new Error("Failed to send message");
        }
      }
    } catch (error: any) {
      console.log("sendMessage error: ", error);
      toast.error(error?.message);
    }
  };
  return (
    <Box px={4} py={6} width="100%">
      <form onSubmit={onSendMessage}>
        <Input
          value={messageBody}
          onChange={(event) => setMessageBody(event.target.value)}
          placeholder="New Message"
          size="md"
          resize="none"
          _focus={{
            boxShadow: "none",
            border: "1px solid",
            borderColor: "whiteAlpha.300",
          }}
        />
      </form>
    </Box>
  );
};

export default MessageInput;
