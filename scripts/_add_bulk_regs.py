"""Add all regulations from the two Excel files that are not yet in the system."""
import json, sys, os

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE = os.path.join(os.path.dirname(__file__), "..")
reg_path = os.path.join(BASE, "data", "regulations.json")
map_path = os.path.join(BASE, "data", "mappings.json")

with open(reg_path, encoding="utf-8") as f:
    regs_doc = json.load(f)
with open(map_path, encoding="utf-8") as f:
    maps_doc = json.load(f)

EU_COUNTRIES = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR",
                "HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK",
                "SI","ES","SE","IS","LI","NO"]

NEW_REGS = [

# ── DATA PRIVACY — Asia-Pacific ──────────────────────────────────────────
{
    "id": "SINGAPORE_PDPA",
    "name": "Singapore Personal Data Protection Act 2012",
    "short_name": "Singapore PDPA",
    "domain": ["data_privacy"],
    "jurisdiction": "Republic of Singapore",
    "enforcement_region": "singapore",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["SG"]},
    "status": "active", "effective_date": "2014-07-02",
    "authority": "Personal Data Protection Commission (PDPC)",
    "url": "https://www.pdpc.gov.sg/Overview-of-PDPA/The-Legislation/Personal-Data-Protection-Act",
    "summary": "Singapore's primary data protection law governing the collection, use, disclosure, and care of personal data. Major 2020 amendments introduced mandatory breach notification within 3 days for significant breaches, data portability, enhanced consent exceptions, and increased financial penalties up to 10% of annual turnover.",
    "key_requirements": [
        "Obtain consent before collecting, using, or disclosing personal data",
        "Provide notification of purpose at or before point of data collection",
        "Mandatory data breach notification to PDPC within 3 calendar days if significant impact",
        "Implement reasonable security arrangements to prevent unauthorised access",
        "Appoint a Data Protection Officer (DPO) responsible for ensuring compliance",
        "Honour data access and correction requests from individuals",
        "Retain personal data only as long as necessary for business or legal purposes",
        "Transfer data overseas only to countries with comparable protection or with contractual safeguards"
    ],
    "penalties": "Up to SGD 1 million or 10% of annual Singapore turnover (whichever is higher) for significant breaches",
    "tags": ["singapore","data_privacy","pdpc","dpo","breach_notification","apac"]
},
{
    "id": "JAPAN_APPI",
    "name": "Act on the Protection of Personal Information (APPI) — 2022 Amendment",
    "short_name": "Japan APPI",
    "domain": ["data_privacy"],
    "jurisdiction": "Japan",
    "enforcement_region": "japan",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["JP"]},
    "status": "active", "effective_date": "2022-04-01",
    "authority": "Personal Information Protection Commission (PPC)",
    "url": "https://www.ppc.go.jp/en/legal/",
    "summary": "Japan's comprehensive personal information protection law, substantially amended in April 2022 to strengthen individual rights, introduce opt-out requirements for third-party transfers, mandatory breach reporting, and extraterritorial application. APPI establishes a balanced framework aligning with GDPR while reflecting Japanese business practices.",
    "key_requirements": [
        "Specify and disclose the purpose of use at or before the time of personal information collection",
        "Obtain explicit opt-in consent before third-party disclosure of personal data",
        "Notify PPC and affected individuals when a breach meets the threshold (500+ records or sensitive data)",
        "Honour data subject rights: access, correction, deletion, and third-party disclosure suspension",
        "Cross-border data transfers require consent or use of contractual safeguards with equivalent protection",
        "Implement appropriate security management measures proportionate to risk",
        "Maintain records of third-party transfer and receipt of personal data",
        "Foreign businesses that handle personal information of Japanese individuals are subject to APPI"
    ],
    "penalties": "Up to JPY 100 million corporate fine; up to 1 year imprisonment for individuals for unlawful use",
    "tags": ["japan","data_privacy","ppc","appi","breach_notification","apac","cross_border"]
},
{
    "id": "INDIA_DPDPA",
    "name": "Digital Personal Data Protection Act 2023",
    "short_name": "India DPDPA",
    "domain": ["data_privacy"],
    "jurisdiction": "Republic of India",
    "enforcement_region": "india",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["IN"]},
    "status": "active", "effective_date": "2023-08-11",
    "authority": "Data Protection Board of India",
    "url": "https://www.meity.gov.in/data-protection-framework",
    "summary": "India's landmark data protection legislation enacted in August 2023. Applies a consent-based framework for processing personal data of Indian residents. Establishes the Data Protection Board as the enforcement authority, introduces significant financial penalties, and creates obligations for Data Fiduciaries (controllers) including Significant Data Fiduciaries. Implementing rules are being developed.",
    "key_requirements": [
        "Obtain free, specific, informed, and unambiguous consent before processing personal data",
        "Provide clear notice of purpose, data collected, and individual rights before seeking consent",
        "Honour data principal rights: access, correction, erasure, and grievance redressal",
        "Report personal data breaches to the Data Protection Board and affected individuals",
        "Appoint a Data Protection Officer for Significant Data Fiduciaries",
        "Conduct Data Protection Impact Assessments for Significant Data Fiduciaries",
        "Data localisation requirements for certain categories — to be defined by government",
        "Restrictions on processing children's data (under 18) without parental consent"
    ],
    "penalties": "Up to INR 250 crore (approx USD 30 million) per violation; higher for Significant Data Fiduciaries",
    "tags": ["india","data_privacy","dpdpa","data_fiduciary","breach_notification","south_asia"]
},
{
    "id": "SOUTH_KOREA_PIPA",
    "name": "Personal Information Protection Act (PIPA) — 2023 Amendment",
    "short_name": "South Korea PIPA",
    "domain": ["data_privacy"],
    "jurisdiction": "Republic of Korea",
    "enforcement_region": "south_korea",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["KR"]},
    "status": "active", "effective_date": "2023-09-15",
    "authority": "Personal Information Protection Commission (PIPC)",
    "url": "https://www.pipc.go.kr/np/default/page.do?mCode=D010010000",
    "summary": "South Korea's comprehensive data protection law enforced by the Personal Information Protection Commission. The 2023 amendment introduced extraterritorial jurisdiction for foreign businesses processing Korean residents' data, mobile-aligned data portability rights, strengthened breach notification, and pseudonymisation provisions aligned with GDPR principles.",
    "key_requirements": [
        "Collect personal information only for a specified and legitimate purpose with individual consent",
        "Limit collection to minimum personal information necessary for the purpose",
        "Notify individuals and PIPC of personal data breaches without delay",
        "Honour data subject rights: access, correction, deletion, and processing restriction",
        "Appoint a Privacy Protection Officer (CPO) responsible for data management",
        "Implement technical and physical security measures appropriate to risk",
        "Obtain separate consent and notify PIPC before transferring personal data abroad",
        "Maintain records of processing activities and disposal of personal information"
    ],
    "penalties": "Fines up to KRW 30 billion or 3% of annual global revenue; up to 2 years imprisonment for intentional violations",
    "tags": ["south_korea","data_privacy","pipc","pipa","cpo","apac","cross_border"]
},
{
    "id": "THAILAND_PDPA",
    "name": "Thailand Personal Data Protection Act 2019",
    "short_name": "Thailand PDPA",
    "domain": ["data_privacy"],
    "jurisdiction": "Kingdom of Thailand",
    "enforcement_region": "southeast_asia",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["TH"]},
    "status": "active", "effective_date": "2022-06-01",
    "authority": "Personal Data Protection Committee (PDPC)",
    "url": "https://www.pdpc.or.th/",
    "summary": "Thailand's GDPR-inspired data protection law, effective for all sectors from June 2022 after COVID-related delays. Requires consent-based processing, data subject rights, DPO appointment for certain controllers, breach notification within 72 hours, and cross-border transfer protections.",
    "key_requirements": [
        "Obtain explicit consent from data subjects before processing personal data",
        "Inform data subjects of the purpose, type, and use of data collection at the time of collection",
        "Notify the PDPC and data subjects of data breaches within 72 hours of becoming aware",
        "Honour data subject rights: access, portability, rectification, erasure, and restriction",
        "Appoint a Data Protection Officer if processing large-scale or sensitive data",
        "Ensure cross-border data transfers are to adequate countries or use contractual protections",
        "Maintain records of processing activities (ROPA)",
        "Conduct Data Protection Impact Assessments for high-risk processing activities"
    ],
    "penalties": "Administrative fines up to THB 5 million; criminal penalties up to 1 year imprisonment for certain offences",
    "tags": ["thailand","data_privacy","pdpc","dpo","breach_notification","southeast_asia"]
},
{
    "id": "MALAYSIA_PDPA",
    "name": "Malaysia Personal Data Protection Act 2010",
    "short_name": "Malaysia PDPA",
    "domain": ["data_privacy"],
    "jurisdiction": "Malaysia",
    "enforcement_region": "southeast_asia",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["MY"]},
    "status": "active", "effective_date": "2013-11-15",
    "authority": "Department of Personal Data Protection (JPDP)",
    "url": "https://www.pdp.gov.my/",
    "summary": "Malaysia's Personal Data Protection Act 2010 governs the processing of personal data in commercial transactions. Based on seven data protection principles. 2024 amendments introduced mandatory security breach notification and enhanced requirements for data processor contracts.",
    "key_requirements": [
        "Process personal data only with consent or on another lawful basis",
        "Notify individuals of the purpose of data processing at point of collection",
        "Implement security measures to protect personal data from loss, misuse, or unauthorised access",
        "Notify JPDP of data security breaches (mandatory under 2024 amendment)",
        "Register as a data user with JPDP if processing in regulated sectors",
        "Honour data subject rights: access and correction of personal data",
        "Ensure cross-border data transfers are to approved countries or with contractual protections",
        "Retain personal data only as long as necessary and ensure secure disposal"
    ],
    "penalties": "Fines up to MYR 500,000 and/or imprisonment up to 3 years for violations",
    "tags": ["malaysia","data_privacy","jpdp","pdpa","southeast_asia","breach_notification"]
},
{
    "id": "PHILIPPINES_DPA",
    "name": "Philippines Data Privacy Act of 2012",
    "short_name": "Philippines DPA",
    "domain": ["data_privacy"],
    "jurisdiction": "Republic of the Philippines",
    "enforcement_region": "southeast_asia",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["PH"]},
    "status": "active", "effective_date": "2016-09-09",
    "authority": "National Privacy Commission (NPC)",
    "url": "https://www.privacy.gov.ph/",
    "summary": "The Philippines Data Privacy Act 2012 (Republic Act 10173) establishes comprehensive data protection obligations for government agencies and private entities processing personal information. Modeled on EU principles, it requires DPO registration with the NPC, breach notification within 72 hours, and implements data subject rights.",
    "key_requirements": [
        "Process personal information lawfully, fairly, and with consent or legal basis",
        "Register Data Protection Officers with the National Privacy Commission (NPC)",
        "Notify NPC and affected individuals of data breaches within 72 hours",
        "Implement organisational, physical, and technical security measures proportionate to nature of data",
        "Honour data subject rights: access, rectification, erasure, and objection",
        "Conduct Privacy Impact Assessments before implementing new high-risk processing systems",
        "Impose contractual data protection obligations on third-party processors",
        "Data transfer abroad requires adequacy finding or contractual safeguards"
    ],
    "penalties": "Imprisonment 1-6 years and fines up to PHP 5 million depending on offence type",
    "tags": ["philippines","data_privacy","npc","dpa","dpo","breach_notification","southeast_asia"]
},
{
    "id": "VIETNAM_PDPD",
    "name": "Vietnam Personal Data Protection Decree 13/2023/ND-CP",
    "short_name": "Vietnam PDPD",
    "domain": ["data_privacy"],
    "jurisdiction": "Socialist Republic of Vietnam",
    "enforcement_region": "southeast_asia",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["VN"]},
    "status": "active", "effective_date": "2023-07-01",
    "authority": "Ministry of Public Security (MPS) — A05 Department",
    "url": "https://dataprotection.gov.vn/",
    "summary": "Vietnam's first comprehensive personal data protection regulation, effective July 2023. Introduces broad data subject rights, consent requirements, data transfer restrictions, and a data localisation obligation for sensitive data. Foreign companies processing Vietnamese citizens' data must appoint a local representative and register with the Ministry of Public Security.",
    "key_requirements": [
        "Obtain clear, voluntary, and specific consent before processing personal data",
        "Distinguish between basic and sensitive personal data with stronger protections for sensitive categories",
        "Notify individuals and authorities of data breaches within 72 hours",
        "Honour data subject rights: access, correction, deletion, objection, and portability",
        "Cross-border data transfers require explicit consent and impact assessment submitted to A05",
        "Sensitive personal data (financial, health, biometric) must be stored on servers within Vietnam",
        "Foreign businesses must appoint a representative in Vietnam",
        "Conduct Data Protection Impact Assessments for high-risk processing activities"
    ],
    "penalties": "Administrative fines; criminal liability for intentional violations under Cybersecurity Law",
    "tags": ["vietnam","data_privacy","mps","a05","data_localisation","southeast_asia"]
},
{
    "id": "INDONESIA_PDP",
    "name": "Indonesia Personal Data Protection Law (UU PDP 2022)",
    "short_name": "Indonesia PDP Law",
    "domain": ["data_privacy"],
    "jurisdiction": "Republic of Indonesia",
    "enforcement_region": "southeast_asia",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["ID"]},
    "status": "active", "effective_date": "2024-10-17",
    "authority": "Ministry of Communication and Informatics (Kominfo) / Personal Data Protection Agency",
    "url": "https://www.kominfo.go.id/",
    "summary": "Indonesia's Personal Data Protection Law (Law No. 27/2022) passed in October 2022, with full enforcement from October 2024 after a 2-year transition. GDPR-influenced, it establishes data subject rights, controller and processor obligations, breach notification, international transfer rules, and a dedicated Personal Data Protection Agency.",
    "key_requirements": [
        "Process personal data only with consent or other lawful basis",
        "Notify data subjects of purpose, type, and legal basis at collection",
        "Mandatory data breach notification to authorities and data subjects within 14 calendar days",
        "Honour data subject rights: access, correction, deletion, portability, and objection",
        "Appoint a Data Protection Officer for high-risk or large-scale processing",
        "Conduct Privacy Impact Assessments for high-risk processing activities",
        "Cross-border transfers require coordination agreements or contractual safeguards",
        "Retain personal data only as long as necessary for stated purpose"
    ],
    "penalties": "Administrative sanctions up to 2% of annual revenue; criminal penalties up to IDR 60 billion",
    "tags": ["indonesia","data_privacy","kominfo","pdp","southeast_asia","breach_notification"]
},
{
    "id": "HONG_KONG_PDPO",
    "name": "Hong Kong Personal Data (Privacy) Ordinance",
    "short_name": "HK PDPO",
    "domain": ["data_privacy"],
    "jurisdiction": "Hong Kong SAR",
    "enforcement_region": "southeast_asia",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["HK"]},
    "status": "active", "effective_date": "2021-10-05",
    "authority": "Privacy Commissioner for Personal Data (PCPD)",
    "url": "https://www.pcpd.org.hk/",
    "summary": "Hong Kong's Personal Data (Privacy) Ordinance (Cap. 486), substantially amended in October 2021 to criminalise doxxing and enhance the PCPD's powers. Applies six Data Protection Principles covering data collection, accuracy, retention, use, security, and access. The PCPD can issue enforcement notices and initiate criminal prosecution for doxxing.",
    "key_requirements": [
        "Collect personal data by lawful and fair means for a specified and lawful purpose",
        "Retain personal data no longer than necessary for the purpose of collection",
        "Use personal data for the purpose for which it was collected or a directly related purpose",
        "Implement appropriate security measures to prevent unauthorised access or processing",
        "Inform data subjects of their right to access and correct personal data",
        "Prohibit doxxing: disclosing personal information to intimidate or harass individuals (criminal offence since 2021)",
        "Regulate direct marketing use of personal data with strict opt-in requirements",
        "Cross-border data transfers are subject to adequate protection requirements"
    ],
    "penalties": "Fines up to HKD 1 million and up to 5 years imprisonment for doxxing offences; enforcement notices for other violations",
    "tags": ["hong_kong","data_privacy","pcpd","pdpo","doxxing","southeast_asia"]
},
{
    "id": "NZ_PRIVACY_ACT",
    "name": "New Zealand Privacy Act 2020",
    "short_name": "NZ Privacy Act",
    "domain": ["data_privacy"],
    "jurisdiction": "New Zealand",
    "enforcement_region": "new_zealand",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["NZ"]},
    "status": "active", "effective_date": "2020-12-01",
    "authority": "Office of the Privacy Commissioner (OPC)",
    "url": "https://www.privacy.org.nz/privacy-act-2020/",
    "summary": "New Zealand's Privacy Act 2020 replaced the 1993 Act, modernising the framework with 13 Information Privacy Principles, mandatory breach notification, enhanced enforcement powers, and cross-border data transfer obligations. Aligns closely with Australia's Privacy Act and incorporates elements of GDPR.",
    "key_requirements": [
        "Collect personal information only for a lawful purpose connected to your functions",
        "Collect information directly from the individual where practicable",
        "Notify individuals of the purpose of collection and their rights at or before collection",
        "Mandatory privacy breach notification to OPC and affected individuals when harm is likely",
        "Store personal information securely and protect against unauthorised access",
        "Honour access and correction rights — respond within 20 working days",
        "Only use personal information for the purpose collected unless an exception applies",
        "Ensure overseas transfers only to countries with comparable privacy protection"
    ],
    "penalties": "Civil proceedings; fines up to NZD 10,000 for individuals; up to NZD 75,000 for organisations for offences",
    "tags": ["new_zealand","data_privacy","opc","privacy_act","apac","breach_notification"]
},
{
    "id": "TURKEY_KVKK",
    "name": "Turkey Law on the Protection of Personal Data (KVKK No. 6698)",
    "short_name": "Turkey KVKK",
    "domain": ["data_privacy"],
    "jurisdiction": "Republic of Turkey",
    "enforcement_region": "europe_other",
    "geography": {"type": "national", "regions": ["MENA"], "countries": ["TR"]},
    "status": "active", "effective_date": "2016-04-07",
    "authority": "Personal Data Protection Authority (KVKK)",
    "url": "https://www.kvkk.gov.tr/",
    "summary": "Turkey's Law No. 6698 on the Protection of Personal Data (KVKK), modeled on GDPR, governs the processing of personal data by natural and legal persons. Requires registration of data controllers in the VERBIS registry, lawful processing, data subject rights, and explicit consent for sensitive personal data categories.",
    "key_requirements": [
        "Register as a data controller in the VERBIS (Data Controllers Registry) system",
        "Process personal data only on a lawful basis (explicit consent or legal justification)",
        "Obtain explicit consent for processing special categories of personal data (health, biometric, criminal)",
        "Honour data subject rights: access, correction, deletion, objection, and data portability",
        "Appoint a Personal Data Protection Officer or designate responsible persons",
        "Implement appropriate technical and organisational measures to prevent unauthorised processing",
        "Notify KVKK and data subjects of data breaches as soon as possible",
        "Cross-border data transfers require adequate protection or explicit consent and KVKK approval"
    ],
    "penalties": "Administrative fines up to TRY 1 million; criminal penalties including imprisonment under Turkish Penal Code",
    "tags": ["turkey","data_privacy","kvkk","verbis","data_controller","europe_other"]
},
{
    "id": "SWITZERLAND_FADP",
    "name": "Switzerland Revised Federal Act on Data Protection (nFADP/revDSG)",
    "short_name": "Switzerland FADP",
    "domain": ["data_privacy"],
    "jurisdiction": "Swiss Confederation",
    "enforcement_region": "europe_other",
    "geography": {"type": "national", "regions": ["Europe"], "countries": ["CH"]},
    "status": "active", "effective_date": "2023-09-01",
    "authority": "Federal Data Protection and Information Commissioner (FDPIC)",
    "url": "https://www.edoeb.admin.ch/edoeb/en/home/the-fdpic/tasks/data-protection.html",
    "summary": "Switzerland's revised Federal Act on Data Protection (nFADP, revDSG), effective September 2023, modernises Swiss data protection law to align with GDPR standards while maintaining Swiss-specific elements. Introduces privacy by design and default, mandatory breach notification, data protection impact assessments, and enhanced individual rights.",
    "key_requirements": [
        "Process personal data lawfully, in good faith, and proportionately to the declared purpose",
        "Implement privacy by design and privacy by default from the outset",
        "Notify FDPIC and affected individuals of data security breaches as soon as possible",
        "Conduct Data Protection Impact Assessments (DPIAs) for high-risk processing activities",
        "Maintain records of processing activities for organisations processing personal data systematically",
        "Honour data subject rights: access, correction, erasure, restriction, and data portability",
        "Ensure adequate data protection before transferring personal data abroad",
        "Designate a data protection representative in Switzerland for foreign companies targeting Swiss residents"
    ],
    "penalties": "Criminal fines up to CHF 250,000 for intentional violations; unlike GDPR, penalties are on individuals not organisations",
    "tags": ["switzerland","data_privacy","fadp","fdpic","gdpr_aligned","europe_other"]
},
{
    "id": "RUSSIA_152FZ",
    "name": "Russia Federal Law No. 152-FZ on Personal Data",
    "short_name": "Russia 152-FZ",
    "domain": ["data_privacy"],
    "jurisdiction": "Russian Federation",
    "enforcement_region": "europe_other",
    "geography": {"type": "national", "regions": ["Europe"], "countries": ["RU"]},
    "status": "active", "effective_date": "2011-07-01",
    "authority": "Roskomnadzor (Federal Service for Supervision in the Sphere of Telecom, IT and Mass Communications)",
    "url": "https://pd.rkn.gov.ru/",
    "summary": "Russia Federal Law No. 152-FZ on Personal Data, as amended, mandates that personal data of Russian citizens must be stored on servers within Russia (data localisation). Operators must register with Roskomnadzor, implement security measures, obtain consent, and respond to subject access requests. Significant fines and website blocking are enforcement tools.",
    "key_requirements": [
        "Store all personal data of Russian citizens on servers physically located within Russia",
        "Register as a personal data operator with Roskomnadzor before commencing data processing",
        "Obtain written consent from data subjects for processing personal data",
        "Implement organisational and technical security measures scaled to data sensitivity level",
        "Notify Roskomnadzor of data security incidents within 24 hours",
        "Destroy or anonymise personal data within 30 days of fulfilling the purpose of processing",
        "Honour data subject rights: access, rectification, erasure, and withdrawal of consent",
        "Cross-border data transfers are restricted; data must first be stored in Russia"
    ],
    "penalties": "Administrative fines significantly increased in 2023 — up to RUB 500 million for data breaches; website blocking for non-compliance with localisation",
    "tags": ["russia","data_privacy","roskomnadzor","data_localisation","152fz","europe_other"]
},
{
    "id": "UKRAINE_LPPD",
    "name": "Ukraine Law on Protection of Personal Data No. 2297-VI",
    "short_name": "Ukraine Personal Data Law",
    "domain": ["data_privacy"],
    "jurisdiction": "Ukraine",
    "enforcement_region": "europe_other",
    "geography": {"type": "national", "regions": ["Europe"], "countries": ["UA"]},
    "status": "active", "effective_date": "2011-01-01",
    "authority": "Parliament Commissioner for Human Rights (Ombudsman)",
    "url": "https://www.ombudsman.gov.ua/en/",
    "summary": "Ukraine's Law on Protection of Personal Data (No. 2297-VI) governs the collection, processing, and storage of personal data. Aligns with Council of Europe Convention 108. Requires consent-based processing, data subject rights, database registration, and cross-border transfer protections.",
    "key_requirements": [
        "Obtain consent or establish another legal basis before processing personal data",
        "Register personal data databases with the State Service of Special Communications",
        "Implement technical and organisational measures to protect personal data",
        "Honour data subject rights: access, correction, blocking, and deletion",
        "Notify data subjects of any processing activities affecting their rights",
        "Restrict cross-border transfers to countries with adequate data protection",
        "Appoint a responsible person for personal data protection",
        "Comply with Council of Europe Convention 108 requirements"
    ],
    "penalties": "Administrative fines and potential criminal liability for severe violations",
    "tags": ["ukraine","data_privacy","ombudsman","europe_other","convention108"]
},

