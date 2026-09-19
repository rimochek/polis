# Working workspace integration

Mode: Operate. User explicitly asks to move the approved /concept.html workspace and Copilot-like full-height side assistant into the main product at /. Preserve the established Polis Golos/green-charcoal/teal visual world and real PDF comparison/review/export behavior.

Primary task: client → task-specific case → typed documents → analysis → human review → clarifications → report. Sidebar: cases, clients grouped from persisted case records, workspace assistant. Case tabs: overview, documents, comparison, clarifications, report, history. Owner and deadline are persisted. No insurance issuance or external sends.

Desktop assistant reserves 360–440px across the entire app, fixed full viewport height, scrollable conversation, bottom composer. Mobile <=900 uses Radix full-screen modal, starts closed, supports close/Escape and keyboard containment. The existing mobile per-insurer comparison selector remains. At intermediate desktop widths tables can scroll horizontally; at >=1300 three offers fit beside the assistant.

Main product data persists under ignored data/. Case chat sees only its current PDFs and requirements; global chat sees metadata only. Demo reply is visibly deterministic. Live chat uses the existing configured provider and surfaces failures without fallback. Google connection check currently rejects expired/invalid credentials; live end-to-end model success is not claimed. Unit tests mock provider responses to check payload scope and citations. Legacy demo history is not retroactively invented.

Evidence: .impeccable/review/workspace-overview.png, workspace-comparison.png, workspace-mobile.png, workspace-mobile-chat.png. Runtime localhost:5173, API localhost:5174. Functional check: artifacts/workspace-browser-check.cjs. Isolated API tests verify persistence through process restart, review invalidation, citation scope, role uploads, drafts and export gating. No deployment or git push requested.
