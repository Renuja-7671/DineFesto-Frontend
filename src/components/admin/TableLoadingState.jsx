import { Box, CircularProgress, Skeleton, TableCell, TableRow } from '@mui/material';

export function TableLoadingSkeleton({ columns = 5, rows = 8 }) {
  return Array.from({ length: rows }).map((_, rowIndex) => (
    <TableRow key={`loading-row-${rowIndex}`}>
      {Array.from({ length: columns }).map((__, colIndex) => (
        <TableCell key={`loading-cell-${colIndex}`}>
          <Skeleton
            variant="text"
            animation="wave"
            height={colIndex === 0 ? 40 : 24}
            sx={{ borderRadius: 1 }}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function TableLoadingSpinner({ columns = 5 }) {
  return (
    <TableRow>
      <TableCell colSpan={columns} align="center" sx={{ py: 8 }}>
        <CircularProgress size={44} thickness={4} />
      </TableCell>
    </TableRow>
  );
}

export function DialogLoadingSpinner() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
      <CircularProgress size={40} />
    </Box>
  );
}

export function GridLoadingSkeleton({ items = 6 }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
      {Array.from({ length: items }).map((_, index) => (
        <Box
          key={`grid-skeleton-${index}`}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            p: 2,
          }}
        >
          <Skeleton variant="rounded" height={160} animation="wave" sx={{ mb: 2 }} />
          <Skeleton variant="text" width="70%" animation="wave" />
          <Skeleton variant="text" width="45%" animation="wave" />
        </Box>
      ))}
    </Box>
  );
}
