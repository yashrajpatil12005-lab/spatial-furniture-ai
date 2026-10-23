# Spatial Furniture AI — Security Policy & Incident Records

This document outlines the security architecture, credential management policies, and historical security audit records for the **Spatial Furniture AI** platform.

---

## 1. Security Architecture & Credential Management

Spatial Furniture AI enforces a strict boundary between public client configuration and server-only secrets:

- **Client-Side Configuration (`NEXT_PUBLIC_*`)**:
  - Firebase client parameters (`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, etc.) are designed by Google to be public project identifiers used by the browser Firebase SDK.
  - Access control and database operations are governed by Cloud Firestore security rules (`firestore.rules`) and Firebase Authentication, rather than reliance on secrecy of the client-side API key.
- **Server-Side Secrets**:
  - Backend credentials (such as `GEMINI_API_KEY`) are kept strictly server-side without the `NEXT_PUBLIC_` prefix, preventing exposure in browser JavaScript bundles.
  - Next.js server route handlers enforce authentication and email verification through `serverAuth.ts` before executing sensitive AI operations.
- **Environment Isolation**:
  - Live secrets are stored in `.env.local` (which is excluded from Git via `.gitignore`).
  - `.env.example` provides a sanitized template with placeholder values only.

---

## 2. GitHub Secret Scanning Alert #1 — Remediation Record

### Incident Summary
- **Detection**: GitHub Secret Scanning detected a Google API key pattern in `src/__tests__/live-firebase.integration.test.ts` from an earlier commit.
- **Key Classification**: The detected value was identified as the Firebase Web API key used for client-side configuration (`NEXT_PUBLIC_FIREBASE_API_KEY`) of the Spatial Furniture AI Firebase project.
- **Nature of the Key**: Under Firebase's standard security model, the Web API key is an identifier intended to route client requests to Firebase services, not a privileged administrative secret.

### Remediation Actions
1. **Source Code Sanitization**:
   - The hardcoded key was removed from the current tracked source in [`src/__tests__/live-firebase.integration.test.ts`](file:///c:/Users/Yashraj%20Patil/OneDrive/Documents/FIELD%20PROJECT/spatial-furniture-ai/src/__tests__/live-firebase.integration.test.ts) (commit `2fbc3e2`).
   - The integration test was refactored to read credentials dynamically from environment variables (`process.env.NEXT_PUBLIC_FIREBASE_API_KEY` and `process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID`) with graceful fallback skipping when unconfigured.
   - All active tracked files in the current repository `HEAD` contain zero hardcoded credentials.
2. **Google Cloud Defense-in-Depth**:
   - Website referrer restrictions were configured in the Google Cloud Console for the Firebase Web API key, restricting client-side usage to authorized project domains (such as local development origins and deployed application hostnames).
3. **Alert Disposition**:
   - GitHub Secret Scanning Alert #1 was dismissed as a false positive, reflecting that the identified key is a public client identifier rather than a private backend secret, and that active tracked files have been sanitized.
4. **Operational Status & Non-Revocation**:
   - The key remains active to maintain continuity of client-side authentication and Firebase services for the application.
   - Git history was not rewritten, preserving the historical commit lineage without force-pushes or history modification.
   - This record documents the remediation and does not claim that the key was revoked.

---

## 3. Reporting a Vulnerability

If you discover a security vulnerability or potential exposure within this repository:

1. Do not open a public issue.
2. Report the vulnerability privately via GitHub Security Advisories or by contacting the repository maintainers.
3. Include detailed steps to reproduce the issue along with environment specifications.
