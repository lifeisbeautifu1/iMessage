import {
  Button,
  ModalOverlay,
  Modal as ChakraModal,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  Input,
} from "@chakra-ui/react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { FormEvent, useState } from "react";

import userOperations from "../../../../graphql/operations/user";
import {
  CreateConversationData,
  CreateConversationInput,
  SearchedUser,
  SearchUsersData,
  SearchUsersInput,
} from "../../../../util/types";
import UserSearchList from "./UserSearchList";
import Participants from "./Participants";
import { toast } from "react-hot-toast";
import conversation from "../../../../graphql/operations/conversation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const Modal = ({ isOpen, onClose }: Props) => {
  const { data: session } = useSession();

  const [username, setUsername] = useState("");

  const router = useRouter();

  const [participants, setParticipants] = useState<Array<SearchedUser>>([]);

  const addParticipant = (participant: SearchedUser) => {
    setParticipants([...participants, participant]);
    setUsername("");
  };

  const removeParticipant = (id: string) => {
    setParticipants(
      participants.filter((participant) => participant.id !== id)
    );
  };

  const [searchUsers, { data, error, loading }] = useLazyQuery<
    SearchUsersData,
    SearchUsersInput
  >(userOperations.Queries.searchUsers);

  const [createConversation, { loading: createConversationLoading }] =
    useMutation<CreateConversationData, CreateConversationInput>(
      conversation.Mutations.createConversation
    );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    searchUsers({ variables: { username } });
  };

  const onCreateConversation = async () => {
    try {
      const { data } = await createConversation({
        variables: {
          participantsIds: [
            session?.user.id!,
            ...participants.map((participant) => participant.id),
          ],
        },
      });
      if (!data?.createConversation) {
        throw new Error("Failed to create conversation");
      }
      const {
        createConversation: { conversationId },
      } = data;
      router.push({ query: { conversationId } });
      setParticipants([]);
      setUsername("");
      onClose();
    } catch (error: any) {
      console.error("onCreateConversation error: ", error);
      toast.error(error?.message);
    }
  };

  return (
    <>
      <ChakraModal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="#2d2d2d" pb={4}>
          <ModalHeader>Create a conversation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={onSubmit}>
              <Stack spacing={4}>
                <Input
                  placeholder="Enter a username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
                <Button
                  isLoading={loading}
                  type="submit"
                  disabled={!username.trim()}
                >
                  Search
                </Button>
              </Stack>
            </form>
            {data?.searchUsers && (
              <UserSearchList
                addParticipant={addParticipant}
                users={data.searchUsers}
              />
            )}
            {participants.length !== 0 && (
              <>
                <Participants
                  participants={participants}
                  removeParticipant={removeParticipant}
                />
                <Button
                  bg="brand.100"
                  width="100%"
                  mt={6}
                  _hover={{ bg: "brand.100" }}
                  isLoading={createConversationLoading}
                  onClick={onCreateConversation}
                >
                  Create Conversation
                </Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </ChakraModal>
    </>
  );
};

export default Modal;
