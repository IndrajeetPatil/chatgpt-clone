import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";

interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Paper
      elevation={1}
      sx={{
        my: 2,
        p: 2,
        bgcolor: message.role === "user" ? "grey.100" : "primary.light",
      }}
    >
      <ReactMarkdown
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? "");
            return !inline && match ? (
              <Box sx={{ position: "relative" }}>
                <SyntaxHighlighter
                  style={materialDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => copyToClipboard(String(children))}
                  sx={{ position: "absolute", top: 8, right: 8 }}
                >
                  Copy
                </Button>
              </Box>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {message.content}
      </ReactMarkdown>
      {message.role === "assistant" && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={() => copyToClipboard(message.content)}
          sx={{ mt: 1 }}
        >
          Copy entire response
        </Button>
      )}
    </Paper>
  );
}
