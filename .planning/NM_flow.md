# SMBC Corporate Onboarding: AI Agent Requirements Document

## 1. High-Level Overview

The corporate customer onboarding process at SMBC is a multi-disciplinary workflow that transforms a prospect into a fully operational banking client. Depending on the product mix requested, the journey pathways diverge significantly in complexity, risk assessment, and operational setup.

We are focusing on two primary journeys:
1. **CASA (Current Account & Savings Account)**: A standardized, high-velocity journey focused primarily on identity verification (KYC/AML), legal mandates, and core banking setup. Credit risk is minimal.
2. **Loan (Credit Facility)**: A highly complex, risk-intensive journey requiring deep financial enrichment, collateral valuation, complex legal covenants, and multi-tiered committee approvals.

---

## 2. Journey Breakdown: Step-by-Step Process Flow

This section details the end-to-end steps, defining who is responsible, what information is captured, and explicitly *how* the data enters the system (e.g., Manual Input, File Upload, AI-Extraction, or API integration).

### A. CASA Account Journey
*Focus: Speed, KYC compliance, and seamless operational setup.*

| Step | Owner | Description | Key Information Captured | Input Method & Source (How) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Initiation & Data Capture** | Client / RM | Capture basic demographics, check duplicates. | Legal Entity Name, DBA, Tax ID, Address, Contact Person. | **Search/Auto-fill**: API lookup (OpenCorporates/Registry). <br>**Manual**: Contact Person details. |
| **2. KYC/AML & Due Diligence** | Compliance Officer | Identify UBOs, Directors, verify against sanctions/media. | UBO details (Name, DOB, % Ownership), PEP Status, Adverse Media Hits. | **File Upload**: Passports/IDs for UBOs. <br>**Auto-populated**: Sanctions/Media hits via Dow Jones/Refinitiv API integration. |
| **3. Legal Agreements** | Legal / Client | Execute standard mandates and T&Cs. | Governing Law, T&C Acceptance, Corporate Resolution. | **File Upload**: Corporate Resolutions (PDF). <br>**Digital Action**: eSignature via DocuSign integration for T&Cs. |
| **4. Review & Approval** | Case Manager | Final check of completeness. | Completeness Score, Missing Docs, FATCA/CRS Status, Approval Sign-off. | **System Calculated**: Completeness Score. <br>**Manual**: Reviewer Notes and Final Sign-off button click. |
| **5. Account Opening & Setup** | Ops Team | Configure accounts in core banking and portals. | Core Banking ID, Account Number, Statement Frequency, SWIFT BIC. | **Manual**: Commission Codes, Statement Frequency. <br>**System Push/Pull**: Account Number returned from Core Banking API. |
| **6. Ongoing Monitoring** | Compliance / System | Track transaction velocity and dormancy. | Review Cycle, Alert Spikes, Dormancy Status. | **Automated**: Background AI/System triggers based on transaction data feeds. |

### B. Loan (Credit Facility) Journey
*Focus: Risk mitigation, financial depth, legal negotiation, and limits.*

