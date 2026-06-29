# StaffDeck SD1 UI QA

Source:
- Figma file `03XlzJQ1dFYdlDWBR4Mlg4`, page node `0:1`
- Reference screenshot: `/tmp/sd1-page-full.png`
- Avatar/illustration nodes: `1:8604`, `1:8627`, `1:8645`, `1:8506`, `1:8409`, `1:8360`

Implementation checkpoints:
- Chat employee gallery: `/tmp/ultrarag4-sd1-qa/chat-final.png`
- Chat collapsed sidebar: `/tmp/ultrarag4-sd1-qa/chat-collapsed-final.png`
- Enterprise employee profile: `/tmp/ultrarag4-sd1-qa/enterprise-final.png`
- Enterprise employee roster: `/tmp/ultrarag4-sd1-qa/enterprise-agents-final.png`
- Enterprise scheduled tasks: `/tmp/ultrarag4-sd1-qa/enterprise-tasks-final.png`

Browser QA summary:
- Chat sidebar: 216px expanded, 72px collapsed, complete Modelbest/UltraRAG4 brand, SD1 bottom management entry, no visible legacy service/sales terms.
- Enterprise sidebar: 216px expanded, complete Modelbest/UltraRAG4 brand, SD1 bottom chat entry, 158px profile illustration, six capability cards with three dark illustration cards.
- Interactions checked: employee gallery tabs, search clear via keyboard, sidebar collapse, enterprise roster load, scheduled tasks load.
- Runtime errors/toasts: none observed.

Automated checks:
- `npm --prefix frontend-chat run build`
- `npm --prefix frontend-enterprise run build`
- `backend/.venv/bin/python -m pytest backend/tests` -> 235 passed

Final result: passed
