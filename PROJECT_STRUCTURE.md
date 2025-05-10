# REPO CONTEXT

This file contains important context about this repo for [Tonkotsu](https://www.tonkotsu.ai) and helps it work faster and generate better code.


# Bricks & Mortar - Project Structure

## Overview
Bricks & Mortar is a property management application built with Next.js, React, TypeScript, and Supabase. The application allows users to track properties, manage expenses, and share property information with other users.

## Directory Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── [locale]/        # Internationalized routes
│   │   ├── about/       # About page
│   │   ├── auth/        # Authentication pages
│   │   ├── dashboard/   # Dashboard pages
│   │   │   └── properties/ # Property management
│   │   ├── goodbye/     # Account deletion confirmation
│   │   ├── home/        # Landing page
│   │   ├── login/       # Login page
│   │   ├── profile/     # User profile
│   │   ├── register/    # Registration page
│   │   └── reset-password/ # Password reset
│   └── api/             # API routes
├── components/          # Reusable React components
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components
│   ├── properties/      # Property-related components
│   │   ├── columns.tsx  # DataTable columns definition
│   │   ├── DataTable.tsx # Properties data table
│   │   └── NewPropertyForm.tsx # Form for adding properties
│   └── ui/              # UI components (shadcn/ui)
├── lib/                 # Utility functions and services
│   ├── i18n/            # Internationalization
│   │   └── messages/    # Translation files (en.json, de.json)
│   ├── supabase/        # Supabase client
│   │   ├── client.ts    # Client-side Supabase
│   │   └── server.ts    # Server-side Supabase
│   └── services/        # Business logic
└── types/               # TypeScript type definitions
```

## Key Technologies

- **Next.js**: App Router for server and client components
- **React**: UI library
- **TypeScript**: Type safety
- **Supabase**: Backend as a Service (Auth, Database, Storage)
- **TailwindCSS**: Styling
- **shadcn/ui**: UI component library
- **next-intl**: Internationalization

## Database Schema

The application uses Supabase with the following main tables:

- **user_profiles**: User profile information
- **properties**: Property details
- **property_users**: Junction table for property sharing

## Authentication

Authentication is handled by Supabase Auth with the following features:
- Email/password authentication
- Email verification
- Password reset
- Session management

## Internationalization

The application supports multiple languages:
- English (en)
- German (de)

Translation files are located in `src/lib/i18n/messages/`.

## Current State

- The application has a working authentication system
- Users can create and manage properties
- Properties can be shared with other users
- The UI is responsive and accessible
- Row Level Security (RLS) is implemented in Supabase

## Recent Changes

- Fixed infinite recursion in RLS policies
- Added translations for property table columns
- Improved error handling in forms

## Known Issues

- Some TypeScript errors in the NewPropertyForm component related to form field types
- Potential performance issues with large property lists

## Development Guidelines

- Use server components by default, client components only when necessary
- Follow the established project structure
- Use Tailwind classes for styling
- Ensure all new features have proper translations
- Implement proper error handling
- Use TypeScript for type safety 