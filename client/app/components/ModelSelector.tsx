import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

interface ModelSelectorProps {
  model: "gpt-4o" | "gpt-4o-mini";
  setModel: (model: "gpt-4o" | "gpt-4o-mini") => void;
}

export default function ModelSelector({ model, setModel }: ModelSelectorProps) {
  const handleChange = (event: SelectChangeEvent) => {
    setModel(event.target.value as "gpt-4o" | "gpt-4o-mini");
  };

  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel id="model-select-label">Model</InputLabel>
      <Select
        labelId="model-select-label"
        id="model-select"
        value={model}
        label="Model"
        onChange={handleChange}
      >
        <MenuItem value="gpt-4o">GPT-4o</MenuItem>
        <MenuItem value="gpt-4o-mini">GPT-4o mini</MenuItem>
      </Select>
    </FormControl>
  );
}
