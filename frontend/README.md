# FlagForge Frontend

FlagForge is a premium, enterprise-ready SaaS Feature Flag Management Platform designed to give development, product, and operations teams absolute control over code releases. With FlagForge, you can safely deploy features to production, target specific user cohorts, run A/B tests, and monitor system metrics in real time.

---

## 🚀 Key Features

- **Multi-Environment Cockpit**: Seamlessly switch between **Development**, **Staging**, and **Production** environments with a single, high-contrast control.
- **Complex Targeting Rules**: Roll out variations based on granular user attributes (e.g., email, country, company, or custom attributes) using advanced comparison operators (`is one of`, `contains`, `matches regex`).
- **Interactive Analytics Dashboard**: Real-time visualization of evaluation trends, SDK client distribution, and latency metrics via interactive charts.
- **Enterprise Audit Logging**: Full traceability with permanent, un-editable logging for every flag creation, configuration update, and toggle event.
- **Multivariate & JSON Configurations**: Support for standard Boolean flags, multivariate string payloads, or structured JSON configurations for dynamic application UI themes.
- **Aesthetic Developer Integration**: Interactive, copy-pasteable SDK code snippets for React, Node.js, Python, and Go, complete with cURL testing templates.

---

## 📁 Clean Frontend Folder Structure

```
├── public/                 # Static asset distribution
├── src/
│   ├── components/         # High-fidelity atomic UI components (Button, Modal, Card, Toast, etc.)
│   ├── context/            # Global application state management (FlagContext)
│   ├── pages/              # Responsive routing pages (Dashboard, Analytics, FeatureFlags, etc.)
│   ├── services/           # Dedicated storage & simulated API service layer (flagsService)
│   ├── types/              # Domain-specific TypeScript declarations
│   ├── App.tsx             # Central Router & view hierarchy
│   ├── index.css           # Global Tailwind stylesheet
│   └── main.tsx            # DOM mounting entry point
├── package.json            # Pruned frontend package definition
├── vite.config.ts          # Vite compilation config
└── tsconfig.json           # Rigid compiler flags
```

---

## 🛠️ Local Installation & Development

To get the FlagForge frontend running locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The application will boot up at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```
This compiles the application into static HTML/JS assets inside the `dist/` directory.

### 4. Lint and Type-Check
```bash
npm run lint
```

---

## 🔌 Architecture & State Persistence

The FlagForge frontend implements a robust, client-side offline storage architecture:
- **Modular Service Layer**: Located in `src/services/flagsService.ts`, this service completely decouples UI operations from storage. It provides standard CRUD and retrieval APIs.
- **React Context integration**: State is broadcasted dynamically across the applet via `src/context/FlagContext.tsx`, binding local state updates directly to local storage hooks. This prepares the system to seamlessly transition to standard SQL, REST, or GraphQL services in the future.
- **Deterministic UI styling**: Styled using **Tailwind CSS** with cohesive off-black background sheets (`#09090b`), indigo accents (`indigo-500/indigo-600`), and typography using Inter, Space Grotesk, and JetBrains Mono.
