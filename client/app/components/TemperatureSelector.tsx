import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

interface TemperatureSelectorProps {
  temperature: 0.2 | 0.7 | 0.9;
  setTemperature: (temperature: 0.2 | 0.7 | 0.9) => void;
}

export default function TemperatureSelector({
  temperature,
  setTemperature,
}: TemperatureSelectorProps) {
  const handleChange = (event: SelectChangeEvent) => {
    setTemperature(parseFloat(event.target.value) as 0.2 | 0.7 | 0.9);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="temperature-select-label">Temperature</InputLabel>
      <Select
        labelId="temperature-select-label"
        id="temperature-select"
        value={temperature.toString()}
        label="Temperature"
        onChange={handleChange}
      >
        <MenuItem value={0.2}>0.2</MenuItem>
        <MenuItem value={0.7}>0.7</MenuItem>
        <MenuItem value={0.9}>0.9</MenuItem>
      </Select>
    </FormControl>
  );
}
