"""
Enrich regulations.json with:
  1. penalty_severity (1-5) and enforcement_intensity (1-3) on ALL 102 regulations
  2. milestones[] on ~15 multi-phase regulations
  3. Upgraded structured key_requirements on the top 20 regulations
     Format: [{id, text, consequence, evidence_guide, control_theme}]

Run from ComplianceMap root:  python scripts/_enrich_regulations.py
"""
import sys, json, os
sys.stdout.reconfigure(encoding='utf-8')

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(BASE, 'data', 'regulations.json')

with open(PATH, encoding='utf-8') as f:
    doc = json.load(f)

regs = {r['id']: r for r in doc['regulations']}

# ─────────────────────────────────────────────
# 1. penalty_severity + enforcement_intensity
#    penalty_severity:     1=minimal/voluntary  5=highest (% global revenue / criminal)
#    enforcement_intensity:1=nascent  2=active  3=highly-active (track record of large fines)
# ─────────────────────────────────────────────
RISK_DATA = {
    # ── EU ──
    'GDPR':       (5, 3), 'NIS2':        (4, 2), 'DORA':        (4, 2),
    'EU_AI_ACT':  (5, 2), 'CYBER_ACT':   (3, 2), 'EU_CSRD':     (3, 2),
    'EU_CSDDD':   (4, 2),
    # ── US Federal ──
    'HIPAA':      (4, 3), 'SOX':         (5, 3), 'CCPA':        (3, 2),
    'EO14028':    (3, 2), 'COPPA':       (3, 3), 'GLBA':        (3, 2),
    'CAN_SPAM':   (2, 2), 'FCPA':        (5, 3),
    # ── US State ──
    'CPRA':       (3, 2),
    # ── UK ──
    'UK_GDPR':    (4, 3), 'UK_BRIBERY':  (5, 3), 'UK_MOD_SLAV': (3, 2),
    'UK_ENV_ACT': (3, 1),
    # ── China ──
    'PIPL':       (4, 2), 'CSL':         (4, 2), 'DSL':         (4, 2),
    # ── Brazil ──
    'LGPD':       (3, 2),
    # ── India ──
    'INDIA_DPDP': (3, 1),
    # ── Canada ──
    'PIPEDA':     (2, 2), 'CANADA_CFPOA':(4, 2),
    # ── Australia ──
    'AUS_PRIVACY':(3, 2), 'AUS_MOD_SLAV':(3, 1),
    # ── Singapore ──
    'SG_PDPA':    (3, 2), 'SG_CSA':      (3, 2), 'SG_PCA':      (4, 2),
    # ── Japan ──
    'JAPAN_APPI': (3, 2),
    # ── South Korea ──
    'KOREA_PIPA': (4, 2), 'KOREA_SAPA':  (3, 2),
    # ── MENA ──
    'PDPL':       (3, 1), 'ISRAEL_PPL':  (3, 2),
    # ── LATAM ──
    'BRAZIL_CCA': (3, 2), 'MEX_LGRA':    (3, 1),
    # ── Africa ──
    'SA_POPIA':   (3, 1), 'SA_PRECCA':   (4, 2),
    # ── Southeast Asia ──
    'TH_PDPA':    (3, 1), 'MY_PDPA':     (2, 1), 'PH_DPA':      (3, 1),
    'VN_PDPD':    (2, 1), 'ID_PDPL':     (3, 1),
    # ── Other Europe ──
    'TR_KVKK':    (3, 2), 'CH_FADP':     (3, 2), 'RU_152FZ':    (3, 2),
    'UA_DPLA':    (2, 1),
    # ── International / IMO ──
    'IMO_MARPOL': (3, 2), 'IMO_DCS':     (2, 2), 'IMO_CII':     (3, 2),
    'FUELEU':     (3, 2), 'HKC_SRC':     (3, 1),
    # ── Finance ──
    'PCI_DSS':    (4, 3), 'BASEL_III':   (4, 2), 'IFRS9':       (3, 2),
    'SAPIN2':     (4, 2), 'MX_CCA':      (3, 1), 'US_CTA':      (3, 2),
    'BRAZIL_CVM': (3, 2),
    # ── ESG / Sustainability ──
    'DE_LKSG':    (3, 2), 'CAN_MOD_SLAV':(3, 1), 'SPAIN_WB':    (3, 1),
    # ── Customs / Trade ──
    'US_UFLPA':   (4, 3), 'EU_ICS2':     (3, 2), 'US_OSRA':     (3, 2),
    'CHINA_ECL':  (4, 2),
    # ── New Zealand ──
    'NZ_PRIVACY': (3, 2),
    # ── Hong Kong ──
    'HK_PDPO':    (3, 2),
    # ── Israel ──
    'IL_PPL':     (3, 2),
}

