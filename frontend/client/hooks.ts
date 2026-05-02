import { useTheme } from "@mui/material";

const useIsDark = () => {
  const theme = useTheme();
  return theme.palette.mode === "dark";
};

export { useIsDark };
