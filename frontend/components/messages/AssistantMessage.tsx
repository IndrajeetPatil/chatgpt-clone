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
import type React from "react";
import { useState } from "react";
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
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <Typography
          variant="body1"
          component="div"
        >
          <ReactMarkdown
            components={{
              pre: ({ children }) => <>{children}</>,
              code: ({ className, children }) => {
                const [, language = ""] =
                  (className ?? "").match(/language-(\w+)/) || [];
                if (language) {
                  return (
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
                      <Typography
                        component="code"
                        sx={{
                          fontFamily:
                            '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
                          fontSize: "0.875rem",
                          whiteSpace: "pre",
                        }}
                      >
                        {String(children).replace(/\n$/, "")}
                      </Typography>
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
            }}
          >
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
