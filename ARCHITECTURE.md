\# Coredora Loan Application — Architecture



\## 1. Overview



Coredora is a responsive multi-step loan application built with Next.js, React, TypeScript, Tailwind CSS, and Supabase.



The application provides a guided loan application experience with authentication, profile management, form validation, persistence, document handling, loan calculations, and automated end-to-end testing.



\---



\## 2. Technology Stack



| Layer           | Technology       |

| --------------- | ---------------- |

| Framework       | Next.js 13.5.1   |

| UI Library      | React 18.2       |

| Language        | TypeScript 5.2   |

| Styling         | Tailwind CSS 3.3 |

| Forms           | React Hook Form  |

| Validation      | Zod              |

| Authentication  | Supabase Auth    |

| Database        | Supabase         |

| Charts          | Recharts         |

| Icons           | Lucide React     |

| Notifications   | Sonner           |

| Testing         | Cypress 15       |

| Package Manager | npm              |



\---



\## 3. High-Level Architecture



```text

&#x20;                        ┌─────────────────────┐

&#x20;                        │      Browser        │

&#x20;                        └──────────┬──────────┘

&#x20;                                   │

&#x20;                                   ▼

&#x20;                        ┌─────────────────────┐

&#x20;                        │     Next.js App     │

&#x20;                        │     App Router      │

&#x20;                        └──────────┬──────────┘

&#x20;                                   │

&#x20;            ┌──────────────────────┼──────────────────────┐

&#x20;            │                      │                      │

&#x20;            ▼                      ▼                      ▼

&#x20;     ┌─────────────┐       ┌─────────────┐       ┌─────────────┐

&#x20;     │ UI / Pages  │       │ Auth Layer  │       │ Form Layer  │

&#x20;     │ components  │       │ Supabase    │       │ RHF + Zod   │

&#x20;     └─────────────┘       └──────┬──────┘       └─────────────┘

&#x20;                                  │

&#x20;                                  ▼

&#x20;                        ┌─────────────────────┐

&#x20;                        │      Supabase       │

&#x20;                        │ Auth + Database     │

&#x20;                        └─────────────────────┘

```



\---



\## 4. Project Structure



```text

app/

├── App Router pages

├── layouts

├── authentication routes

└── application/dashboard routes



components/

├── reusable UI components

├── application components

├── authentication components

├── providers

└── navigation/layout components



hooks/

├── reusable React hooks

├── form persistence

└── application state helpers



lib/

├── Supabase client

├── shared types

├── validation/helpers

└── reusable utilities



supabase/

└── Supabase-related configuration/database resources



cypress/

├── e2e/

├── fixtures/

└── support/



src/

└── supporting source modules



README.md

ARCHITECTURE.md

package.json

next.config.js

tailwind.config.ts

tsconfig.json

cypress.config.ts

```



\---



\## 5. Application Layers



\### Presentation Layer



The presentation layer contains Next.js pages and reusable React components.



Responsibilities:



\* Rendering application screens

\* Responsive layouts

\* User interactions

\* Navigation

\* Loading and error states

\* Accessible form controls



\---



\### Component Layer



Reusable components are located under `components/`.



Responsibilities include:



\* Buttons

\* Cards

\* Forms

\* Navigation

\* Application shell

\* Authentication providers

\* Dashboard components

\* Shared UI primitives



The component layer keeps UI behavior reusable and consistent across the application.



\---



\### Form and Validation Layer



The application uses React Hook Form for form state management and Zod for schema-based validation.



Responsibilities:



\* Managing multi-step form state

\* Field validation

\* Conditional validation

\* Error messages

\* Form submission

\* Preserving user-entered data



This approach keeps validation rules centralized and reduces duplicated form logic.



\---



\### Authentication Layer



Supabase Auth provides authentication and session management.



The authentication flow includes:



```text

Sign Up

&#x20;  │

&#x20;  ▼

Supabase Auth

&#x20;  │

&#x20;  ▼

Authenticated Session

&#x20;  │

&#x20;  ▼

Profile Loading

&#x20;  │

&#x20;  ▼

Protected Application

```



The application listens for Supabase authentication state changes and updates the React application state accordingly.



\---



\### Data Layer



Supabase is used as the backend data service.



The application communicates with Supabase through the Supabase client rather than directly coupling UI components to backend implementation details.



Profile data is loaded using the authenticated user's ID.



\---



\## 6. Authentication Flow



```text

User

&#x20;│

&#x20;├── Sign Up ──────────────► Supabase Auth

&#x20;│                              │

&#x20;│                              ▼

&#x20;│                         User Account

&#x20;│

&#x20;└── Sign In ──────────────► Supabase Auth

&#x20;                               │

&#x20;                               ▼

&#x20;                            Session

&#x20;                               │

&#x20;                               ▼

&#x20;                        Load User Profile

&#x20;                               │

&#x20;                               ▼

&#x20;                        Protected Routes

```



