import React from "react";
import PersonIcon from "@mui/icons-material/Person";
import { Box, Paper, Typography } from "@mui/material";

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
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Icon on the first line */}
      <Box display="flex" alignItems="center" mb={1}>
        <PersonIcon
          sx={{
            color: "#1976d2",
            fontSize: "1.5rem",
            mr: 1,
          }}
        />
        <Typography variant="body2" color="textSecondary">
          User
        </Typography>
      </Box>
      {/* Content starts on the second line */}
      <Typography variant="body1" component="div" sx={{ mt: 1 }}>
        {content}
      </Typography>
    </Paper>
  </Box>
);

export default UserMessage;
