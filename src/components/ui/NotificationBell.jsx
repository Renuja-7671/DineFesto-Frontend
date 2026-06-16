import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Badge,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import {
  NotificationsNone as BellIcon,
  NotificationsActive as BellActiveIcon,
  DoneAll as MarkAllReadIcon,
  Inventory as InventoryIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { api } from '../../lib/api';

const POLL_INTERVAL_MS = 30_000; // poll every 30 s

function typeIcon(type) {
  if (!type) return <InfoIcon fontSize="small" sx={{ color: 'info.main' }} />;
  const t = type.toUpperCase();
  if (t.includes('LOW_STOCK') || t.includes('INVENTORY'))
    return <InventoryIcon fontSize="small" sx={{ color: 'warning.main' }} />;
  if (t.includes('WARN') || t.includes('ALERT'))
    return <WarningIcon fontSize="small" sx={{ color: 'error.main' }} />;
  return <InfoIcon fontSize="small" sx={{ color: 'info.main' }} />;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const timerRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications', {
        params: { limit: 30 },
      });
      if (data?.success) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch {
      // silently fail background polls
    }
  }, []);

  const open = Boolean(anchorEl);

  // Defer initial badge fetch so page data loads first
  useEffect(() => {
    const id = window.setTimeout(() => fetchNotifications(), 1500);
    return () => clearTimeout(id);
  }, [fetchNotifications]);

  // Poll only while the popover is open
  useEffect(() => {
    if (!open) return undefined;

    fetchNotifications();
    timerRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [open, fetchNotifications]);

  const handleOpen = async (event) => {
    setAnchorEl(event.currentTarget);
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  };

  const handleClose = () => setAnchorEl(null);

  const handleMarkOne = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`, {});
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAll = async () => {
    setMarking(true);
    try {
      await api.patch('/notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    } finally {
      setMarking(false);
    }
  };

  const hasUnread = unreadCount > 0;

  return (
    <>
      <Tooltip title="Notifications" arrow>
        <IconButton
          onClick={handleOpen}
          size="medium"
          sx={{
            borderRadius: 2.5,
            border: '1.5px solid',
            borderColor: hasUnread
              ? 'warning.main'
              : 'rgba(25, 118, 210, 0.18)',
            transition: 'all 0.25s ease',
            bgcolor: hasUnread ? 'rgba(255,167,38,0.08)' : 'transparent',
            '&:hover': {
              borderColor: hasUnread ? 'warning.dark' : 'primary.main',
              transform: 'scale(1.05)',
              bgcolor: hasUnread
                ? 'rgba(255,167,38,0.15)'
                : 'rgba(25,118,210,0.08)',
            },
          }}
        >
          <Badge
            badgeContent={unreadCount > 99 ? '99+' : unreadCount}
            color="error"
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.65rem',
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                animation: hasUnread ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.2)' },
                  '100%': { transform: 'scale(1)' },
                },
              },
            }}
          >
            {hasUnread ? (
              <BellActiveIcon
                sx={{ color: 'warning.main', fontSize: 22 }}
              />
            ) : (
              <BellIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 6,
          sx: {
            mt: 1.5,
            width: 380,
            maxWidth: '95vw',
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.07)',
            overflow: 'hidden',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background:
              'linear-gradient(135deg, rgba(25,118,210,0.06) 0%, rgba(255,255,255,0) 100%)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Notifications
            </Typography>
            {hasUnread && (
              <Chip
                label={`${unreadCount} new`}
                size="small"
                color="warning"
                sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: 1.5 }}
              />
            )}
          </Box>
          {hasUnread && (
            <Tooltip title="Mark all as read">
              <span>
                <Button
                  size="small"
                  startIcon={<MarkAllReadIcon fontSize="small" />}
                  onClick={handleMarkAll}
                  disabled={marking}
                  sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                >
                  {marking ? 'Marking…' : 'Mark all'}
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>

        {/* Body */}
        {loading ? (
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box
            sx={{
              py: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              color: 'text.disabled',
            }}
          >
            <BellIcon sx={{ fontSize: 40, opacity: 0.4 }} />
            <Typography variant="body2">You're all caught up!</Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.map((n, idx) => (
              <Box key={n.notificationId}>
                <ListItem
                  alignItems="flex-start"
                  onClick={() => !n.isRead && handleMarkOne(n.notificationId)}
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    cursor: n.isRead ? 'default' : 'pointer',
                    bgcolor: n.isRead
                      ? 'transparent'
                      : 'rgba(25,118,210,0.04)',
                    transition: 'background 0.2s',
                    '&:hover': {
                      bgcolor: n.isRead
                        ? 'rgba(0,0,0,0.02)'
                        : 'rgba(25,118,210,0.08)',
                    },
                    gap: 1.5,
                  }}
                >
                  {/* left icon */}
                  <Box
                    sx={{
                      mt: 0.5,
                      p: 0.75,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: '1px solid rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {typeIcon(n.type)}
                  </Box>

                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: n.isRead ? 400 : 600,
                          lineHeight: 1.4,
                          color: 'text.primary',
                        }}
                      >
                        {n.message}
                      </Typography>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.disabled' }}
                        >
                          {timeAgo(n.createdAt)}
                        </Typography>
                        {!n.isRead && (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {idx < notifications.length - 1 && (
                  <Divider sx={{ mx: 2.5, opacity: 0.5 }} />
                )}
              </Box>
            ))}
          </List>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <Box
            sx={{
              px: 2.5,
              py: 1.25,
              borderTop: '1px solid rgba(0,0,0,0.06)',
              bgcolor: 'rgba(0,0,0,0.01)',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Showing last {notifications.length} notifications
              {open ? ' · Auto-refreshes every 30s' : ''}
            </Typography>
          </Box>
        )}
      </Popover>
    </>
  );
}
