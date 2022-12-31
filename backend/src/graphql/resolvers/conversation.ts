import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import { ConversationPopulated, GraphQLContext } from "../../util/types";

const resolvers = {
  Query: {
    conversations: async (
      _: any,
      __: any,
      context: GraphQLContext
    ): Promise<Array<ConversationPopulated>> => {
      const { prisma, session } = context;
      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }
      const {
        user: { id: userId },
      } = session;

      try {
        const conversations = await prisma.conversation.findMany({
          include: conversationPopulated,
        });
        return conversations.filter(
          (conversation) =>
            !!conversation.participants.find((p) => p.userId === userId)
        );
      } catch (error: any) {
        console.log("conversations error:", error);
        throw new GraphQLError(error?.messages);
      }
    },
  },
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantsIds: Array<string> },
      context: GraphQLContext
    ): Promise<{ conversationId: string }> => {
      const { participantsIds } = args;
      const { session, prisma, pubsub } = context;

      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }

      const {
        user: { id: userId },
      } = session;

      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantsIds.map((id) => ({
                  userId: id,
                  hasSeenLatestMessage: id == userId,
                })),
              },
            },
          },
          include: conversationPopulated,
        });
        pubsub.publish("CONVERSATION_CREATED", {
          conversationCreated: conversation,
        });
        return {
          conversationId: conversation.id,
        };
      } catch (error: any) {
        console.error("createConversation error: ", error);
        throw new GraphQLError("Error creating conversation");
      }
    },
  },
  Subscription: {
    conversationCreated: {
      // subscribe: (_: any, __: any, context: GraphQLContext) => {
      //   const { pubsub } = context;
      //   return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
      // },
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
        },
        (
          payload: ConversationCreateSubscriptionPayload,
          _: any,
          context: GraphQLContext
        ) => {
          const { session } = context;
          const {
            conversationCreated: { participants },
          } = payload;
          const userIsParticipant = !!participants.find(
            (p) => p.userId === session?.user?.id
          );
          return userIsParticipant;
        }
      ),
    },
  },
};

export type ConversationCreateSubscriptionPayload = {
  conversationCreated: ConversationPopulated;
};

export const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  });

export const conversationPopulated =
  Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
      include: participantPopulated,
    },
    latestMessage: {
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
  });

export default resolvers;
