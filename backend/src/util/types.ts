import { ISODateString } from "next-auth";
import type { Prisma, PrismaClient } from "@prisma/client";
import {
  conversationPopulated,
  participantPopulated,
} from "../graphql/resolvers/conversation";
import { PubSub } from "graphql-subscriptions";
import { Context } from "graphql-ws/lib/server";

export type GraphQLContext = {
  session: Session | null;
  prisma: PrismaClient;
  pubsub: PubSub;
};

export type Session = {
  user: User;
  expires: ISODateString;
};

export interface SubscriptionContext extends Context {
  connectionParams: {
    session?: Session;
  };
}

export type User = {
  id: string;
  username: string;
  image: string;
  email: string;
  emailVerified: boolean;
  name: string;
};

export type CreateUsernameResponse = {
  success?: boolean;
  error?: string;
};

export type ConversationPopulated = Prisma.ConversationGetPayload<{
  include: typeof conversationPopulated;
}>;

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
  include: typeof participantPopulated;
}>;
