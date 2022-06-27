import type { NextPage } from "next";

import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import React from "react";
import dynamic from "next/dynamic";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { options } from "../chartOptions";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const series = [
  {
    name: "series1",
    data: [31, 120, 10, 28, 51, 18, 109],
  },
];

const Home: NextPage = () => {
  return (
    <Flex direction="column" h="100vh">
      <Header />
      <Flex w="100%" my="6" maxWidth={1480} mx="auto" px="6">
        <Sidebar />
        <Box>
          <Text>
            Bem vindo ao SNMPMonitor, selecione o sensor que deseja monitorar na
            aba da esquerda.
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Home;
