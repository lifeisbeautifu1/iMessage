import { Flex, Stack } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import {
  MessagesData,
  MessageSubscriptionData,
  MessagesVariables,
} from "../../../util/types";
import MessageOperations from "../../../graphql/operations/message";
import { toast } from "react-hot-toast";
import SkeletonLoader from "../../common/SkeletonLoader";
import { useEffect } from "react";
import MessageItem from "./MessageItem";
import { useSession } from "next-auth/react";

type Props = {
  conversationId: string;
};

const Messages: React.FC<Props> = ({ conversationId }) => {
  const { data: session } = useSession();
  const { data, error, loading, subscribeToMore } = useQuery<
    MessagesData,
    MessagesVariables
  >(MessageOperations.Query.messages, {
    variables: {
      conversationId,
    },
    onError: ({ message }) => {
      toast.error(message);
    },
  });
  const subscribeToMoreMessages = (conversationId: string) => {
    subscribeToMore({
      document: MessageOperations.Subscription.messageSent,
      variables: {
        conversationId,
      },
      updateQuery: (prev, { subscriptionData }: MessageSubscriptionData) => {
        if (!subscriptionData) return prev;
        const newMessage = subscriptionData.data.messageSent;
        return Object.assign({}, prev, {
          messages:
            newMessage.sender.id === session?.user.id
              ? prev.messages
              : [newMessage, ...prev.messages],
        });
      },
    });
  };

  useEffect(() => {
    subscribeToMoreMessages(conversationId);
  }, [conversationId]);

  if (error) return null;

  return (
    <Flex direction="column" justify="flex-end" overflow="hidden">
      {loading && (
        <Stack px={4} spacing={4}>
          <SkeletonLoader count={4} height="60px" />
        </Stack>
      )}
      {data?.messages && (
        <Flex direction="column-reverse" overflowY="scroll" height="100%">
          {data.messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              sentByMe={message.sender.id === session?.user?.id}
            />
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default Messages;
