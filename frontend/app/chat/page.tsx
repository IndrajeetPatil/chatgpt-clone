"use client";

import { Moon, RefreshCcw, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import useAssistantResponse from "@/client/hooks/useAssistantResponse";
import { AssistantModel, AssistantTemperature } from "@/client/types/assistant";
import AssistantMessage from "@/components/messages/AssistantMessage";
import ChatInput from "@/components/messages/ChatInput";
import UserMessage from "@/components/messages/UserMessage";
import AssistantModelParameter from "@/components/parameters/AssistantModelParameter";
import AssistantTemperatureParameter from "@/components/parameters/AssistantTemperatureParameter";
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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE_ID = "initial-message";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: INITIAL_MESSAGE_ID,
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

  const theme = createTheme({ palette: { mode: darkMode ? "dark" : "light" } });

  const handleSendMessage = async (message: string) => {
    const newMessage = {
      id: uuidv4(),
      role: "user" as const,
      content: message,
    };
    setMessages([...messages, newMessage]);
    setLastPrompt(message);
    await triggerAssistantResponse({ model, temperature, prompt: message });
  };

  useEffect(() => {
    if (assistantResponse) {
      const newMessage = {
        id: uuidv4(),
        role: "assistant" as const,
        content: assistantResponse.response,
      };
      setMessages((prev) => [...prev, newMessage]);
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="md"
        sx={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Chat Messages */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
          <Stack spacing={2}>
            {messages.map((message) =>
              message.role === "user" ? (
                <UserMessage key={message.id} content={message.content} />
              ) : (
                <AssistantMessage
                  key={message.id}
                  content={message.content}
                  isFirstMessage={message.id === INITIAL_MESSAGE_ID}
                />
              )
            )}
            {assistantIsLoading && <CircularProgress />}
            {assistantError && (
              <Alert severity="error">Error: {assistantError.message}</Alert>
            )}
          </Stack>
        </Box>

        {/* Control Panel */}
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <AssistantModelParameter model={model} setModel={setModel} />
            <AssistantTemperatureParameter
              temperature={temperature}
              setTemperature={setTemperature}
            />
            <Tooltip title="Regenerate Response">
              <IconButton
                onClick={handleRegenerateResponse}
                disabled={assistantIsLoading}
              >
                <RefreshCcw size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <IconButton onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </IconButton>
            </Tooltip>
          </Stack>
          <ChatInput onSendMessage={handleSendMessage} />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
