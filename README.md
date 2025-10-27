# Yaf Hiring Platform

A modern, full-stack hiring and recruitment management platform built with React Router v7, Chakra UI, and Supabase. This platform streamlines the entire recruitment process from job posting to candidate management with real-time updates and an intuitive admin interface.

## ✨ Features

### For Recruiters/Admins
- 📋 **Job Management** - Create, edit, and manage job postings with customizable application forms
- 👥 **Candidate Tracking** - View and manage all applicants with draggable/resizable table views
- 🎯 **Dynamic Form Builder** - Configure required/optional fields per job posting
- 📊 **Dashboard Analytics** - Monitor recruitment metrics and activity
- 🔐 **Role-Based Access** - Secure admin panel with authentication guards
- 🎨 **Modern UI** - Clean, responsive interface built with Chakra UI v3

### For Job Seekers
- 🔍 **Job Search** - Browse and filter available positions by department, type, and location
- 📝 **Easy Application** - Dynamic application forms that adapt to each job's requirements
- 🔔 **Application Tracking** - Monitor your application status in real-time
- 📱 **Mobile Responsive** - Seamless experience across all devices

## 🚀 Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **React Router v7** - File-based routing with SSR support
- **Chakra UI v3** - Modern component library with excellent DX
- **TypeScript** - Type-safe development
- **TailwindCSS v4** - Utility-first styling (integrated with Chakra)
- **React Hook Form + Zod** - Form handling and validation
- **SWR** - Data fetching and caching

### Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Auth** - Built-in authentication system
- **Row Level Security (RLS)** - Secure data access patterns

### Development Tools
- **Vite** - Fast build tool and dev server
- **TypeScript** - Full type safety
- **ESLint & Prettier** - Code quality and formatting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **Supabase Account** (for database setup)

## 🛠️ Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yaffalhakim1/yaf-hiring-platform.git
cd yaf-hiring-platform
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the root directory:

```env
VITE_PUBLIC_SUPABASE_URL=your_supabase_project_url
VITE_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase database:**

Create the following tables in your Supabase project:

```sql
-- Jobs table
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  slug TEXT,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  type TEXT,
  location TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'IDR',
  salary_display_text TEXT,
  profile_config JSONB,
  list_card JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Candidates table
CREATE TABLE candidates (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES jobs(id) ON DELETE CASCADE,
  user_id TEXT,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate attributes table
CREATE TABLE candidate_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id TEXT REFERENCES candidates(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT,
  order_num INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

5. **Start the development server:**
```bash
npm run dev
```

Your application will be available at `http://localhost:5173`

## 📦 Build & Deployment

### Production Build

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `build/` directory:
- `build/client/` - Static assets
- `build/server/` - Server-side code

### Run Production Build

```bash
npm start
```

### Docker Deployment

```bash
# Build the Docker image
docker build -t yaf-hiring-platform .

# Run the container
docker run -p 3000:3000 yaf-hiring-platform
```

### Deploy to Cloud Platforms

This app can be deployed to:
- **Netlify** - Automatic deployment from Git
- **Vercel** - Optimized for React Router
- **Fly.io** - Global edge deployment
- **Railway** - Simple container deployment
- **AWS/GCP/Azure** - Enterprise cloud platforms

## 🏗️ Project Structure

```
yaf-hiring-platform/
├── app/
│   ├── components/         # Reusable UI components
│   │   ├── error/         # Error handling components
│   │   ├── form/          # Form components
│   │   ├── guards/        # Auth & role guards
│   │   ├── jobs/          # Job-related components
│   │   ├── rhforms/       # React Hook Form wrappers
│   │   ├── table/         # Table components
│   │   └── ui/            # General UI components
│   ├── configs/           # Chakra UI theme configuration
│   ├── constants/         # App constants
│   ├── contexts/          # React contexts (Auth)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and services
│   │   ├── database/      # Database services
│   │   ├── supabase.client.ts
│   │   └── supabase.server.ts
│   ├── routes/            # File-based routing
│   │   ├── admin/         # Admin routes
│   │   ├── jobs/          # Public job routes
│   │   └── login.tsx      # Auth routes
│   ├── types/             # TypeScript definitions
│   ├── validation/        # Zod schemas
│   └── root.tsx           # App root component
├── public/                # Static assets
├── .env                   # Environment variables
└── package.json
```

## 🎯 Key Features Explained

### Dynamic Application Forms

Each job posting can have custom application form configurations:

```typescript
profile_config: {
  fullName: { state: 'mandatory', label: 'Full Name' },
  email: { state: 'mandatory', label: 'Email' },
  phone: { state: 'optional', label: 'Phone Number' },
  linkedin: { state: 'optional', label: 'LinkedIn Profile' },
  // ... more fields
}
```

Fields can be:
- **Mandatory** - Required for application
- **Optional** - Optional for applicants
- **Off** - Hidden from the form

### Draggable & Resizable Tables

The candidate management page features an advanced table with:
- Drag-and-drop column reordering
- Resizable columns
- Built-in pagination
- Advanced filtering

### Authentication & Authorization

Two user roles:
- **Admin** - Full access to job and candidate management
- **Applicant** - Can browse jobs and submit applications

Demo credentials:
- Admin: `admin@hiring.com` / `password123`
- Applicant: `applicant@hiring.com` / `password123`

## 🔧 Configuration

### Chakra UI Theme

Customize the theme in `app/configs/chakra/theme/`:

```typescript
// tokens.ts - Define color palette
colors: {
  primary: {
    500: { value: '#3b82f6' }, // Main brand color
    // ... other shades
  }
}
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## 📚 Documentation

- [React Router Documentation](https://reactrouter.com/)
- [Chakra UI Documentation](https://www.chakra-ui.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com/)


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**me**

- GitHub: [@yaffalhakim1](https://github.com/yaffalhakim1)

## 🙏 Acknowledgments

- Built with React Router v7
- Styled with Chakra UI v3
- Powered by Supabase
- Type-safe with TypeScript

## 📞 Support

For support, open an issue on GitHub or contact the maintainer.

---

**Built with ❤️ for modern hiring processes**
