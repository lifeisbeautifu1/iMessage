import { gql } from "graphql-tag";

const typeDefs = gql`
  scalar Date
  type Mutation {
    createConversation(participantsIds: [String]): CreateConversationResponse
  }
  type CreateConversationResponse {
    conversationId: String
  }
  type Conversation {
    id: String
    latestMessage: Message
    participants: [Participant]
    createdAt: Date
    updatedAt: Date
  }
  type Query {
    conversations: [Conversation]
  }
  type Participant {
    id: String
    user: User
    hasSeenLatestMessage: Boolean
  }
  type Subscription {
    conversationCreated: Conversation
  }
`;

export default typeDefs;
