import { theme } from "./styles/theme";

export const options = {
  chart: {
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    foreColor: "#9FA2B4",
  },
  grid: {
    row: {
      colors: [
        theme.colors.gray[800],
        theme.colors.gray[900],
        theme.colors.gray[800],
      ],
    },
    column: {
      colors: [
        theme.colors.gray[800],
        theme.colors.gray[900],
        theme.colors.gray[800],
      ],
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    enabled: false,
  },
  stroke: {
    curve: "straight" as const,
  },
  xaxis: {
    type: "category" as const,
    axisBorder: {
      color: theme.colors.gray[600],
    },
    axisTicks: {
      color: theme.colors.gray[600],
    },
    tickAmount: 12,
    categories: Array.from({ length: 60 }, (_, i) =>
      (i + 1).toString()
    ).reverse(),
  },
  fill: {
    opacity: 0.3,
    type: "gradient",
    gradient: {
      shade: "dark",
      opacityFrom: 0.7,
      opacityTo: 0.3,
    },
  },
  noData: {
    text: "No data",
    align: "center" as const,
    verticalAlign: "middle" as const,
    offsetX: 0,
    offsetY: 0,
  },
};
