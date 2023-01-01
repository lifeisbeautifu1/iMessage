import { Box } from "@chakra-ui/react";
import ConversationList from "./ConversationList";
import ConversationOperations from "../../../graphql/operations/conversation";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  ConversationDeletedData,
  ConversationsData,
  ConversationUpdatedData,
} from "../../../util/types";
import {
  ConversationPopulated,
  ParticipantPopulated,
} from "../../../../../backend/src/util/types";
import { useEffect } from "react";
import { useRouter } from "next/router";
import SkeletonLoader from "../../common/SkeletonLoader";
import { useSession } from "next-auth/react";

type Props = {};

const ConversationWrapper = (props: Props) => {
  const {
    data: conversationsData,
    loading: conversationsLoading,
    error: conversationError,
    subscribeToMore,
  } = useQuery<ConversationsData>(ConversationOperations.Queries.conversations);

  const router = useRouter();

  const { data: session } = useSession();

  const [markConversationAsRead] = useMutation<
    {
      markConversationAsRead: boolean;
    },
    {
      userId: string;
      conversationId: string;
    }
  >(ConversationOperations.Mutations.markConversationAsRead);

  useSubscription<ConversationUpdatedData, null>(
    ConversationOperations.Subscriptions.conversationUpdated,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;
        if (!subscriptionData) return;
        const {
          conversationUpdated: { conversation: updatedConversation },
        } = subscriptionData;
        const currentlyViewingConversation =
          updatedConversation.id === conversationId;
        if (currentlyViewingConversation)
          onViewConversation(conversationId, false);
      },
    }
  );

  const conversationId = router.query.conversationId;

  const onViewConversation = async (
    conversationId: string,
    hasSeenLatestMessage?: boolean
  ) => {
    router.push({ query: { conversationId } });
    if (hasSeenLatestMessage) return;
    try {
      if (session?.user) {
        await markConversationAsRead({
          variables: {
            conversationId,
            userId: session?.user?.id,
          },
          optimisticResponse: {
            markConversationAsRead: true,
          },
          update: (cache) => {
            const participantsFragment = cache.readFragment<{
              participants: Array<ParticipantPopulated>;
            }>({
              id: `Conversation:${conversationId}`,
              fragment: gql`
                fragment Participants on Conversation {
                  participants {
                    user {
                      id
                      username
                    }
                    hasSeenLatestMessage
                  }
                }
              `,
            });
            if (!participantsFragment) return;

            const participants = [...participantsFragment.participants];

            const userParticipantIdx = participants.findIndex(
              (p) => p.user.id === session?.user?.id
            );

            if (userParticipantIdx === -1) return;

            const userParticipant = participants[userParticipantIdx];

            participants[userParticipantIdx] = {
              ...userParticipant,
              hasSeenLatestMessage: true,
            };

            cache.writeFragment({
              id: `Conversation:${conversationId}`,
              fragment: gql`
                fragment UpdateParticipant on Conversation {
                  participants
                }
              `,
              data: {
                participants,
              },
            });
          },
        });
      }
    } catch (error: any) {
      console.log("onViewConversation error:", error);
    }
  };

  const subscribeToNewConversations = () => {
    subscribeToMore({
      document: ConversationOperations.Subscriptions.conversationCreated,
      updateQuery: (
        prev,
        {
          subscriptionData,
        }: {
          subscriptionData: {
            data: { conversationCreated: ConversationPopulated };
          };
        }
      ) => {
        if (!subscriptionData.data) return prev;
        const newConversation = subscriptionData.data.conversationCreated;
        return Object.assign({}, prev, {
          conversations: [newConversation, ...prev.conversations],
        });
      },
    });
  };

  useSubscription<ConversationDeletedData>(
    ConversationOperations.Subscriptions.conversationDeleted,
    {
      onData: ({ client, data }) => {
        const { data: subscripitonData } = data;

        if (!subscripitonData) return;

        const existing = client.readQuery<ConversationsData>({
          query: ConversationOperations.Queries.conversations,
        });
        if (!existing) return;
        const { conversations } = existing;
        const {
          conversationDeleted: { id: deletedConversationId },
        } = subscripitonData;

        client.writeQuery<ConversationsData>({
          query: ConversationOperations.Queries.conversations,
          data: {
            conversations: conversations.filter(
              (c) => c.id !== deletedConversationId
            ),
          },
        });
      },
    }
  );

  useEffect(() => {
    subscribeToNewConversations();
  }, []);

  return (
    <Box
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
      width={{ base: "100%", md: "430px" }}
      bg="whiteAlpha.50"
      flexDirection="column"
      gap={4}
      py={6}
      px={3}
    >
      {conversationsLoading ? (
        <SkeletonLoader count={7} height="80px" />
      ) : (
        <ConversationList
          conversations={conversationsData?.conversations || []}
          onViewConversation={onViewConversation}
        />
      )}
    </Box>
  );
};

export default ConversationWrapper;
