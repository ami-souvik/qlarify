# GEMINI.md

## Project: Qlarify

Qlarify is an AI-powered system design co-pilot that converts rough product ideas into structured, build-ready system blueprints using Domain-Driven Design (DDD), canonical modeling, and AI-context orchestration.

This document defines architectural intent and coding constraints for this repository.

---

## 1. High-Level Architectural Principles

- Qlarify follows Clean Architecture principles.
- Core domain logic must not depend on infrastructure.
- Canonical system model is the source of truth.
- Visualizations must be derived projections of structured models.
- No business logic in UI or adapters.
- No circular dependencies between bounded contexts.

---

## 2. Core Domains (Bounded Contexts)

### 2.1 Ideation & Clarification Context
Responsible for:
- Conversational refinement of product ideas
- Extracting structured product intent
- Managing assumptions and accepted changes

### 2.2 Product Modeling Context
Responsible for:
- Product overview
- Personas
- Problem statements
- Capabilities
- Constraints & NFRs

### 2.3 System Architecture Context (Core Domain)
Responsible for:
- Domains (DDD)
- Aggregates
- Entities
- Value Objects
- Services
- API definitions
- Database schema modeling
- End-to-end flows

This is the most critical domain in the system.

### 2.4 Visualization Context
Responsible for:
- Generating service maps
- Domain maps
- Flow diagrams
- Schema diagrams

Visualization must always derive from canonical structured data.

### 2.5 Build Orchestration Context
Responsible for:
- Exporting structured build prompts
- Generating incremental change prompts
- Preparing AI-ready context packets

---

## 3. Canonical System Model Rules

All system definitions must conform to a canonical project structure:

Project
  ├── Product Layer
  ├── Architecture Layer
  └── Build Layer

No free-floating documents are allowed.
All artifacts must map to structured entities.

---

## 4. Coding Rules

- Use modular monolith architecture for MVP.
- No direct cross-domain imports without explicit dependency declaration.
- Domain entities must not depend on infrastructure.
- Application layer orchestrates use cases.
- Infrastructure layer implements adapters only.

---

## 5. AI Interaction Guidelines

When generating or modifying code:

- Respect domain boundaries.
- Never introduce undocumented cross-domain coupling.
- Maintain separation of concerns.
- Do not embed business logic in controllers.
- Always preserve architectural intent defined in the canonical model.

---

## 6. Future Extensibility

Qlarify may evolve toward:
- Event-driven expansion
- Multi-project support
- CI-level architectural validation
- IDE integrations

All new features must align with existing bounded contexts or introduce a clearly defined new context.

---

This file acts as architectural intent memory for AI agents interacting with this codebase.