Authentication state is maintained through the Supabase session.



The application handles:



\* Sign up

\* Sign in

\* Sign out

\* Session restoration

\* Authentication state changes

\* Profile loading



\---



\## 7. Loan Application Flow



The loan application is implemented as a guided multi-step workflow.



The workflow supports:



\* Loan type selection

\* Personal information

\* KYC information

\* Address information

\* Employment information

\* Co-applicant information

\* Document information

\* Final review



Conditional logic can determine whether certain steps or fields are required based on the selected loan flow and user information.



\---



\## 8. Form Persistence



Application data can be persisted locally so users can resume an incomplete application.



The persistence layer is responsible for:



\* Saving progress

\* Restoring previously entered values

\* Maintaining the current application state

\* Cleaning completed drafts when appropriate



This improves the user experience when a user leaves and later returns to the application.



\---



\## 9. Loan Calculation



Loan-related calculations are performed on the client side for immediate feedback.



The application provides:



\* Loan amount calculations

\* Tenure information

\* EMI estimation

\* Pre-approval/summary information



Calculated values are displayed to the user before final submission.



\---



\## 10. Document and Signature Flow



The application provides document-related steps as part of the loan workflow.



The document flow is designed to support:



\* Document selection/upload

\* Required document validation

\* Document status

\* Compression/optimization where implemented

\* Electronic signature

\* Final review



Sensitive credentials and environment secrets are not stored in source control.



\---



\## 11. Route Protection



Protected application routes use the authentication state to determine whether a user can access authenticated pages.



```text

Request

&#x20; │

&#x20; ▼

Route Guard

&#x20; │

&#x20; ├── Authenticated ──► Application Page

&#x20; │

&#x20; └── Not Authenticated ──► Authentication Page

```



\---



\## 12. Testing Architecture



Cypress is used for end-to-end testing.



Tests are located under:



```text

cypress/

├── e2e/

├── fixtures/

└── support/

```



The test suite covers important application behaviors including authentication, navigation, forms, validation, and loan application flows.



The current project contains more than the required 15 E2E test cases.



\---



\## 13. Code Quality



The project includes:



```text

npm run lint

npm run typecheck

npm run build

```



These commands are used to validate:



\* ESLint rules

\* TypeScript correctness

\* Production build compatibility



\---



\## 14. Environment Configuration



Environment-specific Supabase configuration is provided through environment variables.



Local environment files such as:



```text

.env.local

```



must not be committed to Git.



Only non-sensitive example configuration should be shared when required.



\---



\## 15. Security Considerations



The application follows these principles:



\* Authentication is handled through Supabase Auth.

\* Environment secrets are kept outside source control.

\* Client-side validation improves user feedback.

\* Server/backend security rules remain the source of truth for protected data.

\* Authenticated sessions are used for protected application access.

\* Sensitive user information should not be exposed in logs or committed to the repository.



\---



\## 16. Deployment



The application is designed for deployment using a Next.js-compatible hosting platform.



Required production environment variables must be configured in the deployment platform.



Typical production flow:



```text

GitHub Repository

&#x20;      │

&#x20;      ▼

Deployment Platform

&#x20;      │

&#x20;      ▼

Next.js Build

&#x20;      │

&#x20;      ▼

Production Application

&#x20;      │

&#x20;      ▼

Supabase

```



\---



\## 17. Development Commands



Install dependencies:



```bash

npm install

```



Start development server:



```bash

npm run dev

```



Run lint:



```bash

npm run lint

```



Run TypeScript checking:



```bash

npm run typecheck

```



Create production build:



```bash

npm run build

```



Start production server:



```bash

npm start

```



Run Cypress:



```bash

npx cypress open

```



\---



\## 18. Repository Hygiene



The following generated or sensitive files should not be committed:



```text

node\_modules/

.next/

.env.local

\*.tsbuildinfo

```



The `.gitignore` file should be kept updated to prevent accidental commits of generated files or secrets.



\---



\## 19. Architecture Principles



The project follows these principles:



1\. Component reusability

2\. Separation of UI and data concerns

3\. Centralized authentication state

4\. Schema-based validation

5\. Reusable hooks for shared behavior

6\. Protected application routes

7\. Automated end-to-end testing

8\. Environment-based configuration

9\. Responsive and accessible UI

10\. Maintainable TypeScript code



\---



\## 20. Summary



Coredora uses a modern React/Next.js architecture with Supabase authentication and data services.



The architecture separates:



\* Presentation

\* Reusable components

\* Form management

\* Validation

\* Authentication

\* Data access

\* Testing



This structure allows the application to remain maintainable while supporting a complete multi-step loan application workflow.



```