# ─────────────────────────────────────────────
# 2. milestones[] — phased regulations
# ─────────────────────────────────────────────
MILESTONES = {
    'EU_AI_ACT': [
        {'date': '2024-08-01', 'label': 'Act enters into force', 'status': 'completed'},
        {'date': '2025-02-02', 'label': 'Prohibited AI practices prohibited', 'status': 'completed'},
        {'date': '2025-08-02', 'label': 'GPAI model obligations apply', 'status': 'completed'},
        {'date': '2026-08-02', 'label': 'High-risk AI system obligations (Annex I) apply', 'status': 'upcoming'},
        {'date': '2027-08-02', 'label': 'All high-risk AI systems (Annex III) apply', 'status': 'upcoming'},
    ],
    'DORA': [
        {'date': '2023-01-16', 'label': 'Regulation enters into force', 'status': 'completed'},
        {'date': '2025-01-17', 'label': 'Full application date — ICT risk, incident reporting, testing, third-party risk', 'status': 'completed'},
        {'date': '2025-07-17', 'label': 'First round of TLPT (Threat-Led Pen Testing) required', 'status': 'upcoming'},
    ],
    'NIS2': [
        {'date': '2023-01-16', 'label': 'Directive enters into force', 'status': 'completed'},
        {'date': '2024-10-17', 'label': 'Member state transposition deadline', 'status': 'completed'},
        {'date': '2025-04-17', 'label': 'National competent authorities operational', 'status': 'completed'},
        {'date': '2025-10-01', 'label': 'Sector-specific supervisory frameworks complete', 'status': 'upcoming'},
    ],
    'EU_CSRD': [
        {'date': '2024-01-01', 'label': 'Large public-interest entities (FY2024 reporting)', 'status': 'completed'},
        {'date': '2025-01-01', 'label': 'Large companies not previously subject to NFRD', 'status': 'upcoming'},
        {'date': '2026-01-01', 'label': 'Listed SMEs, small & non-complex credit institutions', 'status': 'upcoming'},
    ],
    'EU_CSDDD': [
        {'date': '2024-07-25', 'label': 'Directive enters into force', 'status': 'completed'},
        {'date': '2026-07-26', 'label': 'Member state transposition deadline', 'status': 'upcoming'},
        {'date': '2027-07-26', 'label': 'Applies to EU companies: turnover >€1.5B, 5000+ employees', 'status': 'upcoming'},
        {'date': '2028-07-26', 'label': 'Applies to EU companies: turnover >€900M, 3000+ employees', 'status': 'upcoming'},
        {'date': '2029-07-26', 'label': 'Full application — all in-scope companies', 'status': 'upcoming'},
    ],
    'INDIA_DPDP': [
        {'date': '2023-08-11', 'label': 'Act receives presidential assent', 'status': 'completed'},
        {'date': '2025-06-01', 'label': 'Rules notified', 'status': 'completed'},
        {'date': '2025-12-01', 'label': 'Consent Manager framework operational', 'status': 'upcoming'},
        {'date': '2026-06-01', 'label': 'Full enforcement begins', 'status': 'upcoming'},
    ],
    'KOREA_PIPA': [
        {'date': '2023-09-15', 'label': 'Amended PIPA enters into force', 'status': 'completed'},
        {'date': '2024-03-15', 'label': 'Stricter pseudonymization and mobile app obligations apply', 'status': 'completed'},
        {'date': '2025-09-15', 'label': 'Enhanced cross-border transfer mechanisms apply', 'status': 'upcoming'},
    ],
    'GDPR': [
        {'date': '2016-04-27', 'label': 'Regulation published in Official Journal', 'status': 'completed'},
        {'date': '2018-05-25', 'label': 'Full application date', 'status': 'completed'},
        {'date': '2024-09-01', 'label': 'EU-US Data Privacy Framework operational', 'status': 'completed'},
        {'date': '2025-06-01', 'label': 'EDPB coordinated enforcement on right of access', 'status': 'completed'},
    ],
    'HIPAA': [
        {'date': '1996-08-21', 'label': 'Act signed into law', 'status': 'completed'},
        {'date': '2003-04-14', 'label': 'Privacy Rule compliance deadline', 'status': 'completed'},
        {'date': '2005-04-20', 'label': 'Security Rule compliance deadline', 'status': 'completed'},
        {'date': '2024-04-22', 'label': 'HIPAA Security Rule NPRM published — major update', 'status': 'completed'},
        {'date': '2025-07-01', 'label': 'Proposed updated Security Rule compliance deadline', 'status': 'upcoming'},
    ],
    'FUELEU': [
        {'date': '2023-10-09', 'label': 'Regulation enters into force', 'status': 'completed'},
        {'date': '2025-01-01', 'label': 'Data collection for 2025 starts (biofuels reporting)', 'status': 'completed'},
        {'date': '2025-08-31', 'label': 'Verification of 2025 fuel data', 'status': 'upcoming'},
        {'date': '2030-01-01', 'label': 'Minimum 6% GHG reduction target', 'status': 'upcoming'},
        {'date': '2035-01-01', 'label': 'Minimum 14.5% GHG reduction target', 'status': 'upcoming'},
    ],
    'US_CTA': [
        {'date': '2024-01-01', 'label': 'Beneficial ownership reporting begins (entities formed before 2024)', 'status': 'completed'},
        {'date': '2025-01-13', 'label': 'Treasury paused enforcement — court injunction lifted', 'status': 'completed'},
        {'date': '2025-03-21', 'label': 'New reporting deadline under FinCEN interim rule', 'status': 'upcoming'},
    ],
    'AUS_PRIVACY': [
        {'date': '1988-12-17', 'label': 'Privacy Act enacted', 'status': 'completed'},
        {'date': '2022-12-13', 'label': 'Penalty increases to A$50M enacted', 'status': 'completed'},
        {'date': '2024-09-12', 'label': 'Privacy Act Review reforms tabled in Parliament', 'status': 'completed'},
        {'date': '2026-01-01', 'label': 'Anticipated commencement of reformed Privacy Act', 'status': 'upcoming'},
    ],
}

