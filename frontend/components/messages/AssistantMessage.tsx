import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vs,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

const CodeBlock: React.FC<{
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}> = ({ inline, className, children }) => {
  const [codeCopied, setCodeCopied] = useState<string | null>(null);
  const theme = useTheme();

  const match = /language-(\w+)/.exec(className ?? "");
  const codeContent = String(children).replace(/\n$/, "");

  const handleCodeCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(code);
    setTimeout(() => setCodeCopied(null), 2000);
  };

  if (!inline && match) {
    return (
      <Box position="relative" sx={{ mt: 2 }}>
        <SyntaxHighlighter
          style={theme.palette.mode === "dark" ? vscDarkPlus : vs}
          language={match[1]}
          PreTag="div"
        >
          {codeContent}
        </SyntaxHighlighter>
        <Tooltip title={codeCopied === codeContent ? "Copied!" : "Copy code"}>
          <IconButton
            onClick={() => handleCodeCopy(codeContent)}
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              backgroundColor:
                theme.palette.mode === "dark" ? "#4caf50" : "#ff9800",
              color: theme.palette.common.white,
              fontSize: 18,
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark" ? "#45a049" : "#e65100",
              },
            }}
          >
            <FileCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <code
      style={{
        backgroundColor: theme.palette.mode === "dark" ? "#2d2d2d" : "#f5f5f5",
        borderRadius: "4px",
        padding: "0 4px",
        color: theme.palette.mode === "dark" ? "#e0e0e0" : "inherit",
      }}
    >
      {children}
    </code>
  );
};

interface AssistantMessageProps {
  content: string;
  isFirstMessage: boolean;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
  isFirstMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const theme = useTheme();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderers = {
    code: CodeBlock,
  };

  return (
    <Box display="flex" justifyContent="flex-start" mb={2}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          backgroundColor:
            theme.palette.mode === "dark" ? "#2d2d2d" : "#fff3e0",
          maxWidth: "80%",
          wordWrap: "break-word",
          overflowWrap: "anywhere",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box display="flex" alignItems="center" mb={1}>
          <SmartToyIcon
            sx={{
              color: theme.palette.mode === "dark" ? "#4caf50" : "#ff9800",
              fontSize: "1.5rem",
              mr: 1,
            }}
          />
          <Typography variant="body2" color="textSecondary">
            Assistant
          </Typography>
        </Box>
        <Typography variant="body1" component="div" sx={{ mt: 1 }}>
          <ReactMarkdown components={renderers}>{content}</ReactMarkdown>
        </Typography>
        {!isFirstMessage && (
          <Tooltip title={copied ? "Copied!" : "Copy entire message"}>
            <IconButton
              onClick={() => handleCopy(content)}
              sx={{
                position: "absolute",
                bottom: 4,
                right: 4,
                backgroundColor:
                  theme.palette.mode === "dark" ? "#4caf50" : "#ff9800",
                color: theme.palette.common.white,
                fontSize: 18,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#45a049" : "#e65100",
                },
              }}
            >
              <FileCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Paper>
    </Box>
  );
};

export default AssistantMessage;
