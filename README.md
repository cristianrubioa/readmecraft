# ReadmeCraft

Generate your GitHub profile README with just your username.

## Features

- **3 Templates** (Minimal, Standard, Detailed)
- **Customizable Sections** (About, Stats, Skills, Projects)
- **Featured Projects Selection** with pagination
- **Smart Auto-selection** in detailed templates
- **Real-time Markdown Preview**
- **Copy to Clipboard** in one click

## Tech Stack

- **React 18** + TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **GitHub API** (no authentication required)
- **FontAwesome** for icons

## Installation

```bash
# Clone repository
git clone https://github.com/cristianrubioa/readme-craft.git
cd readme-craft

# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Usage

1. Open the application
2. Enter your GitHub username
3. Select a template (Minimal, Standard, or Detailed)
4. Customize sections as needed
5. Choose featured projects
6. Copy the generated markdown

## Templates

- **Minimal**: About + Skills + Projects (no stats)
- **Standard**: About + Stats + Skills (no projects)
- **Detailed**: All (About + Stats + Skills + Projects with auto-selection of top 5)

## Project Structure

```
src/
├── components/       # Reusable React components
├── hooks/           # Custom hooks for GitHub API
├── templates/       # Template configurations
├── types/           # TypeScript types
├── utils/           # Helper functions
└── App.tsx          # Main component
```

## Contributing

Contributions are welcome. For significant changes, please open an issue first.

## Credits

Created by [@cristianrubioa](https://github.com/cristianrubioa) for developers.


