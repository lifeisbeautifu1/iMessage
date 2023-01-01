import {
  ConversationPopulated,
  MessagePopulated,
} from "../../../backend/src/util/types";

// Users

export type CreateUsernameData = {
  createUsername: {
    success: boolean;
    error: string;
  };
};

export type CreateUsernameVariables = {
  username: string;
};

export type SearchUsersInput = {
  username: string;
};

export type SearchUsersData = {
  searchUsers: Array<SearchedUser>;
};

export type SearchedUser = {
  id: string;
  username: string;
};

// Conversations

export type ConversationsData = {
  conversations: Array<ConversationPopulated>;
};

export type CreateConversationData = {
  createConversation: {
    conversationId: string;
  };
};

export type CreateConversationInput = {
  participantsIds: Array<string>;
};

export type ConversationUpdatedData = {
  conversationUpdated: {
    // conversation: Omit<ConversationPopulated, "latestMessage"> & {
    //   latestMessage: MessagePopulated;
    // };
    conversation: ConversationPopulated;
  };
};

export type ConversationDeletedData = {
  conversationDeleted: {
    id: string;
  };
};

// Messages

export type MessagesData = {
  messages: Array<MessagePopulated>;
};

export type MessagesVariables = {
  conversationId: string;
};

export type MessageSubscriptionData = {
  subscriptionData: {
    data: {
      messageSent: MessagePopulated;
    };
  };
};
