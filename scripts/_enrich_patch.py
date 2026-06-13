"""
Patch script: correct IDs and apply remaining milestones + structured requirements.
Run after _enrich_regulations.py
"""
import sys, json, os
sys.stdout.reconfigure(encoding='utf-8')

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(BASE, 'data', 'regulations.json')

with open(PATH, encoding='utf-8') as f:
    doc = json.load(f)

regs = {r['id']: r for r in doc['regulations']}

# Fix risk data for IDs that didn't match first time
RISK_FIXES = {
    'AI_ACT':                 (5, 2),
    'CHINA_CSL':              (4, 2),
    'CHINA_DSL':              (4, 2),
    'US_FCPA':                (5, 3),
    'UK_BRIBERY_ACT':         (5, 3),
    'UK_MODERN_SLAVERY':      (3, 2),
    'UK_ENVIRONMENT_ACT':     (3, 1),
    'INDIA_DPDPA':            (3, 1),
    'AUSTRALIA_PRIVACY_ACT':  (3, 2),
    'AUSTRALIA_MODERN_SLAVERY':(3, 1),
    'SINGAPORE_PDPA':         (3, 2),
    'SINGAPORE_CSA':          (3, 2),
    'SINGAPORE_PCA':          (4, 2),
    'SOUTH_KOREA_PIPA':       (4, 2),
    'SOUTH_KOREA_SAPA':       (3, 2),
    'MEXICO_GLAR':            (3, 1),
    'MEXICO_LFPDPPP':         (2, 1),
    'POPIA':                  (3, 1),
    'THAILAND_PDPA':          (3, 1),
    'MALAYSIA_PDPA':          (2, 1),
    'PHILIPPINES_DPA':        (3, 1),
    'VIETNAM_PDPD':           (2, 1),
    'INDONESIA_PDP':          (3, 1),
    'TURKEY_KVKK':            (3, 2),
    'SWITZERLAND_FADP':       (3, 2),
    'RUSSIA_152FZ':           (3, 2),
    'UKRAINE_LPPD':           (2, 1),
    'EU_FUELEU':              (3, 2),
    'IMO_HKC':                (3, 1),
    'FRANCE_SAPIN2':          (4, 2),
    'US_CTA':                 (3, 2),
    'BOI_357':                (3, 2),
    'BRAZIL_CVM193':          (3, 2),
    'GERMANY_LKSG':           (3, 2),
    'CANADA_FORCED_LABOUR':   (3, 1),
    'SPAIN_WHISTLEBLOWING':   (3, 1),
    'NZ_PRIVACY_ACT':         (3, 2),
    'HONG_KONG_PDPO':         (3, 2),
    'PPL_ISRAEL':             (3, 2),
    'ISRAEL_AML':             (3, 2),
    'ISRAEL_CYBER':           (3, 2),
    'ISA_CYBER_IL':           (3, 2),
    'MALAYSIA_MACC':          (4, 2),
    'ITALY_D231':             (4, 2),
    'UAE_PDPL':               (3, 1),
    'EGYPT_PDPL':             (2, 1),
    'GHANA_DPA':              (2, 1),
    'KENYA_DPA':              (2, 1),
    'RWANDA_DPPPA':           (2, 1),
    'MOROCCO_L0908':          (2, 1),
    'NDPA':                   (2, 1),
    'FICA_SA':                (3, 2),
    'CMISA_CYBER':            (3, 2),
    'CMMC':                   (3, 2),
    'NYDFS_500':              (4, 3),
    'SEC_CYBER_2023':         (4, 3),
    'FISMA':                  (3, 2),
    'OSFI_B13':               (3, 2),
    'AUSTRALIA_CYBER_ACT':    (3, 2),
    'AUSTRALIA_AMLCTF':       (4, 2),
    'AUSTRALIA_SOCI':         (3, 2),
    'ILLINOIS_BIPA':          (4, 3),
    'COLORADO_CPA':           (3, 2),
    'VIRGINIA_CDPA':          (3, 2),
    'QUEBEC_LAW25':           (3, 2),
    'PIPEDA':                 (2, 2),
    'CASL':                   (3, 2),
    'IL_COMPUTER_LAW':        (3, 2),
    'ARGENTINA_PDPA':         (2, 2),
    'CHILE_DPL':              (2, 1),
    'COLOMBIA_L1581':         (2, 1),
    'ECUADOR_LOPDP':          (2, 1),
    'URUGUAY_L18331':         (2, 1),
    'IMO_MARPOL':             (3, 2),
    'IMO_BWM':                (2, 2),
    'IMO_ISM':                (3, 2),
    'IMO_ISPS':               (3, 2),
    'IMO_MLC':                (3, 2),
    'IMO_SOLAS':              (3, 2),
    'EU_ICS2':                (3, 2),
    'US_OSRA':                (3, 2),
    'US_UFLPA':               (4, 3),
    'CHINA_ECL':              (4, 2),
    'SA_PRECCA':              (4, 2),
    'CANADA_CFPOA':           (4, 2),
    'BRAZIL_CCA':             (3, 2),
}

