# Reset database and seed with ClubOps CRM data
# PowerShell script for Windows

Write-Host "⚠️  WARNING: This will DELETE ALL DATA in the database!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to cancel, or wait 5 seconds to continue..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🔄 Resetting database..." -ForegroundColor Cyan
npx prisma migrate reset --force --skip-seed

Write-Host "🔄 Creating new migration..." -ForegroundColor Cyan
npx prisma migrate dev --name clubops_crm_schema --skip-seed

Write-Host "🌱 Seeding database with ClubOps CRM data..." -ForegroundColor Cyan
npm run seed

Write-Host "✅ Done! Database has been reset and seeded." -ForegroundColor Green

