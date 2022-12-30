import { Button, Center, Image, Stack, Text, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useMutation } from "@apollo/client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";

import userOperations from "../../graphql/operations/user";
import { CreateUsernameData, CreateUsernameVariables } from "../../util/types";

type Props = {
  session: Session | null;
  reloadSession: () => void;
};

const Auth = ({ session, reloadSession }: Props) => {
  const [username, setUsername] = useState("");

  const [createUsername, { loading, error }] = useMutation<
    CreateUsernameData,
    CreateUsernameVariables
  >(userOperations.Mutatitons.createUsername);

  const onSubmit = async () => {
    if (!username?.trim()) return;
    try {
      const { data } = await createUsername({
        variables: {
          username,
        },
      });
      if (!data?.createUsername) {
        throw new Error();
      }
      if (data.createUsername?.error) {
        const {
          createUsername: { error },
        } = data;
        toast.error(error);
        return;
      }
      toast.success("Username successfully created! 🚀");
      reloadSession();
    } catch (error: any) {
      toast.error(error?.message);
      console.error(error);
    }
  };

  return (
    <Center height="100vh">
      <Stack spacing={4} align="center">
        {session ? (
          <>
            <Text fontSize="3xl">Create a Username</Text>
            <Input
              value={username}
              placeholder="Enter a username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button width="100%" onClick={onSubmit}>
              Save
            </Button>
          </>
        ) : (
          <>
            <Text fontSize="3xl">iMessage</Text>
            <Button
              leftIcon={<Image height="20px" src="/images/googlelogo.png" />}
              onClick={() => signIn("google")}
            >
              Continue with google
            </Button>
          </>
        )}
      </Stack>
    </Center>
  );
};

export default Auth;
