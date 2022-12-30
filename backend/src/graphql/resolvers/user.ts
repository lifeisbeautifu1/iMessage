import { CreateUsernameResponse, GraphQLContext } from "../../util/types";

const resolvers = {
  Query: {
    searchUsers: () => {},
  },
  Mutation: {
    createUsername: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<CreateUsernameResponse> => {
      const { username } = args;
      const { prisma, session } = context;
      const userId = session?.user?.id;
      if (!session?.user) {
        return {
          error: "Not authorized",
        };
      }
      try {
        const existingUser = await prisma.user.findUnique({
          where: {
            username,
          },
        });
        if (existingUser) {
          return {
            error: "Username already taken. Try another",
          };
        }
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            username,
          },
        });
        return {
          success: true,
        };
      } catch (error: any) {
        return {
          error: error.message,
        };
      }
    },
  },
};

export default resolvers;
