# Clinic Portal

A modern healthcare management system built with React, TypeScript, and Vite.

## Features

- **Patient Management**: View and manage patient records
- **Medication Tracking**: Track medication inventory and prescriptions
- **Authentication**: Secure login system with API integration
- **Responsive Design**: Modern UI built with HeroUI and Tailwind CSS

## Authentication Setup

The application now includes a complete authentication system that integrates with your backend API.

### Authentication Flow

1. **Landing Page**: Users always start on the sign-in page
2. **Login**: Users enter their email and password
3. **API Call**: Credentials are sent to the backend login endpoint
4. **Token Storage**: Access token and token type are stored in session storage
5. **User Profile**: User profile is fetched using the `/auth/me` endpoint
6. **Session Management**: Authentication state is managed throughout the app
7. **Logout**: When user clicks logout, backend logout endpoint is called

### API Configuration

The authentication system is configured to work with the following API endpoints:
- **Login URL**: `https://ohc-backend.blyssbot.com/auth/login`
- **User Profile URL**: `https://ohc-backend.blyssbot.com/auth/me`
- **Logout URL**: `https://ohc-backend.blyssbot.com/auth/logout`
- **Method**: POST for login/logout, GET for profile
- **Content-Type**: application/json

### Request Format

When a user submits their credentials, the following JSON payload is sent:

```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

### Response Handling

The system expects the login API to return a JSON response with:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

And the `/auth/me` endpoint to return user profile data:
```json
{
  "id": 8,
  "first_name": "Yuvraj",
  "last_name": "Singh",
  "username": "yuvraj01",
  "email": "yuvraj01@gmail.com",
  "is_active": true,
  "is_admin": true,
  "playground_access": true,
  "sequential_calling_access": false,
  "voice_agent_access": false,
  "chat_agent_access": true,
  "created_at": "2025-07-11T17:40:11.987761",
  "updated_at": "2025-07-27T10:20:02.125178"
}
```

### Logout Endpoint

When the user clicks the logout button, the application:

1. **Calls Backend**: Makes a POST request to `/auth/logout` with Bearer token
2. **Headers**: 
   ```
   Content-Type: application/json
   Authorization: Bearer {access_token}
   ```
3. **Expected Response**: 
   ```json
   {
     "message": "Successfully logged out"
   }
   ```
4. **Session Cleanup**: Clears all session storage regardless of backend response

### Session Storage

The application uses session storage to store:
- `access_token`: The JWT token for authentication
- `token_type`: The type of token (usually "bearer")
- `userData`: The user profile information

### Environment Variables

To configure the API URL, create a `.env.local` file in the root directory:

```env
VITE_URL=https://ohc-backend.blyssbot.com
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clinic-portal
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
echo "VITE_URL=https://ohc-backend.blyssbot.com" > .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/
│   ├── Auth.tsx          # Authentication component
│   ├── PatientDetail.tsx # Patient details modal
│   └── SetPassword.tsx   # Password setup component
├── contexts/
│   └── AuthContext.tsx   # Authentication context
├── utils/
│   └── api.ts           # API utility functions
├── App.tsx              # Main application component
└── main.tsx            # Application entry point
```

## Authentication Context

The application uses React Context to manage authentication state:

- **AuthProvider**: Wraps the app and provides authentication context
- **useAuth**: Hook to access authentication state and functions
- **Automatic Token Management**: Handles token storage and cleanup
- **Logout Integration**: Calls backend logout endpoint and cleans up session

## API Integration

The application includes utility functions in `src/utils/api.ts` for:
- Making authenticated API calls with Bearer tokens
- Handling login/logout with backend endpoints
- Fetching user profile data
- Managing authentication state

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **HeroUI** - Component library
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Iconify** - Icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

