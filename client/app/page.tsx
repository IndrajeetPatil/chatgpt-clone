"use client";

import { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";
import ModelSelector from "./components/ModelSelector";
import TemperatureSelector from "./components/TemperatureSelector";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState<"gpt-4o" | "gpt-4o-mini">("gpt-4o");
  const [temperature, setTemperature] = useState<0.2 | 0.7 | 0.9>(0.7);

  const handleSendMessage = async (message: string) => {
    const newMessage: Message = { role: "user", content: message };
    setMessages([...messages, newMessage]);

    // TODO: make an API call to Django backend
    // for now, simulate a response
    const assistantMessage: Message = {
      role: "assistant",
      content: `This is a simulated response for "${message}" using ${model} with temperature ${temperature}.`,
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  const handleRegenerateResponse = async () => {
    // TODO
    console.log("Regenerating response...");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <ModelSelector model={model} setModel={setModel} />
            <TemperatureSelector
              temperature={temperature}
              setTemperature={setTemperature}
            />
          </Paper>
          <Paper
            elevation={3}
            sx={{ p: 2, mb: 2, maxHeight: "60vh", overflowY: "auto" }}
          >
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </Paper>
          <ChatInput onSendMessage={handleSendMessage} />
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRegenerateResponse}
            sx={{ mt: 2 }}
          >
            Regenerate Response
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
