import { Button } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";

type Props = {};

const Chat = (props: Props) => {
  const { data: session } = useSession();

  return (
    <div>
      {session?.user?.username}
      <Button onClick={() => signOut()}>logout</Button>
    </div>
  );
};

export default Chat;
