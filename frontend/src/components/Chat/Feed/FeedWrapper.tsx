import { useRouter } from "next/router";
import { Flex } from "@chakra-ui/react";
import MessagesHeader from "./MessagesHeader";
import { useSession } from "next-auth/react";

type Props = {};

const FeedWrapper = (props: Props) => {
  const router = useRouter();

  const { data: session } = useSession();

  const { conversationId } = router.query;

  return (
    <Flex
      display={{ base: conversationId ? "flex" : "none", md: "flex" }}
      width="100%"
      direction="column"
    >
      {conversationId ? (
        <Flex
          direction="column"
          justify="space-between"
          overflow="hidden"
          flexGrow={1}
        >
          {conversationId &&
            typeof conversationId === "string" &&
            session?.user?.id && (
              <MessagesHeader
                conversationId={conversationId}
                userId={session?.user?.id}
              />
            )}
        </Flex>
      ) : (
        <div>No Conversation Selected</div>
      )}
    </Flex>
  );
};

export default FeedWrapper;
