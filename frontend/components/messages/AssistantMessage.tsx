import React, { useState } from "react";
import { atomOneDark, atomOneLight, CopyBlock } from "react-code-blocks";
import ReactMarkdown from "react-markdown";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

interface AssistantMessageProps {
  content: string;
  isFirstMessage: boolean;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
  isFirstMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderers: Record<string, React.FC<CodeProps>> = {
    code({ inline, className, children }: CodeProps) {
      const match = /language-(\w+)/.exec(className ?? "");
      const language = match ? match[1] : "";
      const codeString = String(children).replace(/\n$/, "");
      if (!inline && match) {
        return (
          <Box sx={{ mt: 2, position: "relative" }}>
            <CopyBlock
              theme={isDark ? atomOneDark : atomOneLight}
              text={codeString}
              codeBlock={true}
              language={language}
              showLineNumbers={false}
            />
          </Box>
        );
      }
      return (
        <code
          style={{
            backgroundColor: isDark ? "#2d2d2d" : "#f5f5f5",
            color: isDark ? "#e0e0e0" : "inherit",
          }}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          backgroundColor: isDark ? "#2d2d2d" : "#fff3e0",
          maxWidth: "80%",
          wordWrap: "break-word",
          overflowWrap: "anywhere",
          position: "relative",
        }}
      >
        <SmartToyIcon sx={{ color: isDark ? "#4caf50" : "#ff9800" }} />
        <Typography variant="body1" component="div">
          <ReactMarkdown components={renderers}>{content}</ReactMarkdown>
        </Typography>
        {!isFirstMessage && (
          <Tooltip title={copied ? "Copied!" : "Copy entire message"}>
            <IconButton
              onClick={() => handleCopy(content)}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                backgroundColor: isDark ? "#4caf50" : "#ff9800",
                "&:hover": {
                  backgroundColor: isDark ? "#45a049" : "#e65100",
                },
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Paper>
    </Box>
  );
};

export default AssistantMessage;
