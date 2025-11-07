#!/bin/bash
# Reset database and seed with ClubOps CRM data

echo "⚠️  WARNING: This will DELETE ALL DATA in the database!"
echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
sleep 5

echo "🔄 Resetting database..."
npx prisma migrate reset --force --skip-seed

echo "🔄 Creating new migration..."
npx prisma migrate dev --name clubops_crm_schema --skip-seed

echo "🌱 Seeding database with ClubOps CRM data..."
npm run seed

echo "✅ Done! Database has been reset and seeded."

