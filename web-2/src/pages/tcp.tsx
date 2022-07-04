import type { NextPage } from "next";

import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { options } from "../chartOptions";
import { useSidebarDrawer } from "../hooks/SidebarDrawerContext";
import { api } from "../services/api";
import { theme } from "../styles/theme";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const Home: NextPage = () => {
  const [latestTcpInData, setLatestTcpInData] = useState<number>(-1);
  const [latestTcpOutData, setLatestTcpOutData] = useState<number>(-1);
  const [tcpInData, setTcpInData] = useState<number[]>([]);
  const [tcpOutData, setTcpOutData] = useState<number[]>([]);
  const [tcpActiveOpens, setTcpActiveOpens] = useState<number>(0);
  const [tcpPassiveOpens, setTcpPassiveOpens] = useState<number>(0);

  const timer = useRef<any>(null);

  const { group, ip, isRunning } = useSidebarDrawer();

  const loadData = useCallback(async () => {
    const tcpIn = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.6.10.0",
        group,
      },
    });

    const tcpOut = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.6.11.0",
        group,
      },
    });

    const tcpActiveOpen = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.6.5.0",
        group,
      },
    });

    const tcpPassiveOpen = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.6.6.0",
        group,
      },
    });

    if (latestTcpInData < 0) {
      setTcpInData((previousData) => [...previousData, 0]);
      setTcpOutData((previousData) => [...previousData, 0]);
    } else {
      setTcpOutData((previousData) => [
        ...previousData,
        tcpOut.data - latestTcpOutData,
      ]);

      setTcpInData((previousData) => [
        ...previousData,
        tcpIn.data - latestTcpInData,
      ]);
    }

    setLatestTcpInData(tcpIn.data);
    setLatestTcpOutData(tcpOut.data);

    setTcpActiveOpens(tcpActiveOpen.data);
    setTcpPassiveOpens(tcpPassiveOpen.data);
  }, [group, ip, latestTcpInData, latestTcpOutData]);

  const shiftData = useCallback(async () => {
    const tcpIn = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.6.10.0",
        group,
      },
    });

    const tcpOut = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.6.11.0",
        group,
      },
    });

    const tcpActiveOpen = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.6.5.0",
        group,
      },
    });

    const tcpPassiveOpen = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.6.6.0",
        group,
      },
    });

    const loadedTcpInData = tcpInData;
    loadedTcpInData.shift();
    const loadedTcpOutData = tcpOutData;
    loadedTcpOutData.shift();

    setTcpInData([...loadedTcpInData, tcpIn.data - latestTcpInData]);
    setTcpOutData([...loadedTcpOutData, tcpOut.data - latestTcpOutData]);

    setLatestTcpInData(tcpIn.data);
    setLatestTcpOutData(tcpOut.data);

    setTcpActiveOpens(tcpActiveOpen.data);
    setTcpPassiveOpens(tcpPassiveOpen.data);
  }, [group, ip, tcpInData, tcpOutData, latestTcpInData, latestTcpOutData]);

  useEffect(() => {
    if (isRunning && tcpInData.length < 60) {
      timer.current = setInterval(async () => {
        await loadData();
      }, 1000);
    } else if (isRunning) {
      timer.current = setInterval(() => {
        shiftData();
      }, 1000);
    } else {
      clearInterval(timer.current);
    }
    return () => {
      clearInterval(timer.current);
    };
  }, [isRunning, tcpInData, loadData, shiftData]);

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
              TCP In x TCP Out (60 seconds)
            </Text>
            <Chart
              type="area"
              series={[
                {
                  name: "TCP In",
                  data: tcpInData,
                },
                {
                  name: "TCP Out",
                  data: tcpOutData,
                },
              ]}
              options={options}
              height={250}
            />
          </Box>
          <Box p={["6", "8"]} bg="gray.800" borderRadius={8} pb="4">
            <Text fontSize="lg" mb="4">
              Active TCP Opens x Passive TCP Opens
            </Text>
            <Chart
              type="donut"
              series={[tcpActiveOpens, tcpPassiveOpens]}
              options={{
                labels: ["Active Opens", "Passive Opens"],
                legend: {
                  labels: {
                    colors: theme.colors.gray[200],
                  },
                },
              }}
              height={250}
            />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Home;
