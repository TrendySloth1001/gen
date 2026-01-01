# Portfolio - Terminal Theme

A dark-themed developer portfolio built with Next.js, featuring GitHub integration and interactive code browsing.

## Features

### 🎨 Terminal Aesthetic
- Pure black background with emerald-500 terminal green accents
- Subtle matrix rain background effect
- Monospace fonts and command-line inspired UI

### 📊 GitHub Integration
- **Activity Feed**: Real-time GitHub events with expandable code diffs
  - Inline syntax highlighting (blue for additions, red for deletions)
  - Auto-fetch commit details on load
  - Load more pagination
- **Interactive Heatmap**: Contribution visualization with filters and animations
  - Filter by activity level (high/medium/low)
  - Click to view daily stats
  - Streak tracking and statistics
- **Project Browser**: Browse repository files directly on the portfolio
  - File tree navigation with search (⌘K)
  - Inline code viewer with line numbers
  - Copy to clipboard functionality
  - Breadcrumb navigation
  - File size and line count display

### 🛠️ Tech Stack
- Next.js 16.1.1 with App Router
- React 19.2.3
- TypeScript
- Tailwind CSS v4
- GitHub REST API

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main portfolio page
│   ├── project/[owner]/[repo]/     # Dynamic project browser route
│   └── globals.css                 # Global styles & scrollbar
├── components/
│   ├── TerminalBackground.tsx      # Matrix rain effect
│   ├── GitHubActivity.tsx          # Activity feed with diffs
│   ├── InteractiveHeatmap.tsx      # Contribution heatmap
│   ├── ProjectsGrid.tsx            # Repository cards
│   └── ProjectBrowser.tsx          # Interactive file browser
└── lib/
    └── github.ts                   # GitHub API utilities
```

## Scripts

- `npm run dev` – Start development server on http://localhost:3000
- `npm run build` – Create production build
- `npm start` – Run production server
- `npm run lint` – Run ESLint

## Customization

1. **Update GitHub Username**: Change `TrendySloth1001` in components to your GitHub username
2. **Modify Colors**: Edit Tailwind classes (emerald-500 for terminal green)
3. **Adjust Skills**: Update [src/components/Skills.tsx](src/components/Skills.tsx)
4. **Increase API Rate Limits** (Recommended):
   ```bash
   cp .env.local.example .env.local
   # Add your GitHub token to .env.local
   ```
   - Without token: 60 requests/hour
   - With token: 5000 requests/hour
   - Get token at: https://github.com/settings/tokens

## Keyboard Shortcuts

- **⌘K** / **Ctrl+K**: Focus file search in project browser

## Deployment

Deploy to any Next.js-compatible host:

```bash
npm run build
npm start
```

Recommended platforms: Vercel, Netlify, or any Node.js hosting.

## License

MIT
