# React + TypeScript + Vite

## Styling Conventions

**Systematic Refactor Process:**
- Systematically go through all components and ensure they use **Tailwind CSS** for utilities/layout (margins, padding, flex/grid, border radius, colors, typography, etc.).
- Use **MUI's `sx` prop** (with theme tokens from `design-tokens.ts` via `theme.ts`) for MUI component-specific styling only (e.g., colors, spacing, border radius, shadows on MUI components).
- **Remove all hardcoded styles** and any direct use of `design-tokens.ts` in components. All colors, radii, and shadows should come from the MUI theme or Tailwind classes.
- For **charts and third-party visualizations**, use Tailwind classes for container/layout. For chart colors, prefer semantic hex values or pass theme tokens as props if needed.

**After finishing the components, always refer to this README for guidance when making changes to the rest of the files in the codebase.**

**Example:**
```tsx
<Box className="flex flex-col gap-4" sx={theme => ({ backgroundColor: theme.palette.background.paper, borderRadius: theme.shape.borderRadius })}>
  <Typography className="text-lg font-bold" sx={theme => ({ color: theme.palette.primary.main })}>
    Dashboard
  </Typography>
</Box>
```

This ensures a consistent, theme-driven, and maintainable UI throughout the application.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
