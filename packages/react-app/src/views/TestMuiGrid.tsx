import { Grid } from '@mui/material';

export default function TestMuiGrid() {
  return (
    <Grid container spacing={2}>
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={(theme) => ({ backgroundColor: theme.palette.background.paper, p: 2 })}
      >
        Item 1
      </Grid>
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={(theme) => ({ backgroundColor: theme.palette.background.paper, p: 2 })}
      >
        Right
      </Grid>
    </Grid>
  );
}