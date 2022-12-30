import { Button, Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import ConversationWrapper from "./Conversations/ConversationWrapper";
import FeedWrapper from "./Feed/FeedWrapper";

type Props = {};

const Chat = (props: Props) => {
  return (
    <Flex height="100vh">
      <ConversationWrapper />
      <FeedWrapper />
      <Button onClick={() => signOut()}>logout</Button>
    </Flex>
  );
};

export default Chat;