# ── ANTI-CORRUPTION ───────────────────────────────────────────────────────
{
    "id": "US_FCPA",
    "name": "Foreign Corrupt Practices Act (FCPA)",
    "short_name": "US FCPA",
    "domain": ["anti_corruption", "finance"],
    "jurisdiction": "United States of America",
    "enforcement_region": "us_federal",
    "geography": {"type": "national", "regions": ["Americas"], "countries": ["US"]},
    "status": "active", "effective_date": "1977-12-19",
    "authority": "U.S. Department of Justice (DOJ) and Securities and Exchange Commission (SEC)",
    "url": "https://www.justice.gov/criminal-fraud/foreign-corrupt-practices-act",
    "summary": "The Foreign Corrupt Practices Act prohibits US persons and issuers from bribing foreign government officials to obtain or retain business. It applies to US companies and citizens worldwide, as well as foreign companies listed on US exchanges. The FCPA also includes accounting provisions requiring accurate books and internal controls.",
    "key_requirements": [
        "Prohibition on offering, paying, or authorising bribes to foreign government officials",
        "Maintain books and records that accurately reflect transactions (no off-books accounts)",
        "Implement a system of internal accounting controls sufficient to prevent improper payments",
        "Conduct due diligence on third-party agents, distributors, and joint venture partners",
        "Establish a compliance programme with clear anti-bribery policies and procedures",
        "Provide FCPA compliance training to employees and third parties",
        "Implement gifts, entertainment, and hospitality approval processes",
        "Conduct periodic risk assessments and internal audits of high-risk markets and relationships"
    ],
    "penalties": "Corporate fines up to twice the benefit obtained; individuals up to USD 5 million fine and 5 years imprisonment; SEC can impose disgorgement and civil penalties",
    "tags": ["us","anti_corruption","fcpa","doj","sec","anti_bribery","international"]
},
{
    "id": "UK_BRIBERY_ACT",
    "name": "UK Bribery Act 2010",
    "short_name": "UK Bribery Act",
    "domain": ["anti_corruption"],
    "jurisdiction": "United Kingdom",
    "enforcement_region": "uk",
    "geography": {"type": "national", "regions": ["Europe"], "countries": ["GB"]},
    "status": "active", "effective_date": "2011-07-01",
    "authority": "Serious Fraud Office (SFO) and Crown Prosecution Service (CPS)",
    "url": "https://www.justice.gov.uk/legislation/bribery",
    "summary": "The UK Bribery Act 2010 is one of the world's strictest anti-bribery laws. It criminalises active and passive bribery, bribery of foreign public officials, and — uniquely — the failure of commercial organisations to prevent bribery by associated persons. The 'adequate procedures' defence requires organisations to implement genuine anti-bribery controls.",
    "key_requirements": [
        "Prohibition on offering, promising, or giving bribes to any person (public or private sector)",
        "Prohibition on requesting, agreeing to receive, or accepting a bribe",
        "Prohibition on bribing foreign public officials to obtain a business advantage",
        "Corporate offence of failing to prevent bribery by associated persons — strict liability",
        "Implement 'adequate procedures': proportionate policies, top-level commitment, risk assessment, due diligence, communication, and monitoring",
        "Conduct third-party due diligence on agents, distributors, and joint venture partners",
        "Maintain gifts, hospitality, and facilitation payment approval processes",
        "Extraterritorial reach: applies to UK companies and partnerships regardless of where bribery occurs"
    ],
    "penalties": "Unlimited corporate fines; individuals up to 10 years imprisonment; debarment from public contracts",
    "tags": ["uk","anti_corruption","bribery_act","sfo","adequate_procedures","extraterritorial"]
},
{
    "id": "FRANCE_SAPIN2",
    "name": "France Sapin II Law — Anti-Corruption and Transparency",
    "short_name": "France Sapin II",
    "domain": ["anti_corruption", "finance"],
    "jurisdiction": "French Republic",
    "enforcement_region": "eu",
    "geography": {"type": "national", "regions": ["Europe"], "countries": ["FR"]},
    "status": "active", "effective_date": "2016-12-09",
    "authority": "Agence Française Anticorruption (AFA)",
    "url": "https://www.agence-francaise-anticorruption.gouv.fr/",
    "summary": "France's Sapin II Law imposes mandatory anti-corruption compliance programmes on large companies (500+ employees, €100M+ turnover). Enforced by the Agence Française Anticorruption (AFA), it requires a specific eight-pillar compliance programme. AFA can conduct controls and impose sanctions without criminal proceedings.",
    "key_requirements": [
        "Implement an eight-pillar anti-corruption programme: code of conduct, whistleblowing system, risk mapping, third-party due diligence, accounting controls, training, disciplinary system, internal audit",
        "Create and maintain a bribery risk map identifying exposure across business activities",
        "Conduct enhanced due diligence on third parties presenting a high bribery risk",
        "Implement and operate an effective internal whistleblowing channel",
        "Provide annual anti-corruption training to employees exposed to risk",
        "Senior management must personally oversee and attest to the compliance programme",
        "Submit to periodic AFA controls and provide access to documentation",
        "Applies to French entities and subsidiaries of groups with 500+ employees and €100M+ global turnover"
    ],
    "penalties": "AFA injunctions; personal liability of executive: fines up to EUR 200,000; corporate fines up to EUR 1 million; judicial public compliance monitoring",
    "tags": ["france","anti_corruption","sapin2","afa","eu","compliance_programme","risk_mapping"]
},
{
    "id": "MALAYSIA_MACC",
    "name": "Malaysia Anti-Corruption Commission Act 2009 — Section 17A Corporate Liability",
    "short_name": "Malaysia MACC Act 17A",
    "domain": ["anti_corruption"],
    "jurisdiction": "Malaysia",
    "enforcement_region": "southeast_asia",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["MY"]},
    "status": "active", "effective_date": "2020-06-01",
    "authority": "Malaysian Anti-Corruption Commission (MACC)",
    "url": "https://www.sprm.gov.my/index.php",
    "summary": "Section 17A of Malaysia's Anti-Corruption Commission Act 2009, effective June 2020, introduces corporate liability for corruption by associated persons. Organisations can avoid liability by proving 'adequate procedures' were in place. The Guidelines on Adequate Procedures (T.R.U.S.T.) provide the compliance framework.",
    "key_requirements": [
        "Implement T.R.U.S.T. adequate procedures: Top-level commitment, Risk assessment, Undertake control measures, Systematic review, Training and communication",
        "Top management must actively lead and endorse anti-corruption culture",
        "Conduct enterprise-wide corruption risk assessment and document findings",
        "Implement controls proportionate to identified risks including third-party due diligence",
        "Establish whistleblowing and grievance reporting mechanisms",
        "Provide regular anti-corruption training tailored to roles and risk exposure",
        "Undertake periodic reviews and audits of the anti-corruption programme effectiveness",
        "Ensure contractors, agents, and subsidiaries are subject to equivalent standards"
    ],
    "penalties": "Corporate fine of not less than 10 times the value of the gratification or MYR 1 million (whichever is higher); individual imprisonment up to 20 years",
    "tags": ["malaysia","anti_corruption","macc","section_17a","adequate_procedures","southeast_asia"]
},
{
    "id": "ITALY_D231",
    "name": "Italy Legislative Decree 231/2001 — Corporate Administrative Liability",
    "short_name": "Italy Decree 231/2001",
    "domain": ["anti_corruption", "finance"],
    "jurisdiction": "Italian Republic",
    "enforcement_region": "eu",
    "geography": {"type": "national", "regions": ["Europe"], "countries": ["IT"]},
    "status": "active", "effective_date": "2001-06-04",
    "authority": "Italian Judicial Authorities (Public Prosecutor's Offices)",
    "url": "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2001-06-08;231",
    "summary": "Italy's Legislative Decree 231/2001 establishes administrative liability for legal entities for certain crimes (including corruption, fraud, market manipulation, environmental crimes) committed by directors, employees, or persons under their control. Organisations can avoid liability by demonstrating an effective Organisational, Management, and Control Model (Modello 231) was in place.",
    "key_requirements": [
        "Adopt an Organisational, Management and Control Model (Modello 231) tailored to identified crime risks",
        "Establish a Supervisory Board (Organismo di Vigilanza - OdV) independent from management",
        "OdV must monitor compliance with and adequacy of the Model 231",
        "Implement a risk mapping covering all predicate offences relevant to the organisation",
        "Create and maintain an internal whistleblowing channel",
        "Develop a disciplinary system for violations of the Model 231",
        "Ensure training on Model 231 obligations for all relevant employees",
        "Review and update the Model 231 whenever significant changes occur in organisation or risk profile"
    ],
    "penalties": "Administrative sanctions: fines up to EUR 1.5 million; temporary suspension of business activities; disqualification from public contracts; confiscation of profits",
    "tags": ["italy","anti_corruption","decree_231","odv","modello_231","eu","corporate_liability"]
},
{
    "id": "BRAZIL_CCA",
    "name": "Brazil Clean Company Act (Lei Anticorrupcao No. 12.846/2013)",
    "short_name": "Brazil Clean Company Act",
    "domain": ["anti_corruption", "finance"],
    "jurisdiction": "Federative Republic of Brazil",
    "enforcement_region": "brazil",
    "geography": {"type": "national", "regions": ["Americas"], "countries": ["BR"]},
    "status": "active", "effective_date": "2014-01-29",
    "authority": "Comptroller General of the Union (CGU) and Attorney General's Office (AGU)",
    "url": "https://www.gov.br/cgu/pt-br/assuntos/responsabilizacao-de-empresas/lei-anticorrupcao",
    "summary": "Brazil's Clean Company Act (Lei 12.846/2013) introduces strict corporate liability for acts of corruption against national or foreign public administrations. Companies can receive fine reductions of up to 4% by demonstrating an effective integrity programme. The Leniency Agreement mechanism allows voluntary disclosure in exchange for reduced penalties.",
    "key_requirements": [
        "Prohibit offering or paying bribes to public officials for business advantage",
        "Prohibit financing or sponsoring acts of corruption",
        "Implement a corporate integrity programme covering risk mapping, code of conduct, training, and third-party due diligence",
        "Establish a confidential reporting channel for suspected violations",
        "Conduct enhanced due diligence on agents, consultants, and government-facing third parties",
        "Maintain accurate financial records and internal controls",
        "Consider leniency agreement mechanism for voluntary disclosure to CGU",
        "Ensure anti-corruption obligations flow down to subsidiaries and controlled companies"
    ],
    "penalties": "Administrative fines from 0.1% to 20% of annual gross revenue; extraordinary fines of up to BRL 60 million if revenue cannot be determined; debarment from public contracts",
    "tags": ["brazil","anti_corruption","cgu","clean_company_act","leniency","integrity_programme"]
},
{
    "id": "CANADA_CFPOA",
    "name": "Canada Corruption of Foreign Public Officials Act (CFPOA)",
    "short_name": "Canada CFPOA",
    "domain": ["anti_corruption"],
    "jurisdiction": "Canada",
    "enforcement_region": "canada",
    "geography": {"type": "national", "regions": ["Americas"], "countries": ["CA"]},
    "status": "active", "effective_date": "1998-02-14",
    "authority": "Royal Canadian Mounted Police (RCMP) and Public Prosecution Service of Canada",
    "url": "https://laws-lois.justice.gc.ca/eng/acts/C-45.2/",
    "summary": "Canada's Corruption of Foreign Public Officials Act criminalises the bribery of foreign public officials by Canadian companies and individuals. Amended in 2013 to remove the facilitation payments exception and introduce a nationality-based jurisdiction. Canada is a signatory to the OECD Anti-Bribery Convention.",
    "key_requirements": [
        "Prohibition on offering or paying bribes to foreign public officials to obtain or retain business",
        "Prohibition on possessing or hiding property that is proceeds of bribery",
        "Maintain accurate books and records — prohibits accounting offences that obscure bribery",
        "Extraterritorial reach: applies to Canadians and Canadian companies operating anywhere in the world",
        "No exception for facilitation payments (removed by 2013 amendment)",
        "Implement an anti-corruption compliance programme covering due diligence, training, and monitoring",
        "Conduct risk assessments for operations in high-risk jurisdictions",
        "Provide anti-corruption training to employees and representatives in high-risk roles"
    ],
    "penalties": "Individuals: up to 14 years imprisonment; corporations: unlimited fines; debarment from government contracts",
    "tags": ["canada","anti_corruption","cfpoa","rcmp","oecd_convention","extraterritorial"]
},
{
    "id": "MEXICO_GLAR",
    "name": "Mexico General Law of Administrative Responsibilities (LGRA)",
    "short_name": "Mexico LGRA",
    "domain": ["anti_corruption"],
    "jurisdiction": "United Mexican States",
    "enforcement_region": "latam",
    "geography": {"type": "national", "regions": ["Americas"], "countries": ["MX"]},
    "status": "active", "effective_date": "2017-07-19",
    "authority": "Secretariat of Anti-Corruption and Good Governance (SABG) / Superior Audit Office (ASF)",
    "url": "https://www.gob.mx/sfp",
    "summary": "Mexico's General Law of Administrative Responsibilities (LGRA) creates a system for preventing and sanctioning corruption involving public officials and private parties. Part of the National Anti-Corruption System, it introduces corporate liability for participating in corruption acts and incentivises compliance programmes with fine reductions.",
    "key_requirements": [
        "Prohibition on private parties offering bribes, gifts, or undue benefits to public officials",
        "Corporate liability for participation in serious administrative offences by related persons",
        "Integrity programmes can reduce sanctions: code of conduct, training, compliance officer, reporting channels, whistleblower protections",
        "Prohibition on influencing public officials' decisions through improper means",
        "Due diligence on government-facing third parties and supply chain partners",
        "Maintain controls over government contracts, permits, and licensing activities",
        "Cooperate with anti-corruption investigations; self-reporting can reduce penalties",
        "Annual integrity programme review and risk assessment"
    ],
    "penalties": "Corporate fines up to 2x the benefit obtained or up to 2% of annual revenue; temporary or permanent debarment from government contracts",
    "tags": ["mexico","anti_corruption","lgra","sabg","integrity_programme","latam"]
},
{
    "id": "SA_PRECCA",
    "name": "South Africa Prevention and Combating of Corrupt Activities Act (PRECCA)",
    "short_name": "SA PRECCA",
    "domain": ["anti_corruption"],
    "jurisdiction": "Republic of South Africa",
    "enforcement_region": "africa",
    "geography": {"type": "national", "regions": ["Africa"], "countries": ["ZA"]},
    "status": "active", "effective_date": "2004-04-27",
    "authority": "Directorate for Priority Crime Investigation (Hawks) / National Prosecuting Authority",
    "url": "https://www.gov.za/documents/prevention-and-combating-corrupt-activities-act",
    "summary": "South Africa's PRECCA creates a general offence of corruption applicable to any person and introduces a duty to report corrupt activities on persons in positions of authority. It targets bribery, extortion, fraud, money laundering, and procurement fraud in both public and private sectors.",
    "key_requirements": [
        "General corruption offence: prohibition on any gratification that improperly influences any person",
        "Specific offences for public officers, foreign public officials, agents, and members of the public",
        "Duty to report: persons in authority who know or suspect corruption must report to SAPS",
        "Failure to report corruption is itself a criminal offence",
        "Maintain anti-corruption policies, procedures, and training for employees",
        "Due diligence on agents, contractors, and public-sector-facing third parties",
        "Implement and maintain a whistleblowing and reporting channel",
        "Register on the National Register for Tender Defaulters if convicted"
    ],
    "penalties": "Up to 15 years imprisonment; fines; asset forfeiture; blacklisting from public procurement",
    "tags": ["south_africa","anti_corruption","precca","hawks","duty_to_report","africa"]
},
{
    "id": "SINGAPORE_PCA",
    "name": "Singapore Prevention of Corruption Act (PCA)",
    "short_name": "Singapore PCA",
    "domain": ["anti_corruption"],
    "jurisdiction": "Republic of Singapore",
    "enforcement_region": "singapore",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["SG"]},
    "status": "active", "effective_date": "1960-06-17",
    "authority": "Corrupt Practices Investigation Bureau (CPIB)",
    "url": "https://www.cpib.gov.sg/",
    "summary": "Singapore's Prevention of Corruption Act enforced by the CPIB is one of the most effective anti-corruption frameworks in the world, contributing to Singapore's top global anti-corruption rankings. Covers both public and private sector corruption. CPIB operates independently with extensive investigative powers.",
    "key_requirements": [
        "Prohibition on offering, receiving, or soliciting corrupt gratification in public and private sectors",
        "Prohibition on corrupt acts involving agents and principals (private sector bribery)",
        "Prohibition on bribing public officials — Singapore's clean government reputation is legally enforced",
        "Implement effective anti-corruption policies and controls",
        "Conduct due diligence on agents, distributors, and partners operating in high-risk jurisdictions",
        "Provide anti-corruption training to employees especially in high-risk roles",
        "Gifts and hospitality policies must be clearly defined and enforced",
        "Cooperate with CPIB investigations — obstruction is a criminal offence"
    ],
    "penalties": "Fines up to SGD 100,000 and/or imprisonment up to 5 years per offence",
    "tags": ["singapore","anti_corruption","pca","cpib","public_sector","private_sector"]
},

