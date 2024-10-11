import React from "react";

import PersonIcon from "@mui/icons-material/Person";
import { Box, Paper, Typography, useTheme } from "@mui/material";

interface UserMessageProps {
  content: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ content }) => {
  const theme = useTheme();

  return (
    <Box display="flex" justifyContent="flex-end" mb={2}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          backgroundColor:
            theme.palette.mode === "dark" ? "#1a237e" : "#e3f2fd",
          maxWidth: "70%",
          wordWrap: "break-word",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box display="flex" alignItems="center" mb={1}>
          <PersonIcon
            sx={{
              color: theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
              fontSize: "1.5rem",
              mr: 1,
            }}
          />
          <Typography variant="body2" color="textSecondary">
            User
          </Typography>
        </Box>
        <Typography
          variant="body1"
          component="div"
          sx={{
            mt: 1,
            color:
              theme.palette.mode === "dark"
                ? theme.palette.common.white
                : "inherit",
          }}
        >
          {content}
        </Typography>
      </Paper>
    </Box>
  );
};

export default UserMessage;
