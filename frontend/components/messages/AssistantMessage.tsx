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

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copy status after 2 seconds
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
      return !inline && match ? (
        <SyntaxHighlighter style={darcula} language={match[1]} PreTag="div">
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
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
        <Tooltip title={copied ? "Copied!" : "Copy"}>
          <IconButton
            onClick={handleCopy}
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
