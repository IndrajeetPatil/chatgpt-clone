import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import type React from "react";
import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useIsDark } from "@/client/hooks";

const DARK_COLORS = {
  codeBlock: "#1e1e1e",
  inlineBg: "#2d2d2d",
  inlineFg: "#e0e0e0",
  paper: "#2d2d2d",
  icon: "#4caf50",
} as const;

const LIGHT_COLORS = {
  codeBlock: "#f6f8fa",
  inlineBg: "#f5f5f5",
  inlineFg: "inherit",
  paper: "#fff3e0",
  icon: "#ff9800",
} as const;

const COPY_BTN_COLORS = {
  dark: { bg: "#4caf50", hover: "#45a049" },
  light: { bg: "#ff9800", hover: "#e65100" },
} as const;

function BlockCode({ text }: { text: string }) {
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

interface CopyButtonProps {
  content: string;
  isDark: boolean;
}

function CopyButton({ content, isDark }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const btnColors = isDark ? COPY_BTN_COLORS.dark : COPY_BTN_COLORS.light;

  const handleCopy = () => {
    /* v8 ignore next */
    navigator.clipboard.writeText(content).catch(() => {});
    if (timerRef.current) clearTimeout(timerRef.current);
    setCopied(true);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip title={copied ? "Copied!" : "Copy entire message"}>
      <IconButton
        onClick={handleCopy}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          backgroundColor: btnColors.bg,
          "&:hover": { backgroundColor: btnColors.hover },
        }}
      >
        <ContentCopyIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

interface AssistantMessageProps {
  content: string;
  isFirstMessage: boolean;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
  isFirstMessage,
}) => {
  const isDark = useIsDark();
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

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
            backgroundColor: colors.codeBlock,
          }}
        >
          {children}
        </Box>
      ),
      code: ({
        className = "",
        children,
      }: React.ComponentPropsWithoutRef<"code">) => {
        const language = className.match(/language-(\w+)/)?.[1];
        const text = String(children ?? "");
        if (language || text.includes("\n")) {
          return <BlockCode text={text} />;
        }
        return (
          <code
            style={{ backgroundColor: colors.inlineBg, color: colors.inlineFg }}
          >
            {children}
          </code>
        );
      },
    }),
    [colors]
  );

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          backgroundColor: colors.paper,
          maxWidth: "80%",
          wordWrap: "break-word",
          overflowWrap: "anywhere",
          position: "relative",
        }}
      >
        <SmartToyIcon sx={{ color: colors.icon }} />
        <Typography
          variant="body1"
          component="div"
        >
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </Typography>
        {!isFirstMessage && (
          <CopyButton
            content={content}
            isDark={isDark}
          />
        )}
      </Paper>
    </Box>
  );
};

export default AssistantMessage;
