# Spatial Furniture AI — Demo & Technical Interview Guide

This guide provides a structured, repeatable presentation flow for college defenses, portfolio demonstrations, and technical interviews. It also contains answers to likely technical questions.

> **Security & Privacy Reminder:**
> Never display actual API keys, server credentials, or real user passwords during live demonstrations. Use dummy email addresses (e.g. `customer@demo.local`) and test data.

---

## Part 1: Repeatable Live Demo Script (10-15 Minutes)

### Step 1: Public Discovery & Visitor Experience (2 mins)
1. **Navigate to Landing Page (`http://localhost:3000`)**:
   - Highlight the value proposition: AI-powered spatial furniture planning for modern homes.
   - Show the navigation bar with dynamic active states.
2. **Browse Public Catalog (`/customer/products`)**:
   - Demonstrate the multi-attribute search: Search for `"velvet"`, `"oak"`, or `"armchair"`.
   - Filter by Category (e.g., *Chairs*, *Sofas*, *Tables*).
   - Adjust the Price Range slider and toggle **In Stock Only**.
   - Note the **Indian Rupee (INR `₹`)** formatting and responsive product cards with lazy-loaded imagery.

---

### Step 2: Customer Registration & Authentication (2 mins)
1. **Navigate to Register (`/register`)**:
   - Enter a test name (e.g., `"Jane Doe"`).
   - Demonstrate the real-time character counter (`8/50`).
   - Enter an invalid character (e.g., `Jane123`) to show the accessible error message: *"Full Name cannot contain numbers"*.
   - Type in the password field to demonstrate the **Live Password Strength Meter**:
     - `"pass"` -> **Weak** (Red)
     - `"Password123"` -> **Fair** (Amber)
     - `"SpatialPass123!"` -> **Strong** (Green) with checkmarks for all 4 criteria (uppercase, lowercase, number, special).
   - Toggle the password visibility eye icon to demonstrate accessibility.
2. **Account Creation**:
   - Select the **Customer** role and click **Create Account**.
   - User is redirected to `/customer` with an authenticated session.

---

### Step 3: Spatial Room Analysis & Customizer (4 mins)
1. **Select a Furniture Item**:
   - From `/customer/products`, click on any item (e.g., *Ergonomic Velvet Lounge Chair*).
   - Go to the **Room Visualizer** tab (`#room-visualizer`).
2. **Configure Custom Specifications**:
   - Select custom Color (e.g., *Emerald Green*), Material (e.g., *Premium Velvet*), and Finish (*Matte Black*).
   - Adjust dimensions (Width, Height, Depth in cm).
3. **Upload Room Photo**:
   - Drag or click to upload a room photograph (JPEG, PNG, or WebP).
   - Notice the preview container with instantaneous client-side preview.
4. **Trigger Gemini 2.5 Flash Room Analysis**:
   - Click **"Analyze Room Layout with Gemini"**.
   - Point out the dedicated loading state with animated progress spinner.
   - Once complete, examine the generated **Room Analysis Dashboard**:
     - Overall Spatial Match Score (0–100%) with color-coded status badge.
     - Dimension breakdowns: Lighting & Natural Ambiance, Color Harmony, Scale & Footprint, Practical Considerations.
     - Actionable placement recommendations and architectural observations.
5. **Demonstrate Honest AI Synthesis UX**:
   - Point to the **AI Spatial Image Synthesis** card: Explain that photorealistic furniture inpainting is transparently labeled **Coming Soon** to avoid unreliable third-party hallucinations and unapproved API costs.

---

### Step 4: AI Cross-Catalog Recommendations (2 mins)
1. Scroll down to the **Complementary Recommendations** section.
2. Show that Gemini evaluated the uploaded room photo and suggested matching products from other categories (e.g., a matching side table or floor lamp).
3. Point out the **"Why this fits your room"** AI rationale card explaining the aesthetic match.

---

### Step 5: Retailer Product Management (3 mins)
1. **Switch to a Retailer Account** (or register a test retailer at `/register` with role *Retail Partner*).
2. **View Retailer Dashboard (`/retailer/products`)**:
   - Show the table of products belonging to this retailer.
   - Point out multi-tenant isolation: A retailer cannot view or edit items belonging to other retailers.
