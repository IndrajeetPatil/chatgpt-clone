import React from "react";

import PersonIcon from "@mui/icons-material/Person";
import { Avatar, Box, Paper, Typography } from "@mui/material";

interface UserMessageProps {
  content: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ content }) => (
  <Box display="flex" justifyContent="flex-end" mb={2}>
    <Paper
      elevation={2}
      sx={{
        p: 2,
        backgroundColor: "#e3f2fd",
        maxWidth: "70%",
        wordWrap: "break-word",
      }}
    >
      <Typography variant="body1">{content}</Typography>
    </Paper>
    <Avatar sx={{ bgcolor: "#1976d2", ml: 1 }}>
      <PersonIcon />
    </Avatar>
  </Box>
);

export default UserMessage;