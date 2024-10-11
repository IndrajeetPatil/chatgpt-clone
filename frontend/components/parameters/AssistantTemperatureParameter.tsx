import { ChevronDown, Thermometer } from "lucide-react";
import React, { useState } from "react";

import { AssistantTemperature } from "@/client/types/assistant";
import { Box, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";

interface AssistantTemperatureParameterProps {
  temperature: AssistantTemperature;
  setTemperature: (temperature: AssistantTemperature) => void;
}

const AssistantTemperatureParameter: React.FC<
  AssistantTemperatureParameterProps
> = ({ temperature, setTemperature }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTemperatureChange = (newTemperature: AssistantTemperature) => {
    setTemperature(newTemperature);
    handleClose();
  };

  const getTemperatureDisplay = () => {
    switch (temperature) {
      case AssistantTemperature.DETERMINISTIC:
        return "0.2 - More Deterministic";
      case AssistantTemperature.BALANCED:
        return "0.7 - Balanced";
      case AssistantTemperature.CREATIVE:
        return "0.9 - More Creative";
      default:
        return "";
    }
  };

  return (
    <>
      <Box>
        <Tooltip
          title={
            <React.Fragment>
              Choose Temperature
              <br />
              (Current: {getTemperatureDisplay()})
            </React.Fragment>
          }
        >
          <IconButton onClick={handleClick}>
            <Thermometer size={20} />
            <ChevronDown size={16} />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() =>
            handleTemperatureChange(AssistantTemperature.DETERMINISTIC)
          }
        >
          0.2 - More Deterministic
        </MenuItem>
        <MenuItem
          onClick={() => handleTemperatureChange(AssistantTemperature.BALANCED)}
        >
          0.7 - Balanced
        </MenuItem>
        <MenuItem
          onClick={() => handleTemperatureChange(AssistantTemperature.CREATIVE)}
        >
          0.9 - More Creative
        </MenuItem>
      </Menu>
    </>
  );
};

export default AssistantTemperatureParameter;