for rid, (ps, ei) in RISK_FIXES.items():
    if rid in regs:
        regs[rid]['penalty_severity']      = ps
        regs[rid]['enforcement_intensity'] = ei

# Milestones with correct IDs
MILESTONES = {
    'AI_ACT': [
        {'date':'2024-08-01','label':'Act enters into force','status':'completed'},
        {'date':'2025-02-02','label':'Prohibited AI practices banned','status':'completed'},
        {'date':'2025-08-02','label':'GPAI model provider obligations apply','status':'completed'},
        {'date':'2026-08-02','label':'High-risk AI (Annex I) obligations apply','status':'upcoming'},
        {'date':'2027-08-02','label':'All high-risk AI (Annex III) obligations apply','status':'upcoming'},
    ],
    'INDIA_DPDPA': [
        {'date':'2023-08-11','label':'Act receives presidential assent','status':'completed'},
        {'date':'2025-06-01','label':'Rules notified by Ministry of IT','status':'completed'},
        {'date':'2026-06-01','label':'Full enforcement begins','status':'upcoming'},
    ],
    'SOUTH_KOREA_PIPA': [
        {'date':'2023-09-15','label':'Amended PIPA enters into force','status':'completed'},
        {'date':'2024-03-15','label':'Stricter pseudonymisation requirements apply','status':'completed'},
        {'date':'2025-09-15','label':'Enhanced cross-border transfer mechanisms apply','status':'upcoming'},
    ],
    'EU_FUELEU': [
        {'date':'2023-10-09','label':'Regulation enters into force','status':'completed'},
        {'date':'2025-01-01','label':'Reporting period begins for 2025 fuel data','status':'completed'},
        {'date':'2030-01-01','label':'Minimum 6% GHG intensity reduction target','status':'upcoming'},
        {'date':'2035-01-01','label':'Minimum 14.5% GHG intensity reduction target','status':'upcoming'},
        {'date':'2040-01-01','label':'Minimum 31% GHG intensity reduction target','status':'upcoming'},
    ],
    'AUSTRALIA_PRIVACY_ACT': [
        {'date':'1988-12-17','label':'Privacy Act enacted','status':'completed'},
        {'date':'2022-12-13','label':'Penalty increases to A$50M enacted','status':'completed'},
        {'date':'2024-09-12','label':'Privacy Act Review reforms tabled in Parliament','status':'completed'},
        {'date':'2026-01-01','label':'Anticipated commencement of reformed Privacy Act','status':'upcoming'},
    ],
}

