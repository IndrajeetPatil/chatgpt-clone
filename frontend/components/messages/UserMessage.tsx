import React from "react";

import PersonIcon from "@mui/icons-material/Person";
import { Box, Paper, Typography, useTheme } from "@mui/material";

interface UserMessageProps {
  content: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ content }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          backgroundColor: isDark ? "#1a237e" : "#e3f2fd",
          maxWidth: "70%",
          wordWrap: "break-word",
        }}
      >
        <PersonIcon sx={{ color: isDark ? "#90caf9" : "#1976d2" }} />
        <Typography
          variant="body1"
          component="div"
          sx={{ color: isDark ? "common.white" : "inherit" }}
        >
          {content}
        </Typography>
      </Paper>
    </Box>
  );
};

export default UserMessage;
