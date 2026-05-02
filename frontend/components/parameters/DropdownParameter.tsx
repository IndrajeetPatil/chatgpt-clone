import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { ChevronDown } from "lucide-react";
import type React from "react";
import { useState } from "react";

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

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label={ariaLabel}
        >
          {icon}
          <ChevronDown size={16} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
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