3. **Add New Furniture Item (`/retailer/products/new`)**:
   - Fill in product name, category, brand, dimensions, stock, price, and image URL.
   - Submit and verify the new item appears instantly in the catalog.
4. **Edit / Update Product**:
   - Modify the price or stock quantity and save.
   - Explain the Firestore security protection: The retailer cannot transfer product ownership or change the `retailerId`.

---

### Step 6: Platform Administration & Integration Health (1 min)
1. **Navigate to `/admin`** (when logged in with an authorized admin account):
   - View the Admin Overview Dashboard with integrated catalog statistics and system diagnostics.
   - Show status check on Gemini AI API integration (`Operational`).
   - If accessed by a non-admin, demonstrate the 403 Forbidden protection.

---

## Part 2: Technical Interview Q&A

### Architecture & System Design

**Q1: Why did you choose Next.js with App Router rather than a traditional SPA (Vite/React)?**
> *Answer:*
> The App Router enables a hybrid architecture: static product catalog pages can be rendered for optimal SEO and instant first-contentful paint, while private customer dashboards and interactive visualizers run as dynamic client components. Furthermore, Next.js API route handlers (`/api/ai/*`) serve as our secure backend proxy, ensuring our `GEMINI_API_KEY` is never exposed to client browsers.

**Q2: How does the application prevent cross-tenant data tampering in Firestore?**
> *Answer:*
> We implemented security rules in `firestore.rules` that enforce ownership at the database engine level. On update operations, we assert `resource.data.retailerId == request.auth.uid` AND `request.resource.data.retailerId == resource.data.retailerId`. This guarantees that even if a malicious actor sends a forged HTTP request with another retailer's ID or attempts to reassign product ownership, Firestore denies the transaction.

**Q3: How does your Gemini 2.5 Flash integration ensure structured responses rather than conversational text?**
> *Answer:*
> We use prompt engineering with a strict JSON contract requiring 6 specific evaluation dimensions and numeric scores. On the server, [`src/lib/ai/gemini.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/ai/gemini.ts) uses a multi-layered parser: it strips markdown backticks, uses regex to isolate the JSON payload, clamps numeric scores between 0 and 100, and verifies schema completeness. If the LLM generates unparseable text, a deterministic fallback formats the analysis into structured markdown sections so the UI never crashes.

**Q4: Why didn't you use the Firebase Admin SDK in your Next.js API routes?**
> *Answer:*
> The Firebase Admin SDK requires private service account credentials and adds significant bundle weight to serverless/edge runtimes. Instead, our serverless guard in [`serverAuth.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/firebase/serverAuth.ts) calls Google Identity Toolkit's lightweight REST endpoint to cryptographically verify the user's ID token and retrieves role claims from Firestore. This keeps serverless cold-start times minimal while preserving rigorous security.

**Q5: How do you handle AI quota limits or service interruptions?**
> *Answer:*
> Our recommendation engine in [`src/lib/ai/recommendations.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/ai/recommendations.ts) wraps the Gemini API in a try-catch block. If an API quota error or timeout occurs, it falls back to a deterministic category-matching heuristic that scores products based on room attributes. The user receives recommendations without seeing raw errors or broken components.

---

## Part 3: Known Limitations & Future Roadmap

1. **AI Image Synthesis**:
   - *Status*: Labeled "Coming Soon".
   - *Reason*: Preserves zero billing cost and prevents inconsistent inpainting hallucinations until open-source or production-ready vision-diffusion pipelines are integrated.
2. **Live Firestore Rules Deployment**:
   - *Status*: Rules are written and verified with automated test suites in the repository, but require explicit deployment to live Google Cloud Firestore (`firebase deploy --only firestore:rules`).
3. **Edge Rate Limiting**:
   - *Status*: Currently relies on Gemini API quotas and Firebase Authentication client throttling. Production hardening would add Redis/Cloudflare Turnstile token-bucket rate limiting.
