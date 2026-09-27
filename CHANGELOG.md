# Changelog

## 0.1.1 (2026-09-27)

No change to what the scanner measures or reports.

- The README on npm now describes the npm install (0.1.0 still said "not yet on npm").
- README: how to use the GitHub Action by release tag and its inputs, how to install the agent skill, and that the library needs `--install-browser` once.
- First release built and published by the release workflow, with npm provenance.
- Release workflow: `actions/upload-artifact` 7.0.1 and `actions/download-artifact` 8.0.1.

## 0.1.0 (2026-09-27)

First release: CLI, library, GitHub Action and agent skill. Three isolated visits (baseline, reject click, accept click), tracker and cookie findings, imprint and privacy link checks, DuckDuckGo autoconsent as a second engine. Accuracy and its limits are described in [docs/VALIDATION.md](docs/VALIDATION.md).
