# Spatial Furniture AI — Architecture & Technical Design

This document details the software architecture, data pipelines, security boundaries, and AI integrations powering **Spatial Furniture AI**.

---

## 1. System Architecture Overview

Spatial Furniture AI is designed as a modern, decoupled full-stack application built with the Next.js App Router (Turbopack), Google Gemini 2.5 Flash, and Firebase Cloud Services.

```mermaid
graph TB
    subgraph Client ["Client Layer (Browser)"]
        UI["Next.js App Router UI (React 19)"]
        AC["AuthContext (Firebase Client SDK)"]
        CD["Catalog Discovery & Customizer"]
        VP["Visualization & Recommendation Panels"]
    end

    subgraph Edge ["Next.js Server / API Routes"]
        AV["POST /api/ai/visualize"]
        AR["POST /api/ai/recommend"]
        AI["GET /api/admin/integrations"]
        SA["ServerAuth & RBAC Guard"]
    end

    subgraph External ["External Cloud Services"]
        FA["Firebase Authentication (ID Tokens)"]
        FS["Cloud Firestore (Rules Enforced)"]
        GM["Google Gemini 2.5 Flash Multimodal AI"]
    end

    UI --> AC
    AC --> FA
    CD --> FS
    VP --> AV
    VP --> AR
    AV --> SA
    AR --> SA
    AI --> SA
    SA --> FA
    SA --> FS
    AV --> GM
    AR --> GM
```

---

## 2. Component & Directory Architecture

```text
spatial-furniture-ai/
├── firestore.rules               # Multi-tenant security rules with ownership immutability
├── next.config.ts                # HTTP security response headers & Next.js config
├── vitest.config.mts             # Vitest runner config (jsdom, path aliases)
├── vitest.setup.ts               # Testing Library Jest DOM extensions
├── .env.example                  # Documented environment variables template
├── docs/                         # Architecture, Contribution & Demo documentation
│   ├── ARCHITECTURE.md
│   ├── TEAM_CONTRIBUTIONS.md
│   └── DEMO_AND_INTERVIEW_GUIDE.md
└── src/
    ├── app/                      # Next.js App Router (Pages & API endpoints)
    │   ├── layout.tsx            # Global root layout with AuthProvider & Navbar
    │   ├── page.tsx              # Landing page (hero, value prop, how it works)
    │   ├── login/                # Customer/Retailer/Admin sign-in with code parsing
    │   ├── register/             # Account creation with live password strength meter
    │   ├── customer/             # Customer portal, catalog browsing, room visualizer
    │   ├── retailer/             # Retailer management portal (CRUD inventory)
    │   ├── admin/                # Admin platform integration health monitor
    │   └── api/                  # Server-side API endpoints
    │       ├── ai/visualize/     # Multimodal room layout & compatibility analysis
    │       ├── ai/recommend/     # AI style-match furniture recommendations
    │       └── admin/            # Platform health diagnostics
    ├── components/               # Modular presentation & container components
    │   ├── ai/                   # RoomAnalysisDashboard, VisualizationPanel, RecPanel
    │   ├── layout/               # Role-aware Navbar, Footer
    │   ├── products/             # ProductForm, CustomerProductDiscovery, Customizer
    │   └── ui/                   # Reusable UI badges, buttons, cards
    ├── lib/                      # Core business logic, services & utilities
    │   ├── ai/                   # Gemini client, room analysis parser, recommendation engine
    │   ├── firebase/             # Client SDK config, auth helpers, serverAuth guards
    │   ├── products/             # Product Firestore CRUD & initial catalog seeding
    │   └── utils/                # Currency formatting (INR), Unicode name & password validation
    └── __tests__/                # Vitest automated test suites (70 tests)
```

---

## 3. Authentication & Role-Based Access Control (RBAC)

Spatial Furniture AI enforces a 3-tier Role-Based Access Control model:

| Role | Access Permissions | Navigation Target | Verification Method |
| :--- | :--- | :--- | :--- |
| **Visitor** | Public landing page, product catalog browsing, product details | `/` | Anonymous |
| **Customer** | Visitor features + Authenticated room analysis, AI recommendations | `/customer` | Firebase ID Token + `role: "customer"` |
| **Retailer** | Product creation, editing, deleting own catalog, inventory management | `/retailer` | Firebase ID Token + `role: "retailer"` |
| **Admin** | Integration health monitoring, cross-catalog visibility, platform status | `/admin` | Firebase ID Token + `role: "admin"` |

