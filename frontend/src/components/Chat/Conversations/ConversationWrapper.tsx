import { Box } from "@chakra-ui/react";
import ConversationList from "./ConversationList";

type Props = {};

const ConversationWrapper = (props: Props) => {
  return (
    <Box width={{ base: "100%", md: "400px" }} bg="whiteAlpha.50" p={3}>
      <ConversationList />
    </Box>
  );
};

export default ConversationWrapper;
