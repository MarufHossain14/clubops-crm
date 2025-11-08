# CampOps - Event Management CRM

## Technology Stack

- **Frontend:** Next.js, Tailwind CSS, Redux Toolkit, Redux Toolkit Query, Material UI Data Grid, Clerk
- **Backend:** Node.js with Express, Prisma (PostgreSQL ORM), TypeScript
- **Database:** PostgreSQL, managed with PgAdmin

## Getting Started

### Prerequisites

Ensure you have these tools installed:

- Git
- Node.js
- npm (Node Package Manager)
- PostgreSQL ([download](https://www.postgresql.org/download/))
- PgAdmin ([download](https://www.pgadmin.org/download/))
- Clerk Account (for authentication)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone [git url]
   cd entrystact-v1
   ```

2. **Install dependencies in both client and server:**
   ```bash
   cd client
   npm i
   cd ..
   cd server
   npm i
   ```

3. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   ```

4. **Configure environment variables:**
   - `.env` for server settings (PORT, DATABASE_URL, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY, FRONTEND_URL)
   - `.env.local` for client settings (NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)

5. **Run the project:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

## Additional Resources

- Tailwind CSS configuration (`client/tailwind.config.ts`)
- Redux Toolkit setup (`client/state/api.ts`)
- Database seed files (`server/prisma/seedData/`)
- Database schema (`server/prisma/schema.prisma`)
- `globals.css` file (`client/app/globals.css`)

## Database Management Commands

Command for resetting ID in database:

```sql
SELECT setval(pg_get_serial_sequence('"[DATA_MODEL_NAME_HERE]"', 'id'), coalesce(max(id)+1, 1), false) FROM "[DATA_MODEL_NAME_HERE]";
```

Available models: `Org`, `Member`, `Event`, `RSVP`, `Sponsor`, `VolunteerTask`, `Note`, `Attachment`

## About

Event Management CRM built with modern web technologies featuring AI-powered risk analysis and automated email generation.