### Server-Side Token & Role Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Browser
    participant API as /api/ai/visualize
    participant ServerAuth as serverAuth.ts
    participant GoogleAuth as Google Identity Toolkit
    participant Firestore as Firestore REST API

    Client->>API: POST /api/ai/visualize with Authorization: Bearer <ID_TOKEN>
    API->>ServerAuth: requireAuth(req)
    ServerAuth->>GoogleAuth: Verify ID Token signature & expiration
    GoogleAuth-->>ServerAuth: Token Decoded (uid, email)
    ServerAuth->>Firestore: GET /databases/(default)/documents/users/{uid}
    Firestore-->>ServerAuth: User Document (role: customer|retailer|admin)
    ServerAuth-->>API: Authorized User Context
    API->>API: Execute Multimodal AI Analysis
    API-->>Client: 200 OK with Structured Spatial Analysis
```

### Serverless Security Guard Highlights:
- **No Heavy Admin SDK**: Uses lightweight Google Identity Toolkit and Firestore REST APIs in serverless routes, reducing cold starts while verifying cryptographic validity.
- **Header Hardening**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Secret Protection**: `GEMINI_API_KEY` is strictly server-side (no `NEXT_PUBLIC_` prefix).

---

## 4. Multi-Tenant Firestore Security Architecture

Database access rules in `firestore.rules` isolate tenant data at the storage layer:

1. **User Identity Collection (`users/{userId}`)**:
   - Any authenticated user can read public user records (needed for retailer profile attribution).
   - Only the owning user can write their document upon registration.
   - **Role escalation protection**: New users can only assign themselves `customer` or `retailer`; assigning `admin` is rejected.
2. **Product Catalog Collection (`products/{productId}`)**:
   - `read`: Globally public (`allow read: if true;`) allowing prospective customers to browse without authentication.
   - `create`: Restricted to authenticated users with `role == 'retailer'` and `request.resource.data.retailerId == request.auth.uid`.
   - `update`: Enforces that only the retailer who created the product can update it AND `request.resource.data.retailerId == resource.data.retailerId` (prevents cross-tenant ownership transfer).
   - `delete`: Enforces `resource.data.retailerId == request.auth.uid`.

---

## 5. Gemini 2.5 Flash Multimodal Room Analysis Pipeline

The spatial analysis engine evaluates photographs of physical rooms against specific furniture items using Google's `gemini-2.5-flash` model.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    participant VP as VisualizationPanel.tsx
    participant Route as /api/ai/visualize
    participant Engine as gemini.ts
    participant Gemini as Gemini 2.5 Flash API

    Customer->>VP: Uploads room photo (JPEG/PNG/WebP <= 4.5MB)
    Customer->>VP: Selects furniture specifications (Color, Material, Dimensions)
    Customer->>VP: Clicks "Analyze Room Layout with Gemini"
    VP->>Route: POST FormData (Image Buffer + Product JSON + Customization JSON)
    Route->>Route: Validate auth, MIME type, payload size <= 4.5MB
    Route->>Engine: generateRoomVisualizationConcept()
    Engine->>Gemini: models.generateContent(model: "gemini-2.5-flash", inlineData, prompt)
    Gemini-->>Engine: Structured JSON Response
    Engine->>Engine: validateAndNormalizeRoomAnalysis()
    Note over Engine: Extracts JSON, validates 6 dimensions, clamps scores (0-100), builds markdown fallback
    Engine-->>Route: Normalized Structured Analysis
    Route-->>VP: 200 OK JSON (structuredAnalysis, analysis markdown, success: true)
    VP->>Customer: Renders RoomAnalysisDashboard (Scores, Badges, Recommendations)
```

### The 6 Evaluation Dimensions
Every room analysis produces structured scores (0-100) and actionable insights across:
1. **Room Type & Spatial Scale**: Ceiling height, room category, open floor square footage.
2. **Lighting & Natural Ambiance**: Window placement, daylight temperature, shadow casting.
3. **Color Harmony & Palette Fit**: Dominant wall/floor hues and complementary contrast with furniture.
4. **Furniture Compatibility & Scale**: Clearance paths, walking corridors, proportion match.
5. **Placement & Spatial Coordinates**: Recommended orientation, wall alignment, proximity to doors.
6. **Practical & Safety Considerations**: Electrical outlet access, heavy traffic flow, maintenance tips.

---

## 6. AI Recommendation Engine Architecture

When a room analysis is completed, [`src/lib/ai/recommendations.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/ai/recommendations.ts) evaluates available catalog items against the room analysis:

1. **Candidate Pool Filtering**: Excludes the currently selected product; selects items within matching or complementary categories.
2. **AI Ranking & Synthesis**: Gemini 2.5 Flash evaluates candidate items against room observations, producing a `compatibilityScore` (0-100), `matchReason` (e.g., "The oak frame matches your warm daylight and natural floor tone"), and a `suggestedZone` (e.g., "Adjacent to reading nook").
3. **Deterministic Fallback**: If the Gemini API is unavailable or quota-limited, a local rule-based heuristic scores products by category affinity and style keywords, ensuring zero broken UI states for the user.
