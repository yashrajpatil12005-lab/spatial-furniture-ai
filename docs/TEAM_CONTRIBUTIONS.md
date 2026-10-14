# Spatial Furniture AI — Team Contribution & Responsibility Guide

> **Academic Presentation & Portfolio Attribution Notice:**
> The following responsibilities represent a modular four-member team distribution based on the architectural separation of concerns in the codebase. In college presentations, capstone evaluations, and portfolio project defenses, each teammate can present their designated domain while speaking to cross-functional integrations.

---

## Team Overview & Responsibility Matrix

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Spatial Furniture AI Platform                       │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ Role                 │ Primary Domain       │ Core Modules & Ownership      │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ Teammate 1           │ Frontend & UI/UX     │ Design System, Responsive UI, │
│                      │ Lead                 │ Accessibility, Customizer     │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ Teammate 2           │ Backend, Auth &      │ Firebase Auth, ServerAuth,    │
│                      │ Security Engineer    │ Firestore Rules, API Security │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ Teammate 3           │ Gemini AI & Spatial  │ Multimodal Analysis Engine,   │
│                      │ Intelligence Lead    │ Schema Parsing, Rec Engine    │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ Teammate 4           │ Catalog, Workflows & │ Product Management, Admin,    │
│                      │ QA / Integration     │ Vitest Test Suites, Pipelines │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

---

## 1. Teammate 1: Frontend & UI/UX Specialist

### Primary Responsibilities
- Architecting the client-side presentation layer using Next.js 15+ / 16 (App Router) and React 19.
- Implementing the Tailwind CSS design system with curated emerald/neutral color palette, clean glassmorphism, and responsive grid layouts.
- Developing the interactive **Furniture Customizer** ([`FurnitureCustomizer.tsx`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/components/products/FurnitureCustomizer.tsx)) for real-time dimension, finish, material, and color toggles.
- Building the **Room Analysis Dashboard** ([`RoomAnalysisDashboard.tsx`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/components/ai/RoomAnalysisDashboard.tsx)), including score meters, lighting gauges, and visual callouts.
- Enforcing **WCAG 2.1 AA Accessibility standards**: Explicit `htmlFor` and `id` mappings on all form fields, ARIA live regions for character counters, high color contrast, keyboard `Escape` listeners, and focus rings.

### Key Files Owned
- [`src/components/products/FurnitureCustomizer.tsx`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/components/products/FurnitureCustomizer.tsx)
- [`src/components/ai/RoomAnalysisDashboard.tsx`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/components/ai/RoomAnalysisDashboard.tsx)
- [`src/components/ai/VisualizationPanel.tsx`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/components/ai/VisualizationPanel.tsx)
- [`src/components/layout/Navbar.tsx`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/components/layout/Navbar.tsx)
- [`src/app/globals.css`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/app/globals.css)

### Defense & Interview Talking Points
- *"How did you ensure responsive rendering of large room photographs without layout shift?"*
  - Used aspect-ratio containers (`aspect-w-4 aspect-h-3`), object-cover fitting, and async image decoding with lazy loading.
- *"How did you solve form accessibility in dynamic React inputs?"*
  - Connected every field with unique IDs and `htmlFor` attributes on labels, added `aria-invalid` and `aria-describedby` bound to real-time validation error IDs.

---

## 2. Teammate 2: Firebase, Backend & Security Engineer

