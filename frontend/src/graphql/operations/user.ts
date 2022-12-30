import { gql } from "@apollo/client";

export default {
  Queries: {},
  Mutatitons: {
    createUsername: gql`
      mutation CreateUsername($username: String!) {
        createUsername(username: $username) {
          success
          error
        }
      }
    `,
  },
  Subscriptions: {},
};
