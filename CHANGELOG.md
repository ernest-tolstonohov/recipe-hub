# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-04-26

### Added
- **Autocomplete Feature**: 
  - Backend `GET /search/autocomplete` for recipe titles.
  - Backend `GET /ingredients/autocomplete` for ingredient lookups.
  - Frontend debounced search (300ms) for global navbar.
  - Interactive "Tag Builder" for recipe ingredients with removable rounded pills.
- **Improved Validation**:
  - Recipe title length restriction (255 chars).
  - Recipe description length restriction (2000 chars).
  - Review body length restriction (500 chars).
  - Star ratings limited to 1-5 integer range.

### Changed
- **Security Hardening**:
  - Standardized password hashing to **BCrypt (12 salt rounds)** across all authentication stacks.
  - Increased session security with `HttpOnly`, `Strict` SameSite, and `Secure` (production only) flags.
  - Implemented session inactivity tracker (2-hour limit).
  - Renamed administrative control path from `/system-control` to `/management-console` for obfuscation.
  - Updated administrative logging to detailed CSV format: `username, action, timestamp`.
- **Infrastructure**:
  - Updated `Helmet` CSP directives to securely allow `images.unsplash.com` and local `/media/` storage.
  - Renamed `env-sample` to `.env.example` for GitHub standard compliance.

### Security
- **Rate Limiting**: Integrated `express-rate-limit` on all login endpoints (max 5 attempts per 15 minutes).
- **CSRF Protection**: Native `csurf` implementation active on all state-changing forms.
- **Upload Safety**: Integrated UUID-based file renaming and off-root storage to prevent directory traversal and execution attacks.
