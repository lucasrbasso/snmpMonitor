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

        <Flex flexDirection="column" width="100%">
          <Box
            p={["6", "8"]}
            bg="gray.800"
            borderRadius={8}
            pb="4"
            mb="6"
            width="100%"
          >
            <Text fontSize="lg" mb="4">
              Inscritos da semana
            </Text>
            <Chart type="area" series={series} options={options} height={250} />
          </Box>
          <Box p={["6", "8"]} bg="gray.800" borderRadius={8} pb="4">
            <Text fontSize="lg" mb="4">
              Taxa de abertura
            </Text>
            <Chart type="bar" series={series} options={options} height={250} />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Home;
