import Grid from '@mui/material/Grid';
import { colors } from '/src/styles/design-tokens';

export default function TestMuiGrid() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} sx={{ background: colors.surface, p: 2 }}>
        Left
      </Grid>
      <Grid item xs={12} md={6} sx={{ background: colors.surface, p: 2 }}>
        Right
      </Grid>
    </Grid>
  );
}
