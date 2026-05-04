"use client";

import { type UIMessage, useChat } from "@ai-sdk/react";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PsychologyIcon from "@mui/icons-material/Psychology";
import RefreshIcon from "@mui/icons-material/Refresh";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  CssBaseline,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { TextStreamChatTransport } from "ai";
import { useEffect, useMemo, useState } from "react";
import { getModelDisplay, getTemperatureDisplay } from "@/client/helpers";
import { AssistantModel, AssistantTemperature } from "@/client/types/assistant";
import AssistantMessage from "@/components/messages/AssistantMessage";
import ChatInput from "@/components/messages/ChatInput";
import UserMessage from "@/components/messages/UserMessage";
import DropdownParameter from "@/components/parameters/DropdownParameter";

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

const DARK_THEME_COLOR = "#121212";
const LIGHT_THEME_COLOR = "#ffffff";

const VISUALLY_HIDDEN_SX = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
} as const;

const SKIP_LINK_SX = {
  backgroundColor: "background.paper",
  border: 1,
  borderColor: "primary.main",
  borderRadius: 1,
  boxShadow: 2,
  color: "primary.main",
  left: 16,
  px: 2,
  py: 1,
  position: "absolute",
  top: 16,
  transform: "translateY(-200%)",
  zIndex: "tooltip",
  "&:focus-visible": {
    outline: "2px solid",
    outlineColor: "primary.main",
    outlineOffset: 2,
    transform: "translateY(0)",
  },
} as const;

const MODEL_OPTIONS = [
  { value: AssistantModel.FULL, label: "GPT-4o" },
  { value: AssistantModel.MINI, label: "GPT-4o Mini" },
];

const TEMPERATURE_OPTIONS = [
  {
    value: AssistantTemperature.DETERMINISTIC,
    label: "0.2 - More Deterministic",
  },
  { value: AssistantTemperature.BALANCED, label: "0.7 - Balanced" },
  { value: AssistantTemperature.CREATIVE, label: "0.9 - More Creative" },
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
    <Box
      component="section"
      aria-label="Chat conversation"
      sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}
    >
      <Stack spacing={2}>
        {messages.map(renderMessage)}
        {assistantIsLoading && (
          <Stack
            aria-live="polite"
            direction="row"
            role="status"
            spacing={1}
            sx={{ alignItems: "center" }}
          >
            <CircularProgress
              aria-hidden={true}
              size={20}
            />
            <Typography variant="body2">Generating…</Typography>
          </Stack>
        )}
        {error && (
          <Alert severity="error">
            Something went wrong. Try sending your message again. Details:{" "}
            {error.message}
          </Alert>
        )}
      </Stack>
    </Box>
  );
}

interface DarkModeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

function DarkModeToggle({ darkMode, onToggle }: DarkModeToggleProps) {
  return (
    <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
      <IconButton
        onClick={onToggle}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
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
        <DropdownParameter
          value={model}
          onChange={setModel}
          icon={<PsychologyIcon />}
          tooltipTitle={
            <>
              Choose Assistant Model
              <br />
              (Current: {getModelDisplay(model)})
            </>
          }
          ariaLabel={`Select assistant model. Current model: ${getModelDisplay(model)}`}
          options={MODEL_OPTIONS}
        />
        <DropdownParameter
          value={temperature}
          onChange={setTemperature}
          icon={<ThermostatIcon />}
          tooltipTitle={
            <>
              Choose Temperature
              <br />
              (Current: {getTemperatureDisplay(temperature)})
            </>
          }
          ariaLabel={`Select assistant temperature. Current temperature: ${getTemperatureDisplay(temperature)}`}
          options={TEMPERATURE_OPTIONS}
        />
        <Tooltip title="Regenerate Response">
          <span>
            <IconButton
              disabled={disabled || !canRegenerate}
              onClick={onRegenerate}
              aria-label="Regenerate response"
            >
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
        <DarkModeToggle
          darkMode={darkMode}
          onToggle={onToggleDarkMode}
        />
      </Stack>
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={disabled}
      />
    </Box>
  );
}

function syncBrowserTheme(darkMode: boolean) {
  document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", darkMode ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
}

export default function Home() {
  const [model, setModel] = useState<AssistantModel>(AssistantModel.FULL);
  const [temperature, setTemperature] = useState<AssistantTemperature>(
    AssistantTemperature.BALANCED,
  );
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    syncBrowserTheme(darkMode);
  }, [darkMode]);

  const transport = useMemo(
    () => new TextStreamChatTransport({ api: CHAT_API_URL }),
    [],
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
    [darkMode],
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
      <Box
        href="#message-input"
        component="a"
        sx={SKIP_LINK_SX}
      >
        Skip to Message
      </Box>
      <Container
        id="chat-main"
        component="main"
        maxWidth="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          minHeight: 0,
        }}
      >
        <Typography
          component="h1"
          sx={VISUALLY_HIDDEN_SX}
        >
          Chatbot Template
        </Typography>
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
