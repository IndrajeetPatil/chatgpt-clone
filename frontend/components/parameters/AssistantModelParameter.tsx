import React from "react";

import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface AssistantModelParameterProps {
  model: "gpt-4o" | "gpt-4o-mini";
  setModel: (model: "gpt-4o" | "gpt-4o-mini") => void;
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
      onChange={(e) => setModel(e.target.value as "gpt-4o" | "gpt-4o-mini")}
    >
      <MenuItem value="gpt-4o">GPT-4o</MenuItem>
      <MenuItem value="gpt-4o-mini">GPT-4o Mini</MenuItem>
    </Select>
  </FormControl>
);

export default AssistantModelParameter;
