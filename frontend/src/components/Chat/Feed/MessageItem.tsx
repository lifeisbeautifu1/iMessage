import { Avatar, Stack, Text, Flex, Box } from "@chakra-ui/react";
import { formatRelative } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { MessagePopulated } from "../../../../../backend/src/util/types";

type Props = {
  message: MessagePopulated;
  sentByMe: boolean;
};

const formatRelativeLocale = {
  lastWeek: "eeee 'at' p",
  yesterday: "'Yersterday at' p",
  today: "p",
  other: "MM/dd/yy",
};

const MessageItem = ({ message, sentByMe }: Props) => {
  return (
    <Stack
      direction="row"
      p={4}
      spacing={4}
      justify={sentByMe ? "flex-end" : "flex-start"}
      _hover={{ bg: "whiteAlpha.200" }}
      wordBreak="break-word"
    >
      {!sentByMe && (
        <Flex align="flex-end">
          <Avatar size="sm" />
        </Flex>
      )}
      <Stack spacing={1} width="100%">
        <Stack
          direction="row"
          align="center"
          justify={sentByMe ? "flex-end" : "flex-start"}
        >
          {!sentByMe && (
            <Text fontWeight={500} textAlign="left">
              {message.sender.username}
            </Text>
          )}
          <Text fontSize={14} color="whiteAlpha.700">
            {formatRelative(new Date(message.createdAt), new Date(), {
              locale: {
                ...enUS,
                formatRelative: (token) =>
                  formatRelativeLocale[
                    token as keyof typeof formatRelativeLocale
                  ],
              },
            })}
          </Text>
        </Stack>
        <Flex justify={sentByMe ? "flex-end" : "flex-start"}>
          <Box
            py={1}
            borderRadius={12}
            maxWidth="65%"
            bg={sentByMe ? "brand.100" : "whiteAlpha.300"}
            px={2}
          >
            <Text>{message.body}</Text>
          </Box>
        </Flex>
      </Stack>
    </Stack>
  );
};

export default MessageItem;
