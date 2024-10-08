import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";

import FileCopyIcon from "@mui/icons-material/FileCopy";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Avatar, Box, IconButton, Paper, Tooltip } from "@mui/material";

interface AssistantMessageProps {
  content: string;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCodeCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(code);
    setTimeout(() => setCodeCopied(null), 2000);
  };

  const renderers = {
    code({
      inline,
      className,
      children,
    }: {
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
    }): React.JSX.Element {
      const match = /language-(\w+)/.exec(className ?? "");
      const codeContent = String(children).replace(/\n$/, "");

      return !inline && match ? (
        <Box position="relative">
          <SyntaxHighlighter style={darcula} language={match[1]} PreTag="div">
            {codeContent}
          </SyntaxHighlighter>
          <Tooltip title={codeCopied === codeContent ? "Copied!" : "Copy code"}>
            <IconButton
              onClick={() => handleCodeCopy(codeContent)}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                backgroundColor: "#ff9800",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#e65100",
                },
              }}
            >
              <FileCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <code
          style={{
            backgroundColor: "#f5f5f5",
            padding: "0.2em 0.4em",
            borderRadius: "4px",
            fontSize: "90%",
          }}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <Box display="flex" justifyContent="flex-start" mb={2}>
      <Avatar sx={{ bgcolor: "#ff9800", mr: 1 }}>
        <SmartToyIcon />
      </Avatar>
      <Paper
        elevation={2}
        sx={{
          p: 4,
          backgroundColor: "#fff3e0",
          maxWidth: "80%",
          wordWrap: "break-word",
          overflowWrap: "anywhere",
          position: "relative",
        }}
      >
        <ReactMarkdown components={renderers}>{content}</ReactMarkdown>
        <Tooltip title={copied ? "Copied!" : "Copy entire message"}>
          <IconButton
            onClick={() => handleCopy(content)}
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              backgroundColor: "#ff9800",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#e65100",
              },
            }}
          >
            <FileCopyIcon />
          </IconButton>
        </Tooltip>
      </Paper>
    </Box>
  );
};

export default AssistantMessage;
