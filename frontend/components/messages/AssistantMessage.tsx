import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useIsDark } from "@/client/hooks";
import type React from "react";
import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface AssistantMessageProps {
  content: string;
  isFirstMessage: boolean;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
  isFirstMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDark = useIsDark();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    setCopied(true);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const markdownComponents = useMemo(
    () => ({
      pre: ({ children }: React.ComponentPropsWithoutRef<"pre">) => (
        <Box
          component="pre"
          data-testid="code-block"
          sx={{
            mt: 2,
            p: 2,
            overflowX: "auto",
            borderRadius: 1,
            backgroundColor: isDark ? "#1e1e1e" : "#f6f8fa",
          }}
        >
          {children}
        </Box>
      ),
      code: ({
        className,
        children,
      }: React.ComponentPropsWithoutRef<"code">) => {
        const language =
          (className ?? "").match(/language-(\w+)/)?.[1] ?? "";
        const text = String(children ?? "");
        if (language || text.includes("\n")) {
          return (
            <Typography
              component="code"
              sx={{
                fontFamily:
                  '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: "0.875rem",
                whiteSpace: "pre",
              }}
            >
              {text.replace(/\n$/, "")}
            </Typography>
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
    }),
    [isDark],
  );

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
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
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
