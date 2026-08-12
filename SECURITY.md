# Security Policy

## Supported versions

Angular Advanced Odontogram is published on npm as `angular-advanced-odontogram`.
Security fixes land on the latest published version. Older versions may receive a
fix at the maintainer's discretion, so please move to the newest release when you
can.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Report it privately through GitHub. Open the repository Security tab and choose
"Report a vulnerability" to file a private advisory, or contact the maintainer
[@ZoliQua](https://github.com/ZoliQua) directly. Please include enough detail to
reproduce the issue, the affected version, and the impact as you understand it.

## What to expect

- We aim to acknowledge a report within a few days.
- We will investigate, keep you informed, and agree a disclosure timeline with
  you.
- Once a fix is out, we are glad to credit you for the discovery unless you
  would rather stay anonymous.

## Scope

This library runs entirely in the browser and stores nothing on a server by
itself. The most relevant risks are in how imported JSON or FHIR data is parsed
and rendered, so reports about input handling, SVG rendering and data export are
especially useful.
