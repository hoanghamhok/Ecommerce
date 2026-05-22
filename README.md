# GoCart Ecommerce

Full-stack ecommerce project built with ASP.NET Core 8, Entity Framework Core, SQL Server, Next.js, JWT auth, Google login, MoMo payment flow, email confirmation, wishlist, reviews, analytics, and chatbot/prediction features.

## Highlights for Interview

- ASP.NET Core Web API with service layer and EF Core migrations.
- JWT authentication with role claims and Google OAuth login.
- Cart and checkout flow with stock validation and database transaction.
- MoMo payment callback/notify endpoints.
- Email order confirmation.
- Review/rating, wishlist, order history, admin dashboard, analytics, and chatbot UI.
- Next.js frontend with configurable API base URL.
- Secrets removed from source control and replaced by environment/user-secret configuration.

## Tech Stack

- Backend: ASP.NET Core 8, EF Core, SQL Server, JWT Bearer, BCrypt, Swagger.
- Frontend: Next.js 15, React 18, TypeScript, Tailwind CSS, Recharts, lucide-react.
- Integrations: Google OAuth, Gmail SMTP, MoMo payment.
- ML/AI folder: Python model/chatbot scripts under `model/`.

## Configuration

Do not commit real secrets. Use `EcommerceBackend/appsettings.example.json` as the template.

Recommended local backend setup:

```powershell
cd EcommerceBackend
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=ecommerce;User Id=sa;Password=your-password;TrustServerCertificate=True;"
dotnet user-secrets set "Jwt:Key" "replace-with-at-least-32-random-characters"
dotnet user-secrets set "Google:ClientId" "your-google-client-id"
dotnet user-secrets set "Google:ClientSecret" "your-google-client-secret"
dotnet user-secrets set "EmailSettings:SenderEmail" "your-email@gmail.com"
dotnet user-secrets set "EmailSettings:Password" "your-app-password"
dotnet user-secrets set "Momo:PartnerCode" "your-partner-code"
dotnet user-secrets set "Momo:AccessKey" "your-access-key"
dotnet user-secrets set "Momo:SecretKey" "your-secret-key"
```

Frontend setup:

```powershell
cd ecommerce-frontend
echo NEXT_PUBLIC_API_BASE=http://localhost:5091 > .env.local
```

## Run Locally

Backend:

```powershell
dotnet restore
dotnet ef database update --project EcommerceBackend
dotnet run --project EcommerceBackend
```

Frontend:

```powershell
cd ecommerce-frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

Commands used during cleanup:

```powershell
dotnet build EcommerceBackend\EcommerceBackend.csproj -o .\artifacts\backend-build-check
cd ecommerce-frontend
npm.cmd run build
```

Note: the default backend `bin` output can be locked if an old `EcommerceBackend.exe` is still running. Stop that process before a normal `dotnet build Ecommerce.sln`.

## Security Notes

The previous project configuration contained real-looking local credentials and third-party keys. Rotate any database, Gmail, Google OAuth, MoMo, or JWT secrets that were ever committed or shared.
