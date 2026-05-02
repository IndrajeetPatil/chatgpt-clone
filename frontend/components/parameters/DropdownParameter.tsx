import { Box, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { ChevronDown } from "lucide-react";
import type React from "react";
import { useId, useState } from "react";

interface DropdownOption<T extends string | number> {
  value: T;
  label: string;
}

interface DropdownParameterProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  icon: React.ReactNode;
  tooltipTitle: React.ReactNode;
  ariaLabel: string;
  options: DropdownOption<T>[];
}

function DropdownParameter<T extends string | number>({
  value,
  onChange,
  icon,
  tooltipTitle,
  ariaLabel,
  options,
}: DropdownParameterProps<T>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuId = useId();

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label={ariaLabel}
          aria-haspopup="true"
          aria-controls={anchorEl !== null ? menuId : undefined}
          aria-expanded={anchorEl !== null}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {icon}
            <ChevronDown size={16} />
          </Box>
        </IconButton>
      </Tooltip>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={() => setAnchorEl(null)}
      >
        {options.map((option) => (
          <MenuItem
            key={String(option.value)}
            selected={option.value === value}
            onClick={() => {
              onChange(option.value);
              setAnchorEl(null);
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default DropdownParameter;
