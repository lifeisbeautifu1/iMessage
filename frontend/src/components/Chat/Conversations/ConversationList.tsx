import { Box, Text } from "@chakra-ui/react";
import { useState } from "react";
import { ConversationPopulated } from "../../../../../backend/src/util/types";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import ConversationItem from "./ConversationItem";
import ConversationModal from "./Modal/Modal";

type Props = {
  conversations: Array<ConversationPopulated>;
  onViewConversation: (conversationId: string) => Promise<void>;
};

const ConversationList = ({ conversations, onViewConversation }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: session } = useSession();

  const router = useRouter();

  const onOpen = () => setIsOpen(true);

  const onClose = () => setIsOpen(false);

  return (
    <Box width="100%">
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
        conversations.map((conversation) => (
          <ConversationItem
            onClick={() => onViewConversation(conversation.id)}
            userId={session?.user?.id}
            selectedConversationId={router.query.conversationId as string}
            key={conversation.id}
            conversation={conversation}
          />
        ))}
    </Box>
  );
};

export default ConversationList;
