"use client";

import { type UIMessage, useChat } from "@ai-sdk/react";
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
import { TextStreamChatTransport } from "ai";
import { Moon, RefreshCcw, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { AssistantModel, AssistantTemperature } from "@/client/types/assistant";
import AssistantMessage from "@/components/messages/AssistantMessage";
import ChatInput from "@/components/messages/ChatInput";
import UserMessage from "@/components/messages/UserMessage";
import AssistantModelParameter from "@/components/parameters/AssistantModelParameter";
import AssistantTemperatureParameter from "@/components/parameters/AssistantTemperatureParameter";

const INITIAL_MESSAGE_ID = "initial-message";
const CHAT_API_URL =
  import.meta.env.VITE_CHAT_API_URL ?? "http://localhost:8000/api/v1/chat";
const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: INITIAL_MESSAGE_ID,
    role: "assistant",
    parts: [
      { type: "text", text: "Hi, I am a chat bot. How can I help you today?" },
    ],
  },
];

function renderMessage(message: UIMessage) {
  const content = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

  return message.role === "user" ? (
    <UserMessage
      key={message.id}
      content={content}
    />
  ) : (
    <AssistantMessage
      key={message.id}
      content={content}
      isFirstMessage={message.id === INITIAL_MESSAGE_ID}
    />
  );
}

interface MessageListProps {
  messages: UIMessage[];
  assistantIsLoading: boolean;
  error: Error | undefined;
}

function MessageList({
  messages,
  assistantIsLoading,
  error,
}: MessageListProps) {
  return (
    <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
      <Stack spacing={2}>
        {messages.map(renderMessage)}
        {assistantIsLoading && <CircularProgress />}
        {error && <Alert severity="error">Error: {error.message}</Alert>}
      </Stack>
    </Box>
  );
}

interface ControlPanelProps {
  model: AssistantModel;
  setModel: (m: AssistantModel) => void;
  temperature: AssistantTemperature;
  setTemperature: (t: AssistantTemperature) => void;
  onRegenerate: () => void;
  canRegenerate: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  disabled: boolean;
  onSendMessage: (message: string) => Promise<void>;
}

function ControlPanel({
  model,
  setModel,
  temperature,
  setTemperature,
  onRegenerate,
  canRegenerate,
  darkMode,
  onToggleDarkMode,
  disabled,
  onSendMessage,
}: ControlPanelProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <AssistantModelParameter
          model={model}
          setModel={setModel}
        />
        <AssistantTemperatureParameter
          temperature={temperature}
          setTemperature={setTemperature}
        />
        <Tooltip title="Regenerate Response">
          <IconButton
            onClick={() => {
              if (!disabled && canRegenerate) onRegenerate();
            }}
            aria-label="Regenerate response"
            aria-disabled={disabled || !canRegenerate}
            sx={{ opacity: disabled || !canRegenerate ? 0.38 : 1 }}
          >
            <RefreshCcw size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <IconButton onClick={onToggleDarkMode}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
        </Tooltip>
      </Stack>
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={disabled}
      />
    </Box>
  );
}

export default function Home() {
  const [model, setModel] = useState<AssistantModel>(AssistantModel.FULL);
  const [temperature, setTemperature] = useState<AssistantTemperature>(
    AssistantTemperature.BALANCED
  );
  const [darkMode, setDarkMode] = useState(true);

  const transport = useMemo(
    () => new TextStreamChatTransport({ api: CHAT_API_URL }),
    []
  );
  const { messages, sendMessage, regenerate, error, status } = useChat({
    messages: INITIAL_MESSAGES,
    transport,
    experimental_throttle: 50,
  });
  const assistantIsLoading = status === "submitted" || status === "streaming";
  const hasUserMessage = messages.some((message) => message.role === "user");

  const theme = useMemo(
    () => createTheme({ palette: { mode: darkMode ? "dark" : "light" } }),
    [darkMode]
  );

  const handleSendMessage = async (message: string) => {
    await sendMessage({ text: message }, { body: { model, temperature } });
  };

  const handleRegenerateResponse = async () => {
    if (hasUserMessage) {
      await regenerate({ body: { model, temperature } });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="md"
        sx={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        <MessageList
          messages={messages}
          assistantIsLoading={assistantIsLoading}
          error={error}
        />
        <ControlPanel
          model={model}
          setModel={setModel}
          temperature={temperature}
          setTemperature={setTemperature}
          onRegenerate={handleRegenerateResponse}
          canRegenerate={hasUserMessage}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          disabled={assistantIsLoading}
          onSendMessage={handleSendMessage}
        />
      </Container>
    </ThemeProvider>
  );
}
