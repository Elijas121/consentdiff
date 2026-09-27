# Changelog

## 0.1.4 (2026-09-27)

- Google reCAPTCHA before any consent interaction is now a warning instead of info, like maps, video and chat widgets. It analyses the visitor's device and behaviour on Google's servers, and loading it on every page is a common setup; an Austrian court (BVwG, 13 September 2024, W298 2274626-1) held that reCAPTCHA v3 needs consent. Other captchas (hCaptcha …) stay info. With the default `--fail-on error` this does not fail a CI job.
- GitHub Action: shorter description (GitHub Marketplace allows fewer than 125 characters). That the action sets up Node 22 and pnpm for the rest of the job is in the README.

## 0.1.3 (2026-09-27)

- New warning `imprint-link-partly-broken` / `privacy-link-partly-broken`: a legal link on the site's own domain returns 404 or 410 while another matching link works. 0.1.2 reported nothing in this case, although visitors who click the dead link land on an error page. A dead link on another domain (a web agency's credit link) is still ignored.
- When a working second link replaces a broken first one, the report now shows that link's own text (0.1.2 kept the text of the broken one).
- README: a single scan is a sample; sites whose tags race their consent tool can differ between visits, so scan twice before signing a site off.
- Found by running the published 0.1.2 package against the 306-site regression list after release.

## 0.1.2 (2026-09-27)

No change to what the scanner measures or reports.

- GitHub Action: `actions/setup-node` 7.0.0 (Node 24 runtime). 0.1.1 ran on the deprecated Node 20 runtime and printed a deprecation warning in every job that used it. Automatic package-manager caching stays off, so the action writes no cache into your workflow.
- CI and release workflows: `actions/checkout` 7.0.1 and `actions/setup-node` 7.0.0.

## 0.1.1 (2026-09-27)

No change to what the scanner measures or reports.

- The README on npm now describes the npm install (0.1.0 still said "not yet on npm").
- README: how to use the GitHub Action by release tag and its inputs, how to install the agent skill, and that the library needs `--install-browser` once.
- First release built and published by the release workflow, with npm provenance.
- Release workflow: `actions/upload-artifact` 7.0.1 and `actions/download-artifact` 8.0.1.

## 0.1.0 (2026-09-27)

First release: CLI, library, GitHub Action and agent skill. Three isolated visits (baseline, reject click, accept click), tracker and cookie findings, imprint and privacy link checks, DuckDuckGo autoconsent as a second engine. Accuracy and its limits are described in [docs/VALIDATION.md](docs/VALIDATION.md).
