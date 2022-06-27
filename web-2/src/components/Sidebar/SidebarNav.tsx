import { Flex, Input, Stack, Switch, Text } from "@chakra-ui/react";

import { RiCpuLine } from "react-icons/ri";
import { FaMemory, FaNetworkWired } from "react-icons/fa";
import { NavLink } from "./NavLink";

import { NavSection } from "./NavSection";
import { useSidebarDrawer } from "../../hooks/SidebarDrawerContext";

export const SidebarNav: React.FC = () => {
  const { group, ip, isRunning, changeGroup, changeIp, changeIsRunning } =
    useSidebarDrawer();

  return (
    <>
      <Stack spacing="12" align="flex-start">
        <NavSection title="MONITORAMENTO">
          <NavLink icon={RiCpuLine} href="/cpu">
            CPU
          </NavLink>
          <NavLink icon={FaMemory} href="/memory">
            MEMÓRIA
          </NavLink>
          <NavLink icon={FaNetworkWired} href="/tcp">
            TCP
          </NavLink>
          <NavLink icon={FaNetworkWired} href="/udp">
            UDP
          </NavLink>
        </NavSection>
      </Stack>
      <Text mt={8}>Endereço IP:</Text>
      <Input
        mt={2}
        placeholder="Endereço Ip"
        onChange={(event) => changeIp(event.target.value)}
        value={ip}
      />

      <Text mt={4}>Grupo:</Text>
      <Input
        mt={2}
        placeholder="Grupo"
        onChange={(event) => changeGroup(event.target.value)}
        value={group}
      />

      <Flex width="100%" flexDirection="column" alignItems="center">
        <Text mt={8}>Ligar o consumo de dados:</Text>
        <Switch
          mt={2}
          size="lg"
          onChange={changeIsRunning}
          isChecked={isRunning}
        />
      </Flex>
    </>
  );
};
