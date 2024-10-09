import React from "react";

import { AssistantTemperature } from "@/client/types/assistant";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface AssistantTemperatureParameterProps {
  temperature: AssistantTemperature;
  setTemperature: (temp: AssistantTemperature) => void;
}

const AssistantTemperatureParameter: React.FC<
  AssistantTemperatureParameterProps
> = ({ temperature, setTemperature }) => (
  <FormControl fullWidth>
    <InputLabel>Temperature</InputLabel>
    <Select
      value={temperature}
      label="Temperature"
      onChange={(e) => setTemperature(e.target.value as AssistantTemperature)}
    >
      <MenuItem value={AssistantTemperature.DETERMINISTIC}>
        0.2 - More Deterministic
      </MenuItem>
      <MenuItem value={AssistantTemperature.BALANCED}>0.7 - Balanced</MenuItem>
      <MenuItem value={AssistantTemperature.CREATIVE}>
        0.9 - More Creative
      </MenuItem>
    </Select>
  </FormControl>
);

export default AssistantTemperatureParameter;
