import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Paper,
  Grid,
  Chip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material';
import {
  Refresh,
  Event,
  AccessTime,
  CheckCircle,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function WaiterSchedule() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scheduleData, setScheduleData] = useState({
    thisWeekSchedule: [],
    nextWeekSchedule: [],
    upcomingShift: null,
  });

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/employees/schedule`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setScheduleData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
      setError('Failed to load schedule');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const getDayName = (date) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getShortDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Work Schedule
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Work Schedule
        </Typography>
        <Alert 
          severity="error" 
          action={
            <IconButton color="inherit" size="small" onClick={fetchSchedule}>
              <Refresh />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, mb: 1 }}>
            Work Schedule
          </Typography>
          <Typography color="text.secondary">
            View your upcoming shifts and work schedule
          </Typography>
          <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
            Shop Hours: 6:00 AM - 10:00 PM • Morning: 6 AM - 2 PM • Afternoon: 2 PM - 10 PM
          </Typography>
        </Box>
        <IconButton onClick={fetchSchedule} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Upcoming Shift */}
      {scheduleData.upcomingShift && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 3, 
            mb: 3,
            border: '2px solid',
            borderColor: 'primary.main',
            backgroundColor: 'primary.50',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Next Shift: {getDayName(scheduleData.upcomingShift.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getShortDate(scheduleData.upcomingShift.date)} • {formatTime(scheduleData.upcomingShift.startTime)} - {formatTime(scheduleData.upcomingShift.endTime)}
                  </Typography>
                  <Chip
                    label={scheduleData.upcomingShift.shift}
                    size="small"
                    color="primary"
                    sx={{ mt: 1, fontWeight: 600 }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {scheduleData.upcomingShift.duration} hours
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* This Week's Schedule */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          This Week
        </Typography>
        <Grid container spacing={2}>
          {scheduleData.thisWeekSchedule.length > 0 ? (
            scheduleData.thisWeekSchedule.map((shift, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 3, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {getDayName(shift.date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getShortDate(shift.date)}
                        </Typography>
                      </Box>
                      <Chip
                        label={shift.shift}
                        size="small"
                        color={shift.shift === 'Morning' ? 'success' : 'warning'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccessTime sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Event sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {shift.duration} hours
                      </Typography>
                    </Box>
                    {shift.isToday && (
                      <Chip
                        icon={<CheckCircle />}
                        label="Today"
                        size="small"
                        color="primary"
                        sx={{ mt: 2, fontWeight: 600 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                No shifts scheduled for this week
              </Alert>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Next Week's Schedule */}
      {scheduleData.nextWeekSchedule.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Next Week
          </Typography>
          <Grid container spacing={2}>
            {scheduleData.nextWeekSchedule.map((shift, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 3, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {getDayName(shift.date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getShortDate(shift.date)}
                        </Typography>
                      </Box>
                      <Chip
                        label={shift.shift}
                        size="small"
                        color={shift.shift === 'Morning' ? 'success' : 'warning'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccessTime sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Event sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {shift.duration} hours
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default WaiterSchedule;
