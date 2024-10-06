import React from "react";
import { Box, Typography, Paper, Avatar } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";

interface AssistantMessageProps {
  content: string;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ content }) => (
  <Box display="flex" justifyContent="flex-start" mb={2}>
    <Avatar sx={{ bgcolor: "#ff9800", mr: 1 }}>
      <SmartToyIcon />
    </Avatar>
    <Paper
      elevation={2}
      sx={{
        p: 2,
        backgroundColor: "#fff3e0",
        maxWidth: "70%",
        wordWrap: "break-word",
      }}
    >
      <Typography variant="body1">{content}</Typography>
    </Paper>
  </Box>
);

export default AssistantMessage;