# ── ESG / SUSTAINABILITY ──────────────────────────────────────────────────
{
    "id": "EU_CSRD",
    "name": "EU Corporate Sustainability Reporting Directive (CSRD) 2022/2464",
    "short_name": "EU CSRD",
    "domain": ["esg", "finance"],
    "jurisdiction": "European Union",
    "enforcement_region": "eu",
    "geography": {"type": "regional", "regions": ["Europe"], "countries": EU_COUNTRIES},
    "status": "active", "effective_date": "2023-01-05",
    "authority": "National Competent Authorities / European Financial Reporting Advisory Group (EFRAG)",
    "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022L2464",
    "summary": "The EU Corporate Sustainability Reporting Directive (CSRD) mandates comprehensive ESG reporting aligned with European Sustainability Reporting Standards (ESRS). Phased implementation starting FY2024 for large listed companies, expanding to all large EU companies, listed SMEs, and eventually non-EU companies with significant EU business. Requires assurance on sustainability information.",
    "key_requirements": [
        "Report on material sustainability matters using European Sustainability Reporting Standards (ESRS)",
        "Apply double materiality: report on both impact on society/environment AND financial risks from ESG",
        "Include Scope 1, 2, and 3 greenhouse gas emissions in climate disclosures",
        "Disclose social topics: own workforce, workers in value chain, affected communities, consumers",
        "Governance disclosures including board oversight of sustainability and anti-corruption",
        "Obtain limited assurance from an accredited statutory auditor on sustainability statements",
        "Publish sustainability statement in the management report in XHTML-tagged digital format",
        "Report on EU Taxonomy alignment for environmentally sustainable activities"
    ],
    "penalties": "Member state-imposed sanctions; enforcement by national securities and auditing regulators",
    "tags": ["eu","esg","csrd","esrs","double_materiality","scope3","sustainability_reporting"]
},
{
    "id": "EU_CSDDD",
    "name": "EU Corporate Sustainability Due Diligence Directive (CSDDD) 2024/1760",
    "short_name": "EU CSDDD",
    "domain": ["esg", "labor"],
    "jurisdiction": "European Union",
    "enforcement_region": "eu",
    "geography": {"type": "regional", "regions": ["Europe"], "countries": EU_COUNTRIES},
    "status": "active", "effective_date": "2024-07-25",
    "authority": "National Supervisory Authorities",
    "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024L1760",
    "summary": "The EU Corporate Sustainability Due Diligence Directive (CS3D/CSDDD) requires large companies to identify and address adverse human rights and environmental impacts in their own operations and value chains. Full implementation from 2027-2029 depending on company size. Directors have a duty of care for sustainability impacts.",
    "key_requirements": [
        "Conduct due diligence across own operations, subsidiaries, and established business relationships in value chain",
        "Identify actual and potential adverse human rights and environmental impacts",
        "Prevent, mitigate, and remediate identified adverse impacts with action plans",
        "Establish and operate accessible grievance mechanism for affected stakeholders",
        "Publish annual due diligence report aligned with CSRD sustainability statement",
        "Directors must integrate due diligence into corporate strategy and are personally accountable",
        "Adopt a Paris Agreement-aligned climate transition plan",
        "Engage with affected stakeholders including workers, trade unions, and communities"
    ],
    "penalties": "Supervisory authority administrative fines; civil liability to persons harmed by failure to comply; fines up to 5% of global net turnover",
    "tags": ["eu","esg","csddd","due_diligence","human_rights","value_chain","directors_duty"]
},
{
    "id": "GERMANY_LKSG",
    "name": "Germany Supply Chain Due Diligence Act (Lieferkettensorgfaltspflichtengesetz — LkSG)",
    "short_name": "Germany LkSG",
    "domain": ["esg", "labor"],
    "jurisdiction": "Federal Republic of Germany",
    "enforcement_region": "eu",
    "geography": {"type": "national", "regions": ["Europe"], "countries": ["DE"]},
    "status": "active", "effective_date": "2023-01-01",
    "authority": "Federal Office for Economic Affairs and Export Control (BAFA)",
    "url": "https://www.bafa.de/DE/Lieferketten/lieferketten_node.html",
    "summary": "Germany's LkSG requires large companies (originally 3,000+ employees from 2023, expanded to 1,000+ from 2024) to conduct due diligence on human rights and environmental risks throughout their supply chains. Companies must appoint a human rights officer, conduct risk analysis, implement remedial measures, and report annually.",
    "key_requirements": [
        "Appoint a Human Rights Officer responsible for monitoring LkSG compliance",
        "Conduct annual supply chain risk analysis across direct and indirect suppliers",
        "Issue a Policy Statement on respect for human rights signed by management",
        "Implement preventive measures and remedial action for identified risks and violations",
        "Establish a complaints procedure for affected persons to report human rights risks",
        "Ensure procurement practices do not contribute to human rights or environmental violations",
        "Document due diligence activities and publish an annual report submitted to BAFA",
        "Extend due diligence to indirect suppliers when there is substantiated knowledge of risks"
    ],
    "penalties": "BAFA fines up to EUR 8 million or 2% of global annual revenue; exclusion from public procurement for up to 3 years",
    "tags": ["germany","esg","lksg","bafa","supply_chain","human_rights","due_diligence","eu"]
},
{
    "id": "UK_MODERN_SLAVERY",
    "name": "UK Modern Slavery Act 2015",
    "short_name": "UK Modern Slavery Act",
    "domain": ["esg", "labor"],
    "jurisdiction": "United Kingdom",
    "enforcement_region": "uk",
    "geography": {"type": "national", "regions": ["Europe"], "countries": ["GB"]},
    "status": "active", "effective_date": "2015-10-29",
    "authority": "Home Office / Independent Anti-Slavery Commissioner",
    "url": "https://www.legislation.gov.uk/ukpga/2015/30/contents",
    "summary": "The UK Modern Slavery Act 2015 requires large commercial organisations with annual UK turnover of £36 million or more to publish an annual Transparency Statement disclosing steps taken to ensure no modern slavery or human trafficking in their supply chains and operations. It also criminalises modern slavery and human trafficking with severe penalties.",
    "key_requirements": [
        "Publish an annual Modern Slavery and Human Trafficking Transparency Statement signed by a director",
        "Statement must cover at least: organisation structure and supply chains, policies, due diligence processes, identified risk areas, key performance indicators",
        "Publish the Statement on the company website with a prominent link from the homepage",
        "Conduct supply chain mapping and risk assessment to identify modern slavery exposure",
        "Implement supplier codes of conduct and audit mechanisms for high-risk supply chains",
        "Provide training to relevant employees on identifying and reporting modern slavery indicators",
        "Establish a reporting mechanism for employees and suppliers to raise concerns",
        "Applies to all legal entities supplying goods or services in the UK with £36 million+ global turnover"
    ],
    "penalties": "Criminal penalties for modern slavery: up to life imprisonment. Civil penalties for statement non-compliance: unlimited fines; government may apply for injunction",
    "tags": ["uk","esg","labor","modern_slavery","transparency_statement","supply_chain","human_trafficking"]
},
{
    "id": "AUSTRALIA_MODERN_SLAVERY",
    "name": "Australia Modern Slavery Act 2018",
    "short_name": "Australia Modern Slavery Act",
    "domain": ["esg", "labor"],
    "jurisdiction": "Australia",
    "enforcement_region": "australia",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["AU"]},
    "status": "active", "effective_date": "2019-01-01",
    "authority": "Department of Home Affairs (Australian Border Force)",
    "url": "https://www.homeaffairs.gov.au/foi1/other/modern-slavery/modern-slavery-act-guidance",
    "summary": "Australia's Modern Slavery Act 2018 requires entities based or operating in Australia with annual consolidated revenue over AUD 100 million to report annually on modern slavery risks in their operations and supply chains. Reports must be submitted to the government-managed Modern Slavery Register and are publicly available.",
    "key_requirements": [
        "Submit an annual modern slavery statement covering required criteria to the online Register",
        "Statement must be approved by the board and signed by a principal officer",
        "Identify modern slavery risks in operations and supply chains across all tiers",
        "Describe actions taken to assess and address identified modern slavery risks",
        "Assess effectiveness of actions through measurable key performance indicators",
        "Consult with entities owned or controlled by the reporting entity",
        "Conduct supplier due diligence and require suppliers to report on their own modern slavery risks",
        "Provide training to procurement and supply chain staff on modern slavery indicators"
    ],
    "penalties": "Public naming for non-compliant entities; expected enhanced penalties under planned amendments",
    "tags": ["australia","esg","labor","modern_slavery","supply_chain","transparency","apac"]
},
{
    "id": "CANADA_FORCED_LABOUR",
    "name": "Canada Fighting Against Forced Labour and Child Labour in Supply Chains Act (S-211)",
    "short_name": "Canada S-211 Forced Labour Act",
    "domain": ["esg", "labor"],
    "jurisdiction": "Canada",
    "enforcement_region": "canada",
    "geography": {"type": "national", "regions": ["Americas"], "countries": ["CA"]},
    "status": "active", "effective_date": "2024-01-01",
    "authority": "Public Safety Canada",
    "url": "https://www.canada.ca/en/public-safety-canada/news/2023/05/fighting-against-forced-labour-and-child-labour-in-supply-chains-act.html",
    "summary": "Canada's Supply Chains Act (Bill S-211), effective January 2024, requires federal government institutions and large private sector entities to report annually on measures taken to prevent and reduce the risk of forced labour and child labour in their supply chains. Reports must be submitted to the Minister of Public Safety and are publicly available.",
    "key_requirements": [
        "Submit annual report to Public Safety Canada by May 31 each year covering supply chain forced labour risks",
        "Report must be approved by the governing board and publicly available on company website",
        "Identify structure, activities, and supply chains of the entity",
        "Describe policies and due diligence processes relating to forced and child labour",
        "Identify parts of business or supply chains that carry risk of forced or child labour",
        "Describe steps taken to remediate any forced or child labour that has occurred",
        "Describe training provided to employees on forced labour",
        "Applies to entities listed on Canadian stock exchange, or with assets, revenue, or employees above set thresholds"
    ],
    "penalties": "Fines up to CAD 250,000 for individuals and entities for false or misleading reports; management liability for knowing violations",
    "tags": ["canada","esg","labor","forced_labour","child_labour","supply_chain","transparency"]
},
{
    "id": "SPAIN_WHISTLEBLOWING",
    "name": "Spain Law 2/2023 on Whistleblower Protection",
    "short_name": "Spain Whistleblowing Law",
    "domain": ["esg", "anti_corruption"],
    "jurisdiction": "Kingdom of Spain",
    "enforcement_region": "eu",
    "geography": {"type": "national", "regions": ["Europe"], "countries": ["ES"]},
    "status": "active", "effective_date": "2023-02-20",
    "authority": "Independent Whistleblower Protection Authority (Autoridad Independiente de Proteccion del Informante, A.A.I.)",
    "url": "https://www.boe.es/eli/es/l/2023/02/20/2",
    "summary": "Spain's Law 2/2023 transposes the EU Whistleblowing Directive (2019/1937), requiring public entities and private companies with 50+ employees to establish and operate internal reporting channels for regulatory breaches. Introduces comprehensive protections for whistleblowers and significant penalties for retaliation.",
    "key_requirements": [
        "Establish a confidential internal reporting channel accessible to employees and contractors",
        "Designate a responsible person or team to manage reports and maintain confidentiality",
        "Acknowledge reports within 7 days and communicate follow-up actions within 3 months",
        "Implement strong confidentiality protections for the whistleblower's identity",
        "Prohibit any form of retaliation against whistleblowers including dismissal, demotion, or harassment",
        "Allow anonymous reporting channels where technically feasible",
        "Publish information about reporting channels in a clear and accessible format",
        "Applies to companies with 50+ employees; public entities regardless of size"
    ],
    "penalties": "Fines up to EUR 1 million for retaliation against whistleblowers; fines up to EUR 300,000 for failure to establish reporting channels",
    "tags": ["spain","esg","anti_corruption","whistleblowing","eu_directive","retaliation_protection","eu"]
},

