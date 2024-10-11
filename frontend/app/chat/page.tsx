"use client";

import { Moon, RefreshCcw, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import useAssistantResponse from "@/client/hooks/useAssistantResponse";
import { AssistantModel, AssistantTemperature } from "@/client/types/assistant";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  CssBaseline,
  IconButton,
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

export default function Home() {
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
  const [darkMode, setDarkMode] = useState(true);

  const {
    triggerAssistantResponse,
    assistantResponse,
    assistantError,
    assistantIsLoading,
  } = useAssistantResponse();

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

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
      await triggerAssistantResponse({
        model,
        temperature,
        prompt: lastPrompt,
      });
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                maxHeight: "100%",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
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
            </Box>
          </Box>

          <Box
            sx={{
              height: "20vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 2,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
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
              <Tooltip
                title={
                  darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </IconButton>
              </Tooltip>
            </Stack>

            <ChatInput onSendMessage={handleSendMessage} />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