| Step | Owner | Description | Key Information Captured | Input Method & Source (How) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Initiation & Data Capture** | Client / RM | Demographics + specific lending requests. | Demographics, GICS/NAICS Codes, Requested Credit Line, Proposed Collateral. | **Search/Auto-fill**: Demographics (API). <br>**Manual/Dropdown**: Requested Credit Line. <br>**File Upload**: High-level Collateral summaries. |
| **2. Credit, Risk & Compliance** | Credit Analyst | Assess financial standing, PD/LGD, risk grades. | NAV, AUM, Leverage Ratio, PD/LGD, Credit Grade. | **System Calculated**: PD/LGD models based on inputs. <br>**Manual Review**: Analyst override/approval of AI-suggested Risk Grade. |
| **3. KYC/AML Due Diligence** | Compliance Officer | Deep tracing of complex holding structures. | Complex Holding Diagrams, Trust Deeds, Intermediary Entities. | **File Upload**: Trust Deeds, Articles of Association. <br>**AI Extracted**: Holding structure extracted from uploaded PDFs and visualized. |
| **4. Financial Enrichment & Credit Memo** | RM / Credit Analyst | Granular financial profiling and Credit Memo generation. | Assets, Liabilities, EBITDA, Ratios, Real Estate Valuations, **Credit Memo Document**. | **File Upload**: Audited Financials. <br>**AI Extracted**: Financial spread data from PDFs (OCR). <br>**System Generated**: Ratios, automated Credit Memo draft. |
| **5. Legal Negotiation** | Legal / Client | Draft custom Master Agreements and covenants. | ISDA/MRA Agreements, Deviation Logs, Covenant Tracking. | **File Upload/Versioning**: Word documents. <br>**Manual**: Logging deviations. <br>**Digital Action**: E-signature. |
| **6. Committee Approval** | MD / Credit Committee | Validate risk vs. reward, read Credit Memo. | ESG Risk, Committee Notes, MD Sign-off. | **Auto-populated**: ESG Risk (from external vendor). <br>**Manual**: Committee Decision Notes and final approval click. |
| **7. Limit & Account Setup** | Ops Team | Load limits into EMS/Trading systems. | Settlement/Margin Accounts, Trading Limits. | **System Push**: Automated push to trading APIs. <br>**Manual**: Verification of limit loads. |
| **8. Ongoing Monitoring** | Credit / Ops | Oversight of financial covenants and limit expirations. | Limit Expirations, ROA Tracking, Downgrade History. | **Automated Alerting**: System checks against covenant thresholds. |

---

## 3. Exhaustive Front-End Screens Inventory

Below is the definitive list of required user interfaces to support the workflows. For each screen, we define the exact fields, data types, and precisely how the AI Agent should architect the data acquisition (Manual vs. File Upload vs. AI Auto-fill).

### Screen 1: The Initiation Portal
* **Journeys Used In**: CASA & Loan
* **Primary Users**: Client (Self-Service) or Relationship Manager (Maker)
* **Number of Views/Tabs required**: 2 (Entity Search/Lookup, Data Entry Form)

| Field / Component | Input Type | Source / How |
| :--- | :--- | :--- |
| **Entity Search Bar** | Text Search Input | **API**: Direct query to OpenCorporates or local registry. |
| **Legal Entity Name** | Text Field | **Auto-populated**: From Search selection. |
| **Tax ID / Registration No.** | Text Field | **Auto-populated**: From Search, with manual override capability. |
| **Proof of Incorporation** | File Upload Zone | **Manual Upload**: Client uploads PDF. |
| **Industry Code (NAICS/GICS)** | Dropdown Search | **AI Suggestion**: Based on entity name/nature of business, mapped to dropdown. |
| **Primary Address** | Multi-line Text | **Auto-populated**: From registry API. |
| **Contact Person Details** | Form Grid | **Manual Input**: Name, Email, Phone number. |
| **Product Selection** | Radio/Toggle | **Manual Input**: User selects CASA or Credit Facility. |
| **Requested Credit Limit** | Numeric Input | **Manual Input**: (Only visible if Loan selected). |
| **Initial Collateral Doc** | File Upload Zone | **Manual Upload**: (Only visible if Loan selected). |

### Screen 2: Credit & Financial Profiler
* **Journeys Used In**: Loan primarily
* **Primary Users**: Credit Analyst, Relationship Manager
* **Number of Views/Tabs required**: 3 (Financial Spreading, Risk Modeling, Document Vault)

| Field / Component | Input Type | Source / How |
| :--- | :--- | :--- |
| **Audited Financials Upload** | File Upload Zone | **Manual Upload**: RM or Client uploads Annual Reports (PDF/Excel). |
| **Assets, Liabilities, Equity** | Data Grid | **AI Extracted**: Parsed from uploaded financials via OCR/LLM. Manual override capability. |
| **EBITDA, Net Income** | Data Grid | **AI Extracted**: Parsed from uploaded financials. |
| **Financial Ratios (ROE/ROA)** | Read-only Text | **System Calculated**: Derived mathematically from the Data Grid values. |
| **PD & LGD Inputs** | Sliders / Number | **Auto-populated**: AI model baseline, adjustable by Analyst. |
| **Real Estate/Asset Valuations** | Form Grid | **Manual Input**: Entered by RM based on external physical appraisals. |
| **Credit Grade Assignment** | Dropdown | **AI Suggestion**: Based on PD/LGD matrices, requires manual confirm. |