# ── CYBERSECURITY ─────────────────────────────────────────────────────────
{
    "id": "CHINA_CSL",
    "name": "China Cybersecurity Law of the People's Republic of China",
    "short_name": "China Cybersecurity Law",
    "domain": ["cybersecurity", "data_privacy"],
    "jurisdiction": "People's Republic of China",
    "enforcement_region": "china",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["CN"]},
    "status": "active", "effective_date": "2017-06-01",
    "authority": "Cyberspace Administration of China (CAC)",
    "url": "https://www.cac.gov.cn/2017-06/11/c_1121029560.htm",
    "summary": "China's Cybersecurity Law (CSL) is the foundational national cybersecurity legislation establishing requirements for network operators, critical information infrastructure (CII) operators, and data handlers. It mandates data localisation for CII operators, network security protections, user data handling restrictions, and real-name registration.",
    "key_requirements": [
        "Implement a cybersecurity grading and protection system (Multi-Level Protection Scheme — MLPS 2.0)",
        "Critical Information Infrastructure (CII) operators must store data within China",
        "Conduct annual cybersecurity reviews for CII operators before cross-border data transfer",
        "Implement technical measures to monitor and record network operations and security events",
        "Require real-name verification for users accessing network services",
        "Report network security incidents to CAC and relevant authorities",
        "Establish emergency response plans and conduct regular cybersecurity drills",
        "Comply with classified cybersecurity standards issued by TC260 (National Cybersecurity Standardization)"
    ],
    "penalties": "Fines from RMB 10,000 to 1 million; suspension of operations; revocation of licences; criminal liability for serious violations",
    "tags": ["china","cybersecurity","csl","cac","mlps","cii","data_localisation","real_name"]
},
{
    "id": "CHINA_DSL",
    "name": "China Data Security Law 2021",
    "short_name": "China DSL",
    "domain": ["cybersecurity", "data_privacy"],
    "jurisdiction": "People's Republic of China",
    "enforcement_region": "china",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["CN"]},
    "status": "active", "effective_date": "2021-09-01",
    "authority": "Cyberspace Administration of China (CAC) and sector regulators",
    "url": "https://www.cac.gov.cn/2021-06/11/c_1624994566736342.htm",
    "summary": "China's Data Security Law establishes a national data classification and grading system and imposes obligations on all data processing activities within China and overseas activities affecting national security. Introduces an Important Data catalogue system and mandatory security assessments before exporting important data.",
    "key_requirements": [
        "Implement a data classification and grading system based on national importance and sensitivity",
        "Identify and maintain an inventory of Important Data processed by the organisation",
        "Conduct national security reviews before any activity involving transfer of Important Data abroad",
        "Apply enhanced protections to data that affects national security, public interests, or citizens' rights",
        "Report data security incidents affecting national security to relevant authorities",
        "Build and maintain a data security management system with appropriate technical controls",
        "Cooperate with law enforcement investigations involving data security",
        "Extraterritorial effect: applies to data processing abroad that harms Chinese national security"
    ],
    "penalties": "Fines from RMB 100,000 to 10 million; suspension of operations; licence revocation for national security violations",
    "tags": ["china","cybersecurity","data_security","dsl","cac","data_classification","important_data"]
},
{
    "id": "SINGAPORE_CSA",
    "name": "Singapore Cybersecurity Act 2018",
    "short_name": "Singapore Cyber Act",
    "domain": ["cybersecurity", "critical_infrastructure"],
    "jurisdiction": "Republic of Singapore",
    "enforcement_region": "singapore",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["SG"]},
    "status": "active", "effective_date": "2018-08-31",
    "authority": "Cyber Security Agency of Singapore (CSA)",
    "url": "https://www.csa.gov.sg/legislation/the-cybersecurity-act",
    "summary": "Singapore's Cybersecurity Act 2018, amended in 2024, establishes the regulatory framework for national cybersecurity including oversight of Critical Information Infrastructure (CII), licensure of cybersecurity service providers, and computer misuse provisions. The 2024 amendment expanded scope to include systems of temporary cybersecurity concern and major critical infrastructure.",
    "key_requirements": [
        "Critical Information Infrastructure (CII) owners must notify CSA of cybersecurity incidents within 2 hours of awareness",
        "CII owners must conduct annual cybersecurity audits and risk assessments by a licensed professional",
        "CII owners must participate in CSA-directed cybersecurity exercises",
        "Obtain licences from CSA for providing specified cybersecurity services (penetration testing, SOC, forensics)",
        "Implement cybersecurity codes of practice issued by CSA for CII sectors",
        "Report significant vulnerabilities discovered in systems to CSA",
        "Systems of Temporary Cybersecurity Concern (STCC) must comply with direction from Commissioner",
        "Cooperate with CSA investigations and provide access to information and systems"
    ],
    "penalties": "Fines up to SGD 100,000 and/or imprisonment up to 2 years for CII owners; fines up to SGD 500,000 for unlicensed cybersecurity services",
    "tags": ["singapore","cybersecurity","csa","cii","critical_infrastructure","incident_reporting","licencing"]
},