# ─────────────────────────────────────────────
# 3. Structured key_requirements — top 20 regulations
#    {id, text, consequence, evidence_guide, control_theme}
#
# control_theme values:
#   data_governance | access_control | incident_response | vendor_management
#   training_awareness | technical_controls | policy_procedures | risk_assessment
#   board_governance | financial_controls
# ─────────────────────────────────────────────
STRUCTURED_REQS = {
    'GDPR': [
        {'id':'GDPR-R001','text':'Establish and document a lawful basis for every personal data processing activity','consequence':'Unlawful processing; fines up to €20M or 4% global annual turnover','evidence_guide':'Records of Processing Activities (RoPA); legitimate interest assessments; consent records','control_theme':'data_governance'},
        {'id':'GDPR-R002','text':'Honour all data subject rights: access (Art.15), erasure (Art.17), portability (Art.20), rectification (Art.16), restriction (Art.18), objection (Art.21)','consequence':'Fines; supervisory authority enforcement; reputational damage','evidence_guide':'DSR handling procedures; documented response timelines; data subject request logs','control_theme':'data_governance'},
        {'id':'GDPR-R003','text':'Report personal data breaches to the supervisory authority within 72 hours of becoming aware','consequence':'Fines up to €10M or 2% global turnover; possible criminal liability in some member states','evidence_guide':'Breach notification log; incident response runbook; DPA submission receipts','control_theme':'incident_response'},
        {'id':'GDPR-R004','text':'Notify affected data subjects without undue delay when a breach is likely to result in high risk to their rights and freedoms','consequence':'Fines; reputational and legal exposure','evidence_guide':'Breach notification letters; risk assessment records; communication logs','control_theme':'incident_response'},
        {'id':'GDPR-R005','text':'Appoint a Data Protection Officer (DPO) for public authorities, large-scale systematic monitoring, or large-scale sensitive data processing','consequence':'Fines; inability to demonstrate accountability','evidence_guide':'DPO appointment letter; DPO contract or job description; registration with supervisory authority','control_theme':'policy_procedures'},
        {'id':'GDPR-R006','text':'Implement Privacy by Design and Privacy by Default in all systems and processes involving personal data','consequence':'Fines; mandatory remediation orders by regulators','evidence_guide':'Privacy impact review in SDLC; default settings documentation; design decisions log','control_theme':'technical_controls'},
        {'id':'GDPR-R007','text':'Conduct Data Protection Impact Assessments (DPIAs) before commencing high-risk processing activities','consequence':'Fines; enforcement action; processing suspension','evidence_guide':'Completed DPIA templates; evidence of prior consultation with DPA where required','control_theme':'risk_assessment'},
        {'id':'GDPR-R008','text':'Ensure personal data is not transferred outside the EEA without an adequate safeguard (adequacy decision, SCCs, BCRs, or derogation)','consequence':'Fines up to €20M or 4% global turnover; injunctions on data flows','evidence_guide':'Transfer impact assessments; executed SCCs; adequacy decision references; BCR approvals','control_theme':'vendor_management'},
        {'id':'GDPR-R009','text':'Enter into binding Data Processing Agreements (DPAs) with all processors handling personal data on your behalf','consequence':'Fines; joint liability exposure with processors','evidence_guide':'Signed DPA index; processor audit reports; sub-processor approval records','control_theme':'vendor_management'},
        {'id':'GDPR-R010','text':'Maintain Records of Processing Activities (RoPA) as required by Article 30','consequence':'Fines; supervisory authority audit findings','evidence_guide':'Up-to-date RoPA spreadsheet or register; review date and owner records','control_theme':'data_governance'},
    ],

    'HIPAA': [
        {'id':'HIPAA-R001','text':'Conduct an accurate and thorough risk analysis of potential risks and vulnerabilities to ePHI','consequence':'Civil penalties up to $1.9M per category per year; criminal prosecution','evidence_guide':'Risk analysis report; asset inventory; threat assessment documentation; annual review records','control_theme':'risk_assessment'},
        {'id':'HIPAA-R002','text':'Implement risk management measures to reduce identified risks to a reasonable and appropriate level','consequence':'Civil money penalties; mandatory corrective action plan','evidence_guide':'Risk management plan; remediation tracking; control implementation evidence','control_theme':'risk_assessment'},
        {'id':'HIPAA-R003','text':'Implement access controls limiting ePHI access to authorized persons and software programs only','consequence':'Penalties; corrective action plan; reputational damage','evidence_guide':'Access control policy; active directory / IAM audit reports; least-privilege reviews','control_theme':'access_control'},
        {'id':'HIPAA-R004','text':'Implement audit controls to record and examine activity on systems containing ePHI','consequence':'Penalties; inability to detect or investigate breaches','evidence_guide':'Audit log configuration; log retention policy; SIEM alerts; periodic log review records','control_theme':'technical_controls'},
        {'id':'HIPAA-R005','text':'Notify affected individuals, HHS, and (where applicable) media within required timeframes following a breach of unsecured PHI','consequence':'Penalties up to $1.9M per incident category; OCR investigation','evidence_guide':'Breach assessment log; HHS notification receipts; individual notification records','control_theme':'incident_response'},
        {'id':'HIPAA-R006','text':'Provide patients with Notice of Privacy Practices (NPP) describing how PHI is used and disclosed','consequence':'Penalties; complaints to OCR','evidence_guide':'Current NPP document; distribution records; website posting evidence','control_theme':'policy_procedures'},
        {'id':'HIPAA-R007','text':'Enter into Business Associate Agreements (BAAs) with all vendors who access, create, receive, maintain, or transmit PHI on your behalf','consequence':'Penalties; joint liability; OCR enforcement','evidence_guide':'Executed BAA index; vendor assessment records; BAA review dates','control_theme':'vendor_management'},
        {'id':'HIPAA-R008','text':'Train all workforce members on HIPAA policies and procedures','consequence':'Penalties; inability to invoke workforce training defence','evidence_guide':'Training completion records; training materials; assessment scores; annual refresh evidence','control_theme':'training_awareness'},
    ],

    'SOX': [
        {'id':'SOX-R001','text':'CEO and CFO must personally certify accuracy of financial statements (Section 302)','consequence':'Criminal penalties up to $5M and 20 years imprisonment for false certifications','evidence_guide':'Signed Section 302 certifications; sub-certifications from business unit leaders','control_theme':'board_governance'},
        {'id':'SOX-R002','text':'Assess and report on effectiveness of internal controls over financial reporting (ICFR) annually (Section 404)','consequence':'SEC enforcement; restatements; shareholder litigation; delisting risk','evidence_guide':'Management assessment report; external auditor attestation; control testing workpapers','control_theme':'financial_controls'},
        {'id':'SOX-R003','text':'Establish and maintain disclosure controls and procedures to ensure timely and accurate reporting','consequence':'SEC enforcement; restatements; D&O liability','evidence_guide':'Disclosure committee charters; meeting minutes; controls inventory; gap remediation tracking','control_theme':'policy_procedures'},
        {'id':'SOX-R004','text':'Maintain audit committee independence — all members must be independent directors','consequence':'Exchange delisting; SEC investigation; investor litigation','evidence_guide':'Board composition records; independence declarations; committee charter','control_theme':'board_governance'},
        {'id':'SOX-R005','text':'Retain all audit-related records for seven years and prohibit destruction during investigations (Section 802)','consequence':'Criminal obstruction charges; evidence spoliation sanctions','evidence_guide':'Records retention policy; legal hold procedures; destruction logs; storage certificates','control_theme':'data_governance'},
        {'id':'SOX-R006','text':'Implement and protect whistleblower protections for employees reporting suspected fraud','consequence':'Civil liability; DOL enforcement; reputational damage','evidence_guide':'Whistleblower policy; hotline records; non-retaliation training; investigation logs','control_theme':'policy_procedures'},
    ],

    'CCPA': [
        {'id':'CCPA-R001','text':'Disclose categories of personal information collected and purposes at or before point of collection','consequence':'AG enforcement; $2,500/unintentional or $7,500/intentional violation','evidence_guide':'Privacy notice; collection point disclosures; consent forms; website audit','control_theme':'data_governance'},
        {'id':'CCPA-R002','text':'Respond to consumer rights requests (know, delete, opt-out of sale, non-discrimination) within 45 days','consequence':'Enforcement by CA AG; private right of action for security breaches','evidence_guide':'Consumer request logs; response time records; request fulfilment documentation','control_theme':'data_governance'},
        {'id':'CCPA-R003','text':'Provide a "Do Not Sell or Share My Personal Information" opt-out mechanism','consequence':'$7,500 per intentional violation; AG enforcement','evidence_guide':'Opt-out link on website; opt-out request logs; downstream vendor notification records','control_theme':'data_governance'},
        {'id':'CCPA-R004','text':'Implement and maintain reasonable security measures to protect personal information','consequence':'Private right of action for breaches; AG enforcement','evidence_guide':'Security risk assessment; NIST CSF or ISO 27001 mapping; pen test reports; incident logs','control_theme':'technical_controls'},
        {'id':'CCPA-R005','text':'Update Privacy Policy at least every 12 months to reflect current practices','consequence':'AG enforcement; consumer complaints','evidence_guide':'Privacy policy version history; legal review records; publication confirmation','control_theme':'policy_procedures'},
    ],

    'NIS2': [
        {'id':'NIS2-R001','text':'Implement cybersecurity risk management measures: policies, incident handling, supply chain security, network security, encryption, MFA, access control','consequence':'Fines up to €10M or 2% global turnover; operational suspension orders','evidence_guide':'Cybersecurity policy; risk register; ISO 27001 or equivalent audit; MFA deployment records','control_theme':'risk_assessment'},
        {'id':'NIS2-R002','text':'Report significant incidents to national CSIRT/NCA within 24 hours (early warning) and 72 hours (notification)','consequence':'Fines up to €10M or 2% global turnover; public disclosure requirements','evidence_guide':'Incident log; CSIRT notification receipts; post-incident analysis reports','control_theme':'incident_response'},
        {'id':'NIS2-R003','text':'Ensure supply chain cybersecurity: assess security practices of direct suppliers and service providers','consequence':'Fines; supervisory orders to remediate third-party risks','evidence_guide':'Supplier security assessment questionnaires; contract security clauses; audit rights','control_theme':'vendor_management'},
        {'id':'NIS2-R004','text':'Management body must receive training in cybersecurity risk management and oversee its implementation','consequence':'Personal liability of management; fines for organisation','evidence_guide':'Board/management training records; board cybersecurity agenda items; meeting minutes','control_theme':'board_governance'},
        {'id':'NIS2-R005','text':'Register with the national competent authority and provide required organisational information','consequence':'Fines; non-compliant operation of essential/important entity','evidence_guide':'NCA registration confirmation; entity classification documentation','control_theme':'policy_procedures'},
        {'id':'NIS2-R006','text':'Test incident response and business continuity plans regularly through exercises and drills','consequence':'Fines; inability to demonstrate resilience capability','evidence_guide':'Table-top exercise reports; drill schedules; BCP test results; lessons-learned records','control_theme':'incident_response'},
    ],

    'DORA': [
        {'id':'DORA-R001','text':'Establish an ICT risk management framework with board-approved policies, risk appetite, and governance structure','consequence':'Fines; supervisory orders; management personal liability','evidence_guide':'ICT risk management framework document; board approval minutes; risk appetite statement','control_theme':'risk_assessment'},
        {'id':'DORA-R002','text':'Classify and report major ICT-related incidents to competent authority within prescribed timelines (initial: 4 hours, intermediate: 72 hours, final: 1 month)','consequence':'Fines up to 1% average daily worldwide turnover (banks); supervisory scrutiny','evidence_guide':'ICT incident classification methodology; incident log; NCA submission receipts','control_theme':'incident_response'},
        {'id':'DORA-R003','text':'Conduct Digital Operational Resilience Testing (DORT) annually — basic testing and TLPT for significant entities','consequence':'Supervisory finding; mandatory remediation; fines','evidence_guide':'Annual test plan; penetration test reports; TLPT scoping documentation; remediation tracker','control_theme':'technical_controls'},
        {'id':'DORA-R004','text':'Manage ICT third-party risk through rigorous pre-contractual due diligence, contract provisions, and ongoing monitoring','consequence':'Supervisory action; withdrawal of authorisation; fines','evidence_guide':'TPPP (Third-Party Provider Policy); DDQ responses; contract review records; exit plans','control_theme':'vendor_management'},
        {'id':'DORA-R005','text':'Ensure contractual provisions with ICT third-party providers include: SLAs, audit rights, exit strategies, data portability, incident cooperation','consequence':'Fines; mandatory contract renegotiation; supervisory orders','evidence_guide':'ICT contract register; contract review checklist; executed contract clauses','control_theme':'vendor_management'},
        {'id':'DORA-R006','text':'Maintain an updated register of all ICT third-party arrangements and report concentration risks','consequence':'Supervisory findings; fines; forced diversification','evidence_guide':'ICT third-party register; critical third-party assessment; concentration risk analysis','control_theme':'vendor_management'},
    ],

    'EU_AI_ACT': [
        {'id':'AIACT-R001','text':'Prohibit and cease use of AI systems classified as unacceptable risk: subliminal manipulation, social scoring by public authorities, real-time biometric identification in public spaces (with exceptions)','consequence':'Fines up to €35M or 7% global annual turnover','evidence_guide':'AI system inventory; prohibited AI classification assessment; system decommission records','control_theme':'risk_assessment'},
        {'id':'AIACT-R002','text':'For high-risk AI systems: establish risk management system, conduct conformity assessment before deployment, register in EU database','consequence':'Fines up to €15M or 3% global annual turnover; market withdrawal orders','evidence_guide':'Risk management system documentation; conformity assessment report; EU database registration number','control_theme':'risk_assessment'},
        {'id':'AIACT-R003','text':'For high-risk AI: implement data governance practices for training, validation, and testing datasets','consequence':'Fines; mandatory withdrawal; supervisory investigation','evidence_guide':'Dataset documentation; bias testing reports; data quality assessments; data governance policy','control_theme':'data_governance'},
        {'id':'AIACT-R004','text':'For high-risk AI: maintain technical documentation, logs, and enable human oversight throughout the system lifecycle','consequence':'Fines; market access restrictions','evidence_guide':'Technical documentation file; system logs; human oversight procedures; monitoring records','control_theme':'technical_controls'},
        {'id':'AIACT-R005','text':'GPAI model providers: comply with transparency obligations, copyright law, and publish summaries of training data','consequence':'Fines up to €15M or 3% global turnover for GPAI; systemic risk obligations for large models','evidence_guide':'Model documentation; training data summary; copyright compliance assessment','control_theme':'policy_procedures'},
        {'id':'AIACT-R006','text':'Providers of AI systems interacting with natural persons must disclose the AI nature to users, unless obvious from context','consequence':'Fines up to €7.5M or 1.5% global turnover','evidence_guide':'AI disclosure notices; chatbot system prompt logs; user interface design documentation','control_theme':'policy_procedures'},
    ],

    'PIPL': [
        {'id':'PIPL-R001','text':'Obtain separate, specific consent for each personal information processing purpose; consent must be voluntary and unambiguous','consequence':'Fines up to 5% of prior-year revenue; business suspension','evidence_guide':'Consent records; consent capture mechanisms; withdrawal records; consent management platform','control_theme':'data_governance'},
        {'id':'PIPL-R002','text':'Conduct Personal Information Protection Impact Assessments (PIPIAs) before high-risk processing including sensitive data, automated decisions, or cross-border transfers','consequence':'Fines; processing orders; suspension','evidence_guide':'PIPIA report templates; completed PIPIA records; review by Person-in-Charge','control_theme':'risk_assessment'},
        {'id':'PIPL-R003','text':'Designate a Person-in-Charge (PIC) for personal information protection within the organisation','consequence':'Fines; regulatory inspection','evidence_guide':'PIC appointment letter; PIC responsibilities documentation; reporting structure','control_theme':'policy_procedures'},
        {'id':'PIPL-R004','text':'For cross-border transfers: obtain prior CAC approval, pass a security assessment, or use standard contract (PIC); restricted transfers of "important data"','consequence':'Fines up to 5% revenue; data flow injunctions; business suspension','evidence_guide':'CAC approval certificates; security assessment report; executed SCCs; transfer records','control_theme':'vendor_management'},
        {'id':'PIPL-R005','text':'Notify individuals and competent authority within prescribed timeline following personal information security incidents','consequence':'Fines; regulatory investigation; reputational damage','evidence_guide':'Incident notification log; CAC/local authority submission receipts; individual notification records','control_theme':'incident_response'},
    ],

    'UK_GDPR': [
        {'id':'UKGDPR-R001','text':'Establish a lawful basis under UK GDPR for each processing activity; maintain a ROPA compliant with UK requirements','consequence':'ICO enforcement; fines up to £17.5M or 4% global turnover','evidence_guide':'UK ROPA; lawful basis documentation; LIA for legitimate interests; consent records','control_theme':'data_governance'},
        {'id':'UKGDPR-R002','text':'Report notifiable personal data breaches to the ICO within 72 hours; notify affected individuals when high risk','consequence':'ICO enforcement; fines up to £17.5M or 4% global turnover','evidence_guide':'Breach log; ICO notification receipts; individual notification records; breach assessment records','control_theme':'incident_response'},
        {'id':'UKGDPR-R003','text':'Ensure restricted transfers from the UK use an approved transfer mechanism: adequacy regulation, IDTA, UK addendum to EU SCCs, or binding corporate rules','consequence':'ICO enforcement; fines; processing suspension','evidence_guide':'Transfer mechanism documentation; IDTA or UK addendum copies; TRA (Transfer Risk Assessment)','control_theme':'vendor_management'},
        {'id':'UKGDPR-R004','text':'Appoint a UK GDPR Representative if processing UK resident data from outside the UK (and not exempt)','consequence':'ICO enforcement; fines','evidence_guide':'UK representative appointment record; designation documentation; ICO notification','control_theme':'policy_procedures'},
    ],

    'LGPD': [
        {'id':'LGPD-R001','text':'Establish a legal basis for each personal data processing activity from the 10 LGPD legal bases','consequence':'Fines up to 2% of Brazil revenues (max R$50M per violation); suspension of processing','evidence_guide':'Data processing register showing legal basis per activity; legitimate interest assessments','control_theme':'data_governance'},
        {'id':'LGPD-R002','text':'Designate a Data Protection Officer (Encarregado) and publish their contact details','consequence':'ANPD enforcement; reputational damage','evidence_guide':'DPO appointment record; contact details on company website; ANPD notification','control_theme':'policy_procedures'},
        {'id':'LGPD-R003','text':'Notify ANPD and data subjects of security incidents likely to cause significant harm within a reasonable period','consequence':'Fines; ANPD orders; reputational damage','evidence_guide':'Incident notification log; ANPD submission records; individual notification evidence','control_theme':'incident_response'},
    ],

    'HIPAA_SECURITY': [  # Maps to HIPAA id for enrichment
        # Already covered in HIPAA above
    ],

    'FCPA': [
        {'id':'FCPA-R001','text':'Prohibit payments of anything of value to foreign officials to obtain or retain business; anti-bribery prohibition applies to all issuers, domestic concerns, and agents acting in the US','consequence':'Criminal: corporations up to $2M/count; individuals up to $250K and 5 years imprisonment; DOJ/SEC civil penalties','evidence_guide':'Anti-bribery policy; third-party due diligence records; gift and hospitality log','control_theme':'policy_procedures'},
        {'id':'FCPA-R002','text':'Issuers must maintain books and records that accurately reflect all transactions (accounting provisions)','consequence':'Civil penalties; SEC enforcement; criminal liability','evidence_guide':'Financial controls documentation; internal audit workpapers; GL reconciliation records','control_theme':'financial_controls'},
        {'id':'FCPA-R003','text':'Implement adequate internal accounting controls to prevent and detect bribery payments','consequence':'SEC enforcement; deferred prosecution agreements; disgorgement','evidence_guide':'Internal controls assessment; SOX 404 mapping; compliance testing results','control_theme':'financial_controls'},
        {'id':'FCPA-R004','text':'Conduct adequate due diligence on third parties (agents, consultants, distributors) acting on behalf of the company in foreign markets','consequence':'Successor liability in M&A; prosecution for wilful blindness','evidence_guide':'Third-party due diligence questionnaires; background check reports; red flag escalation records','control_theme':'vendor_management'},
        {'id':'FCPA-R005','text':'Train all employees and agents in FCPA requirements, anti-bribery policy, and escalation procedures','consequence':'Reduced mitigation credit in DOJ/SEC investigations','evidence_guide':'Training completion records; training content; assessment results; refresher schedule','control_theme':'training_awareness'},
    ],

    'UK_BRIBERY': [
        {'id':'UKBRIB-R001','text':'Prevent bribery of and by associated persons — commercial organisations must have "adequate procedures" to prevent bribery','consequence':'Unlimited fine for organisation; up to 10 years imprisonment for individuals','evidence_guide':'Anti-bribery policy; six-step adequate procedures framework documentation; board commitment evidence','control_theme':'policy_procedures'},
        {'id':'UKBRIB-R002','text':'Do not offer, promise, or give a financial or other advantage to induce or reward improper performance','consequence':'Unlimited fine; 10 years imprisonment; SFO prosecution','evidence_guide':'Gifts and hospitality policy; gifts register; pre-approval records; escalation logs','control_theme':'policy_procedures'},
        {'id':'UKBRIB-R003','text':'Conduct proportionate risk assessment of bribery risks across business activities and geographies','consequence':'Inadequate procedures defence unavailable without risk assessment','evidence_guide':'Bribery risk assessment report; country/sector risk ratings; annual review records','control_theme':'risk_assessment'},
        {'id':'UKBRIB-R004','text':'Apply due diligence to individuals and entities who perform services on behalf of the organisation','consequence':'Prosecution of organisation for failure to prevent bribery','evidence_guide':'Third-party due diligence policy; DDQ responses; background checks; ongoing monitoring records','control_theme':'vendor_management'},
    ],

    'CSL': [  # China Cybersecurity Law
        {'id':'CSL-R001','text':'Network operators must collect, use, and protect personal information in accordance with law, user agreement, and principle of necessity','consequence':'Fines; suspension of business; revocation of licences','evidence_guide':'Data collection policy; minimization assessment; user agreement; privacy notice','control_theme':'data_governance'},
        {'id':'CSL-R002','text':'Implement tiered cybersecurity protection system (MLPS 2.0) — classify network systems and implement corresponding security measures','consequence':'Fines of CNY 50,000–500,000; suspension; licence revocation','evidence_guide':'MLPS classification certificate; protection level documentation; security assessment reports','control_theme':'technical_controls'},
        {'id':'CSL-R003','text':'Critical information infrastructure (CII) operators must store personal and important data within mainland China; security assessment required for cross-border transfer','consequence':'Fines; business suspension; criminal liability for senior management','evidence_guide':'CII designation documentation; data localisation evidence; CAC security assessment certificate','control_theme':'data_governance'},
        {'id':'CSL-R004','text':'Report cybersecurity incidents to the competent authority within prescribed timelines','consequence':'Fines; reputational damage; criminal liability','evidence_guide':'Incident log; MIIT/CNCERT notification records; incident response procedures','control_theme':'incident_response'},
    ],

    'PCI_DSS': [
        {'id':'PCI-R001','text':'Build and maintain a secure network: install and maintain a firewall configuration to protect cardholder data (Req. 1)','consequence':'Card brand fines $5,000–$100,000/month; loss of ability to process cards','evidence_guide':'Firewall configuration standards; network diagrams; quarterly firewall rule reviews','control_theme':'technical_controls'},
        {'id':'PCI-R002','text':'Do not use vendor-supplied defaults for system passwords and other security parameters (Req. 2)','consequence':'Card brand fines; breach liability','evidence_guide':'Hardening standards; system configuration baselines; change control records','control_theme':'technical_controls'},
        {'id':'PCI-R003','text':'Protect stored cardholder data using encryption, truncation, masking, or hashing (Req. 3)','consequence':'Card brand fines; breach notification obligations; forensic investigation costs','evidence_guide':'Data flow diagrams; cardholder data discovery scans; encryption implementation evidence','control_theme':'data_governance'},
        {'id':'PCI-R004','text':'Encrypt transmission of cardholder data across open, public networks (Req. 4)','consequence':'Card brand fines; breach liability','evidence_guide':'TLS configuration evidence; certificate management records; protocol scan results','control_theme':'technical_controls'},
        {'id':'PCI-R005','text':'Use and regularly update anti-virus software or programs (Req. 5)','consequence':'Card brand fines; audit findings','evidence_guide':'AV deployment records; version and signature update logs; exception handling records','control_theme':'technical_controls'},
        {'id':'PCI-R006','text':'Restrict access to cardholder data by business need-to-know; assign unique IDs to each person with computer access (Req. 7, 8)','consequence':'Card brand fines; breach liability','evidence_guide':'Access control policy; user access reviews; ID management records; MFA evidence','control_theme':'access_control'},
        {'id':'PCI-R007','text':'Track and monitor all access to network resources and cardholder data; retain audit logs for at least 12 months (Req. 10)','consequence':'Card brand fines; inability to investigate breaches','evidence_guide':'Log management policy; SIEM configuration; log retention evidence; review records','control_theme':'technical_controls'},
        {'id':'PCI-R008','text':'Regularly test security systems and processes: vulnerability scans, penetration tests, intrusion detection (Req. 11)','consequence':'Card brand fines; loss of certification','evidence_guide':'Quarterly ASV scan reports; annual pen test report; IDS/IPS configuration; remediation records','control_theme':'technical_controls'},
        {'id':'PCI-R009','text':'Maintain a policy that addresses information security for all personnel; conduct annual security awareness training (Req. 12)','consequence':'Card brand fines; audit non-compliance finding','evidence_guide':'Information security policy; annual review evidence; training completion records','control_theme':'training_awareness'},
    ],

    'SG_PDPA': [
        {'id':'SGPDPA-R001','text':'Obtain consent before collecting, using, or disclosing personal data; purpose must be notified before or at time of collection','consequence':'Financial penalty up to S$1M per contravention','evidence_guide':'Consent records; consent capture UI; purpose notification records; withdrawal records','control_theme':'data_governance'},
        {'id':'SGPDPA-R002','text':'Notify individuals of the purposes for which their data is collected, used, or disclosed','consequence':'Financial penalty; PDPC enforcement directions','evidence_guide':'Data protection notice; collection point disclosures; notification delivery logs','control_theme':'data_governance'},
        {'id':'SGPDPA-R003','text':'Protect personal data from unauthorised access, collection, use, disclosure, copying, modification, or disposal — by reasonable security arrangements','consequence':'Financial penalty up to S$1M; public reprimand','evidence_guide':'Security policy; risk assessment; encryption evidence; access control logs; ISO 27001 or equivalent','control_theme':'technical_controls'},
        {'id':'SGPDPA-R004','text':'Notify PDPC and affected individuals of data breaches that result, or are likely to result, in significant harm within 3 days (PDPC) / as soon as practicable (individuals)','consequence':'Financial penalty; PDPC enforcement action','evidence_guide':'Breach assessment records; PDPC notification receipts; individual notification records','control_theme':'incident_response'},
    ],

    'AUS_PRIVACY': [
        {'id':'AUS-R001','text':'Notify individuals of what personal information is collected and why at or before the time of collection (APP 5)','consequence':'OAIC investigation; civil penalties up to A$50M for serious or repeated breaches','evidence_guide':'Privacy policy; collection notice templates; delivery confirmation records','control_theme':'data_governance'},
        {'id':'AUS-R002','text':'Use and disclose personal information only for the primary purpose of collection, or a secondary purpose the individual would reasonably expect (APP 6)','consequence':'OAIC investigation; civil penalties','evidence_guide':'Data use register; secondary purpose justification records; consent records where applicable','control_theme':'data_governance'},
        {'id':'AUS-R003','text':'Take reasonable steps to protect personal information from misuse, interference, loss, and unauthorised access (APP 11)','consequence':'Civil penalties up to A$50M','evidence_guide':'Security risk assessment; technical and organisational controls documentation; incident history','control_theme':'technical_controls'},
        {'id':'AUS-R004','text':'Notify OAIC and affected individuals of eligible data breaches as soon as practicable (Notifiable Data Breaches scheme)','consequence':'Civil penalties for failure to notify; OAIC enforcement','evidence_guide':'Breach assessment log; NDB assessment records; OAIC notification receipts; individual notification','control_theme':'incident_response'},
    ],
}

