# SII XML Offer Generator

A modern web application for generating SII-compliant XML offers with a user-friendly wizard interface.

## Tech Stack

- **Framework**: Next.js 15 with App Router and Server Components
- **UI**: React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + Shadcn/ui
- **Validation**: Zod
- **Forms**: React Hook Form
- **State Management**: Zustand (when needed)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm 8.0 or later

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd sii-xml-offer-generator
```

2. Install dependencies:

```bash
pnpm install
```

3. Create environment variables:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/                 # Next.js App Router
│   ├── (wizard)/       # Wizard layout group
│   └── api/            # API routes
├── components/         # React components
│   ├── ui/            # Shadcn/ui components
│   └── wizard/        # Wizard-specific components
├── lib/               # Utilities and helpers
├── types/             # TypeScript type definitions
├── schemas/           # Zod validation schemas
├── public/            # Static assets
└── docs/              # Documentation
```

## Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Development Guidelines

### Code Style

- TypeScript strict mode enabled
- Prettier for code formatting
- ESLint for code quality
- Tailwind CSS for styling

### Component Development

- Use Server Components by default
- Client Components only when necessary (interactivity)
- Shadcn/ui for consistent UI components
- Follow React 19 best practices

## Deployment

The application is configured for deployment on Vercel:

1. Push changes to your repository
2. Import project in Vercel
3. Configure environment variables
4. Deploy

## License

[Your License Here]