# ── CUSTOMS & TRADE ───────────────────────────────────────────────────────
{
    "id": "CHINA_ECL",
    "name": "China Export Control Law 2020",
    "short_name": "China ECL",
    "domain": ["customs_trade"],
    "jurisdiction": "People's Republic of China",
    "enforcement_region": "china",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["CN"]},
    "status": "active", "effective_date": "2020-12-01",
    "authority": "Ministry of Commerce of China (MOFCOM)",
    "url": "https://www.mofcom.gov.cn/",
    "summary": "China's Export Control Law 2020 establishes a unified legal framework for controlling exports of dual-use items, military goods, nuclear materials, and other items related to national security. Imposes end-user and end-use controls, requires export licences, and introduces an unreliable entity list.",
    "key_requirements": [
        "Obtain export licences from MOFCOM for controlled items on the export control list",
        "Conduct end-user and end-use verification for controlled items before export",
        "Implement internal compliance programme for export control (screening, recordkeeping, training)",
        "Establish internal export control systems for significant exporters",
        "Prohibit re-export of controlled items without Chinese government approval",
        "Screen customers and transactions against the Unreliable Entity List",
        "Report suspicious export inquiries or diversion attempts to MOFCOM",
        "Comply with catch-all controls for items not on the list but intended for WMD or military end-use"
    ],
    "penalties": "Fines from RMB 500,000 to 10x the value of goods; licence revocation; addition to Unreliable Entity List; criminal prosecution for severe violations",
    "tags": ["china","customs_trade","export_control","ecl","mofcom","dual_use","end_user_control"]
},
{
    "id": "US_UFLPA",
    "name": "Uyghur Forced Labor Prevention Act (UFLPA)",
    "short_name": "US UFLPA",
    "domain": ["customs_trade", "esg"],
    "jurisdiction": "United States of America",
    "enforcement_region": "us_federal",
    "geography": {"type": "national", "regions": ["Americas"], "countries": ["US"]},
    "status": "active", "effective_date": "2022-06-21",
    "authority": "U.S. Customs and Border Protection (CBP) / Forced Labor Enforcement Task Force (FLETF)",
    "url": "https://www.cbp.gov/trade/forced-labor/UFLPA",
    "summary": "The Uyghur Forced Labor Prevention Act creates a rebuttable presumption that all goods mined, produced, or manufactured wholly or in part in China's Xinjiang region were made using forced labor and are barred from US imports. Importers must provide clear and convincing evidence to rebut the presumption.",
    "key_requirements": [
        "Do not import goods produced wholly or in part in Xinjiang or by UFLPA-listed entities",
        "Conduct comprehensive supply chain tracing to identify any Xinjiang-sourced materials",
        "Maintain records demonstrating supply chain due diligence and absence of forced labour",
        "If goods are detained by CBP, provide clear and convincing evidence against forced labour to obtain release",
        "Screen suppliers against the UFLPA Entity List (companies sanctioned for using forced labour)",
        "Implement supply chain mapping to at least the third tier for high-risk categories (cotton, polysilicon, tomatoes, PPE, electronics)",
        "Engage with suppliers on their own supply chain transparency and forced labour policies",
        "Maintain and provide to CBP upon request: supply chain tracing, supply chain due diligence policies, and business records"
    ],
    "penalties": "Detention and seizure of imported goods; exclusion from US market; commercial disruption; potential reputational damage",
    "tags": ["us","customs_trade","esg","uflpa","cbp","forced_labour","xinjiang","supply_chain","rebuttable_presumption"]
},
{
    "id": "EU_FUELEU",
    "name": "FuelEU Maritime Regulation (EU) 2023/1805",
    "short_name": "FuelEU Maritime",
    "domain": ["maritime", "environment"],
    "jurisdiction": "European Union",
    "enforcement_region": "eu",
    "geography": {"type": "regional", "regions": ["Europe"], "countries": EU_COUNTRIES},
    "status": "active", "effective_date": "2025-01-01",
    "authority": "European Maritime Safety Agency (EMSA) and national Maritime Authorities",
    "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R1805",
    "summary": "FuelEU Maritime mandates progressive reduction of the GHG intensity of energy used on board ships calling at EU ports. Starting 2025, ships must comply with declining GHG intensity targets (2%, 6%, 13%, 31%, 62%, 80% reductions by 2025-2050) and promotes adoption of sustainable maritime fuels (methanol, ammonia, hydrogen).",
    "key_requirements": [
        "Comply with GHG intensity limits for energy used on board ships calling at EU ports from 2025",
        "Use EU Monitoring, Reporting and Verification (MRV) system to report fuel consumption and GHG data",
        "Obtain a FuelEU Maritime Document of Compliance verified by an accredited organisation",
        "Comply with the On-shore Power Supply (OPS) obligation at designated EU ports from 2030",
        "Use FuelEU balance pooling mechanism to share surplus and deficit compliance across fleets",
        "Increase use of sustainable fuels including renewable fuels of non-biological origin (RFNBOs)",
        "Ships with non-compliance balances must remediate by paying penalties or pooling arrangements",
        "Applies to all ships over 5,000 GT calling at EU/EEA ports regardless of flag state"
    ],
    "penalties": "Annual penalty of EUR 2,400 per tonne of Very Low Sulphur Fuel Oil (VLSFO) equivalent for non-compliance balance; additional sanctions from Member States",
    "tags": ["eu","maritime","environment","fueleu","ghg","sustainable_fuels","decarbonisation"]
},
{
    "id": "EU_ICS2",
    "name": "EU Import Control System 2 (ICS2)",
    "short_name": "EU ICS2",
    "domain": ["customs_trade"],
    "jurisdiction": "European Union",
    "enforcement_region": "eu",
    "geography": {"type": "regional", "regions": ["Europe"], "countries": EU_COUNTRIES},
    "status": "active", "effective_date": "2021-03-15",
    "authority": "European Commission — Directorate-General for Taxation and Customs Union (DG TAXUD)",
    "url": "https://taxation-customs.ec.europa.eu/customs-4/customs-security/import-control-system-2-ics2_en",
    "summary": "EU Import Control System 2 (ICS2) is a phased customs pre-arrival safety and security programme replacing ICS1. It requires economic operators to file Entry Summary Declarations (ENS) with pre-loading/pre-arrival data enabling customs risk analysis before goods arrive in the EU. Phase 3 (full scope for all maritime/air/road) is effective March 2025.",
    "key_requirements": [
        "File Entry Summary Declarations (ENS) with accurate pre-loading data before goods depart for EU",
        "Provide minimum dataset at pre-loading; full dataset at pre-arrival (PLACI obligations)",
        "Postal and express carriers must file ENS data before loading in non-EU origin countries",
        "All economic operators in the supply chain may be required to contribute ENS data",
        "Respond to 'Do Not Load' or 'Authorisation Needed' messages from EU customs within specified timeframes",
        "Maintain data accuracy and completeness — use of EU Customs trader portal or APIs",
        "Implement ICS2 trader portal access or integrate via certified third-party software",
        "Economic operators must register in EU Customs Trader Portal and hold EORI number"
    ],
    "penalties": "Member state-imposed customs penalties for late, incomplete, or inaccurate ENS filings; potential shipment delays and customs examinations",
    "tags": ["eu","customs_trade","ics2","ens","customs_security","supply_chain","pre_arrival"]
},
{
    "id": "US_OSRA",
    "name": "Ocean Shipping Reform Act of 2022 (OSRA)",
    "short_name": "US OSRA 2022",
    "domain": ["customs_trade"],
    "jurisdiction": "United States of America",
    "enforcement_region": "us_federal",
    "geography": {"type": "national", "regions": ["Americas"], "countries": ["US"]},
    "status": "active", "effective_date": "2022-06-16",
    "authority": "Federal Maritime Commission (FMC)",
    "url": "https://www.fmc.gov/resources-services/the-ocean-shipping-reform-act-of-2022/",
    "summary": "The Ocean Shipping Reform Act of 2022 strengthens the Shipping Act of 1984 to address unfair practices by ocean common carriers. It provides new FMC enforcement tools, requires carriers to publish service contracts, prohibits unreasonable refusals of export cargo bookings, and mandates transparency in detention and demurrage charges.",
    "key_requirements": [
        "Ocean carriers must maintain public tariffs and service contracts on file with FMC",
        "Prohibition on ocean carriers unreasonably refusing to negotiate service contracts with exporters",
        "Prohibition on unreasonable refusal of requests for vessel space for US exports",
        "Ocean carriers must provide detailed billing for detention and demurrage charges",
        "Detention and demurrage charges must be just and reasonable — FMC can review and refund excess",
        "Common carriers must establish accessible complaint procedures for shippers",
        "FMC has enhanced investigative powers and can initiate enforcement without complaint",
        "Shipping exchanges (non-vessel operators) must register and comply with regulations"
    ],
    "penalties": "FMC civil penalties up to USD 78,121 per violation; injunctive relief; cease and desist orders",
    "tags": ["us","customs_trade","osra","fmc","ocean_shipping","detention_demurrage","export"]
},