### Screen 3: Compliance & KYC/AML Workspace
* **Journeys Used In**: CASA & Loan
* **Primary Users**: Compliance Officer
* **Number of Views/Tabs required**: 3 (UBO Visualization, Screening Dashboard, Document Verification)

| Field / Component | Input Type | Source / How |
| :--- | :--- | :--- |
| **UBO / Holding Diagram** | Interactive Canvas | **AI Generated**: Visual graph built by extracting corporate entities from uploaded Trust Deeds/Registry docs. |
| **Director/Stakeholder Grid** | Data Table | **Auto-populated / AI Extracted**: From registry or uploaded documents. |
| **Stakeholder IDs (Passports)** | File Upload Zone | **Manual Upload**: RM/Client uploads stakeholder IDs. |
| **ID Verification Status** | Status Badge | **API**: Onfido / Jumio integration to verify uploaded IDs automatically. |
| **Adverse Media Hits** | List/Feed | **API**: Dow Jones / Refinitiv real-time feed based on Entity/Director names. |
| **Sanctions Match Score** | Progress/Gauge | **API**: External screening tool. |
| **Overall AML Risk Rating** | Dropdown | **System Calculated**: Rule-based score, manual override by Compliance. |

### Screen 4: Legal Negotiation Hub
* **Journeys Used In**: CASA & Loan
* **Primary Users**: Legal Counsel, Client
* **Number of Views/Tabs required**: 2 (Document Generation, Execution Panel)

| Field / Component | Input Type | Source / How |
| :--- | :--- | :--- |
| **Master Agreement Type** | Dropdown | **Manual Input**: Legal selects ISDA, MRA, or standard T&Cs. |
| **Base Document Template** | Document Viewer | **System Generated**: Template auto-filled with Client Name, Address, Product details from Screen 1. |
| **Corporate Resolutions** | File Upload Zone | **Manual Upload**: Client uploads signed board resolutions. |
| **Covenant Deviation Log** | Text Area / Grid | **Manual Input**: Legal manually logs negotiated deviations from standard terms. |
| **Signature Status** | Status Indicator | **API**: DocuSign webhook indicating Pending/Signed. |

### Screen 5: Review & Executive Approval Dashboard
* **Journeys Used In**: CASA & Loan
* **Primary Users**: Case Manager, Credit Committee, Managing Director
* **Number of Views/Tabs required**: 2 (Executive Summary, Action Panel)

| Field / Component | Input Type | Source / How |
| :--- | :--- | :--- |
| **Completeness Scorecard** | Circular Progress | **System Calculated**: Checks all required fields across previous screens. |
| **Credit Memo Viewer** | Document Viewer | **System Generated**: AI aggregates Financials, KYC summary, and Risk Grades into a standard memo format. |
| **Key Risk Flags** | Alert Banners | **System Generated**: Highlights missing docs, high AML risk, or high LGD. |
| **ESG / Reputational Risk** | Text / Score | **API**: External ESG rating agencies (e.g., Sustainalytics). |
| **Secondary Reviewer Notes** | Rich Text Area | **Manual Input**: "Four-Eyes" reviewer inputs comments. |
| **Final Decision Action** | Buttons | **Manual Input**: Click Approve, Reject, or Return to Maker. |

### Screen 6: Operations & Limits Setup
* **Journeys Used In**: CASA & Loan
* **Primary Users**: Banking Operations Team
* **Number of Views/Tabs required**: 2 (Core Banking Configuration, Limit Configuration)

| Field / Component | Input Type | Source / How |
| :--- | :--- | :--- |
| **Core Banking Account No.** | Text Field | **System Push/Pull**: API call creates account in core banking and pulls number back. |
| **Commission & Fee Codes** | Dropdown | **Manual Input**: Ops team selects applicable fee tiers. |
| **SWIFT BIC Configuration** | Text Field | **Manual Input**: Ops team configures routing details. |
| **Trading Limit Values** | Number Inputs | **Auto-populated**: Pulled directly from approved Credit Memo. |
| **Push to Trading/EMS** | Action Button | **API**: Pushes configured limits into downstream trading systems (e.g., Murex, Bloomberg EMS). |
