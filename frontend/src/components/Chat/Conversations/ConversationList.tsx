import { Box, Text, Button } from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import { ConversationPopulated } from "../../../../../backend/src/util/types";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import ConversationOperations from "../../../graphql/operations/conversation";
import ConversationItem from "./ConversationItem";
import ConversationModal from "./Modal/Modal";
import { toast } from "react-hot-toast";

type Props = {
  conversations: Array<ConversationPopulated>;
  onViewConversation: (
    conversationId: string,
    hasSeenLatestMessage?: boolean
  ) => Promise<void>;
};

const ConversationList = ({ conversations, onViewConversation }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: session } = useSession();

  const [deleteConversation] = useMutation<{
    deleteConversation: boolean;
    conversationId: string;
  }>(ConversationOperations.Mutations.deleteConversation);

  const router = useRouter();

  const onOpen = () => setIsOpen(true);

  const onClose = () => setIsOpen(false);

  const onDeleteConversation = async (conversationId: string) => {
    try {
      toast.promise(
        deleteConversation({
          variables: {
            conversationId,
          },
          update: () => {
            router.replace(
              typeof process.env.NEXT_PUBLIC_BASE_URL === "string"
                ? process.env.NEXT_PUBLIC_BASE_URL
                : ""
            );
          },
        }),
        {
          loading: "Deleting conversation",
          success: "Conversation deleted",
          error: "Failed to delete conversation",
        }
      );
    } catch (error: any) {
      console.log("onDeleteConversation error:", error);
      toast.error(error?.message);
    }
  };

  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt.valueOf() - a.updatedAt.valueOf()
  );

  return (
    <Box
      width={{ base: "100%", md: "400px" }}
      position="relative"
      height="100%"
      overflow="hidden"
    >
      <Box
        py={2}
        px={4}
        mb={4}
        bg="blackAlpha.300"
        borderRadius={4}
        cursor="pointer"
        onClick={onOpen}
      >
        <Text textAlign="center" fontWeight="500" color="whiteAlpha.800">
          Find or start a conversation
        </Text>
      </Box>
      <ConversationModal isOpen={isOpen} onClose={onClose} />
      {session?.user?.id &&
        sortedConversations.map((conversation) => {
          const participant = conversation.participants.find(
            (p) => p.user.id === session?.user?.id
          );
          return (
            <ConversationItem
              onClick={() =>
                onViewConversation(
                  conversation.id,
                  participant?.hasSeenLatestMessage
                )
              }
              onDeleteConversation={onDeleteConversation}
              hasSeenLatestMessage={participant?.hasSeenLatestMessage}
              userId={session?.user?.id}
              selectedConversationId={router.query.conversationId as string}
              key={conversation.id}
              conversation={conversation}
            />
          );
        })}
      <Box px={8} py={6} position="absolute" bottom={0} left={0} width="100%">
        <Button width="100%" onClick={() => signOut()}>
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default ConversationList;
