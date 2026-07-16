# FlagForge AI Agent System

AI-powered software engineering orchestration layer for the FlagForge feature flag platform. Runs alongside the existing `frontend/` and `backend/` applications without modifying them.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Orchestrator                            │
│  Planner → TaskTracker → SkillRegistry → Delegator          │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
    ┌──────▼──────┐        ┌──────▼──────┐
    │ Coding Agent│        │   Skills    │
    │ Read/Write  │        │ create-flag │
    │ Run commands│        └─────────────┘
    └──────┬──────┘
           │
    ┌──────▼──────┐   ┌─────────────┐   ┌──────────────────┐
    │   Memory    │   │    Slack    │   │ Autonomous Flow  │
    │ conventions │   │ 4 channels  │   │ daily inspection │
    │ task history│   └─────────────┘   └──────────────────┘
    └─────────────┘
```

## Quick Start

```bash
# From repository root
cp .env.example .env
npm install
npm run typecheck

# Plan a task
npm run agent:plan -- "create feature flag for dark mode"

# Execute planned task
npm run agent:execute -- <task-id>

# Run daily inspection
npm run agent:inspect

# Start autonomous scheduler
npm run agent:schedule
```

## Components

| Directory | Purpose |
|-----------|---------|
| `agents/orchestrator/` | Plans, delegates, tracks tasks |
| `agents/coding-agent/` | Reads files, runs commands, applies changes |
| `memory/` | Persistent project knowledge |
| `skills/` | Reusable agent capabilities |
| `communication/slack/` | Slack integration (optional) |
| `workflows/` | Autonomous scheduled workflows |
| `configs/` | Environment-based configuration |

## Environment Variables

See `.env.example` for all options. Key variables:

- `AGENT_LLM_PROVIDER` — `openai`, `anthropic`, `gemini`, or `none`
- `SLACK_ENABLED` — Enable Slack notifications
- `AUTONOMOUS_ENABLED` — Enable daily inspection scheduler

## Skills

Skills live in `skills/<skill-id>/SKILL.md`. The orchestrator auto-loads them and matches triggers against incoming requests.

Built-in: **create-feature-flag** — standardized flag creation workflow for FlagForge.

## Slack Channels

| Channel | Env Variable | Purpose |
|---------|-------------|---------|
| orchestrator | `SLACK_CHANNEL_ORCHESTRATOR` | Task lifecycle events |
| coding | `SLACK_CHANNEL_CODING` | Coding agent activity |
| logs | `SLACK_CHANNEL_LOGS` | Detailed logs |
| human_review | `SLACK_CHANNEL_HUMAN_REVIEW` | Failures needing approval |

## Planning

Every coding task generates an execution plan before work begins:

1. Analyze repository
2. Modify backend (if needed)
3. Modify frontend (if needed)
4. Test
5. Return result

Plans are logged to Slack (when enabled) and stored in task history.

## Autonomous Workflows

The daily inspection workflow (`workflows/daily-inspection/`) checks:

- Key project files exist
- package.json validity
- Agent system typecheck

Reports are saved to `memory/data/reports/`.

## Existing Application

The agent system does **not** replace or modify:

- `frontend/` — React + Vite UI
- `backend/backend/` — Express + Prisma API

Start the existing app separately:

```bash
# Backend
cd backend/backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```
