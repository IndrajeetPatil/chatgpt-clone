import { Bot, ChevronDown } from "lucide-react";
import React, { useState } from "react";

import { AssistantModel } from "@/client/types/assistant";
import { Box, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";

interface AssistantModelParameterProps {
  model: AssistantModel;
  setModel: (model: AssistantModel) => void;
}

const AssistantModelParameter: React.FC<AssistantModelParameterProps> = ({
  model,
  setModel,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModelChange = (newModel: AssistantModel) => {
    setModel(newModel);
    handleClose();
  };

  const getModelDisplay = () =>
    model === AssistantModel.FULL ? "GPT-4o" : "GPT-4o Mini";

  return (
    <>
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
          <IconButton onClick={handleClick}>
            <Bot size={20} />
            <ChevronDown size={16} />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleModelChange(AssistantModel.FULL)}>
          GPT-4o
        </MenuItem>
        <MenuItem onClick={() => handleModelChange(AssistantModel.MINI)}>
          GPT-4o Mini
        </MenuItem>
      </Menu>
    </>
  );
};

export default AssistantModelParameter;
