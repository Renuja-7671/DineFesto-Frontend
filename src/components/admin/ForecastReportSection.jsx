import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  AutoGraph as AutoGraphIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const EMPTY_DATA = {
  modelVersion: 'prophet-v1',
  days: 30,
  lookbackDays: 7,
  count: 0,
  hasForecast: false,
  generatedAt: null,
  rangeStart: '',
  rangeEnd: '',
  forecast: [],
};

function ForecastReportSection() {
  const [forecastData, setForecastData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatCurrency = useCallback(
    (amount) =>
      new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0),
    []
  );

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/reports/sales-forecast`, {
        params: { days: 30, historyDays: 7 },
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setForecastData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sales forecast');
      setForecastData(EMPTY_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const chartData = useMemo(
    () =>
      (forecastData.forecast || []).map((row) => ({
        ...row,
        label: row.date.slice(5),
      })),
    [forecastData.forecast]
  );

  const todayKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const futurePoints = chartData.filter((row) => row.isFuture && row.predictedRevenue !== null);
  const avgPredicted =
    futurePoints.length > 0
      ? futurePoints.reduce((sum, row) => sum + row.predictedRevenue, 0) / futurePoints.length
      : 0;

  const lastGenerated = forecastData.generatedAt
    ? new Date(forecastData.generatedAt).toLocaleString('en-LK')
    : null;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Sales Forecast
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Prophet model · {forecastData.rangeStart} to {forecastData.rangeEnd}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchForecast}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {!loading && !forecastData.hasForecast && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No forecast data available yet. Ensure the backend scheduler is enabled or run{' '}
          <strong>npm run forecast:train</strong> from the backend folder. At least 14 days of
          order history is required.
        </Alert>
      )}

      {forecastData.hasForecast && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ bgcolor: 'primary.light', borderRadius: 2, p: 1.5 }}>
                      <AutoGraphIcon sx={{ color: 'primary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Forecast Days
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {forecastData.count}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ bgcolor: 'success.light', borderRadius: 2, p: 1.5 }}>
                      <AutoGraphIcon sx={{ color: 'success.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Avg Predicted / Day
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {formatCurrency(avgPredicted)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ bgcolor: 'info.light', borderRadius: 2, p: 1.5 }}>
                      <ScheduleIcon sx={{ color: 'info.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Model Version
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {forecastData.modelVersion}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Last Trained
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {lastGenerated || 'Unknown'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6">Predicted vs Actual Revenue</Typography>
                <Chip label="Past = actual" size="small" variant="outlined" />
                <Chip label="Future = predicted" size="small" color="primary" variant="outlined" />
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={2} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => (value == null ? '—' : formatCurrency(value))}
                    labelFormatter={(label) => {
                      const row = chartData.find((r) => r.label === label);
                      return row?.date || label;
                    }}
                  />
                  <Legend />
                  <ReferenceLine x={todayKey.slice(5)} stroke="#94A3B8" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="predictedRevenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Predicted"
                    connectNulls
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lowerBoundRevenue"
                    stroke="#94A3B8"
                    strokeDasharray="5 5"
                    name="Lower Bound"
                    connectNulls
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="upperBoundRevenue"
                    stroke="#64748B"
                    strokeDasharray="5 5"
                    name="Upper Bound"
                    connectNulls
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualRevenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Actual"
                    connectNulls
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}

export default ForecastReportSection;
