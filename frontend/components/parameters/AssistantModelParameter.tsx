import React from "react";

import { AssistantModel } from "@/client/types/assistant";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface AssistantModelParameterProps {
  model: AssistantModel;
  setModel: (model: AssistantModel) => void;
}

const AssistantModelParameter: React.FC<AssistantModelParameterProps> = ({
  model,
  setModel,
}) => (
  <FormControl fullWidth sx={{ mb: 2 }}>
    <InputLabel>Model</InputLabel>
    <Select
      value={model}
      label="Model"
      onChange={(e) => setModel(e.target.value as AssistantModel)}
    >
      <MenuItem value="gpt-4o">GPT-4o</MenuItem>
      <MenuItem value="gpt-4o-mini">GPT-4o Mini</MenuItem>
    </Select>
  </FormControl>
);

export default AssistantModelParameter;
