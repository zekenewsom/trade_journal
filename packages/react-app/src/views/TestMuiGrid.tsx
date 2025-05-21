import { Grid } from '@mui/material';

export default function TestMuiGrid() {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }} sx={{ background: '#23263a', p: 2 }}>Left</Grid>
      <Grid size={{ xs: 12, md: 6 }} sx={{ background: '#ccc', p: 2 }}>Right</Grid>
    </Grid>
  );
}