# Already have GDPR, NIS2, DORA, EU_CSRD, EU_CSDDD, HIPAA, US_CTA milestones from first run?
# Check and add if missing
MILESTONES_KEEP = {
    'GDPR': [
        {'date':'2016-04-27','label':'Regulation published in Official Journal','status':'completed'},
        {'date':'2018-05-25','label':'Full application date','status':'completed'},
        {'date':'2024-09-01','label':'EU-US Data Privacy Framework operational','status':'completed'},
    ],
    'NIS2': [
        {'date':'2023-01-16','label':'Directive enters into force','status':'completed'},
        {'date':'2024-10-17','label':'Member state transposition deadline','status':'completed'},
        {'date':'2026-01-01','label':'All member states expected to have supervisory frameworks','status':'upcoming'},
    ],
    'DORA': [
        {'date':'2023-01-16','label':'Regulation enters into force','status':'completed'},
        {'date':'2025-01-17','label':'Full application — ICT risk, incident reporting, TPPR, testing','status':'completed'},
        {'date':'2025-07-17','label':'First annual TLPT cycle commences for significant entities','status':'upcoming'},
    ],
    'EU_CSRD': [
        {'date':'2024-01-01','label':'Large public-interest entities (500+ employees) — FY2024 reporting','status':'completed'},
        {'date':'2025-01-01','label':'Large EU companies not previously subject to NFRD','status':'upcoming'},
        {'date':'2026-01-01','label':'Listed SMEs and small non-complex credit institutions','status':'upcoming'},
    ],
    'EU_CSDDD': [
        {'date':'2024-07-25','label':'Directive enters into force','status':'completed'},
        {'date':'2026-07-26','label':'Member state transposition deadline','status':'upcoming'},
        {'date':'2027-07-26','label':'Largest EU companies (>€1.5B turnover, 5000+ employees)','status':'upcoming'},
        {'date':'2028-07-26','label':'EU companies >€900M turnover, 3000+ employees','status':'upcoming'},
        {'date':'2029-07-26','label':'Full application — all in-scope companies','status':'upcoming'},
    ],
    'HIPAA': [
        {'date':'2003-04-14','label':'Privacy Rule compliance deadline','status':'completed'},
        {'date':'2005-04-20','label':'Security Rule compliance deadline','status':'completed'},
        {'date':'2024-04-22','label':'Updated Security Rule NPRM published','status':'completed'},
        {'date':'2025-07-01','label':'Proposed updated Security Rule compliance deadline','status':'upcoming'},
    ],
    'US_CTA': [
        {'date':'2024-01-01','label':'Beneficial ownership reporting begins (pre-2024 entities)','status':'completed'},
        {'date':'2025-01-13','label':'Court injunction lifted — enforcement resumed','status':'completed'},
        {'date':'2025-03-21','label':'New reporting deadline under FinCEN interim rule','status':'upcoming'},
    ],
}
MILESTONES.update(MILESTONES_KEEP)

for rid, ms in MILESTONES.items():
    if rid in regs and not regs[rid].get('milestones'):
        regs[rid]['milestones'] = ms

