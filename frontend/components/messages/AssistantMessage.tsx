import React, { useState } from "react";
import { atomOneDark, atomOneLight, CopyBlock } from "react-code-blocks";
import ReactMarkdown from "react-markdown";

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
          <Box position="relative" sx={{ mt: 2 }}>
            <CopyBlock
              text={codeString}
              language={language}
              showLineNumbers={false}
              theme={theme.palette.mode === "dark" ? atomOneDark : atomOneLight}
              codeBlock
            />
          </Box>
        );
      }

      return (
        <code
          style={{
            backgroundColor:
              theme.palette.mode === "dark" ? "#2d2d2d" : "#f5f5f5",
            color: theme.palette.mode === "dark" ? "#e0e0e0" : "inherit",
          }}
        >
          {children}
        </code>
      );
    },
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
