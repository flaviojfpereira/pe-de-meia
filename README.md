<div align="center">

# Pé de Meia

**Portugal-First Wealth Intelligence, Real Estate Valuation & Financial Independence Engine.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_API-2.5_Flash-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Architecture](#architecture) • [Core Engines](#core-engines) • [Interface Gallery](#interface-gallery) • [Local Setup](#local-setup) • [Keyboard Shortcuts](#keyboard-shortcuts)

---

</div>

## Overview

**Pé de Meia** is a high-precision wealth intelligence platform built for complex, real-world financial decision-making, engineered with native fidelity to Portugal's economic and regulatory landscape.

### Distinctive Innovations

1. **Financial Forking (*Counterfactual Weaver*)**  
   Version-control your life decisions like code branches. Fork your financial trajectory into parallel scenarios (e.g. *Relocate to Silver Coast*, *Aggressive ETF Growth*, *Buy T2 vs. Rent*), compare 10- and 20-year net worth, monthly cash flow, and milestone dates side-by-side, and promote any scenario to become your canonical plan with a single click.

2. **Real-Time Sensitivity Sandbox (*Ripple Playground*)**  
   Zero-latency multi-variable simulation engine. Modulating monthly ETF DCA, crypto allocations, property value overrides, or inflation rates instantly recalculates 30-year wealth trajectories, quantifying the exact ripple effect on retirement dates (e.g. *pulls milestone forward by 11 months*), safe-to-spend allowances, and downside stress tests.

3. **Physical-Feature AI Valuation & Notary Deed Grounding**  
   Replaces naive square-meter estimates with deep physical appraisal. Powered by Gemini 2.5 Flash, the valuation engine factors in thermal comfort systems (wall radiators, HVAC, energy certification), construction year, balconies, and garage spaces. It cross-references active portal asking prices against historical notary deed archives to surface realistic negotiation margins.

4. **Portugal-First Regulatory & Closing Friction Engine**  
   Eliminates the blind spots of US-centric tools by modeling exact Portuguese fiscal mechanics: progressive IMT brackets, dual Stamp Duty (acquisition + credit), *Casa Pronta* notary fees, CIRS Art. 41 rental expense shielding (HOA, insurance, IMI), and CIRS Art. 10 crypto holding exemptions.

---

## Interface Gallery

<div align="center">

### 1. Present State Dashboard
![Present State Dashboard](docs/screenshots/01-dashboard-overview.png)
*Net worth trajectory, cash runway, safe-to-spend calculation, emergency fund health, and active debt amortizations.*

---

### 2. Portfolio Assets & Real Estate Management
![Portfolio Assets and Liabilities](docs/screenshots/02-real-estate-imt.png)
*Property ledger, fair market valuations, net rental cash flows, and CIRS Art. 41 tax shielding.*

---

### 3. Ripple Playground
![Ripple Playground](docs/screenshots/03-ripple-playground.png)
*Real-time sensitivity analysis for savings rates, asset allocation, inflation shocks, and milestone acceleration.*

---

### 4. Counterfactual Weaver
![Counterfactual Weaver](docs/screenshots/04-counterfactual-weaver.png)
*Side-by-side branch comparison of alternative life scenarios with one-click promotion to the main model.*

---

### 5. Physical Property & Thermal Comfort Specification
![Add Real Estate Property](docs/screenshots/05-add-property-features.png)
*Granular physical input: typology, usable area, construction year, heating systems, AC, garage, and grounding context notes.*

---

### 6. AI Valuation Engine & Portuguese Market Benchmarks
![AI Valuation Engine](docs/screenshots/06-ai-valuation-engine.png)
*Official notary deed registry comparison, portal asking prices, negotiation discounts, and step-by-step appraisal rationale.*

</div>

---

## Core Engines

### 1. Counterfactual Weaver: Financial Forking Architecture
Pé de Meia treats financial plans like Git branches. Instead of overwriting your baseline trajectory to test an idea, the Weaver engine creates an isolated counterfactual sandbox:
- **Side-by-Side Delta Matrix**: Computes differentials across 10-year net worth, 20-year net worth, retirement monthly cash flow, and target milestone arrival dates.
- **One-Click Promotion**: When a life decision crystallizes (e.g., selling a primary residence to relocate or shifting from aggressive growth to capital preservation), the branch can be promoted directly to replace the active baseline model.

### 2. Ripple Simulation Engine (Zero-Latency Sensitivity)
Traditional financial tools recompute projections only upon form submission or page reloads. The Ripple Engine calculates compounding equations client-side across 30 annual buckets instantaneously:
- **Milestone Date Shifting**: Calculates the dynamic derivative of wealth growth to determine exactly how many months a decision advances or delays your target milestones.
- **Three-Prong Stress Testing**: Computes instantaneous portfolio resilience against a -20% market correction, a persistent +1% inflation shock, and +5 years of longevity risk.

### 3. Physical Feature Appraisal & Notary Grounding (Gemini 2.5 Flash)
Generic valuation APIs rely purely on raw parish $\text{€}/\text{m}^2$ averages, producing misleading appraisals for modernized or feature-rich properties. Pé de Meia’s engine grounds AI appraisals in physical specifications:
- **Thermal Comfort Modeling**: Calibrates value for central heating (gas wall radiators vs. electric), heat pump infrastructure, double-glazed thermal breaks, and multi-split AC installation costs.
- **Negotiation Gap Analysis**: Compares asking list prices (Idealista) with official notary deed transaction records to establish realistic closing discounts (typically -5% to -8% in urban hubs).

### 4. Real Estate Transaction Friction & Upfront Capital (Portugal)
A standard 10%–20% bank down payment ignores the actual liquidity needed to close a property in Portugal. Pé de Meia computes the exact capital requirement:

$$\text{Total Upfront Capital} = \text{Down Payment} + \text{IMT} + \text{Stamp Duty (Acquisition)} + \text{Stamp Duty (Loan)} + \text{Notary / Registry} + \text{Bank Fees}$$

- **IMT**: Progressive Continental tax brackets for both primary residence (HPP) and secondary/investment acquisitions.
- **Acquisition Stamp Duty**: 0.8% of deed value.
- **Mortgage Stamp Duty**: 0.6% on loans > 5 years.
- **Closing & Registration**: *Casa Pronta* fixed notary (~€750) + bank appraisal/dossier fees (~€750).

> **Practical Impact**: On a **€225,000** apartment with 20% down payment (€45,000), the closing friction adds **€11,127** in mandatory statutory costs, requiring **€56,127** in liquid capital.

### 5. CIRS Article 41 Rental Tax Shield
Unlike naive calculators that apply a flat 25% or 28% to gross rents, the calculation engine mirrors Portuguese tax code:

$$\text{Taxable Base} = \max\Big(0, \text{Gross Rent} - (\text{HOA/Condo} + \text{Fire/Multi-risk Insurance} + \text{IMI} + \text{Documented Maintenance})\Big)$$

Autonomous IRS rates (25% standard, or reduced 15% / 10% tiers for long-term leases under *Mais Habitação*) apply solely to this net base.

### 6. CIRS Article 10 Cryptocurrency Holding Rule & ETF TER Drag
- **CIRS Art. 10 Crypto Exemption**: Tracks holding duration. Capital gains on crypto held $< 365$ days are taxed at 28%; assets held $\ge 365$ days qualify for **0% tax exemption**.
- **ETF TER Drag**: Deducts annualized Total Expense Ratios (TER) from gross compounding yield, modeling the tax drag of accumulating vs. distributive global index funds.

---

## Architecture

```
pe-de-meia/
├── docs/
│   └── screenshots/         # UI documentation captures (1-6)
├── src/
│   ├── components/          # Modular UI components
│   │   ├── AssetsManager.tsx       # Asset inventory, IMT audit, valuation modals
│   │   ├── CounterfactualWeaver.tsx# Multi-branch financial forking engine
│   │   ├── Navigation.tsx          # Collapsible navigation & global metrics
│   │   ├── PresentStateHome.tsx    # Primary net worth & liquidity dashboard
│   │   └── RipplePlayground.tsx    # Zero-latency scenario simulator
│   ├── data/
│   │   └── initialState.ts  # Pre-calibrated Portuguese baseline scenario
│   ├── utils/
│   │   └── calculations.ts  # Pure mathematical formulas (IMT, CIRS 41, IRR, FIRE)
│   ├── App.tsx              # Application root & view dispatcher
│   └── types.ts             # Domain type declarations
├── server.ts                # Express backend proxy for secure Gemini API execution
├── package.json
└── tsconfig.json
```

- **Frontend**: React 18 with TypeScript and Vite. Zero UI component library bloat; tailored high-density styling via Tailwind CSS.
- **Backend / Security**: Node.js Express server (`server.ts`) acts as an authenticated proxy for Google GenAI calls. API keys never touch client bundles.
- **AI Grounding**: Uses `@google/genai` (Gemini 2.5 Flash) with structured JSON schemas and Portuguese real estate market context.
- **Engine Reliability**: Pure, deterministic calculations in `src/utils/calculations.ts` isolated from UI state.

---

## Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/pe-de-meia.git
   cd pe-de-meia
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: The platform features complete local deterministic fallback valuations if no API key is provided).*

4. Launch development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + B` / `Cmd + B` | Toggle / Collapse Sidebar Navigation |
| `Alt + 1` to `Alt + 5` | Instant Tab Navigation |

---

## License

This project is licensed under the [MIT License](LICENSE).