# ── FINANCE / OTHER ───────────────────────────────────────────────────────
{
    "id": "US_CTA",
    "name": "Corporate Transparency Act — Beneficial Ownership Information Reporting",
    "short_name": "US Corporate Transparency Act",
    "domain": ["finance"],
    "jurisdiction": "United States of America",
    "enforcement_region": "us_federal",
    "geography": {"type": "national", "regions": ["Americas"], "countries": ["US"]},
    "status": "active", "effective_date": "2024-01-01",
    "authority": "Financial Crimes Enforcement Network (FinCEN) — U.S. Treasury",
    "url": "https://www.fincen.gov/boi",
    "summary": "The Corporate Transparency Act requires most US domestic and foreign companies registered to do business in the US to report their beneficial owners (persons owning 25%+ or exercising substantial control) to FinCEN. Note: as of March 2025, FinCEN temporarily exempted domestic US companies pending regulatory review.",
    "key_requirements": [
        "Report beneficial ownership information (BOI) to FinCEN — name, DOB, address, and ID document for each beneficial owner",
        "Existing companies formed before 2024 had a reporting deadline of January 1, 2025 (domestic companies currently exempt pending review)",
        "New companies formed after 2024 must report within 30 days of formation",
        "Report changes to beneficial ownership or company information within 30 days",
        "Foreign companies registered to do business in the US must report",
        "Beneficial owners are individuals owning 25%+ equity interest or exercising substantial control",
        "Implement internal processes to identify, verify, and update beneficial ownership records",
        "Certify that reported information is accurate and complete"
    ],
    "penalties": "Civil penalty of USD 500 per day for ongoing violations; criminal penalty of up to USD 10,000 and 2 years imprisonment for wilful violations",
    "tags": ["us","finance","cta","fincen","beneficial_ownership","aml","transparency"]
},
{
    "id": "BRAZIL_CVM193",
    "name": "Brazil CVM Resolution 193 — ESG Reporting (ISSB Standards)",
    "short_name": "Brazil CVM 193",
    "domain": ["esg", "finance"],
    "jurisdiction": "Federative Republic of Brazil",
    "enforcement_region": "brazil",
    "geography": {"type": "national", "regions": ["Americas"], "countries": ["BR"]},
    "status": "active", "effective_date": "2026-01-01",
    "authority": "Securities and Exchange Commission of Brazil (CVM)",
    "url": "https://www.gov.br/cvm",
    "summary": "Brazil's CVM Resolution 193 requires publicly listed companies to report on sustainability matters using ISSB Standards (IFRS S1 and S2), making Brazil an early adopter of mandatory climate and sustainability disclosure aligned with international standards. Mandatory for listed companies reporting on fiscal year 2026.",
    "key_requirements": [
        "Disclose sustainability-related financial information using IFRS S1 (General Requirements)",
        "Disclose climate-related risks and opportunities using IFRS S2 (Climate-related Disclosures)",
        "Report Scope 1, 2, and 3 greenhouse gas emissions following GHG Protocol",
        "Describe governance processes for oversight of sustainability-related risks and opportunities",
        "Disclose strategy for managing climate transition and physical risks",
        "Provide quantitative metrics and targets for climate performance",
        "Ensure sustainability disclosures are consistent with financial statements",
        "Obtain external assurance on sustainability disclosures (timeline to be defined)"
    ],
    "penalties": "CVM administrative sanctions for material non-disclosure; reputational and investor relations impact",
    "tags": ["brazil","esg","finance","cvm","issb","ifrs_s1","ifrs_s2","climate_disclosure"]
},

# ── MARITIME — SPECIALISED ────────────────────────────────────────────────
{
    "id": "IMO_HKC",
    "name": "Hong Kong International Convention for Safe and Environmentally Sound Recycling of Ships (HKC)",
    "short_name": "HKC Ship Recycling Convention",
    "domain": ["maritime", "environment"],
    "jurisdiction": "International",
    "enforcement_region": "international",
    "geography": {"type": "global", "regions": ["Global"], "countries": ["AT","AU","BE","BG","BR","CA","CN","HR","CY","DE","DK","EE","FI","FR","GB","GR","IE","IN","IT","JP","KR","LT","LU","MT","NL","NO","PL","PT","RO","SE","SG","SK","SI","ES","TR","US"]},
    "status": "active", "effective_date": "2025-06-26",
    "authority": "International Maritime Organization (IMO)",
    "url": "https://www.imo.org/en/OurWork/Environment/Pages/Ship-Recycling.aspx",
    "summary": "The Hong Kong International Convention (2009) establishes safe and environmentally sound requirements for the recycling of ships at end-of-life. Entered into force June 26, 2025, it requires ships to carry an Inventory of Hazardous Materials (IHM), obtain certification, and be recycled only at approved facilities listed by their flag state.",
    "key_requirements": [
        "Ships must maintain and certify an Inventory of Hazardous Materials (IHM) — Part I for new ships, Parts II and III for recycling",
        "Flag states must authorise ship recycling facilities and maintain a national list",
        "Ship Recycling Facilities must maintain a Ship Recycling Facility Plan (SRFP)",
        "Issue a Statement of Completion from the recycling facility upon completion",
        "Prohibition on use of hazardous materials listed in Annex I (asbestos, PCBs, ozone-depleting substances, etc.)",
        "Workers at recycling facilities must receive hazardous materials training and PPE",
        "Vessels must obtain Ready for Recycling Certificate before entering a recycling facility",
        "Flag states must report annually on ship recycling activities to IMO"
    ],
    "penalties": "Flag state penalties and detention of non-compliant ships; facility certification withdrawal",
    "tags": ["maritime","environment","hkc","ship_recycling","ihazmat","imo","end_of_life"]
},

# ── MORE DATA PRIVACY ─────────────────────────────────────────────────────
{
    "id": "SOUTH_KOREA_SAPA",
    "name": "South Korea Serious Accidents Punishment Act (SAPA)",
    "short_name": "South Korea SAPA",
    "domain": ["labor"],
    "jurisdiction": "Republic of Korea",
    "enforcement_region": "south_korea",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["KR"]},
    "status": "active", "effective_date": "2022-01-27",
    "authority": "Ministry of Employment and Labor (MOEL)",
    "url": "https://www.moel.go.kr/",
    "summary": "South Korea's Serious Accidents Punishment Act criminalises fatal industrial accidents and serious occupational diseases resulting from management failures. CEOs and management may face personal imprisonment. Applies to workplaces with 50+ employees and all public transportation and multi-use facilities.",
    "key_requirements": [
        "Implement a workplace safety and health management system as the responsible business operator",
        "Establish and maintain documented safety and health management goals and execution plans",
        "Secure adequate budget and personnel for safety management proportionate to operations",
        "Conduct regular workplace inspections and address identified safety hazards",
        "Immediately report serious industrial accidents to Ministry of Employment and Labor",
        "Take immediate protective measures when a serious accident occurs to prevent recurrence",
        "Implement remediation measures for identified safety risks within specified timelines",
        "Maintain records of safety management activities and accident response"
    ],
    "penalties": "CEOs and responsible managers: up to 1 year imprisonment (mandatory) and fines up to KRW 1 billion for fatal accidents; company fines up to KRW 5 billion",
    "tags": ["south_korea","labor","sapa","workplace_safety","ceo_liability","fatal_accidents"]
},
{
    "id": "UK_ENVIRONMENT_ACT",
    "name": "UK Environment Act 2021",
    "short_name": "UK Environment Act 2021",
    "domain": ["environment"],
    "jurisdiction": "United Kingdom",
    "enforcement_region": "uk",
    "geography": {"type": "national", "regions": ["Europe"], "countries": ["GB"]},
    "status": "active", "effective_date": "2021-11-09",
    "authority": "Office for Environmental Protection (OEP) and Environment Agency",
    "url": "https://www.legislation.gov.uk/ukpga/2021/30",
    "summary": "The UK Environment Act 2021 sets legally binding targets for air quality, water quality, biodiversity, and waste reduction following Brexit. It establishes the Office for Environmental Protection (OEP) as the enforcement body. Key supply chain requirements include due diligence obligations to prevent UK businesses from using commodities produced on illegally deforested land.",
    "key_requirements": [
        "Businesses using specified commodities (cattle, cocoa, coffee, palm oil, soya, rubber) must conduct due diligence to prevent illegal deforestation in supply chains",
        "Maintain records of commodity supply chains sufficient to demonstrate absence of illegal deforestation",
        "Report annually on due diligence steps taken for forest risk commodities",
        "Comply with legally binding targets for fine particulate matter, water quality, and biodiversity",
        "Local authorities must meet new environmental reporting requirements",
        "Producer responsibility obligations for packaging and waste management",
        "OEP can investigate public authorities for environmental law compliance failures",
        "Applies to companies using forest risk commodities with an annual UK turnover above threshold"
    ],
    "penalties": "Civil sanctions from the OEP; fines and injunctions; unlimited fines for deforestation due diligence failures",
    "tags": ["uk","environment","deforestation","biodiversity","supply_chain","oep","forest_risk"]
},
{
    "id": "JAPAN_APPI_EXTRA",
    "name": "Japan Act on the Protection of Personal Information — already covered as JAPAN_APPI",
    "short_name": "SKIP",
    "domain": ["data_privacy"],
    "jurisdiction": "Japan",
    "enforcement_region": "japan",
    "geography": {"type": "national", "regions": ["APAC"], "countries": ["JP"]},
    "status": "active", "effective_date": "2022-04-01",
    "authority": "PPC",
    "url": "https://www.ppc.go.jp/en/",
    "summary": "DUPLICATE — skip",
    "key_requirements": ["skip"],
    "penalties": "skip",
    "tags": ["skip"]
},
]

# ── Filter out duplicates and the skip entry ──────────────────────────────
existing_ids = {r["id"] for r in regs_doc["regulations"]}
added = []
skipped = []

for r in NEW_REGS:
    if r.get("short_name") == "SKIP":
        continue
    if r["id"] in existing_ids:
        skipped.append(r["id"])
    else:
        regs_doc["regulations"].append(r)
        existing_ids.add(r["id"])
        added.append(r["id"])
        print(f"ADDED: {r['id']}")

if skipped:
    print(f"\nSkipped (already exist): {skipped}")

regs_doc["last_updated"] = "2026-06-10"
with open(reg_path, "w", encoding="utf-8") as f:
    json.dump(regs_doc, f, indent=2, ensure_ascii=False)
print(f"\nTotal regulations: {len(regs_doc['regulations'])}")

# ── Mappings for new regulations ──────────────────────────────────────────
existing_pairs = {(m["regulation_id"], m["standard_id"]) for m in maps_doc["mappings"]}

