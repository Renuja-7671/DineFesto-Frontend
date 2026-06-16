import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  TextField,
  Typography,
  Zoom,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as ChatIcon,
} from '@mui/icons-material';
import { getUser } from '../../utils/auth';
import { getChatbotStatus, sendChatMessage } from '../../services/chatbotService';

const ROLE_GREETINGS = {
  ADMIN: 'Hi! I use live DineFesto data. Ask about orders, menu, inventory, reservations, staff, or leave.',
  MANAGER: 'Hi! I use live DineFesto data. Ask about orders, reservations, inventory, or staff.',
  WAITER: 'Hi! I use live DineFesto data. Ask about active orders, menu items, attendance, or leave.',
  CHEF: 'Hi! I use live DineFesto data. Ask about the kitchen queue or your leave balance.',
  CUSTOMER: 'Hi! I use live DineFesto data. Ask about the menu, your orders, or your reservations.',
};

function ChatbotWidget({
  accentColor = 'primary.main',
  bottom,
  right,
  left,
  top,
}) {
  const user = getUser();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    getChatbotStatus()
      .then((status) => setEnabled(status.enabled))
      .catch(() => setEnabled(false));
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: ROLE_GREETINGS[user?.role] || 'Hi! How can I help you today?',
        },
      ]);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const history = nextMessages
        .slice(0, -1)
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg) => ({ role: msg.role, content: msg.content }));

      const data = await sendChatMessage(trimmed, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const fixedPosition = {
    position: 'fixed',
    ...(top !== undefined && { top }),
    ...(right !== undefined && { right }),
    ...(bottom !== undefined && { bottom }),
    ...(left !== undefined && { left }),
  };

  return (
    <>
      <Zoom in={!open}>
        <Fab
          color="primary"
          aria-label="Open chat assistant"
          onClick={handleOpen}
          sx={{
            ...fixedPosition,
            zIndex: 1400,
            bgcolor: accentColor,
            '&:hover': { bgcolor: accentColor, filter: 'brightness(0.92)' },
          }}
        >
          <ChatIcon />
        </Fab>
      </Zoom>

      {open && (
        <Paper
          elevation={8}
          sx={{
            ...fixedPosition,
            width: { xs: 'calc(100vw - 32px)', sm: 380 },
            height: { xs: 'min(70vh, 520px)', sm: 520 },
            zIndex: 1400,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: accentColor,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  DineFesto Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Powered by Gemini
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {!enabled && (
            <Alert severity="warning" sx={{ m: 2, borderRadius: 2 }}>
              Chat assistant is not configured yet. Add GEMINI_API_KEY to the backend environment.
            </Alert>
          )}

          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'grey.50' }}>
            {messages.map((message, index) => (
              <Box
                key={`${message.role}-${index}`}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '85%',
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: message.role === 'user' ? 'primary.main' : 'white',
                    color: message.role === 'user' ? 'white' : 'text.primary',
                    border: message.role === 'assistant' ? '1px solid' : 'none',
                    borderColor: 'divider',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                </Box>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || !enabled}
                multiline
                maxRows={3}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={loading || !enabled || !input.trim()}
                sx={{ alignSelf: 'flex-end' }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}
    </>
  );
}

export default ChatbotWidget;
