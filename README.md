# Coredora — Multi-Step Loan Application Platform

Coredora is a modern, responsive digital loan application platform designed to provide a smooth, secure, and user-friendly loan application experience.

The platform combines a multi-step application workflow with authentication, validation, conditional logic, draft persistence, EMI calculations, document management, and automated end-to-end testing.

---

## Features

### Loan Application

* 8-step loan application workflow
* Multiple loan types
* Loan amount and tenure selection
* Dynamic form validation
* Conditional form fields
* Step-by-step navigation
* Application progress tracking
* Final application review
* Protected application routes

### Smart Application Experience

* Automatic draft saving
* Application state persistence
* Resume application functionality
* Client-side validation
* Clear validation feedback
* Authentication-based route protection
* Login and registration flows

### EMI Calculator

* Loan amount input
* Interest rate input
* Loan tenure selection
* Monthly EMI calculation
* Total interest calculation
* Total repayment calculation
* Interactive calculator interface
* INR currency formatting

### Documents & Verification

* Document upload workflow
* Document management
* KYC information
* Application document review
* E-signature workflow
* Protected document routes

### Authentication

* User registration
* User login
* Supabase authentication
* Session persistence
* Protected application routes
* Automatic redirects for unauthenticated users

### Dashboard

* Loan application overview
* Application status
* Loan information
* EMI and repayment information
* User-specific application experience

### Testing

* Cypress end-to-end testing
* Authentication redirect tests
* Route accessibility tests
* Form availability tests
* Calculator route tests
* Loan route tests
* Document route tests
* Homepage visibility tests

---

## Technology Stack

| Technology      | Purpose                             |
| --------------- | ----------------------------------- |
| Next.js 13      | Application framework               |
| React 18        | User interface                      |
| TypeScript      | Type-safe development               |
| Tailwind CSS    | Styling and responsive UI           |
| Supabase        | Authentication and backend services |
| React Hook Form | Form management                     |
| Zod             | Form validation                     |
| Recharts        | Data visualization                  |
| Lucide React    | UI icons                            |
| Cypress         | End-to-end testing                  |

---

## Project Structure

```text
coredora-loan-application/
│
├── app/
│   ├── login/
│   ├── register/
│   ├── (app)/
│   │   ├── apply/
│   │   ├── calculator/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── loans/
│   │   └── profile/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── app-providers.tsx
│   ├── app-shell.tsx
│   ├── providers.tsx
│   └── route-guard.tsx
│
├── cypress/
│   ├── e2e/
│   ├── fixtures/
│   └── support/
│
├── hooks/
│
├── lib/
│   ├── constants.ts
│   ├── loan.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── wizard-schema.ts
│   └── supabase/
│
├── supabase/
│
├── ARCHITECTURE.md
├── cypress.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Git

### Installation

Clone the repository and enter the project directory:

```bash
git clone <repository-url>
cd coredora-loan-application
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root.

Add the required Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never commit `.env.local` or private credentials to GitHub.

### Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

If your local Cypress configuration uses another port, start the application on that configured port.

---

## Available Scripts

### Development

```bash
npm run dev
```

Starts the Next.js development server.

### Production Build

```bash
npm run build
```

Creates an optimized production build.

### Production Server

```bash
npm run start
```

Starts the production server after building the application.

### Type Checking

```bash
npm run typecheck
```

Runs the TypeScript compiler without generating files.

### Linting

```bash
npm run lint
```

Runs ESLint and checks the project for code-quality issues.

### End-to-End Tests

```bash
npx cypress run
```

Runs the Cypress test suite in headless mode.

---

## Quality Checks

Before submitting the project, run:

```bash
npm run typecheck
npm run lint
npm run build
npx cypress run
```

The project should pass all four checks before deployment or submission.

---

## End-to-End Testing

Cypress tests cover important application flows including:

* Homepage loading
* Login route
* Registration route
* Loan application authentication redirect
* Calculator authentication redirect
* Loans page
* Documents authentication redirect
* Profile authentication redirect
* Dashboard authentication redirect
* Login form fields
* Registration form fields
* Calculator route behavior
* Documents route behavior
* Homepage visibility
* Protected route behavior

---

## Architecture

Detailed project architecture and implementation decisions are documented in:

```text
ARCHITECTURE.md
```

The architecture documentation covers the application structure, major modules, authentication flow, routing, data handling, validation, and testing strategy.

---

## Security

The application follows basic frontend security practices:

* Authentication-protected routes
* Environment variables for Supabase configuration
* No committed private environment files
* Client-side validation
* Protected authenticated application flows
* Authentication-aware redirects

Client-side validation should always be complemented by appropriate server-side validation in a production backend.

---

## Responsive Design

The interface is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile devices

The UI uses responsive Tailwind CSS utilities and reusable components to maintain consistent layouts across screen sizes.

---

## Submission Checklist

Before final submission, verify:

* [ ] Application starts successfully
* [ ] Authentication works
* [ ] Loan application workflow works
* [ ] Validation works
* [ ] Conditional logic works
* [ ] Draft persistence works
* [ ] EMI calculator works
* [ ] Document workflow works
* [ ] E-signature flow works
* [ ] Dashboard works
* [ ] `ARCHITECTURE.md` is included
* [ ] README is complete
* [ ] TypeScript check passes
* [ ] ESLint passes
* [ ] Production build passes
* [ ] Cypress tests pass
* [ ] GitHub repository is up to date
* [ ] Final project ZIP is prepared

---

## Project Status

Coredora is configured as a modern Next.js loan application platform with authentication, protected application flows, validation, financial calculations, document handling, architecture documentation, and automated end-to-end testing.
