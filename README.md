# Digital Product Passport (DPP) Application

A comprehensive solution for implementing EU-compliant Digital Product Passports following Sylius-inspired API-first design principles.

## Features

- **Backend (Django):**
  - ProductPassport model with UUID, name, QR code, and encrypted sustainability data
  - REST API with Django REST Framework (CRUD, pagination, Redis caching)
  - GDPR compliance with encrypted fields and data deletion endpoints
  - PostgreSQL database
  - Swagger API documentation
  - Magic link authentication and email verification
  - User registration with email verification
  - Company dashboard access control

- **Frontend (React):**
  - Responsive UI with Tailwind CSS (white-blue color scheme)
  - PassportViewer component with offline support using localStorage
  - Yellow notification banner for offline mode
  - Lazy loading for performance optimization
  - Passwordless login with magic links
  - Company dashboard for passport management
  - User registration with form validation
  - PassportForm for creating and editing product passports

## Architecture

This application follows a modern client-server architecture:

- **Backend**: Django REST API with PostgreSQL and Redis
- **Frontend**: React SPA with Tailwind CSS
- **Deployment**: Docker containers (nginx, Django, PostgreSQL, Redis)

## Setup Instructions

### Using Docker (Recommended)

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/dpp-application.git
   cd dpp-application
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

3. Customize environment variables in `.env` file, especially:
   - Database credentials
   - Email settings for magic link authentication
   - JWT settings

4. Build and start the containers:
   ```
   docker-compose up -d
   ```

5. Access the application:
   - Frontend: http://localhost
   - Admin interface: http://localhost/admin
   - API documentation: http://localhost/api/schema/swagger-ui/

### Manual Setup

#### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```
   python manage.py migrate
   ```

4. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

5. Start the development server:
   ```
   python manage.py runserver
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Authentication System

The application uses a modern, secure authentication system:

1. **Magic Link Authentication:**
   - Users enter their email address
   - A time-limited magic link is sent to their email
   - Clicking the link logs them in securely without a password
   - JWT tokens are generated and stored in localStorage

2. **Registration Process:**
   - Users register with basic details
   - Email verification with a magic link
   - Account activation upon verification

3. **Security Features:**
   - JWT with access and refresh tokens
   - Token expiration
   - HTTPS-only communication
   - Email-based verification

## User Roles and Access

1. **Public Users:**
   - Can view product passports
   - Have access to offline functionality

2. **Company Users:**
   - Can register and verify their email
   - Can log in with magic links
   - Can create, edit, and manage their product passports
   - Need organization assignment to access the dashboard

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request