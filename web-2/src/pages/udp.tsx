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
  const [latestUdpInData, setLatestUdpInData] = useState<number>(-1);
  const [latestUdpOutData, setLatestUdpOutData] = useState<number>(-1);
  const [udpInData, setUdpInData] = useState<number[]>([]);
  const [udpOutData, setUdpOutData] = useState<number[]>([]);
  const [udpInErross, setUdpActiveOpens] = useState<number>(0);
  const [udpNoPortss, setUdpPassiveOpens] = useState<number>(0);

  const timer = useRef<any>(null);

  const { group, ip, isRunning } = useSidebarDrawer();

  const loadData = useCallback(async () => {
    const udpIn = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.7.1.0",
        group,
      },
    });

    const udpOut = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.7.4.0",
        group,
      },
    });

    const udpInErros = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.7.3.0",
        group,
      },
    });

    const udpNoPorts = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.7.2.0",
        group,
      },
    });

    if (latestUdpInData < 0) {
      setUdpInData((previousData) => [...previousData, 0]);
      setUdpOutData((previousData) => [...previousData, 0]);
    } else {
      setUdpOutData((previousData) => [
        ...previousData,
        udpOut.data - latestUdpOutData,
      ]);

      setUdpInData((previousData) => [
        ...previousData,
        udpIn.data - latestUdpInData,
      ]);
    }

    setLatestUdpInData(udpIn.data);
    setLatestUdpOutData(udpOut.data);

    setUdpActiveOpens(udpInErros.data);
    setUdpPassiveOpens(udpNoPorts.data);
  }, [group, ip, latestUdpInData, latestUdpOutData]);

  const shiftData = useCallback(async () => {
    const udpIn = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.7.1.0",
        group,
      },
    });

    const udpOut = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.7.4.0",
        group,
      },
    });

    const udpInErros = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.7.3.0",
        group,
      },
    });

    const udpNoPorts = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.7.2.0",
        group,
      },
    });

    const loadedUdpInData = udpInData;
    loadedUdpInData.shift();
    const loadedUdpOutData = udpOutData;
    loadedUdpOutData.shift();

    setUdpInData([...loadedUdpInData, udpIn.data - latestUdpInData]);
    setUdpOutData([...loadedUdpOutData, udpOut.data - latestUdpOutData]);

    setLatestUdpInData(udpIn.data);
    setLatestUdpOutData(udpOut.data);

    setUdpActiveOpens(udpInErros.data);
    setUdpPassiveOpens(udpNoPorts.data);
  }, [group, ip, udpInData, udpOutData, latestUdpInData, latestUdpOutData]);

  useEffect(() => {
    if (isRunning && udpInData.length < 60) {
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
  }, [isRunning, udpInData, loadData, shiftData]);

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
              UDP In Datagrams x UDP Out Datagrams (60 seconds)
            </Text>
            <Chart
              type="area"
              series={[
                {
                  name: "UDP In",
                  data: udpInData,
                },
                {
                  name: "UDP Out",
                  data: udpOutData,
                },
              ]}
              options={options}
              height={250}
            />
          </Box>
          <Box p={["6", "8"]} bg="gray.800" borderRadius={8} pb="4">
            <Text fontSize="lg" mb="4">
              Problems with UDP (No ports or Errors)
            </Text>
            <Chart
              type="donut"
              series={[udpInErross, udpNoPortss]}
              options={{
                labels: ["UDP In Errors", "UDP No Ports"],
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
