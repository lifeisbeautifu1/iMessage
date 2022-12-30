import { Flex, Stack, Text } from "@chakra-ui/react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { SearchedUser } from "../../../../util/types";

type Props = {
  participants: Array<SearchedUser>;
  removeParticipant: (id: string) => void;
};

const Participants = ({ participants, removeParticipant }: Props) => {
  return (
    <Flex direction="row" mt={8} gap="10px" flexWrap="wrap">
      {participants.map((participant) => (
        <Stack
          align="center"
          direction="row"
          bg="#3d3d3d"
          borderRadius={4}
          key={participant.id}
          p={2}
        >
          <Text>{participant.username}</Text>
          <IoIosCloseCircleOutline
            onClick={() => removeParticipant(participant.id)}
            size={20}
            cursor="pointer"
          />
        </Stack>
      ))}
    </Flex>
  );
};

export default Participants;
