import { GraphQLContext } from "../../util/types";

const resolvers = {
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantsIds: Array<string> },
      context: GraphQLContext
    ) => {
      const { participantsIds } = args;
      console.log(participantsIds);
    },
  },
};

export default resolvers;
