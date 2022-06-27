import { Text } from "@chakra-ui/react";

export const Logo: React.FC = () => {
  return (
    <Text
      fontSize={["2xl", "3xl"]}
      fontWeight="bold"
      letterSpacing="tight"
      width="64"
    >
      SNMPMonitor
      <Text as="span" ml="1" color="pink.500">
        .
      </Text>
    </Text>
  );
};
