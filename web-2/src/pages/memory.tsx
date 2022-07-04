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
  const [hrStorageUsed, setHrStorageUsed] = useState(0);
  const [hrStorageAllocationUnits, setHrStorageAllocationUnits] = useState(0);
  const [hrMemorySize, setHrMemorySize] = useState(0);

  const timer = useRef<any>(null);

  const { group, ip, isRunning } = useSidebarDrawer();

  const loadData = useCallback(async () => {
    const memorySize = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.25.2.2.0",
        group,
      },
    });

    const allocationUnits = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.25.2.3.1.4.4",
        group,
      },
    });

    const storageUsed = await api.get("/", {
      params: {
        ip,
        oid: "1.3.6.1.2.1.25.2.3.1.6.4",
        group,
      },
    });

    setHrStorageUsed(storageUsed.data);
    setHrStorageAllocationUnits(allocationUnits.data);
    setHrMemorySize(memorySize.data);
  }, [group, ip]);

  useEffect(() => {
    if (isRunning) {
      timer.current = setInterval(async () => {
        await loadData();
      }, 1000);
    } else {
      clearInterval(timer.current);
    }
    return () => {
      clearInterval(timer.current);
    };
  }, [isRunning, loadData]);

  return (
    <Flex direction="column" h="100vh">
      <Header />
      <Flex w="100%" my="6" maxWidth={1480} mx="auto" px="6">
        <Sidebar />

        <Flex flexDirection="column" width="100%">
          <Box p={["6", "8"]} bg="gray.800" borderRadius={8} pb="4">
            <Text fontSize="lg" mb="4">
              Use de memória RAM
            </Text>
            <Chart
              type="donut"
              series={[
                hrStorageAllocationUnits * hrStorageUsed * 0.000000001,
                hrMemorySize * 0.000001 -
                  hrStorageAllocationUnits * hrStorageUsed * 0.000000001,
              ]}
              options={{
                labels: ["Memória em uso", "Memória disponível"],
                legend: {
                  labels: {
                    colors: theme.colors.gray[200],
                  },
                },
                dataLabels: {
                  enabled: true,
                  formatter: function (val) {
                    return Number(val).toFixed(1) + "%";
                  },
                },
                plotOptions: {
                  pie: {
                    donut: {
                      labels: {
                        show: true,
                        name: {},
                        value: {
                          color: "#EEEEF2",
                        },
                        total: {
                          show: true,
                          showAlways: true,
                          color: "#EEEEF2",
                          formatter: function (val) {
                            const series = val.config.series;

                            return (
                              Number(series[0] + series[1]).toFixed(2) + " GB"
                            );
                          },
                        },
                      },
                    },
                  },
                },
              }}
              height={500}
            />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Home;
