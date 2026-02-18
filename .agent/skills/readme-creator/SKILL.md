---
name: readme-creator
description: Generate or update a **production-grade, extremely detailed** README.md. Use when the user wants "comprehensive documentation", "detailed readme", or "full system specification". This skill prioritizes depth, design intent, and architectural clarity over brevity.
---

# README Creator Skill (Detailed Edition)

This skill creates a `README.md` that serves as a **complete system specification**. It goes beyond simple usage instructions to explain **why** the system is built the way it is, how it works under the hood, and how to operate it safely in production.

## Core Philosophy: "The Absent Architect"

Imagine the original architect has left the company and cannot be contacted. This README must contain EVERY piece of information a new senior engineer would need to:
1.  Understand the historical design decisions (ADRs).
2.  Debug a critical production outage.
3.  Scale the system or refactor core components.

**Do not aim for "concise". Aim for "definitive".**

## Usage Guidelines

1.  **Forensic Analysis**: You must dig deep into the code.
    -   **Identify "Whys"**: If you see a specific library (e.g., Zustand over Redux), try to infer why. If unsure, note it as an inference.
    -   **Trace Critical Flows**: Follow the path of user data from input -> state/store -> API -> persistence.
    -   **Security Audit**: Look for auth headers, sanitation, CORS, cookies.
2.  **Mandatory Visualization**: You **MUST** use Mermaid diagrams for:
    -   **System Architecture** (Container View)
    -   **Critical Sequence** (e.g., "Image Export Flow" or "Login Flow")
    -   **State/Data Flow** (How data moves through the app)
3.  **File-Level Granularity**: Do not just list folders. explain key files (files > 150 lines or with "Manager"/"Service"/"Context" in the name).

## Required Sections & Detail Level

-   **🧠 Design Decisions**: Explain technology choices. *Why Vite? Why specific lint rules?*
-   **📐 Architecture & State**: Diagrams + text explaining the state management pattern.
-   **🔐 Security Specifications**: Auth, CSP, sanitation strategies found in code.
-   **⚡ Performance Optimizations**: Memoization, lazy loading, code splitting strategies observed.
-   **🌐 Internationalization (i18n)**: Strategy for multi-language support (if present).
-   **📡 API Reference**: List key endpoints or interfaces if this is a library/service.
-   **🧪 Test Strategy**: Not just commands, but *what* is tested (e.g., "Unit tests for utils, E2E for critical paths").
-   **🔧 Troubleshooting**: Specific errors and known workarounds.

## Steps

1.  **Read Template**: View `assets/README_TEMPLATE.md`.
2.  **Analyze Source**:
    -   `package.json` -> Dependencies (Infer tech stack & design choices)
    -   `src/store` or `src/context` -> State management analysis
    -   `src/services` or `src/api` -> Data flow analysis
    -   `vite.config.ts` / `next.config.js` -> Build & Env analysis
3.  **Draft**: Generate usage of the template. **Fill every section**.
4.  **Review**: Ask yourself, "If checking this out at 3 AM for a hotfix, is this enough info?"
5.  **Write**: Save to `README.md`.
