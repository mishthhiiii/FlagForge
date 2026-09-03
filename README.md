<div align="center">

# FlagForge

### AI-Powered Feature Flag Management Platform

Safely control software rollouts across **Development, Staging, and Production** with environment-based feature flags, AI-assisted rollout insights, role-based access control, and complete audit visibility.

<img src="assets/dashboard-preview.png" alt="FlagForge Dashboard" width="100%"/>

</div>

---

## Overview

FlagForge is a full-stack feature flag management platform inspired by modern deployment workflows used by software teams. Instead of redeploying applications for every feature release, FlagForge enables controlled rollouts through centralized feature toggles, environment-based configuration, and deployment risk insights.

The platform combines **React**, **Express**, and **MySQL** to provide a production-style workflow for managing feature releases while maintaining visibility through audit logs and permission-based access.

---

## Key Features

### Environment-Based Feature Management

- Separate Development, Staging, and Production environments
- Independent feature visibility across environments
- Environment-aware dashboards and metrics

### Feature Flag Controls

- Create new feature flags
- Edit existing configurations
- Pause or activate features instantly
- Delete obsolete flags
- Adjust rollout percentages in real time

### AI Rollout Insights

- Risk score based on rollout health
- Recommendation-based decision support
- Environment-specific analysis
- Developers always retain final control

### Secure Access

- JWT Authentication
- Role-based permissions
- Admin
- Developer
- Viewer

### Audit Visibility

Every important action is recorded, including:

- Feature creation
- Configuration updates
- Rollout changes
- Feature deletion

---

## Dashboard Preview

<img src="assets/dashboard-preview.png" alt="FlagForge Dashboard"/>

---

## Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MySQL |
| Authentication | JWT |
| Styling | Tailwind CSS |
| API | REST |
| Version Control | Git & GitHub |

---

## Architecture

```text
                 React + Vite
                      │
                      │ REST APIs
                      ▼
               Express Backend
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
 Feature Flags     Authentication   Audit Logs
      │
      ▼
     MySQL Database
```

---

## Project Structure

```text
FlagForge/
├── assets/
├── backend/
│   ├── app.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
├── database/
│   ├── schema.sql
│   └── seed.sql
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── ...
├── package.json
├── vite.config.js
└── README.md
```

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/mishthhiiii/FlagForge.git
cd FlagForge
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create a `.env` file using `.env.example`.

Configure your database credentials before starting the application.

### Run the Project

```bash
npm run dev
```

The application runs locally at:

```text
http://localhost:3000
```

Health endpoint:

```text
http://localhost:3000/health
```

---

## Demo Accounts

| Role | Email |
|------|-------|
| Admin | `admin@flagforge.local` |
| Developer | `developer@flagforge.local` |
| Viewer | `viewer@flagforge.local` |

> Demo credentials are available from the login page.

---

## Core Workflows

### Feature Flag Lifecycle

1. Create a feature flag.
2. Assign an environment.
3. Configure rollout percentage.
4. Activate or pause the rollout.
5. Monitor risk insights.
6. Review the audit history.

### Environment Switching

Switching between environments updates:

- Dashboard metrics
- Live rollout table
- Risk insights
- Feature visibility

### AI Rollout Insights

Instead of automatically changing production behavior, FlagForge provides recommendations based on rollout health.

Example recommendations include:

- Continue rollout
- Pause rollout
- Disable rollout

The final decision always remains with the developer.

---

## API Overview

| Method | Endpoint | Purpose |
|---------|----------|---------|
| POST | `/login` | Authenticate user |
| GET | `/flags` | Fetch feature flags |
| POST | `/flags` | Create feature |
| PATCH | `/flags/:id` | Update feature |
| DELETE | `/flags/:id` | Delete feature |
| GET | `/audit` | Fetch audit logs |
| GET | `/health` | Health check |

---

## Design Principles

FlagForge was built around four core principles:

- Controlled feature releases instead of risky deployments.
- Environment-specific configuration.
- Transparent audit visibility.
- Human-controlled AI recommendations.

---

## Future Improvements

- Scheduled feature releases
- Percentage-based gradual rollouts
- Team workspaces
- Webhook integrations
- Advanced rollout analytics



**Made by Mishthi Chaurasia**
