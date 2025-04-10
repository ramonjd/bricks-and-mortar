# REPO CONTEXT

This file contains important context about this repo for [Tonkotsu](https://www.tonkotsu.ai) and helps it work faster and generate better code.

## Repository Overview

Bricks & Mortar is a property expense tracking application for homeowners, landlords, and renters. The application helps users track expenses, manage properties, and handle shared costs efficiently.

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Database**: Supabase
- **Language**: TypeScript
- **Testing**: Jest + React Testing Library

## Setup Commands

### Initial Setup

```bash
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory with Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Commands

### Running Development Server

```bash
npm run dev
```

### Building the Application

```bash
npm run build
```

### Start Production Build

```bash
npm start
```

### Running Linter

```bash
npm run lint
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
│   └── ui/              # UI components
├── lib/                 # Utility functions and services
│   ├── supabase/        # Supabase client
│   └── services/        # Business logic
└── types/               # TypeScript type definitions
```
