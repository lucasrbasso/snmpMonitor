import type { NextPage } from "next";

import { Box, Flex, Input, Select, Text } from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { options } from "../lineChartOptions";
import { useSidebarDrawer } from "../hooks/SidebarDrawerContext";
import { api } from "../services/api";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface CpuData {
  name: string;
  data: number[];
}

const Cpu: NextPage = () => {
  const [firstOidCpu, setFirstOidCpu] = useState<string>(
    "1.3.6.1.2.1.25.3.3.1.2.4"
  );
  const [cpuOids, setCpuOids] = useState<string[]>([]);
  const [numberOfCores, setNumberOfCores] = useState(8);
  const [cpuData, setCpuData] = useState<CpuData[]>([]);

  const timer = useRef<any>(null);

  const { group, ip, isRunning, turnOffIsRunning } = useSidebarDrawer();

  const changeCpuOids = useCallback(async () => {
    const oids = firstOidCpu.split(".");
    setCpuOids([]);

    const lastValue = oids.pop();
    const preFinalOid = oids.join(".");
    const cpuAuxOids = [];

    if (lastValue) {
      for (let index = 0; index < numberOfCores; index++) {
        let oidAux = preFinalOid;

        oidAux += `.${String(Number(lastValue) + index)}`;
        cpuAuxOids.push(oidAux);
      }
      setCpuOids(cpuAuxOids);
    }
  }, [firstOidCpu, numberOfCores]);

  const loadData = useCallback(async () => {
    let cpuDataAux = cpuData.map((value) => value);

    cpuOids.map(async (oid, index) => {
      const loadCpuForOid = await api.get<number>("/", {
        params: {
          ip,
          oid,
          group,
        },
      });

      if (loadCpuForOid) {
        const cpuDataValue = cpuData[index] ? cpuData[index].data : [0];
        let finalCpuData = {} as CpuData;

        if (cpuData[index]) {
          if (cpuData[index].data.length < 60) {
            finalCpuData = {
              name: `CPU ${index + 1}`,
              data: [...cpuDataValue, loadCpuForOid.data],
            };
          } else {
            const dataAux = cpuData[index].data;
            dataAux.shift();

            finalCpuData = {
              name: `CPU ${index + 1}`,
              data: [...dataAux, loadCpuForOid.data],
            };
          }
        } else {
          finalCpuData = {
            name: `CPU ${index + 1}`,
            data: [...cpuDataValue, loadCpuForOid.data],
          };
        }

        const cpuExists = cpuData.filter(
          (cpu) => cpu.name === `CPU ${index + 1}`
        );

        if (cpuExists.length > 0) {
          const finalCpu = cpuDataAux.map((cpu) => {
            if (cpu.name === `CPU ${index + 1}`) {
              return finalCpuData;
            } else {
              return cpu;
            }
          });

          cpuDataAux = finalCpu;
          setCpuData(cpuDataAux);
        } else {
          cpuDataAux.push(finalCpuData);
          cpuDataAux.sort(function (cpu1, cpu2) {
            if (cpu1.name > cpu2.name) {
              return 1;
            }
            if (cpu1.name < cpu2.name) {
              return -1;
            }
            return 0;
          });
          setCpuData([...cpuDataAux]);
        }
      }
    });
  }, [cpuData, cpuOids, group, ip]);

  useEffect(() => {
    changeCpuOids();
  }, [changeCpuOids]);

  useEffect(() => {
    if (isRunning) {
      timer.current = setInterval(async () => {
        await loadData();
      }, 1000);
    }
    return () => {
      clearInterval(timer.current);
    };
  }, [isRunning, loadData]);

  const changeFirstOidCpu = (value: string) => {
    turnOffIsRunning();
    setFirstOidCpu(value);
    changeCpuOids();
    setCpuData([]);
  };

  const changeNumberOfCores = (value: number) => {
    turnOffIsRunning();
    setNumberOfCores(value);
    changeCpuOids();
    setCpuData([]);
  };

  return (
    <Flex direction="column" h="100vh">
      <Header />

      <Flex w="100%" my="6" maxWidth={1480} mx="auto" px="6">
        <Sidebar />

        <Flex flexDirection="column" width="100%">
          <Text mt={8}>Primeira Oid CPU:</Text>
          <Input
            placeholder="Primeira Oid CPU"
            onChange={(event) => changeFirstOidCpu(event.target.value)}
            value={firstOidCpu}
          />

          <Text mt={3}>Número de Cores:</Text>

          <Select
            mb={4}
            bg={"#181B23"}
            color="white"
            value={numberOfCores}
            onChange={(event) =>
              changeNumberOfCores(Number(event.target.value))
            }
          >
            <option style={{ backgroundColor: "#181B23" }} value={2}>
              2
            </option>
            <option style={{ backgroundColor: "#181B23" }} value={4}>
              4
            </option>
            <option style={{ backgroundColor: "#181B23" }} value={6}>
              6
            </option>
            <option style={{ backgroundColor: "#181B23" }} value={8}>
              8
            </option>
            <option style={{ backgroundColor: "#181B23" }} value={12}>
              12
            </option>
          </Select>

          <Box
            p={["6", "8"]}
            bg="gray.800"
            borderRadius={8}
            pb="4"
            mb="6"
            width="100%"
          >
            <Text fontSize="lg" mb="4">
              CPU Load (60 seconds)
            </Text>
            <Chart
              type="line"
              series={cpuData}
              options={options}
              height={400}
            />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Cpu;
