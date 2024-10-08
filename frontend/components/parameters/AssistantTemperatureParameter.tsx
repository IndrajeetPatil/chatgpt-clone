import React from "react";

import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

type Temperature = 0.2 | 0.7 | 0.9;

interface AssistantTemperatureParameterProps {
  temperature: Temperature;
  setTemperature: (temp: Temperature) => void;
}

const AssistantTemperatureParameter: React.FC<
  AssistantTemperatureParameterProps
> = ({ temperature, setTemperature }) => (
  <FormControl fullWidth>
    <InputLabel>Temperature</InputLabel>
    <Select
      value={temperature}
      label="Temperature"
      onChange={(e) =>
        setTemperature(Number(e.target.value) as 0.2 | 0.7 | 0.9)
      }
    >
      <MenuItem value={0.2}>0.2 - More Deterministic</MenuItem>
      <MenuItem value={0.7}>0.7 - Balanced</MenuItem>
      <MenuItem value={0.9}>0.9 - More Creative</MenuItem>
    </Select>
  </FormControl>
);

export default AssistantTemperatureParameter;
