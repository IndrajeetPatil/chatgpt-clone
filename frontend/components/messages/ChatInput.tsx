import React, { KeyboardEvent, useState } from "react";

import SendIcon from "@mui/icons-material/Send";
import { Box, IconButton, TextField } from "@mui/material";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    sendMessage();
  };

  const sendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      display="flex"
      alignItems="flex-end"
      mt={2}
    >
      <TextField
        multiline
        fullWidth
        placeholder="Type your message..."
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ mr: 1 }}
      />
      <IconButton
        type="submit"
        color="primary"
        disabled={!message.trim()}
        aria-label="Send message"
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default ChatInput;
