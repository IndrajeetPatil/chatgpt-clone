import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Tooltip, Stack, Box } from "@mui/material";
import { Bot, Thermometer, ChevronDown } from "lucide-react";
import { AssistantModel, AssistantTemperature } from "@/client/types/assistant";

interface AssistantParametersProps {
  model: AssistantModel;
  temperature: AssistantTemperature;
  setModel: (model: AssistantModel) => void;
  setTemperature: (temperature: AssistantTemperature) => void;
}

const AssistantParameters: React.FC<AssistantParametersProps> = ({
  model,
  temperature,
  setModel,
  setTemperature,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuType, setMenuType] = useState<"model" | "temperature" | null>(
    null
  );

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    type: "model" | "temperature"
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuType(type);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuType(null);
  };

  const handleModelChange = (newModel: AssistantModel) => {
    setModel(newModel);
    handleClose();
  };

  const handleTemperatureChange = (newTemperature: AssistantTemperature) => {
    setTemperature(newTemperature);
    handleClose();
  };

  const modelMenuItems = [
    <MenuItem key="full" onClick={() => handleModelChange(AssistantModel.FULL)}>
      GPT-4o
    </MenuItem>,
    <MenuItem key="mini" onClick={() => handleModelChange(AssistantModel.MINI)}>
      GPT-4o Mini
    </MenuItem>,
  ];

  const temperatureMenuItems = [
    <MenuItem
      key="deterministic"
      onClick={() =>
        handleTemperatureChange(AssistantTemperature.DETERMINISTIC)
      }
    >
      0.2 - More Deterministic
    </MenuItem>,
    <MenuItem
      key="balanced"
      onClick={() => handleTemperatureChange(AssistantTemperature.BALANCED)}
    >
      0.7 - Balanced
    </MenuItem>,
    <MenuItem
      key="creative"
      onClick={() => handleTemperatureChange(AssistantTemperature.CREATIVE)}
    >
      0.9 - More Creative
    </MenuItem>,
  ];

  const getModelDisplay = () =>
    model === AssistantModel.FULL ? "GPT-4o" : "GPT-4o Mini";
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
      <Stack direction="row" spacing={2}>
        <Box>
          <Tooltip
            title={
              <React.Fragment>
                Choose Assistant Model
                <br />
                (Current: {getModelDisplay()})
              </React.Fragment>
            }
          >
            <IconButton
              onClick={(e) => handleClick(e, "model")}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Bot size={20} />
              <ChevronDown size={16} />
            </IconButton>
          </Tooltip>
        </Box>
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
            <IconButton
              onClick={(e) => handleClick(e, "temperature")}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Thermometer size={20} />
              <ChevronDown size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {menuType === "model" ? modelMenuItems : temperatureMenuItems}
      </Menu>
    </>
  );
};

export default AssistantParameters;
