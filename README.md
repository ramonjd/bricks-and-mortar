# Bricks & Mortar

A property expense tracking application for homeowners, landlords, and renters. Track expenses, manage properties, and handle shared costs efficiently.

## Features

- Property management for owners and landlords
- Expense tracking and receipt scanning
- Shared expense management for multiple tenants
- Budget planning and future expense forecasting
- Insurance inventory management
- Export reports for various stakeholders

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Database**: Supabase
- **Language**: TypeScript
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/bricks-and-mortar.git
   cd bricks-and-mortar
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # Reusable React components
│   └── ui/               # UI components
├── lib/                  # Utility functions and services
│   ├── supabase/        # Supabase client
│   └── services/        # Business logic
└── types/               # TypeScript type definitions
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