# ─────────────────────────────────────────────
# Apply enrichments
# ─────────────────────────────────────────────
changed = 0

for reg in doc['regulations']:
    rid = reg['id']

    # 1. penalty_severity + enforcement_intensity
    ps, ei = RISK_DATA.get(rid, (2, 1))
    if reg.get('penalty_severity') != ps or reg.get('enforcement_intensity') != ei:
        reg['penalty_severity']      = ps
        reg['enforcement_intensity'] = ei
        changed += 1

    # 2. milestones[]
    if rid in MILESTONES and not reg.get('milestones'):
        reg['milestones'] = MILESTONES[rid]
        changed += 1

    # 3. Structured key_requirements
    if rid in STRUCTURED_REQS and STRUCTURED_REQS[rid]:
        existing = reg.get('key_requirements', [])
        # Only upgrade if currently strings (not yet structured)
        if existing and isinstance(existing[0], str):
            reg['key_requirements'] = STRUCTURED_REQS[rid]
            changed += 1
        elif not existing:
            reg['key_requirements'] = STRUCTURED_REQS[rid]
            changed += 1

doc['last_updated'] = '2026-06-10'

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(doc, f, indent=2, ensure_ascii=False)

print(f'Done. {changed} regulations enriched.')
print(f'Total regulations: {len(doc["regulations"])}')

# Summary
structured_count = sum(1 for r in doc['regulations']
                       if r.get('key_requirements') and isinstance(r['key_requirements'][0], dict))
milestone_count  = sum(1 for r in doc['regulations'] if r.get('milestones'))
risk_count       = sum(1 for r in doc['regulations'] if 'penalty_severity' in r)
print(f'  penalty_severity/enforcement_intensity: {risk_count} regulations')
print(f'  milestones[]:                           {milestone_count} regulations')
print(f'  structured key_requirements:            {structured_count} regulations')