# Structured key_requirements — remaining regs with correct IDs
STRUCTURED_REQS = {
    'AI_ACT': [
        {'id':'AIACT-R001','text':'Identify and cease any use of prohibited AI systems (subliminal manipulation, social scoring, real-time remote biometric ID in public spaces without exception)','consequence':'Fines up to €35M or 7% global annual turnover','evidence_guide':'AI system inventory; prohibited AI classification assessment; decommission records','control_theme':'risk_assessment'},
        {'id':'AIACT-R002','text':'For high-risk AI systems: establish a risk management system and conduct a conformity assessment before market placement or putting into service','consequence':'Fines up to €15M or 3% global annual turnover; market withdrawal orders','evidence_guide':'Risk management system documentation; conformity assessment report; EU database registration','control_theme':'risk_assessment'},
        {'id':'AIACT-R003','text':'For high-risk AI: implement data governance practices for training, validation, and testing datasets including bias testing','consequence':'Fines; mandatory withdrawal from market','evidence_guide':'Dataset documentation; bias testing reports; data quality assessments','control_theme':'data_governance'},
        {'id':'AIACT-R004','text':'For high-risk AI: maintain technical documentation, generate logs automatically, and enable meaningful human oversight','consequence':'Fines; market access restrictions; supervisory investigation','evidence_guide':'Technical documentation file; logging configuration; human oversight procedures','control_theme':'technical_controls'},
        {'id':'AIACT-R005','text':'GPAI model providers must comply with transparency obligations, copyright law, and publish training data summaries','consequence':'Fines up to €15M or 3% global turnover; systemic risk obligations for frontier models','evidence_guide':'Model technical documentation; training data summary; copyright compliance assessment','control_theme':'policy_procedures'},
        {'id':'AIACT-R006','text':'Disclose to users when they are interacting with an AI system unless the context makes it obvious','consequence':'Fines up to €7.5M or 1.5% global turnover','evidence_guide':'AI disclosure notices; chatbot/voice bot disclosure logs; UI design evidence','control_theme':'policy_procedures'},
    ],
    'US_FCPA': [
        {'id':'FCPA-R001','text':'Prohibit payments of anything of value to foreign officials to obtain or retain business; apply to all issuers, domestic concerns, and agents acting in the US','consequence':'Criminal: corporations up to $2M per count; individuals up to $250K and 5 years imprisonment; unlimited civil penalties','evidence_guide':'Anti-bribery policy; gift and hospitality register; third-party payment logs','control_theme':'policy_procedures'},
        {'id':'FCPA-R002','text':'Issuers must maintain books and records that accurately reflect all transactions in reasonable detail (accounting provisions)','consequence':'SEC enforcement; disgorgement; civil penalties','evidence_guide':'GL reconciliation records; internal audit workpapers; financial controls documentation','control_theme':'financial_controls'},
        {'id':'FCPA-R003','text':'Implement and maintain a system of internal accounting controls sufficient to prevent and detect bribery','consequence':'SEC enforcement; deferred prosecution agreements','evidence_guide':'Internal controls assessment; SOX 404 mapping; control testing results','control_theme':'financial_controls'},
        {'id':'FCPA-R004','text':'Conduct adequate due diligence on all third parties (agents, consultants, distributors) acting on behalf of the company in foreign markets','consequence':'Successor liability in M&A; prosecution for wilful blindness','evidence_guide':'Third-party DDQ responses; background check reports; red flag escalation records','control_theme':'vendor_management'},
        {'id':'FCPA-R005','text':'Train all employees and third-party agents on FCPA requirements, anti-bribery policy, and escalation procedures','consequence':'Reduced mitigation credit in DOJ/SEC investigations','evidence_guide':'Training completion records; content; assessment results; refresher schedule','control_theme':'training_awareness'},
    ],
    'UK_BRIBERY_ACT': [
        {'id':'UKBRIB-R001','text':'Commercial organisations must have "adequate procedures" in place to prevent bribery by associated persons','consequence':'Unlimited fine for organisation; up to 10 years imprisonment for individuals','evidence_guide':'Anti-bribery policy; six-step adequate procedures documentation; board commitment evidence','control_theme':'policy_procedures'},
        {'id':'UKBRIB-R002','text':'Prohibit offering, promising, or giving a financial or other advantage to induce improper performance','consequence':'Unlimited fine; 10 years imprisonment; SFO prosecution','evidence_guide':'Gifts register; pre-approval records; hospitality log; escalation log','control_theme':'policy_procedures'},
        {'id':'UKBRIB-R003','text':'Conduct a proportionate risk assessment of bribery risks across business activities and geographies','consequence':'Adequate procedures defence unavailable without documented risk assessment','evidence_guide':'Bribery risk assessment report; country risk ratings; annual review records','control_theme':'risk_assessment'},
        {'id':'UKBRIB-R004','text':'Conduct due diligence on individuals and entities who perform services on behalf of the organisation','consequence':'Prosecution of organisation for failure to prevent bribery by associated person','evidence_guide':'Third-party due diligence policy; DDQ responses; background checks; ongoing monitoring','control_theme':'vendor_management'},
    ],
    'CHINA_CSL': [
        {'id':'CSL-R001','text':'Collect and use personal information only with user consent, for lawful purposes, and on a necessity principle','consequence':'Fines of CNY 50,000–500,000; suspension of business; licence revocation','evidence_guide':'Data collection policy; user agreement; privacy notice; minimisation assessment','control_theme':'data_governance'},
        {'id':'CSL-R002','text':'Classify network infrastructure and implement the Multi-Level Protection Scheme (MLPS 2.0) for your network security tier','consequence':'Fines; suspension; licence revocation; criminal liability for executives','evidence_guide':'MLPS classification certificate; protection documentation; security assessment reports','control_theme':'technical_controls'},
        {'id':'CSL-R003','text':'Critical Information Infrastructure operators must store personal information and important data within mainland China','consequence':'Fines; business suspension; criminal liability for senior management','evidence_guide':'CII designation documents; data localisation architecture evidence; CAC assessment certificate','control_theme':'data_governance'},
        {'id':'CSL-R004','text':'Report network security incidents to the competent authority within prescribed timelines','consequence':'Fines; reputational damage; criminal liability','evidence_guide':'Incident log; MIIT/CNCERT notification records; incident response procedures','control_theme':'incident_response'},
    ],
    'SINGAPORE_PDPA': [
        {'id':'SGPDPA-R001','text':'Obtain consent and notify individuals of purposes before or at the time of collecting personal data','consequence':'Financial penalty up to S$1M per contravention','evidence_guide':'Consent records; consent capture UI evidence; purpose notification records','control_theme':'data_governance'},
        {'id':'SGPDPA-R002','text':'Protect personal data with reasonable security arrangements against unauthorised access, collection, use, disclosure, or disposal','consequence':'Financial penalty up to S$1M; public reprimand by PDPC','evidence_guide':'Security policy; risk assessment; encryption evidence; access control logs','control_theme':'technical_controls'},
        {'id':'SGPDPA-R003','text':'Notify PDPC within 3 days and affected individuals as soon as practicable of a data breach resulting in significant harm','consequence':'Financial penalty; PDPC enforcement action','evidence_guide':'Breach assessment records; PDPC notification receipts; individual notification evidence','control_theme':'incident_response'},
        {'id':'SGPDPA-R004','text':'Appoint a Data Protection Officer (DPO) and make their business contact details publicly available','consequence':'PDPC advisory; financial penalty','evidence_guide':'DPO appointment record; website/intranet contact details; DPO responsibilities document','control_theme':'policy_procedures'},
    ],
    'AUSTRALIA_PRIVACY_ACT': [
        {'id':'AUS-R001','text':'Notify individuals of what personal information is collected and why at or before the time of collection (APP 5)','consequence':'OAIC investigation; civil penalties up to A$50M for serious or repeated breaches','evidence_guide':'Privacy policy; collection notice templates; delivery confirmation records','control_theme':'data_governance'},
        {'id':'AUS-R002','text':'Use and disclose personal information only for the primary purpose of collection or a reasonably expected secondary purpose (APP 6)','consequence':'OAIC investigation; civil penalties up to A$50M','evidence_guide':'Data use register; secondary purpose justification records; consent records','control_theme':'data_governance'},
        {'id':'AUS-R003','text':'Take reasonable steps to protect personal information from misuse, interference, loss, and unauthorised access, disclosure, or modification (APP 11)','consequence':'Civil penalties up to A$50M; OAIC enforcement','evidence_guide':'Security risk assessment; technical and organisational controls evidence; incident history','control_theme':'technical_controls'},
        {'id':'AUS-R004','text':'Notify OAIC and affected individuals of eligible data breaches as soon as practicable (Notifiable Data Breaches scheme)','consequence':'Civil penalties for failure to notify; OAIC enforcement','evidence_guide':'Breach assessment log; NDB assessment records; OAIC notification receipts','control_theme':'incident_response'},
    ],
    'PIPL': [
        {'id':'PIPL-R001','text':'Obtain separate, specific, and voluntary consent for each personal information processing purpose; consent must be given in clear and unambiguous terms','consequence':'Fines up to 5% of prior-year revenue; business suspension; delisting from app stores','evidence_guide':'Consent records; consent UI capture; withdrawal records; consent management platform','control_theme':'data_governance'},
        {'id':'PIPL-R002','text':'Conduct Personal Information Protection Impact Assessments (PIPIAs) before high-risk processing (sensitive data, automated decisions, cross-border transfers)','consequence':'Fines; processing halt orders; suspension','evidence_guide':'PIPIA templates; completed assessments; review by designated Person-in-Charge','control_theme':'risk_assessment'},
        {'id':'PIPL-R003','text':'Designate a Person-in-Charge (PIC) for personal information protection','consequence':'Fines; regulatory inspection; enforcement orders','evidence_guide':'PIC appointment letter; responsibilities documentation; reporting structure','control_theme':'policy_procedures'},
        {'id':'PIPL-R004','text':'For cross-border data transfers: obtain CAC approval, pass a security assessment, or use standard contracts; restrictions apply to important data','consequence':'Fines up to 5% revenue; data flow injunctions; business suspension','evidence_guide':'CAC approval certificates; security assessment report; executed SCCs; transfer records','control_theme':'vendor_management'},
        {'id':'PIPL-R005','text':'Notify individuals and competent authority within prescribed timeline of personal information security incidents','consequence':'Fines; CAC investigation; reputational damage','evidence_guide':'Incident notification log; authority submission receipts; individual notification records','control_theme':'incident_response'},
    ],
    'SOX': [
        {'id':'SOX-R001','text':'CEO and CFO must personally certify accuracy and completeness of periodic financial reports (Section 302)','consequence':'Criminal penalties up to $5M and 20 years imprisonment for false certifications','evidence_guide':'Signed Section 302 certifications; sub-certifications from business unit leaders','control_theme':'board_governance'},
        {'id':'SOX-R002','text':'Assess and report on the effectiveness of Internal Controls over Financial Reporting (ICFR) annually (Section 404)','consequence':'SEC enforcement; financial restatements; shareholder litigation; exchange delisting','evidence_guide':'Management ICFR assessment; external auditor attestation; control testing workpapers','control_theme':'financial_controls'},
        {'id':'SOX-R003','text':'Maintain disclosure controls and procedures ensuring material information is collected and reported to certifying officers','consequence':'SEC enforcement; D&O liability; restatements','evidence_guide':'Disclosure committee charters; meeting minutes; controls inventory; remediation tracker','control_theme':'policy_procedures'},
        {'id':'SOX-R004','text':'Audit committee must consist entirely of independent directors; at least one must be a financial expert','consequence':'Exchange delisting; SEC enforcement; investor litigation','evidence_guide':'Board composition records; independence declarations; financial expert designation','control_theme':'board_governance'},
        {'id':'SOX-R005','text':'Retain all audit-related records for seven years; prohibit alteration or destruction during investigations (Section 802)','consequence':'Criminal obstruction charges up to 20 years; evidence spoliation sanctions','evidence_guide':'Records retention policy; legal hold procedures; destruction prohibition logs','control_theme':'data_governance'},
    ],
    'NYDFS_500': [
        {'id':'NYDFS-R001','text':'Establish and maintain a cybersecurity programme based on an annual risk assessment','consequence':'DFS enforcement; consent orders; fines; licence actions','evidence_guide':'Annual risk assessment report; cybersecurity programme documentation; board approval','control_theme':'risk_assessment'},
        {'id':'NYDFS-R002','text':'Designate a Chief Information Security Officer (CISO) responsible for cybersecurity programme','consequence':'DFS enforcement; programme deficiency finding','evidence_guide':'CISO appointment; annual CISO board report; role responsibilities','control_theme':'board_governance'},
        {'id':'NYDFS-R003','text':'Implement multi-factor authentication for remote access and privileged account access','consequence':'DFS enforcement; consent orders','evidence_guide':'MFA deployment records; privileged access inventory; authentication policy','control_theme':'access_control'},
        {'id':'NYDFS-R004','text':'Notify DFS within 72 hours of a cybersecurity event that has a reasonable likelihood of materially affecting operations or involving NPI','consequence':'DFS enforcement; reputational damage','evidence_guide':'Incident log; DFS notification receipts; incident classification methodology','control_theme':'incident_response'},
        {'id':'NYDFS-R005','text':'Conduct annual penetration testing and bi-annual vulnerability assessments','consequence':'DFS examination findings; enforcement','evidence_guide':'Penetration test reports; vulnerability scan results; remediation tracking','control_theme':'technical_controls'},
    ],
    'SEC_CYBER_2023': [
        {'id':'SECCYBER-R001','text':'Disclose material cybersecurity incidents on Form 8-K within 4 business days of determining materiality','consequence':'SEC enforcement; D&O liability; securities fraud claims','evidence_guide':'Materiality assessment records; 8-K filings; incident classification documentation','control_theme':'incident_response'},
        {'id':'SECCYBER-R002','text':'Annually disclose cybersecurity risk management, strategy, and governance in Form 10-K','consequence':'SEC enforcement; restatement risk; investor claims','evidence_guide':'Annual 10-K cybersecurity disclosure; board oversight evidence; risk management programme description','control_theme':'board_governance'},
        {'id':'SECCYBER-R003','text':'Disclose the board of directors\' oversight of cybersecurity risks and management\'s role in assessing and managing those risks','consequence':'SEC enforcement; shareholder litigation','evidence_guide':'Board committee charters; meeting minutes with cybersecurity agenda items; management reporting structure','control_theme':'board_governance'},
    ],
    'LGPD': [
        {'id':'LGPD-R001','text':'Establish a legal basis for each personal data processing activity from the 10 LGPD legal bases','consequence':'Fines up to 2% of Brazil revenues (max R$50M per violation); suspension of processing','evidence_guide':'Data processing register with legal basis per activity; legitimate interest assessments','control_theme':'data_governance'},
        {'id':'LGPD-R002','text':'Designate a Data Protection Officer (Encarregado) and publish their contact details publicly','consequence':'ANPD enforcement; reputational damage','evidence_guide':'DPO appointment record; website contact details; ANPD notification','control_theme':'policy_procedures'},
        {'id':'LGPD-R003','text':'Notify ANPD and data subjects of security incidents likely to cause significant harm within a reasonable period','consequence':'Fines; ANPD enforcement orders; reputational damage','evidence_guide':'Incident notification log; ANPD submission receipts; individual notification evidence','control_theme':'incident_response'},
        {'id':'LGPD-R004','text':'Respect data subject rights: access, correction, anonymisation, portability, deletion, information on sharing, and right to object','consequence':'Fines; ANPD enforcement; private litigation','evidence_guide':'DSR handling procedures; response time logs; fulfilment documentation','control_theme':'data_governance'},
    ],
    'ITALY_D231': [
        {'id':'D231-R001','text':'Adopt an Organisational, Management and Control Model (Modello 231) to prevent predicate offences by company personnel','consequence':'Administrative fines; disqualification from contracts; seizure of profits; reputational damage','evidence_guide':'Adopted Modello 231 document; board resolution; model review dates','control_theme':'policy_procedures'},
        {'id':'D231-R002','text':'Appoint an independent Supervisory Body (Organismo di Vigilanza) to oversee implementation of the Model','consequence':'Absence of OdV removes the shield of organisational liability defence','evidence_guide':'OdV appointment; OdV meeting minutes; annual OdV report to board','control_theme':'board_governance'},
        {'id':'D231-R003','text':'Implement a whistleblowing channel allowing confidential reporting of potential offences under D.Lgs. 231/2001','consequence':'Weakened liability defence; Spain Whistleblowing non-compliance parallel','evidence_guide':'Whistleblowing channel documentation; confidentiality procedures; report investigation records','control_theme':'policy_procedures'},
    ],
    'FRANCE_SAPIN2': [
        {'id':'SAPIN-R001','text':'Entities with 500+ employees and €100M+ turnover must implement an anti-corruption compliance programme (8 prescribed measures)','consequence':'AFA enforcement; fines up to €200K for individuals and €1M for entities; compulsory compliance programme order','evidence_guide':'Anti-corruption programme documentation; all 8 measure implementation evidence','control_theme':'policy_procedures'},
        {'id':'SAPIN-R002','text':'Establish a risk mapping identifying and prioritising corruption risks exposure','consequence':'AFA enforcement; programme inadequacy finding','evidence_guide':'Risk mapping report; risk assessment methodology; annual review records','control_theme':'risk_assessment'},
        {'id':'SAPIN-R003','text':'Implement a secure and confidential whistleblowing alert system','consequence':'AFA enforcement; Sapin II non-compliance finding','evidence_guide':'Alert system documentation; confidentiality procedures; investigation handling records','control_theme':'policy_procedures'},
        {'id':'SAPIN-R004','text':'Conduct due diligence on third parties (clients, suppliers, intermediaries) presenting corruption risk','consequence':'AFA enforcement; programme inadequacy','evidence_guide':'Third-party due diligence procedures; DDQ responses; risk-based screening records','control_theme':'vendor_management'},
    ],
}

changed = 0
for rid, reqs in STRUCTURED_REQS.items():
    if rid not in regs:
        print(f'  WARN: {rid} not found in database')
        continue
    existing = regs[rid].get('key_requirements', [])
    if existing and isinstance(existing[0], str):
        regs[rid]['key_requirements'] = reqs
        changed += 1
    elif not existing:
        regs[rid]['key_requirements'] = reqs
        changed += 1
    else:
        print(f'  SKIP: {rid} already has structured requirements')

for rid, ms in MILESTONES.items():
    if rid not in regs:
        continue
    if not regs[rid].get('milestones'):
        regs[rid]['milestones'] = ms
        changed += 1

doc['last_updated'] = '2026-06-10'
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(doc, f, indent=2, ensure_ascii=False)

structured = sum(1 for r in doc['regulations']
                 if r.get('key_requirements') and isinstance(r['key_requirements'][0], dict))
milestones = sum(1 for r in doc['regulations'] if r.get('milestones'))
print(f'Patch done. {changed} items updated.')
print(f'  structured key_requirements: {structured} regulations')
print(f'  milestones[]:                {milestones} regulations')
