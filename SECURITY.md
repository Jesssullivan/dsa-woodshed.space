# Security policy

This is a static, prerendered site with no backend, no auth, and no runtime
secrets. It ships only public content.

If you find a security issue (e.g. an XSS vector in the markdown renderer, or
private data that was mistakenly published), please report it privately via the
content repository's advisory form:

https://github.com/Jesssullivan/dsa-study-packet/security/advisories/new

`gitleaks` config (`.gitleaks.toml`) is retained from the scaffold as a
pre-commit / CI secret-scan gate. No credentials should ever be committed.
