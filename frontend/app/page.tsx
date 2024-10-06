"use client";

import { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  CssBaseline,
  Container,
  Box,
  Paper,
  Stack,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ModelSelector from "../components/parameters/ModelSelector";
import TemperatureSelector from "../components/parameters/TemperatureSelector";
import ChatInput from "../components/messages/ChatInput";
import UserMessage from "../components/messages/UserMessage";
import AssistantMessage from "../components/messages/AssistantMessage";
import useAssistantResponse from "@/client/hooks/useAssistantResponse";

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
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const {
    triggerAssistantResponse,
    assistantResponse,
    assistantError,
    assistantIsLoading,
  } = useAssistantResponse();

  const handleSendMessage = async (message: string) => {
    const newMessage: Message = { role: "user", content: message };
    setMessages([...messages, newMessage]);
    setLastPrompt(message);

    await triggerAssistantResponse({
      model,
      temperature,
      prompt: message,
    });
  };

  useEffect(() => {
    if (assistantResponse) {
      const assistantMessage: Message = {
        role: "assistant",
        content: assistantResponse.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }
  }, [assistantResponse]);

  const handleRegenerateResponse = async () => {
    if (lastPrompt) {
      // Remove the last assistant message
      setMessages((prev) => prev.filter((msg, idx) => idx !== prev.length - 1));

      await triggerAssistantResponse({
        model,
        temperature,
        prompt: lastPrompt,
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          {/* Settings Panel */}
          <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <Stack spacing={2}>
              <ModelSelector model={model} setModel={setModel} />
              <TemperatureSelector
                temperature={temperature}
                setTemperature={setTemperature}
              />
            </Stack>
          </Paper>

          {/* Chat Messages */}
          {messages.length > 0 && (
            <>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  mb: 2,
                  maxHeight: "60vh",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack spacing={2}>
                  {messages.map((message, index) =>
                    message.role === "user" ? (
                      <UserMessage key={index} content={message.content} />
                    ) : (
                      <AssistantMessage key={index} content={message.content} />
                    )
                  )}
                  {assistantIsLoading && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                    >
                      <CircularProgress />
                    </Box>
                  )}
                  {assistantError && (
                    <Alert severity="error">
                      Error: {assistantError.message}
                    </Alert>
                  )}
                </Stack>
              </Paper>

              {/* Regenerate Response Button */}
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRegenerateResponse}
                sx={{ mt: 2 }}
                disabled={assistantIsLoading}
              >
                Regenerate Response
              </Button>
            </>
          )}

          {/* Chat Input */}
          <ChatInput onSendMessage={handleSendMessage} />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
