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

### Step 2: Customer Registration & Password Security (2 mins)
1. **Navigate to Register (`/register`)**:
   - Enter a test name (e.g., `"Jane Doe"`).
   - Demonstrate the real-time character counter (`8/50`).
   - Enter an invalid character (e.g., `Jane123`) to show the accessible error message: *"Full Name cannot contain numbers"*.
   - Type in the password field to demonstrate the **Live Password Strength Meter & Requirements Checklist**:
     - `"pass"` -> **Weak** (Red, requirement checkmarks unmet).
     - `"Password123"` -> **Fair** (Amber, 3 of 4 character types satisfied).
     - `"SpatialPass123!"` -> **Strong** (Green, meets 8–128 character policy, uppercase, lowercase, number, and special character).
   - Toggle the password visibility eye icon to demonstrate accessibility and ARIA labeling.
   - Mention security best practice: plaintext passwords are never stored in Firestore or logs; Firebase Authentication manages all credential hashing.
2. **Account Creation**:
   - Select the **Customer** role and click **Create Account**.
   - Notice immediate dispatch of the official Firebase verification email.
   - User is redirected directly to the **Email Verification Pending Screen (`/verify-email`)**.

---

### Step 2b: Email Verification Workflow & Security Enforcement (3 mins)
1. **Verification-Pending Screen (`/verify-email`)**:
   - Point out the registered email callout displaying the exact email address.
   - Show the **"Verification Pending"** status badge.
   - Click **"Resend Verification Email"**:
     - Show the loading spinner and subsequent green dispatch confirmation.
     - Demonstrate the **60-second cooldown timer** (`Resend email in 58s`) preventing email spam.
2. **Demonstrate Strict Access Denial for Unverified Accounts**:
   - Attempt to navigate directly to the customer dashboard (`http://localhost:3000/customer`).
   - Point out that [`ProtectedRoute.tsx`](file:///src/lib/firebase/ProtectedRoute.tsx) intercepts the request and redirects back to `/verify-email`.
   - Point out that the Navbar displays an unverified warning banner and restricts navigation links to public browsing and verification.
   - Explain server-side protection: Protected Next.js API routes (`/api/ai/visualize`, `/api/ai/recommend`) reject unverified tokens with **HTTP 403 Forbidden** (`EMAIL_NOT_VERIFIED`). Client-supplied verification booleans are never trusted.
3. **Simulate Login with Unverified Account**:
   - Sign out and navigate to `/login`.
   - Sign in with the unverified credentials.
   - Point out that access to protected dashboards is blocked; a clear alert appears with options to **Resend Verification Email**, view **Verification Details**, or **Sign Out**.
4. **Complete Verification & Refresh Token**:
   - Open your email inbox and click the verification link sent by Firebase (or verify via Firebase Console).
   - Return to `/verify-email` and click **"I've Verified My Email"**.
   - Show the instant token refresh: `getIdToken(true)` forces Firebase to issue a new JWT containing `email_verified: true`.
   - The status badge transitions to green **"Email Verified"**, and the user is redirected to their authorized dashboard!

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

**Q6: How is email verification enforced securely on the backend rather than trusting client state?**
> *Answer:*
> We never trust client-supplied booleans like `emailVerified: true`. When a protected API route (`/api/ai/visualize`, `/api/ai/recommend`, or `/api/admin/*`) is invoked, [`src/lib/firebase/serverAuth.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/firebase/serverAuth.ts) extracts the `Bearer <token>` from the HTTP `Authorization` header and makes a trusted server-side request to Google Identity Toolkit (`https://identitytoolkit.googleapis.com/v1/accounts:lookup`). Google inspects the cryptographically signed token and returns the authentic `emailVerified` boolean. If `emailVerified` is false, the server returns **HTTP 403 Forbidden** with error code `EMAIL_NOT_VERIFIED`.

**Q7: Why must the authentication token be refreshed after clicking the email verification link?**
> *Answer:*
> Firebase ID tokens are stateless JSON Web Tokens (JWTs) with a 1-hour expiration time. When a user clicks the verification link in their email, Firebase's backend database marks the email as verified, but the existing JWT cached in the user's browser still holds the previous claim `email_verified: false`. When the user clicks "I've Verified My Email", our frontend calls `await user.getIdToken(true)`. The `forceRefresh: true` flag instructs Firebase to issue a brand new JWT reflecting the updated `email_verified: true` claim, which the backend then validates.

**Q8: How are passwords secured and validated according to college presentation feedback?**
> *Answer:*
> We enforce an 8 to 128 character policy requiring at least one uppercase letter, one lowercase letter, one number, and one special character across both frontend form validation ([`src/lib/utils/validation.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/utils/validation.ts)) and auth helpers ([`src/lib/firebase/auth.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/lib/firebase/auth.ts)). Plaintext passwords are never stored in Firestore documents, application state, or logs. Credential hashing, salt generation, and brute-force mitigation are handled entirely by Firebase Authentication.

---

## Part 3: Firebase Console Manual Configuration Checklist

To configure a new or existing Firebase project for full email verification & password policy:

1. **Authentication -> Sign-in method**:
   - Provider: **Email/Password** -> **Enabled**.
   - Email link (passwordless sign-in) -> Disabled.
2. **Authentication -> Templates -> Email address verification**:
   - Customize the verification email Subject (e.g., *"Verify your email for Spatial Furniture AI"*).
   - Sender name: *"Spatial Furniture AI"*.
   - Action URL: Default Firebase handler domain or authorized custom domain.
3. **Authentication -> Settings -> User actions**:
   - **Email enumeration protection**: Recommended enabled.
4. **Authentication -> Settings -> Password policy** *(Identity Platform feature)*:
   - Minimum characters: **8**.
   - Max characters: **128**.
   - Require uppercase character: **Checked**.
   - Require lowercase character: **Checked**.
   - Require numeric character: **Checked**.
   - Require non-alphanumeric character: **Checked**.
5. **Authentication -> Settings -> Authorized domains**:
   - Ensure `localhost` is listed for local development and live demonstrations.
   - Add any deployment domains (e.g. `*.vercel.app` or custom domains).

---

## Part 4: Known Limitations & Future Roadmap

1. **AI Image Synthesis**:
   - *Status*: Labeled "Coming Soon".
   - *Reason*: Preserves zero billing cost and prevents inconsistent inpainting hallucinations until open-source or production-ready vision-diffusion pipelines are integrated.
2. **Live Firestore Rules Deployment**:
   - *Status*: Rules are written and verified with automated test suites in the repository, but require explicit deployment to live Google Cloud Firestore (`firebase deploy --only firestore:rules`).
3. **Edge Rate Limiting**:
   - *Status*: Currently relies on Gemini API quotas and Firebase Authentication client throttling. Production hardening would add Redis/Cloudflare Turnstile token-bucket rate limiting.