### Primary Responsibilities
- Architecting the **Firebase Authentication & Firestore** backend architecture with client-side session management via React Context (`AuthContext.tsx`).
- Developing the server-side authorization guards ([`serverAuth.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/firebase/serverAuth.ts)) validating Firebase ID tokens using the Google Identity REST API in serverless routes.
- Writing and hardening database security rules in [`firestore.rules`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/firestore.rules): Enforcing multi-tenant retailer product isolation, preventing product ownership transfers, and blocking self-assigned `admin` role escalation.
- Hardening HTTP security response headers in [`next.config.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/next.config.ts) (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
- Authoring the comprehensive user validation suite in [`validation.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/utils/validation.ts) (Unicode full name validation, password policy, and live strength meter).

### Key Files Owned
- [`firestore.rules`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/firestore.rules)
- [`next.config.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/next.config.ts)
- [`src/lib/firebase/AuthContext.tsx`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/firebase/AuthContext.tsx)
- [`src/lib/firebase/serverAuth.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/firebase/serverAuth.ts)
- [`src/lib/utils/validation.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/utils/validation.ts)
- [`src/__tests__/serverAuth.test.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/__tests__/serverAuth.test.ts)
- [`src/__tests__/firestore-rules.test.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/__tests__/firestore-rules.test.ts)

### Defense & Interview Talking Points
- *"Why verify ID tokens using Google Identity Toolkit REST API instead of the Firebase Admin SDK in Next.js?"*
  - The Firebase Admin SDK has heavy private key dependencies and large bundle footprints unsuitable for edge/serverless runtimes. The REST API token verification performs signature verification without credential overhead.
- *"How did you prevent retailers from overwriting other retailers' inventory?"*
  - Added strict immutable ownership checks in Firestore rules: `allow update: if isRetailer() && resource.data.retailerId == request.auth.uid && request.resource.data.retailerId == resource.data.retailerId;`.

---

## 3. Teammate 3: Gemini AI & Spatial Intelligence Lead

### Primary Responsibilities
- Architecting the **Gemini 2.5 Flash Multimodal Room Analysis Engine** ([`gemini.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/ai/gemini.ts)), integrating Google GenAI SDK (`@google/genai`).
- Crafting system prompts that instruct Gemini 2.5 Flash to act as an interior architect and return structured JSON schemas across 6 spatial evaluation dimensions.
- Implementing robust response parsing: markdown fence cleaning, JSON extraction with regex fallbacks, schema normalization, and numeric score clamping (0 to 100).
- Developing the **AI Furniture Recommendation Engine** ([`recommendations.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/ai/recommendations.ts)), ranking catalog items against room analysis observations.
- Designing the honest "Coming Soon" UX pattern for AI image generation, eliminating unintended paid API requests.

### Key Files Owned
- [`src/lib/ai/gemini.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/ai/gemini.ts)
- [`src/lib/ai/recommendations.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/ai/recommendations.ts)
- [`src/lib/ai/geminiClient.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/ai/geminiClient.ts)
- [`src/app/api/ai/visualize/route.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/app/api/ai/visualize/route.ts)
- [`src/app/api/ai/recommend/route.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/app/api/ai/recommend/route.ts)
- [`src/__tests__/gemini-analysis.test.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/__tests__/gemini-analysis.test.ts)
- [`src/__tests__/recommendations.test.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/__tests__/recommendations.test.ts)

### Defense & Interview Talking Points
- *"How do you handle LLM output non-determinism and formatting inconsistencies?"*
  - Implemented `validateAndNormalizeRoomAnalysis()` with a three-layer fallback: regex JSON extraction, property validation with schema defaults, and dynamic conversion to a 6-section markdown report if JSON is unparseable.
- *"Why choose Gemini 2.5 Flash over text-only models?"*
  - Gemini 2.5 Flash is natively multimodal. It accepts both room photo byte buffers and furniture metadata in a single inference call, analyzing lighting direction, floor area, and perspective in sub-second speeds.

---

## 4. Teammate 4: Furniture Catalog, Retailer/Admin Workflows & QA Lead

### Primary Responsibilities
- Implementing retailer catalog CRUD operations ([`ProductForm.tsx`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/components/products/ProductForm.tsx), [`ProductTable.tsx`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/components/products/ProductTable.tsx)), including physical dimensions, inventory tracking, and image URLs.
- Building the **Customer Product Discovery** interface ([`CustomerProductDiscovery.tsx`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/components/products/CustomerProductDiscovery.tsx)) with multi-field search (name, brand, material), price filtering, and stock status filters.
- Developing the Indian Rupee (INR `₹`) currency formatting utility with Indian number system formatting ([`currency.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/utils/currency.ts)).
- Setting up the **automated testing infrastructure** using Vitest and React Testing Library: 70 unit and integration tests across 7 suites with 100% pass rate.
- Managing production build validation, linting (`eslint`), TypeScript verification, and environment variable documentation ([`.env.example`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/.env.example)).

### Key Files Owned
- [`src/components/products/ProductForm.tsx`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/components/products/ProductForm.tsx)
- [`src/components/products/ProductTable.tsx`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/components/products/ProductTable.tsx)
- [`src/components/products/CustomerProductDiscovery.tsx`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/components/products/CustomerProductDiscovery.tsx)
- [`src/lib/products/index.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/products/index.ts)
- [`src/lib/utils/currency.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/utils/currency.ts)
- [`src/__tests__/currency.test.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/__tests__/currency.test.ts)
- [`src/__tests__/product-filtering.test.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/__tests__/product-filtering.test.ts)
- [`vitest.config.mts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/vitest.config.mts)
- [`.env.example`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/.env.example)

### Defense & Interview Talking Points
- *"How did you test Firestore security rules without a live cloud database?"*
  - Wrote behavioral policy unit tests in [`firestore-rules.test.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/__tests__/firestore-rules.test.ts) that mirror the AST evaluation logic of Firestore security rules for multi-tenant isolation.
- *"How does your product filtering scale with large catalogs?"*
  - Applied client-side multi-attribute search using case-insensitive normalization with memoized filtering, and added lazy image loading to reduce initial network bandwidth.
