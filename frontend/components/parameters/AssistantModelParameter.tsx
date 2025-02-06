import { Bot, ChevronDown } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { getModelDisplay } from "@/client/helpers";
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

  return (
    <>
      <Box>
        <Tooltip
          title={
            <>
              Choose Assistant Model
              <br />
              (Current: {getModelDisplay(model)})
            </>
          }
        >
          <IconButton
            onClick={handleClick}
            aria-label={`Select assistant model. Current model: ${getModelDisplay(model)}`}
          >
            <Bot size={20} />
            <ChevronDown size={16} />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
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
