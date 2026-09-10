# Security Policy

## Reporting a vulnerability

**Do not open a public issue** for a security vulnerability.

- **Preferred:** use GitHub's private vulnerability reporting —
  **Security → Report a vulnerability** on the repository.
- **Alternative:** email `security@corpopay.site`.

Please include:

1. A clear description of the vulnerability and its impact.
2. Steps to reproduce, or a proof-of-concept if you have one.
3. The affected version(s).
4. Any suggested fix.

## Scope

In scope: anything in the SDK that could leak an API key, bypass webhook
signature verification, or otherwise compromise a tenant's data.

Out of scope: issues in third-party dependencies that must be fixed upstream.