NEW_MAPS = [
# Singapore PDPA
{"regulation_id":"SINGAPORE_PDPA","standard_id":"ISO27701","coverage_level":"full","notes":"ISO 27701 directly maps to PDPA obligations: consent management, data subject rights, DPO, breach notification, and cross-border transfer controls.","mapped_articles":["All"],"mapped_controls":["All PIMS controls"]},
{"regulation_id":"SINGAPORE_PDPA","standard_id":"ISO27001","coverage_level":"substantial","notes":"ISO 27001 ISMS covers PDPA security obligations and DPO accountability requirements; consent and rights mechanisms require supplementation.","mapped_articles":["Secs 12-24"],"mapped_controls":["A.5,A.9,A.16,A.18"]},
{"regulation_id":"SINGAPORE_PDPA","standard_id":"SOC2","coverage_level":"partial","notes":"SOC 2 Privacy criteria cover a subset of PDPA obligations; PDPC-specific requirements like DPO and 3-day notification not fully addressed.","mapped_articles":["Sec 26A"],"mapped_controls":["P1-P8"]},

# Japan APPI
{"regulation_id":"JAPAN_APPI","standard_id":"ISO27701","coverage_level":"substantial","notes":"ISO 27701 maps to APPI's data handling rules, cross-border transfer provisions, and data subject rights. Japan's adequacy under GDPR facilitates alignment.","mapped_articles":["All"],"mapped_controls":["All PIMS controls"]},
{"regulation_id":"JAPAN_APPI","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 addresses APPI security management obligations for personal information; rights management and third-party transfer records not covered.","mapped_articles":["Art 20-22"],"mapped_controls":["A.9,A.12,A.16,A.18"]},

# India DPDPA
{"regulation_id":"INDIA_DPDPA","standard_id":"ISO27701","coverage_level":"substantial","notes":"ISO 27701 provides PIMS controls aligning with DPDPA Data Fiduciary obligations: consent management, purpose limitation, breach notification, DPO duties.","mapped_articles":["Secs 5-14"],"mapped_controls":["All PIMS controls"]},
{"regulation_id":"INDIA_DPDPA","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 ISMS covers DPDPA security safeguards obligation; Data Board-specific reporting and consent management require supplementation.","mapped_articles":["Sec 8"],"mapped_controls":["A.9,A.12,A.16"]},
{"regulation_id":"INDIA_DPDPA","standard_id":"NIST_CSF","coverage_level":"partial","notes":"NIST CSF supports DPDPA security obligations; Identify and Protect functions are most directly relevant.","mapped_articles":["Sec 8"],"mapped_controls":["ID,PR"]},

# South Korea PIPA
{"regulation_id":"SOUTH_KOREA_PIPA","standard_id":"ISO27701","coverage_level":"substantial","notes":"ISO 27701 maps to PIPA's privacy management obligations including consent, data minimisation, and cross-border transfer requirements.","mapped_articles":["Art 15-39"],"mapped_controls":["All PIMS controls"]},
{"regulation_id":"SOUTH_KOREA_PIPA","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 covers PIPA's technical and physical security measures; consent management and PIPC reporting require supplementation.","mapped_articles":["Art 29"],"mapped_controls":["A.9,A.12,A.16"]},

# Thailand PDPA
{"regulation_id":"THAILAND_PDPA","standard_id":"ISO27701","coverage_level":"full","notes":"Thailand PDPA is GDPR-modelled; ISO 27701 provides comprehensive PIMS controls mapping to all key PDPA obligations.","mapped_articles":["All"],"mapped_controls":["All PIMS controls"]},
{"regulation_id":"THAILAND_PDPA","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 covers PDPA security measures obligation; DPO appointment and consent records require additional controls.","mapped_articles":["Sec 37"],"mapped_controls":["A.5,A.9,A.16"]},

# Malaysia PDPA
{"regulation_id":"MALAYSIA_PDPA","standard_id":"ISO27701","coverage_level":"substantial","notes":"ISO 27701 maps to Malaysia PDPA's seven Data Protection Principles: notice, choice, disclosure, security, retention, data integrity, and access.","mapped_articles":["All"],"mapped_controls":["All PIMS controls"]},
{"regulation_id":"MALAYSIA_PDPA","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 covers the security principle of PDPA and breach notification requirements under 2024 amendment.","mapped_articles":["Sec 9"],"mapped_controls":["A.9,A.12,A.16"]},

# Philippines DPA
{"regulation_id":"PHILIPPINES_DPA","standard_id":"ISO27701","coverage_level":"full","notes":"Philippines DPA aligns closely with GDPR and ISO 27701 provides comprehensive PIMS controls for all DPA obligations including DPO registration.","mapped_articles":["All"],"mapped_controls":["All PIMS controls"]},
{"regulation_id":"PHILIPPINES_DPA","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 addresses DPA security obligations; NPC-specific requirements like mandatory DPO registration require supplementation.","mapped_articles":["Sec 20"],"mapped_controls":["A.9,A.12,A.16,A.18"]},

# Vietnam PDPD
{"regulation_id":"VIETNAM_PDPD","standard_id":"ISO27701","coverage_level":"substantial","notes":"ISO 27701 maps to PDPD consent requirements, data subject rights, and cross-border transfer obligations; data localisation requires additional controls.","mapped_articles":["All"],"mapped_controls":["All PIMS controls"]},
{"regulation_id":"VIETNAM_PDPD","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 covers PDPD security safeguards; Vietnam-specific A05 registration and localisation requirements are not addressed.","mapped_articles":["Art 26-28"],"mapped_controls":["A.9,A.12,A.16"]},

# Indonesia PDP
{"regulation_id":"INDONESIA_PDP","standard_id":"ISO27701","coverage_level":"substantial","notes":"ISO 27701 maps to Indonesia PDP Law: controller obligations, consent, data subject rights, breach notification, and cross-border transfer requirements.","mapped_articles":["All"],"mapped_controls":["All PIMS controls"]},
{"regulation_id":"INDONESIA_PDP","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 covers PDP Law security requirements; DPO appointment and cross-border transfer assessment require supplementation.","mapped_articles":["Art 35-39"],"mapped_controls":["A.9,A.12,A.16"]},

# Hong Kong PDPO
{"regulation_id":"HONG_KONG_PDPO","standard_id":"ISO27701","coverage_level":"substantial","notes":"ISO 27701 maps to PDPO's six Data Protection Principles and the 2021 anti-doxxing amendments.","mapped_articles":["DPPs 1-6"],"mapped_controls":["All PIMS controls"]},
{"regulation_id":"HONG_KONG_PDPO","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 addresses DPP 4 security requirements; direct marketing opt-in and doxxing controls require additional measures.","mapped_articles":["DPP 4"],"mapped_controls":["A.9,A.12,A.16"]},

# NZ Privacy Act
{"regulation_id":"NZ_PRIVACY_ACT","standard_id":"ISO27701","coverage_level":"substantial","notes":"ISO 27701 maps to NZ Privacy Act's 13 Information Privacy Principles and mandatory breach notification obligations.","mapped_articles":["IPPs 1-13"],"mapped_controls":["All PIMS controls"]},
{"regulation_id":"NZ_PRIVACY_ACT","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 covers IPP 5 (security) and breach notification technical requirements.","mapped_articles":["IPP 5"],"mapped_controls":["A.9,A.12,A.16"]},
{"regulation_id":"NZ_PRIVACY_ACT","standard_id":"SOC2","coverage_level":"partial","notes":"SOC 2 Privacy criteria align with NZ Privacy Act IPPs for data subject access and security.","mapped_articles":["IPPs 5,6"],"mapped_controls":["P1-P8"]},

# Turkey KVKK
{"regulation_id":"TURKEY_KVKK","standard_id":"ISO27701","coverage_level":"substantial","notes":"ISO 27701 maps to KVKK consent requirements, data subject rights, and security obligations aligned with GDPR.","mapped_articles":["Art 5-11"],"mapped_controls":["All PIMS controls"]},
{"regulation_id":"TURKEY_KVKK","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 covers KVKK technical and administrative security measures; VERBIS registration not addressed.","mapped_articles":["Art 12"],"mapped_controls":["A.9,A.12,A.16,A.18"]},

# Switzerland FADP
{"regulation_id":"SWITZERLAND_FADP","standard_id":"ISO27701","coverage_level":"full","notes":"Switzerland FADP aligns with GDPR; ISO 27701 provides comprehensive PIMS controls satisfying all nFADP obligations.","mapped_articles":["All"],"mapped_controls":["All PIMS controls"]},
{"regulation_id":"SWITZERLAND_FADP","standard_id":"ISO27001","coverage_level":"substantial","notes":"ISO 27001 supports nFADP privacy by design, DPIA, and security requirements; FDPIC-specific reporting needs supplementation.","mapped_articles":["Art 6-10,23-25"],"mapped_controls":["A.5,A.9,A.12,A.16,A.18"]},

# Russia 152-FZ
{"regulation_id":"RUSSIA_152FZ","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 covers 152-FZ security level requirements; data localisation and Roskomnadzor registration are Russia-specific.","mapped_articles":["Art 19"],"mapped_controls":["A.9,A.12,A.16"]},
{"regulation_id":"RUSSIA_152FZ","standard_id":"ISO27701","coverage_level":"partial","notes":"ISO 27701 covers consent and rights requirements of 152-FZ; data localisation requirement on Russian servers is not addressed.","mapped_articles":["Art 5-9"],"mapped_controls":["PIMS controls subset"]},

# Ukraine LPPD
{"regulation_id":"UKRAINE_LPPD","standard_id":"ISO27701","coverage_level":"partial","notes":"ISO 27701 maps to Ukraine LPPD consent and data subject rights obligations aligned with Council of Europe Convention 108.","mapped_articles":["All"],"mapped_controls":["PIMS controls"]},
{"regulation_id":"UKRAINE_LPPD","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 covers LPPD security measures and database protection requirements.","mapped_articles":["Art 24"],"mapped_controls":["A.9,A.12,A.16"]},

# FCPA
{"regulation_id":"US_FCPA","standard_id":"COBIT","coverage_level":"substantial","notes":"COBIT 2019 governance objectives (MEA01, APO12, APO11) address FCPA books-and-records obligations and internal controls framework.","mapped_articles":["Accounting provisions"],"mapped_controls":["MEA01,APO12"]},
{"regulation_id":"US_FCPA","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 risk management provides the bribery risk assessment framework required by effective FCPA compliance programmes.","mapped_articles":["Anti-bribery provisions"],"mapped_controls":["Risk assessment process"]},
{"regulation_id":"US_FCPA","standard_id":"ISO27001","coverage_level":"minimal","notes":"ISO 27001 contributes to FCPA books-and-records controls via access management and audit logging for financial systems.","mapped_articles":["Accounting provisions"],"mapped_controls":["A.9,A.12"]},

# UK Bribery Act
{"regulation_id":"UK_BRIBERY_ACT","standard_id":"ISO31000","coverage_level":"substantial","notes":"ISO 31000 underpins the bribery risk mapping and third-party due diligence processes required for UK Bribery Act adequate procedures defence.","mapped_articles":["Sec 7 adequate procedures"],"mapped_controls":["Risk identification,assessment,treatment"]},
{"regulation_id":"UK_BRIBERY_ACT","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance framework supports the internal controls and management oversight required by the adequate procedures defence.","mapped_articles":["All"],"mapped_controls":["MEA01,APO11,APO12"]},

# France Sapin II
{"regulation_id":"FRANCE_SAPIN2","standard_id":"ISO31000","coverage_level":"substantial","notes":"ISO 31000 risk management directly supports Sapin II's mandatory risk mapping pillar.","mapped_articles":["Sapin II Art 17 pillars"],"mapped_controls":["Risk identification,assessment"]},
{"regulation_id":"FRANCE_SAPIN2","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance and assurance objectives address Sapin II training, internal audit, and management oversight pillars.","mapped_articles":["Art 17"],"mapped_controls":["APO11,MEA01,MEA02"]},

# Malaysia MACC
{"regulation_id":"MALAYSIA_MACC","standard_id":"ISO31000","coverage_level":"substantial","notes":"ISO 31000 supports MACC Section 17A risk assessment pillar of T.R.U.S.T. adequate procedures framework.","mapped_articles":["Sec 17A(4)"],"mapped_controls":["Risk assessment process"]},
{"regulation_id":"MALAYSIA_MACC","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance objectives support top-level commitment and systematic review pillars of T.R.U.S.T. framework.","mapped_articles":["All T.R.U.S.T. pillars"],"mapped_controls":["EDM01,APO11,MEA02"]},

# Italy Decree 231
{"regulation_id":"ITALY_D231","standard_id":"ISO31000","coverage_level":"substantial","notes":"ISO 31000 underpins the risk mapping component of the Modello 231 — the primary tool for identifying predicate offence exposure.","mapped_articles":["Art 6-7 Modello 231"],"mapped_controls":["Risk identification,assessment"]},
{"regulation_id":"ITALY_D231","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance objectives support the OdV supervisory board monitoring, internal audit, and documentation requirements of Decree 231.","mapped_articles":["Art 6"],"mapped_controls":["MEA01,MEA02,APO11"]},

# Brazil CCA
{"regulation_id":"BRAZIL_CCA","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 supports the risk mapping component of Brazil's integrity programme required by the Clean Company Act regulations.","mapped_articles":["Decree 8.420/2015 Art 41-43"],"mapped_controls":["Risk assessment process"]},
{"regulation_id":"BRAZIL_CCA","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance framework supports CCA internal controls and audit requirements.","mapped_articles":["All"],"mapped_controls":["MEA01,APO11"]},

# Canada CFPOA
{"regulation_id":"CANADA_CFPOA","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 supports bribery risk assessment required by an effective CFPOA compliance programme.","mapped_articles":["All"],"mapped_controls":["Risk assessment process"]},
{"regulation_id":"CANADA_CFPOA","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance framework supports internal controls and financial records integrity requirements under CFPOA.","mapped_articles":["All"],"mapped_controls":["MEA01,APO11"]},

# Mexico GLAR
{"regulation_id":"MEXICO_GLAR","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 risk assessment framework supports the corporate integrity programme risk mapping required by GLAR.","mapped_articles":["Art 25 Integrity Programme"],"mapped_controls":["Risk assessment process"]},
{"regulation_id":"MEXICO_GLAR","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance supports GLAR compliance officer accountability, monitoring, and audit requirements.","mapped_articles":["All"],"mapped_controls":["MEA01,APO11"]},

# SA PRECCA
{"regulation_id":"SA_PRECCA","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 supports corruption risk assessment required for effective PRECCA compliance.","mapped_articles":["All"],"mapped_controls":["Risk assessment process"]},
{"regulation_id":"SA_PRECCA","standard_id":"COBIT","coverage_level":"minimal","notes":"COBIT governance supports internal controls and duty-to-report compliance mechanisms.","mapped_articles":["All"],"mapped_controls":["MEA01"]},

# Singapore PCA
{"regulation_id":"SINGAPORE_PCA","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 risk management supports anti-corruption risk assessment required by PCA compliance programmes.","mapped_articles":["All"],"mapped_controls":["Risk assessment process"]},
{"regulation_id":"SINGAPORE_PCA","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance framework supports PCA compliance monitoring, gift registers, and internal controls.","mapped_articles":["All"],"mapped_controls":["MEA01,APO11"]},

# EU CSRD
{"regulation_id":"EU_CSRD","standard_id":"ISO9001","coverage_level":"partial","notes":"ISO 9001 management system principles support CSRD's documented processes, management review, and improvement requirements.","mapped_articles":["ESRS G1,G2"],"mapped_controls":["Quality management system"]},
{"regulation_id":"EU_CSRD","standard_id":"ISO31000","coverage_level":"substantial","notes":"ISO 31000 directly supports CSRD's double materiality assessment and sustainability risk management disclosures.","mapped_articles":["ESRS 1 material impacts"],"mapped_controls":["Risk identification,assessment"]},
{"regulation_id":"EU_CSRD","standard_id":"ISO27001","coverage_level":"minimal","notes":"ISO 27001 contributes to CSRD cybersecurity and data governance disclosures under ESRS G1.","mapped_articles":["ESRS G1"],"mapped_controls":["A.18"]},
{"regulation_id":"EU_CSRD","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance objectives support CSRD board oversight, governance structure, and accountability disclosures.","mapped_articles":["ESRS G1,G2"],"mapped_controls":["EDM01,APO11,MEA02"]},

# EU CSDDD
{"regulation_id":"EU_CSDDD","standard_id":"ISO31000","coverage_level":"substantial","notes":"ISO 31000 is the primary risk management standard supporting CSDDD's due diligence risk identification and assessment obligations.","mapped_articles":["Art 8-9"],"mapped_controls":["Risk identification,assessment,treatment"]},
{"regulation_id":"EU_CSDDD","standard_id":"ISO9001","coverage_level":"partial","notes":"ISO 9001 process management principles support CSDDD's documented due diligence processes and stakeholder engagement.","mapped_articles":["Art 5-10"],"mapped_controls":["Quality management process"]},
{"regulation_id":"EU_CSDDD","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance objectives support CSDDD director accountability and management oversight requirements.","mapped_articles":["Art 22"],"mapped_controls":["EDM01,APO12"]},

# Germany LkSG
{"regulation_id":"GERMANY_LKSG","standard_id":"ISO31000","coverage_level":"full","notes":"ISO 31000 is explicitly referenced in LkSG implementation guidance; risk identification, assessment, and treatment directly map to LkSG due diligence steps.","mapped_articles":["Secs 4-7"],"mapped_controls":["Risk identification,assessment,treatment"]},
{"regulation_id":"GERMANY_LKSG","standard_id":"ISO9001","coverage_level":"partial","notes":"ISO 9001 process management supports LkSG's supplier evaluation, corrective action, and documented procedures.","mapped_articles":["Secs 4-9"],"mapped_controls":["Quality management"]},
{"regulation_id":"GERMANY_LKSG","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance framework supports LkSG reporting, management oversight, and board accountability.","mapped_articles":["Sec 10"],"mapped_controls":["MEA01,APO11"]},

# UK Modern Slavery
{"regulation_id":"UK_MODERN_SLAVERY","standard_id":"ISO9001","coverage_level":"partial","notes":"ISO 9001 process management and supplier evaluation principles support Modern Slavery Act due diligence and transparency statement.","mapped_articles":["Sec 54"],"mapped_controls":["Quality management"]},
{"regulation_id":"UK_MODERN_SLAVERY","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 risk assessment supports supply chain risk identification required by the Modern Slavery Act compliance framework.","mapped_articles":["Sec 54"],"mapped_controls":["Risk assessment"]},

# Australia Modern Slavery
{"regulation_id":"AUSTRALIA_MODERN_SLAVERY","standard_id":"ISO9001","coverage_level":"partial","notes":"ISO 9001 supplier evaluation and process management support the due diligence and effectiveness measurement criteria of the Modern Slavery Act.","mapped_articles":["Mandatory criteria"],"mapped_controls":["Quality management"]},
{"regulation_id":"AUSTRALIA_MODERN_SLAVERY","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 risk assessment framework supports modern slavery risk identification across supply chain tiers.","mapped_articles":["Mandatory criteria 3-4"],"mapped_controls":["Risk assessment"]},

# Canada Forced Labour
{"regulation_id":"CANADA_FORCED_LABOUR","standard_id":"ISO9001","coverage_level":"partial","notes":"ISO 9001 process management and supplier evaluation support the due diligence reporting requirements of S-211.","mapped_articles":["Sec 11"],"mapped_controls":["Quality management"]},
{"regulation_id":"CANADA_FORCED_LABOUR","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 risk assessment supports identification of forced labour risks across supply chains as required by S-211.","mapped_articles":["Sec 11"],"mapped_controls":["Risk assessment"]},

# Spain Whistleblowing
{"regulation_id":"SPAIN_WHISTLEBLOWING","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 A.6.1 and A.16 controls support the confidentiality protections required for whistleblowing channels.","mapped_articles":["Art 5-7"],"mapped_controls":["A.6.1,A.16"]},
{"regulation_id":"SPAIN_WHISTLEBLOWING","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance objectives support the management oversight and audit requirements for whistleblowing programmes.","mapped_articles":["Art 8-12"],"mapped_controls":["APO11,MEA02"]},

# China CSL
{"regulation_id":"CHINA_CSL","standard_id":"ISO27001","coverage_level":"substantial","notes":"ISO 27001 ISMS aligns with MLPS 2.0 requirements; CSL-specific CII data localisation requires additional controls.","mapped_articles":["Art 10-24"],"mapped_controls":["A.5-A.18"]},
{"regulation_id":"CHINA_CSL","standard_id":"NIST_CSF","coverage_level":"substantial","notes":"NIST CSF five functions map to CSL network security requirements; CAC-specific obligations require supplementation.","mapped_articles":["Art 21-23"],"mapped_controls":["ID,PR,DE,RS"]},
{"regulation_id":"CHINA_CSL","standard_id":"CIS_CONTROLS","coverage_level":"partial","notes":"CIS Controls v8 technical controls address CSL network security measures; China-specific MLPS grading requires local standards.","mapped_articles":["Art 21"],"mapped_controls":["CIS 1-16"]},
{"regulation_id":"CHINA_CSL","standard_id":"NIST_800_53","coverage_level":"partial","notes":"NIST 800-53 detailed controls address CSL security requirements; CII data localisation and real-name registration are China-specific.","mapped_articles":["Art 21-23"],"mapped_controls":["AC,CA,IR,SI,SC"]},

# China DSL
{"regulation_id":"CHINA_DSL","standard_id":"ISO27001","coverage_level":"partial","notes":"ISO 27001 supports DSL's data classification and security management requirements; Important Data catalogue and cross-border assessment are China-specific.","mapped_articles":["Art 21-27"],"mapped_controls":["A.8,A.12,A.16"]},
{"regulation_id":"CHINA_DSL","standard_id":"NIST_CSF","coverage_level":"partial","notes":"NIST CSF Identify function (asset and risk management) supports DSL data classification and risk assessment requirements.","mapped_articles":["Art 21-25"],"mapped_controls":["ID.AM,ID.RA"]},
{"regulation_id":"CHINA_DSL","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 risk management framework supports DSL's data security risk assessment and classification requirements.","mapped_articles":["Art 21"],"mapped_controls":["Risk assessment process"]},

# Singapore CSA
{"regulation_id":"SINGAPORE_CSA","standard_id":"ISO27001","coverage_level":"substantial","notes":"ISO 27001 provides the ISMS baseline required by Singapore CSA for CII operators and cybersecurity service providers.","mapped_articles":["All"],"mapped_controls":["A.5-A.18"]},
{"regulation_id":"SINGAPORE_CSA","standard_id":"NIST_CSF","coverage_level":"substantial","notes":"NIST CSF aligns with CSA cybersecurity framework for CII risk management; five functions map to CSA codes of practice.","mapped_articles":["All"],"mapped_controls":["ID,PR,DE,RS,RC"]},
{"regulation_id":"SINGAPORE_CSA","standard_id":"CIS_CONTROLS","coverage_level":"partial","notes":"CIS Controls v8 technical controls support CSA cybersecurity requirements for CII owners.","mapped_articles":["CII requirements"],"mapped_controls":["CIS 1-18"]},

# China ECL
{"regulation_id":"CHINA_ECL","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance objectives support ECL internal compliance programme, due diligence, and recordkeeping requirements.","mapped_articles":["Art 31-36"],"mapped_controls":["APO11,MEA01"]},
{"regulation_id":"CHINA_ECL","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 supports the export control risk assessment required by effective ECL compliance programmes.","mapped_articles":["Art 7"],"mapped_controls":["Risk assessment process"]},

# UFLPA
{"regulation_id":"US_UFLPA","standard_id":"ISO9001","coverage_level":"partial","notes":"ISO 9001 supplier evaluation and audit processes directly support UFLPA supply chain due diligence and traceability requirements.","mapped_articles":["All"],"mapped_controls":["Quality management"]},
{"regulation_id":"US_UFLPA","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 supply chain risk assessment framework supports UFLPA due diligence and risk identification obligations.","mapped_articles":["All"],"mapped_controls":["Risk assessment"]},

# FuelEU Maritime
{"regulation_id":"EU_FUELEU","standard_id":"ISO9001","coverage_level":"partial","notes":"ISO 9001 documentation and management review principles support FuelEU compliance management and annual reporting requirements.","mapped_articles":["Art 5-6"],"mapped_controls":["Quality management"]},
{"regulation_id":"EU_FUELEU","standard_id":"ISO31000","coverage_level":"minimal","notes":"ISO 31000 risk management supports FuelEU transition risk planning for GHG intensity reduction targets.","mapped_articles":["Art 4"],"mapped_controls":["Risk assessment"]},

# EU ICS2
{"regulation_id":"EU_ICS2","standard_id":"ISO9001","coverage_level":"partial","notes":"ISO 9001 process controls and data accuracy requirements support ICS2 ENS submission quality and compliance.","mapped_articles":["All"],"mapped_controls":["Quality management"]},
{"regulation_id":"EU_ICS2","standard_id":"ISO27001","coverage_level":"minimal","notes":"ISO 27001 supports security of ICS2 ENS data transmission systems and trader portal access controls.","mapped_articles":["All"],"mapped_controls":["A.9,A.12"]},

# US OSRA
{"regulation_id":"US_OSRA","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance and service management objectives support OSRA compliance monitoring, tariff publication, and complaint handling.","mapped_articles":["All"],"mapped_controls":["APO11,MEA01"]},
{"regulation_id":"US_OSRA","standard_id":"ISO9001","coverage_level":"partial","notes":"ISO 9001 process management and customer satisfaction principles support OSRA service delivery and dispute resolution requirements.","mapped_articles":["All"],"mapped_controls":["Quality management"]},

# US CTA
{"regulation_id":"US_CTA","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance objectives support CTA's beneficial ownership recordkeeping and accuracy requirements.","mapped_articles":["All"],"mapped_controls":["APO11,MEA01"]},
{"regulation_id":"US_CTA","standard_id":"ISO27001","coverage_level":"minimal","notes":"ISO 27001 access controls and data accuracy requirements support CTA's accurate beneficial ownership data maintenance.","mapped_articles":["All"],"mapped_controls":["A.9,A.18"]},

# Brazil CVM193
{"regulation_id":"BRAZIL_CVM193","standard_id":"ISO9001","coverage_level":"partial","notes":"ISO 9001 management system and documented processes support CVM 193 sustainability reporting quality and governance.","mapped_articles":["All"],"mapped_controls":["Quality management"]},
{"regulation_id":"BRAZIL_CVM193","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 supports the climate and sustainability risk assessment required by IFRS S1/S2 disclosures.","mapped_articles":["IFRS S1"],"mapped_controls":["Risk assessment"]},
{"regulation_id":"BRAZIL_CVM193","standard_id":"COBIT","coverage_level":"partial","notes":"COBIT governance objectives support board oversight and governance disclosures required by CVM 193.","mapped_articles":["IFRS S1 Governance"],"mapped_controls":["EDM01,MEA02"]},

# HKC Ship Recycling
{"regulation_id":"IMO_HKC","standard_id":"ISO9001","coverage_level":"substantial","notes":"ISO 9001 management system and documented procedures map closely to Ship Recycling Facility Plan (SRFP) and Inventory of Hazardous Materials requirements.","mapped_articles":["All"],"mapped_controls":["Quality management"]},
{"regulation_id":"IMO_HKC","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 risk management supports the hazard identification and risk assessment components of the Ship Recycling Facility Plan.","mapped_articles":["Annex 2"],"mapped_controls":["Risk assessment"]},

# South Korea SAPA
{"regulation_id":"SOUTH_KOREA_SAPA","standard_id":"ISO9001","coverage_level":"partial","notes":"ISO 9001 process management and continuous improvement principles support SAPA safety management documentation and review requirements.","mapped_articles":["Art 4-5"],"mapped_controls":["Quality management"]},
{"regulation_id":"SOUTH_KOREA_SAPA","standard_id":"ISO31000","coverage_level":"substantial","notes":"ISO 31000 risk management framework directly supports SAPA's mandatory workplace risk analysis and safety management plans.","mapped_articles":["Art 4"],"mapped_controls":["Risk identification,assessment,treatment"]},

# UK Environment Act
{"regulation_id":"UK_ENVIRONMENT_ACT","standard_id":"ISO9001","coverage_level":"partial","notes":"ISO 9001 supplier evaluation and process controls support UK Environment Act's forest risk commodity due diligence requirements.","mapped_articles":["Part 3"],"mapped_controls":["Quality management"]},
{"regulation_id":"UK_ENVIRONMENT_ACT","standard_id":"ISO31000","coverage_level":"partial","notes":"ISO 31000 risk assessment supports the environmental risk identification required by the UK Environment Act's due diligence obligations.","mapped_articles":["Part 3"],"mapped_controls":["Risk assessment"]},
]

added_maps = 0
for m in NEW_MAPS:
    pair = (m["regulation_id"], m["standard_id"])
    if pair not in existing_pairs:
        maps_doc["mappings"].append(m)
        existing_pairs.add(pair)
        added_maps += 1

maps_doc["last_updated"] = "2026-06-10"
with open(map_path, "w", encoding="utf-8") as f:
    json.dump(maps_doc, f, indent=2, ensure_ascii=False)

print(f"\nAdded {added_maps} new mappings — total: {len(maps_doc['mappings'])}")
