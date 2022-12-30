import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginDrainHttpServer,
} from "apollo-server-core";
import { getSession } from "next-auth/react";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { PrismaClient } from "@prisma/client";
import express from "express";
import dotenv from "dotenv";
import http from "http";

import typeDefs from "./graphql/typeDefs";
import { GraphQLContext, Session } from "./util/types";
import resolvers from "./graphql/resolvers";

async function main() {
  dotenv.config();
  const app = express();
  const httpServer = http.createServer(app);
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  const corsConfig = {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  };
  const prisma = new PrismaClient();

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    context: async ({ req, res }): Promise<GraphQLContext> => {
      const session = await getSession({ req });

      return { session: session as Session, prisma };
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });

  await server.start();
  server.applyMiddleware({ app, cors: corsConfig });
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 5000 }, resolve)
  );

  console.log(`🚀 Server ready at http://localhost:5000${server.graphqlPath}`);
}

main().catch((err) => console.error(err));
