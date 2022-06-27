import { useDisclosure, UseDisclosureReturn } from "@chakra-ui/react";
import { useRouter } from "next/router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface SidebarDrawerProviderProps {
  children: ReactNode;
}

interface SidebarDrawerContextData extends UseDisclosureReturn {
  ip: string;
  group: string;
  isRunning: boolean;
  changeGroup: (value: string) => void;
  changeIp: (value: string) => void;
  changeIsRunning: () => void;
}

const SidebarDrawerContext = createContext({} as SidebarDrawerContextData);

export const SidebarDrawerProvider: React.FC<SidebarDrawerProviderProps> = ({
  children,
}) => {
  const disclosure = useDisclosure();
  const router = useRouter();
  const [ip, setIp] = useState("localhost");
  const [group, setGroup] = useState("gerencia");
  const [isRunning, setIsRunning] = useState(true);

  const changeGroup = (value: string) => {
    setGroup(value);
    setIsRunning(false);
  };

  const changeIp = (ipAddress: string) => {
    setIp(ipAddress);
    setIsRunning(false);
  };

  const changeIsRunning = () => {
    setIsRunning((previousState) => !previousState);
  };

  useEffect(() => {
    disclosure.onClose();
  }, [router.asPath]);

  return (
    <SidebarDrawerContext.Provider
      value={{
        ...disclosure,
        ip,
        group,
        isRunning,
        changeGroup,
        changeIp,
        changeIsRunning,
      }}
    >
      {children}
    </SidebarDrawerContext.Provider>
  );
};

export const useSidebarDrawer = () => useContext(SidebarDrawerContext);
