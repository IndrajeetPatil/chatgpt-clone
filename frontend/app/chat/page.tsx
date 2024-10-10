"use client";

import { useEffect, useState } from "react";

import useAssistantResponse from "@/client/hooks/useAssistantResponse";
import { AssistantModel, AssistantTemperature } from "@/client/types/assistant";
import { RefreshCcw } from "lucide-react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  CssBaseline,
  IconButton,
  Paper,
  Stack,
  Tooltip,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import AssistantMessage from "../../components/messages/AssistantMessage";
import ChatInput from "../../components/messages/ChatInput";
import UserMessage from "../../components/messages/UserMessage";
import AssistantParameters from "../../components/parameters/AssistantParameters";

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
  // Initial message from the assistant
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi, I am a chat bot. How can I help you today?",
    },
  ]);
  const [model, setModel] = useState<AssistantModel>(AssistantModel.FULL);
  const [temperature, setTemperature] = useState<AssistantTemperature>(
    AssistantTemperature.BALANCED
  );
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
      setMessages((prev) => prev.slice(0, -1));

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
          {/* Chat Messages */}
          {messages.length > 0 && (
            <>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  mb: 2,
                  maxHeight: "70vh",
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
                      <AssistantMessage
                        key={index}
                        content={message.content}
                        isFirstMessage={index === 0}
                      />
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

              {/* Control Panel */}
              <Box>
                <Stack direction="row" spacing={2}>
                  <AssistantParameters
                    model={model}
                    temperature={temperature}
                    setModel={setModel}
                    setTemperature={setTemperature}
                  />
                  <Tooltip title="Regenerate Response">
                    <IconButton
                      onClick={handleRegenerateResponse}
                      disabled={assistantIsLoading}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <RefreshCcw size={20} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </>
          )}

          {/* Chat Input */}
          <ChatInput onSendMessage={handleSendMessage} />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
