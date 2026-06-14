"""
Add regulation-to-standard mappings for the 10 new standards added in Wave 6.
Standards: ISO22301, ISO27017, ISO27018, NIST_AI_RMF, ISO42001,
           SOC1, NIST_800_171, HITRUST_CSF, ISO20000, IEC62443
"""

import json, datetime, pathlib

ROOT = pathlib.Path(__file__).parent.parent
MAPPINGS_FILE = ROOT / "data" / "mappings.json"

NEW_MAPPINGS = [

    # ── ISO 22301 (Business Continuity) ──────────────────────────────────────
    {
        "regulation_id": "DORA",
        "standard_id": "ISO22301",
        "coverage_level": "substantial",
        "mapped_articles": ["Art. 11", "Art. 12", "Art. 17", "Art. 26"],
        "mapped_controls": ["Cl. 8.2 (BIA)", "Cl. 8.3 (Strategies)", "Cl. 8.4 (Plans)", "Cl. 8.5 (Exercising)", "Cl. 9.1 (Monitoring)"],
        "notes": "ISO 22301 directly satisfies DORA's ICT business continuity (Art. 11), backup and restoration policies (Art. 12), and crisis communication requirements (Art. 17). The standard's BIA, RTO/RPO, and exercising requirements map onto DORA's resilience testing obligations."
    },
    {
        "regulation_id": "NIS2",
        "standard_id": "ISO22301",
        "coverage_level": "substantial",
        "mapped_articles": ["Art. 21(1)", "Art. 21(2)(c)", "Art. 21(2)(e)", "Art. 23"],
        "mapped_controls": ["Cl. 8.2 (BIA)", "Cl. 8.3 (Strategies)", "Cl. 8.4 (Plans)", "Cl. 9.1 (Monitoring)", "Cl. 10 (Improvement)"],
        "notes": "NIS2 requires essential and important entities to implement business continuity plans (Art. 21(2)(c)) and crisis management (Art. 21(2)(e)). ISO 22301 certification is the primary mechanism to demonstrate compliance with these NIS2 resilience obligations."
    },
    {
        "regulation_id": "HIPAA",
        "standard_id": "ISO22301",
        "coverage_level": "partial",
        "mapped_articles": ["45 CFR §164.308(a)(7)", "45 CFR §164.310(a)(2)(i)"],
        "mapped_controls": ["Cl. 8.2 (BIA)", "Cl. 8.3 (Strategies)", "Cl. 8.4 (BCPs)", "Cl. 8.5 (Exercising)"],
        "notes": "HIPAA Security Rule Contingency Plan standard (§164.308(a)(7)) requires data backup, disaster recovery, emergency mode operation, and testing. ISO 22301's BIA, recovery strategies, and exercising requirements satisfy these HIPAA obligations. HIPAA also covers privacy and administrative requirements not addressed by ISO 22301."
    },
    {
        "regulation_id": "AUSTRALIA_SOCI",
        "standard_id": "ISO22301",
        "coverage_level": "substantial",
        "mapped_articles": ["Part 2A", "Div 2A.2", "Critical Infrastructure Risk Management Program"],
        "mapped_controls": ["Cl. 8.2 (BIA)", "Cl. 8.3 (Strategies)", "Cl. 8.4 (Plans)", "Cl. 8.5 (Exercising)", "Cl. 9.1"],
        "notes": "Australia's SOCI Act mandates critical infrastructure entities to develop and maintain Critical Infrastructure Risk Management Programs (CIRMPs) including business continuity arrangements. ISO 22301 provides the framework for demonstrating compliance with SOCI's resilience obligations across all critical infrastructure sectors."
    },
    {
        "regulation_id": "AU_CPS234",
        "standard_id": "ISO22301",
        "coverage_level": "partial",
        "mapped_articles": ["Para. 36", "Para. 37", "Para. 38"],
        "mapped_controls": ["Cl. 8.2 (BIA)", "Cl. 8.3 (Strategies)", "Cl. 8.4 (Plans)", "Cl. 8.5 (Exercising)"],
        "notes": "APRA CPS 234 requires APRA-regulated entities to maintain information security capability and business continuity capability in the event of a cyber incident. ISO 22301 addresses recovery and continuity aspects; CPS 234's broader information security requirements are covered by ISO 27001."
    },
    {
        "regulation_id": "SG_MAS_TRM",
        "standard_id": "ISO22301",
        "coverage_level": "substantial",
        "mapped_articles": ["Chapter 6", "Para. 6.1", "Para. 6.2", "Para. 6.3"],
        "mapped_controls": ["Cl. 8.2 (BIA)", "Cl. 8.3 (Strategies)", "Cl. 8.4 (BCPs)", "Cl. 8.5 (Exercising)", "Cl. 9.1 (Testing)"],
        "notes": "MAS TRM Chapter 6 on IT Service Continuity requires FIs to establish business continuity plans, conduct BIAs, define RTO/RPOs, and test plans at least annually. ISO 22301 provides the structured BCM framework that satisfies MAS TRM Chapter 6 requirements comprehensively."
    },
    {
        "regulation_id": "DE_BSIG2",
        "standard_id": "ISO22301",
        "coverage_level": "partial",
        "mapped_articles": ["§8a BSIG", "§8b BSIG"],
        "mapped_controls": ["Cl. 8.2 (BIA)", "Cl. 8.3 (Strategies)", "Cl. 8.4 (BCPs)", "Cl. 8.5 (Exercising)"],
        "notes": "Germany's IT-SiG 2.0 (BSIG §8a) requires KRITIS operators to implement appropriate organizational measures including business continuity. ISO 22301 supports compliance with BSIG's resilience requirements, though DE_BSIG2 also mandates technical security measures and incident reporting beyond BCM scope."
    },
    {
        "regulation_id": "EU_MICA",
        "standard_id": "ISO22301",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 74", "Art. 96"],
        "mapped_controls": ["Cl. 8.2 (BIA)", "Cl. 8.3 (Strategies)", "Cl. 8.4 (BCPs)"],
        "notes": "MiCA requires crypto-asset service providers to have business continuity plans and operational resilience arrangements. ISO 22301 provides the BCM framework for CASPs to demonstrate operational continuity compliance. MiCA also covers financial, governance, and licensing requirements outside ISO 22301 scope."
    },
    {
        "regulation_id": "OSFI_B13",
        "standard_id": "ISO22301",
        "coverage_level": "partial",
        "mapped_articles": ["Domain 3 (Resilience)", "Outcome 3.1", "Outcome 3.2"],
        "mapped_controls": ["Cl. 8.2 (BIA)", "Cl. 8.3 (Strategies)", "Cl. 8.4 (Plans)", "Cl. 8.5 (Exercising)"],
        "notes": "OSFI B-13 Guideline (Technology and Cyber Risk Management) Domain 3 requires FRFIs to have technology resilience plans and recovery capabilities. ISO 22301 supports compliance with OSFI B-13's resilience domain, particularly BIA, recovery strategies, and continuity testing."
    },

    # ── ISO 27017 (Cloud Security Controls) ──────────────────────────────────
    {
        "regulation_id": "GDPR",
        "standard_id": "ISO27017",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 25", "Art. 28", "Art. 32"],
        "mapped_controls": ["CLD.6.3.1 (Shared responsibilities)", "CLD.9.5.1 (VM hardening)", "CLD.9.5.2 (Admin operations)", "CLD.12.1.1 (Segregation)", "CLD.12.4.1 (Monitoring)"],
        "notes": "ISO 27017 supports GDPR Art. 32 (technical security measures) for cloud-hosted personal data processing, and Art. 28 (processor obligations) through its shared-responsibility and sub-processor controls. It does not cover GDPR's legal bases, data subject rights, DPO, or cross-border transfer mechanisms."
    },
    {
        "regulation_id": "NIS2",
        "standard_id": "ISO27017",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 21(2)(d)", "Art. 21(2)(i)"],
        "mapped_controls": ["CLD.6.3.1", "CLD.9.5.1", "CLD.9.5.2", "CLD.12.1.1", "CLD.12.3.1", "CLD.13.1.1"],
        "notes": "ISO 27017 supports NIS2 supply chain security (Art. 21(2)(d)) and network/system security (Art. 21(2)(i)) where cloud services are in scope. It addresses tenant isolation, shared responsibility, and cloud-specific incident response relevant to NIS2-obligated cloud users."
    },
    {
        "regulation_id": "UK_DPA_2018",
        "standard_id": "ISO27017",
        "coverage_level": "partial",
        "mapped_articles": ["Schedule 1", "Art. 25 (UK GDPR)", "Art. 32 (UK GDPR)"],
        "mapped_controls": ["CLD.6.3.1", "CLD.9.5.1", "CLD.9.5.2", "CLD.12.1.1"],
        "notes": "UK GDPR (incorporated in DPA 2018) maintains GDPR Art. 32 security obligations for cloud-hosted personal data. ISO 27017 provides the cloud-specific security controls to support UK GDPR processor obligations for cloud service providers and customers."
    },
    {
        "regulation_id": "SG_MAS_TRM",
        "standard_id": "ISO27017",
        "coverage_level": "partial",
        "mapped_articles": ["Chapter 7 (Cloud Computing)", "Para. 7.1", "Para. 7.2"],
        "mapped_controls": ["CLD.6.3.1 (Shared responsibilities)", "CLD.9.5.1 (VM hardening)", "CLD.12.1.1 (Tenant segregation)", "CLD.12.3.1 (Data security)"],
        "notes": "MAS TRM Chapter 7 specifically addresses cloud computing risk management and requires FIs to assess shared responsibility models, ensure data segregation, and maintain cloud security controls. ISO 27017 provides the technical control framework that maps directly to MAS TRM Chapter 7 requirements."
    },
    {
        "regulation_id": "AU_CPS234",
        "standard_id": "ISO27017",
        "coverage_level": "partial",
        "mapped_articles": ["Para. 15", "Para. 22", "Para. 23"],
        "mapped_controls": ["CLD.6.3.1", "CLD.9.5.1", "CLD.9.5.2", "CLD.12.1.1"],
        "notes": "CPS 234 requires APRA entities to maintain information security capability for third-party managed (including cloud) systems. ISO 27017 supports CPS 234 compliance for cloud deployments by providing shared responsibility frameworks and cloud-specific security controls."
    },
    {
        "regulation_id": "CN_MLPS2",
        "standard_id": "ISO27017",
        "coverage_level": "partial",
        "mapped_articles": ["GB/T 22239-2019 Cloud Extension"],
        "mapped_controls": ["CLD.6.3.1", "CLD.9.5.1", "CLD.9.5.2", "CLD.12.1.1", "CLD.13.1.1"],
        "notes": "China's MLPS 2.0 includes a cloud computing security extension specifying security requirements for cloud platforms and tenants. ISO 27017 aligns with the tenant isolation, shared responsibility, and cloud-specific security controls required under MLPS 2.0 cloud extension."
    },
    {
        "regulation_id": "PIPL",
        "standard_id": "ISO27017",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 51", "Art. 55", "Art. 59"],
        "mapped_controls": ["CLD.6.3.1", "CLD.9.5.1", "CLD.12.1.1", "CLD.12.3.1"],
        "notes": "PIPL requires personal information handlers using cloud processing to implement appropriate technical measures (Art. 51) and conduct impact assessments (Art. 55). ISO 27017 supports PIPL compliance by defining security responsibilities between cloud providers and customers processing personal information."
    },

    # ── ISO 27018 (Privacy in Cloud) ─────────────────────────────────────────
    {
        "regulation_id": "GDPR",
        "standard_id": "ISO27018",
        "coverage_level": "substantial",
        "mapped_articles": ["Art. 5(1)(b)", "Art. 5(1)(e)", "Art. 17", "Art. 20", "Art. 28", "Art. 32", "Art. 33"],
        "mapped_controls": ["A.1 (Consent and purpose)", "A.2 (Data minimization)", "A.3 (Transparency)", "A.4 (Return/Deletion)", "A.5 (Sub-processors)", "A.10 (Breach notification)"],
        "notes": "ISO 27018 is specifically designed to support GDPR compliance for cloud PII processors. It covers Art. 28 processor obligations (sub-processor disclosure, instructions), Art. 17 erasure, Art. 20 portability, and Art. 33 breach notification by cloud providers. Gaps include lawful basis determination, data subject rights in full, and supervisory authority interactions (processor-side obligations only)."
    },
    {
        "regulation_id": "UK_DPA_2018",
        "standard_id": "ISO27018",
        "coverage_level": "substantial",
        "mapped_articles": ["Art. 28 (UK GDPR)", "Art. 32 (UK GDPR)", "Art. 33 (UK GDPR)", "Schedule 2 DPA 2018"],
        "mapped_controls": ["A.1", "A.3 (Transparency)", "A.4 (Return/Deletion)", "A.5 (Sub-processors)", "A.10 (Breach notification)"],
        "notes": "UK GDPR (in DPA 2018) maintains GDPR-equivalent processor obligations. ISO 27018 supports UK GDPR Art. 28 processor contract requirements, including sub-processor management, data return/deletion mechanisms, and breach notification for cloud-hosted UK personal data."
    },
    {
        "regulation_id": "PIPL",
        "standard_id": "ISO27018",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 21", "Art. 47", "Art. 51", "Art. 55"],
        "mapped_controls": ["A.1 (Consent/purpose)", "A.2 (Data minimization)", "A.3 (Transparency)", "A.4 (Return/Deletion)", "A.5 (Sub-processing)"],
        "notes": "PIPL requires personal information processors to control purpose limitation (Art. 21), ensure deletion capability (Art. 47), and implement appropriate measures (Art. 51). ISO 27018 supports cloud PII processing obligations under PIPL, though PIPL's China-specific cross-border transfer and data localization requirements go beyond ISO 27018 scope."
    },
    {
        "regulation_id": "SINGAPORE_PDPA",
        "standard_id": "ISO27018",
        "coverage_level": "partial",
        "mapped_articles": ["Part V (Protection)", "Part VI (Retention)", "Part VIII (Transfer Limitation)"],
        "mapped_controls": ["A.1", "A.3 (Transparency)", "A.4 (Return/Deletion)", "A.5 (Sub-processors)", "A.9 (Return and deletion)"],
        "notes": "Singapore PDPA requires organisations and data intermediaries to protect personal data and ensure deletion when no longer needed. ISO 27018 supports cloud data intermediary obligations under PDPA through its return, deletion, and transparency controls."
    },
    {
        "regulation_id": "JAPAN_APPI",
        "standard_id": "ISO27018",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 25 (Third-party provision)", "Art. 24 (Foreign third-party)", "Art. 23 (Security measures)"],
        "mapped_controls": ["A.1 (Purpose)", "A.3 (Transparency)", "A.4 (Return/Deletion)", "A.5 (Sub-processors)"],
        "notes": "Japan APPI governs third-party provision and overseas transfer of personal information. ISO 27018 supports APPI compliance for cloud processing by establishing transparency, sub-processor controls, and data deletion mechanisms required under APPI's third-party provision obligations."
    },
    {
        "regulation_id": "LGPD",
        "standard_id": "ISO27018",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 7", "Art. 9", "Art. 37", "Art. 46", "Art. 48"],
        "mapped_controls": ["A.1 (Consent/purpose)", "A.2 (Minimization)", "A.4 (Return/Deletion)", "A.5 (Sub-processors)", "A.10 (Breach notification)"],
        "notes": "Brazil's LGPD imposes obligations on operators (processors) including security measures (Art. 46), breach notification (Art. 48), and processing records (Art. 37). ISO 27018 supports LGPD cloud operator compliance through its PII processor controls."
    },
    {
        "regulation_id": "AUSTRALIA_PRIVACY_ACT",
        "standard_id": "ISO27018",
        "coverage_level": "partial",
        "mapped_articles": ["APP 11 (Security)", "APP 4 (Unsolicited PI)", "APP 6 (Use/Disclosure)"],
        "mapped_controls": ["A.1 (Purpose limitation)", "A.4 (Return/Deletion)", "A.5 (Sub-processors)", "A.10 (Breach notification)"],
        "notes": "Australia's Privacy Act APP 11 requires entities to take reasonable steps to protect personal information, including from cloud providers (APP 8 for overseas transfers). ISO 27018 supports cloud PII processor obligations under the Privacy Act."
    },
    {
        "regulation_id": "SOUTH_KOREA_PIPA",
        "standard_id": "ISO27018",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 26 (Consignment)", "Art. 29 (Security measures)", "Art. 34 (Breach notification)"],
        "mapped_controls": ["A.1 (Purpose)", "A.3 (Transparency)", "A.4 (Deletion)", "A.5 (Sub-processors)", "A.10 (Breach)"],
        "notes": "South Korea PIPA Art. 26 regulates processing consignment (outsourcing to cloud providers), requiring transparency about consignees. ISO 27018 supports PIPA cloud consignment obligations through sub-processor disclosure, purpose limitation, and deletion controls."
    },

    # ── NIST AI RMF ──────────────────────────────────────────────────────────
    {
        "regulation_id": "AI_ACT",
        "standard_id": "NIST_AI_RMF",
        "coverage_level": "substantial",
        "mapped_articles": ["Art. 9", "Art. 10", "Art. 13", "Art. 14", "Art. 15", "Art. 17"],
        "mapped_controls": ["GOVERN (Policies)", "MAP (Risk categorization)", "MEASURE (Testing/evaluation)", "MANAGE (Risk response)"],
        "notes": "NIST AI RMF maps closely to EU AI Act requirements for high-risk AI systems. The GOVERN function covers Art. 9 (risk management system) and Art. 17 (quality management). MAP/MEASURE address Art. 10 (training data governance) and Art. 15 (accuracy/robustness). The AI RMF does not cover EU AI Act's conformity assessment procedures, CE marking, or registration requirements."
    },
    {
        "regulation_id": "EO14028",
        "standard_id": "NIST_AI_RMF",
        "coverage_level": "substantial",
        "mapped_articles": ["Section 2 (AI safety)", "Section 4 (NIST standards)", "Section 10 (Definitions)"],
        "mapped_controls": ["GOVERN", "MAP", "MEASURE", "MANAGE", "Trustworthy AI properties"],
        "notes": "EO 14110 (2023 AI EO, successor to EO 14028) explicitly mandates use of NIST AI RMF for federal AI safety and security. The AI RMF was developed in response to EO 14028's Section 4 directive to NIST. Federal agencies and contractors using AI must align with AI RMF functions."
    },
    {
        "regulation_id": "EU_DSA",
        "standard_id": "NIST_AI_RMF",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 26 (Risk assessment)", "Art. 27 (Mitigation measures)", "Art. 40 (Algorithmic auditing)"],
        "mapped_controls": ["GOVERN (Policies)", "MAP (Risk identification)", "MEASURE (Evaluation)", "MANAGE (Mitigation)"],
        "notes": "EU DSA requires very large online platforms to conduct systemic risk assessments for algorithmic systems (Art. 26) and implement mitigation measures (Art. 27). NIST AI RMF's MAP and MEASURE functions support these DSA obligations. Gaps include DSA's specific audit, interoperability, and data access requirements."
    },
    {
        "regulation_id": "SINGAPORE_PDPA",
        "standard_id": "NIST_AI_RMF",
        "coverage_level": "partial",
        "mapped_articles": ["PDPC Advisory Guidelines on AI", "Model AI Governance Framework"],
        "mapped_controls": ["GOVERN (Human oversight)", "MAP (Risk identification)", "MEASURE (Fairness testing)", "MANAGE (Ongoing monitoring)"],
        "notes": "Singapore's PDPC Model AI Governance Framework and PDPA Advisory Guidelines on AI align closely with NIST AI RMF principles. The AI RMF supports Singapore's AI explainability, fairness, and human oversight recommendations, supplementing PDPA's data protection obligations for AI applications."
    },
    {
        "regulation_id": "CHINA_CSL",
        "standard_id": "NIST_AI_RMF",
        "coverage_level": "minimal",
        "mapped_articles": ["Art. 22 (Algorithm security)"],
        "mapped_controls": ["GOVERN (Policies)", "MAP (Risk identification)"],
        "notes": "China's Cybersecurity Law touches on algorithm security obligations relevant to AI. NIST AI RMF's GOVERN and MAP functions provide risk governance context applicable to CSL's security requirements, but China has its own specific AI regulations (Algorithm Recommendation Provisions, Deep Synthesis Provisions) that are more directly applicable."
    },

    # ── ISO 42001 (AI Management System) ─────────────────────────────────────
    {
        "regulation_id": "AI_ACT",
        "standard_id": "ISO42001",
        "coverage_level": "full",
        "mapped_articles": ["Art. 9", "Art. 10", "Art. 11", "Art. 12", "Art. 13", "Art. 14", "Art. 17", "Art. 72"],
        "mapped_controls": ["4 (Context)", "6.1.2 (AI risk assessment)", "8.2 (AI risk assessment)", "8.4 (AI documentation)", "8.5 (AI impact assessment)", "9.1 (Monitoring)", "Annex A"],
        "notes": "ISO 42001 is positioned as the primary certification pathway for EU AI Act conformance for high-risk AI systems. Its AIMS requirements map to Art. 9 (risk management system), Art. 10 (data governance), Art. 11 (technical documentation), Art. 12 (logging), Art. 13 (transparency), Art. 14 (human oversight), and Art. 17 (quality management). ISO 42001 certification by a notified body can satisfy EU AI Act conformity assessment requirements."
    },
    {
        "regulation_id": "EO14028",
        "standard_id": "ISO42001",
        "coverage_level": "partial",
        "mapped_articles": ["Section 4 (NIST standards)", "Section 5 (AI safety)"],
        "mapped_controls": ["6.1.2 (AI risk)", "8.2 (Risk assessment)", "8.5 (Impact assessment)", "9.1 (Monitoring)", "Annex A.6 (Responsible disclosure)"],
        "notes": "EO 14110 on AI safety references management systems and standards for responsible AI. ISO 42001 supports US federal AI obligations through its AI risk assessment, impact assessment, and governance requirements, complementing the NIST AI RMF approach required for federal agencies."
    },
    {
        "regulation_id": "EU_DSA",
        "standard_id": "ISO42001",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 26 (Risk assessment)", "Art. 27 (Mitigation)", "Art. 40 (Algorithmic audit)"],
        "mapped_controls": ["8.2 (AI risk assessment)", "8.4 (AI system documentation)", "8.5 (AI impact assessment)", "9.1 (Monitoring)"],
        "notes": "DSA requires very large online platforms to assess and mitigate systemic risks from algorithmic systems. ISO 42001's AI risk assessment and impact assessment framework (Cl. 8.2, 8.5) directly supports DSA's risk management obligations for recommendation systems."
    },
    {
        "regulation_id": "SINGAPORE_PDPA",
        "standard_id": "ISO42001",
        "coverage_level": "partial",
        "mapped_articles": ["PDPC Model AI Governance Framework (2nd Ed.)", "Part 3 (Internal governance)"],
        "mapped_controls": ["4 (Context)", "5 (Leadership)", "6.1.2 (AI risk)", "8.5 (AI impact)", "Annex A.2 (AI policy)", "Annex A.4 (Responsible AI)"],
        "notes": "Singapore's Model AI Governance Framework recommends AI management structures that align with ISO 42001. The standard's AIMS approach supports Singapore's AI governance recommendations for explainability, fairness, and human oversight in commercial AI deployments subject to PDPA."
    },

    # ── SOC 1 (Financial Controls) ────────────────────────────────────────────
    {
        "regulation_id": "SOX",
        "standard_id": "SOC1",
        "coverage_level": "full",
        "mapped_articles": ["Section 302", "Section 404", "Section 906"],
        "mapped_controls": ["CC1 (Control environment)", "CC2 (Information/communication)", "CC3 (Risk assessment)", "CC4 (Monitoring)", "CC5 (Control activities)", "CC6 (Logical access)", "CC7 (Operations)"],
        "notes": "SOC 1 Type II is specifically designed to support SOX Section 404 compliance for service organizations. External auditors rely on SOC 1 reports when evaluating the ICFR controls of companies that outsource processes affecting financial statements (payroll, ERP, custody services). A clean SOC 1 Type II report is the primary mechanism for service organizations to evidence SOX-relevant control effectiveness."
    },
    {
        "regulation_id": "GLBA",
        "standard_id": "SOC1",
        "coverage_level": "partial",
        "mapped_articles": ["Safeguards Rule (16 CFR Part 314)", "Privacy Rule (16 CFR Part 313)"],
        "mapped_controls": ["CC1 (Control environment)", "CC3 (Risk assessment)", "CC5 (Control activities)", "CC6 (Logical access)", "CC7 (Operations)"],
        "notes": "GLBA Safeguards Rule requires financial institutions to implement a comprehensive information security program. SOC 1 controls (particularly CC3 risk assessment, CC5 control activities, CC6 access controls) overlap with GLBA's administrative, technical, and physical safeguard requirements for customer financial information."
    },
    {
        "regulation_id": "SEC_CYBER_2023",
        "standard_id": "SOC1",
        "coverage_level": "partial",
        "mapped_articles": ["Item 106 (Cybersecurity)", "Form 8-K (Incident disclosure)", "Form 10-K (Risk management)"],
        "mapped_controls": ["CC2 (Communication)", "CC3 (Risk assessment)", "CC4 (Monitoring)", "CC7 (Operations)"],
        "notes": "SEC Cyber Rules require public companies to disclose material cybersecurity incidents and describe their cybersecurity risk management. SOC 1 Type II demonstrates operating effectiveness of ICFR controls over time, supporting SEC disclosures about internal control effectiveness and cybersecurity governance."
    },
    {
        "regulation_id": "OSFI_B13",
        "standard_id": "SOC1",
        "coverage_level": "partial",
        "mapped_articles": ["Domain 1 (Governance)", "Domain 2 (Risk management)", "Outcome 1.3"],
        "mapped_controls": ["CC1 (Control environment)", "CC3 (Risk assessment)", "CC5 (Control activities)", "CC6 (Logical access)"],
        "notes": "OSFI B-13 requires FRFIs to assess technology and cyber risk in outsourced services through third-party risk management. SOC 1 reports from service providers are a key mechanism for OSFI-regulated FIs to obtain assurance over ICFR-relevant outsourced controls."
    },
    {
        "regulation_id": "AU_CPS234",
        "standard_id": "SOC1",
        "coverage_level": "partial",
        "mapped_articles": ["Para. 22", "Para. 23", "Para. 24"],
        "mapped_controls": ["CC1 (Control environment)", "CC3 (Risk assessment)", "CC5 (Control activities)", "CC6 (Logical access)"],
        "notes": "CPS 234 requires APRA entities to obtain assurance over information security capability of third parties managing assets on their behalf. SOC 1 reports are accepted as evidence of third-party controls relevant to APRA-regulated entities' financial and operational systems."
    },
    {
        "regulation_id": "EU_MICA",
        "standard_id": "SOC1",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 70", "Art. 71", "Art. 74"],
        "mapped_controls": ["CC1 (Control environment)", "CC3 (Risk assessment)", "CC5 (Control activities)"],
        "notes": "MiCA requires crypto-asset service providers to have adequate internal controls over operations and financial reporting. SOC 1 reports from custody, trading, or settlement service providers help demonstrate the operational control effectiveness required under MiCA."
    },

    # ── NIST SP 800-171 (Protecting CUI) ─────────────────────────────────────
    {
        "regulation_id": "CMMC",
        "standard_id": "NIST_800_171",
        "coverage_level": "full",
        "mapped_articles": ["CMMC Level 2 (110 practices)", "DFARS 252.204-7012"],
        "mapped_controls": ["3.1 (AC)", "3.2 (AT)", "3.3 (AU)", "3.4 (CM)", "3.5 (IA)", "3.6 (IR)", "3.7 (MA)", "3.8 (MP)", "3.9 (PS)", "3.10 (PE)", "3.11 (RA)", "3.12 (CA)", "3.13 (SC)", "3.14 (SI)"],
        "notes": "CMMC Level 2 is essentially a direct implementation of NIST SP 800-171 Rev. 2 — all 110 practices in CMMC Level 2 map directly to NIST 800-171 security requirements. Achieving NIST 800-171 compliance (verified by C3PAO assessment) is the mechanism for attaining CMMC Level 2 certification required for DoD contracts involving CUI."
    },
    {
        "regulation_id": "FISMA",
        "standard_id": "NIST_800_171",
        "coverage_level": "substantial",
        "mapped_articles": ["44 USC §3551", "OMB Circular A-130"],
        "mapped_controls": ["3.1 (AC)", "3.3 (AU)", "3.4 (CM)", "3.5 (IA)", "3.6 (IR)", "3.11 (RA)", "3.13 (SC)", "3.14 (SI)"],
        "notes": "FISMA mandates that federal agencies and contractors apply NIST security standards. NIST 800-171 is derived from NIST SP 800-53 and provides the CUI-specific control baseline for non-federal contractors. Compliance with 800-171 demonstrates conformance with FISMA requirements for systems processing CUI on behalf of federal agencies."
    },
    {
        "regulation_id": "EO14028",
        "standard_id": "NIST_800_171",
        "coverage_level": "partial",
        "mapped_articles": ["Section 3 (Federal government cybersecurity)", "Section 4 (Software security)"],
        "mapped_controls": ["3.1 (AC)", "3.3 (AU)", "3.4 (CM)", "3.5 (IA)", "3.6 (IR)", "3.13 (SC)", "3.14 (SI)"],
        "notes": "EO 14028 mandates zero-trust architecture, enhanced logging, and security standards for federal contractors. NIST 800-171 provides the baseline security requirements for contractors, with controls directly supporting EO 14028's requirements for endpoint security, identity verification, and log retention."
    },
    {
        "regulation_id": "CIRCIA",
        "standard_id": "NIST_800_171",
        "coverage_level": "partial",
        "mapped_articles": ["Section 2240 (Reporting)", "Proposed CIRCIA rules"],
        "mapped_controls": ["3.6 (IR — Incident Response)", "3.3 (AU — Audit)", "3.14 (SI — System Integrity)", "3.13 (SC — Communications)"],
        "notes": "CIRCIA requires critical infrastructure entities to report cyber incidents to CISA. NIST 800-171's incident response (3.6), audit/logging (3.3), and system integrity (3.14) requirements support the security posture and detection capabilities needed to identify and report incidents under CIRCIA."
    },

    # ── HITRUST CSF (Healthcare) ──────────────────────────────────────────────
    {
        "regulation_id": "HIPAA",
        "standard_id": "HITRUST_CSF",
        "coverage_level": "full",
        "mapped_articles": ["45 CFR Part 164 (Security Rule)", "45 CFR Part 164 (Privacy Rule)", "45 CFR Part 164 (Breach Notification)"],
        "mapped_controls": ["01 (InfoSec Policy)", "07 (Access Control)", "08 (Audit Logging)", "09 (Physical Security)", "10 (Network)", "11 (Monitoring)", "12 (Application Security)", "14 (Third-Party Assurance)"],
        "notes": "HITRUST CSF was specifically designed to consolidate HIPAA Security Rule (administrative, physical, technical safeguards), Privacy Rule, and Breach Notification Rule requirements into a certifiable control framework. A HITRUST r2 Validated Assessment is widely accepted by healthcare organizations as comprehensive evidence of HIPAA compliance. The CSF also incorporates NIST CSF, ISO 27001, and PCI DSS, making it the most comprehensive healthcare compliance framework."
    },
    {
        "regulation_id": "GDPR",
        "standard_id": "HITRUST_CSF",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 5", "Art. 9 (Health data)", "Art. 25", "Art. 32", "Art. 35 (DPIA for health data)"],
        "mapped_controls": ["01 (Policy)", "07 (Access Control)", "09 (Physical Security)", "11 (Monitoring)", "13 (Privacy)", "14 (Third-Party)"],
        "notes": "HITRUST CSF v11 includes privacy controls mapped to GDPR requirements, particularly for health data (Art. 9 special category). Healthcare organizations in the EU can use HITRUST to demonstrate GDPR Art. 32 technical and organizational security measures, though GDPR's lawfulness, data subject rights, and DPO requirements go beyond HITRUST's security focus."
    },
    {
        "regulation_id": "UK_DPA_2018",
        "standard_id": "HITRUST_CSF",
        "coverage_level": "partial",
        "mapped_articles": ["Schedule 1 Part 1 (Health data)", "Art. 9 (UK GDPR)", "Art. 32 (UK GDPR)"],
        "mapped_controls": ["01 (Policy)", "07 (Access Control)", "11 (Monitoring)", "13 (Privacy)", "14 (Third-Party)"],
        "notes": "UK GDPR in DPA 2018 treats health data as special category data. HITRUST CSF supports UK healthcare organisations in demonstrating appropriate security measures for health data under UK GDPR Art. 32, covering the technical and organisational safeguards required."
    },
    {
        "regulation_id": "AUSTRALIA_PRIVACY_ACT",
        "standard_id": "HITRUST_CSF",
        "coverage_level": "partial",
        "mapped_articles": ["APP 11 (Security)", "My Health Records Act 2012"],
        "mapped_controls": ["01 (Policy)", "07 (Access Control)", "09 (Physical)", "11 (Monitoring)", "14 (Third-Party)"],
        "notes": "Australian healthcare organizations subject to the Privacy Act (APP 11 — security obligations) and My Health Records Act can use HITRUST CSF to demonstrate appropriate security management for health information. HITRUST CSF's healthcare-specific controls align with Australian health data security requirements."
    },
    {
        "regulation_id": "GLBA",
        "standard_id": "HITRUST_CSF",
        "coverage_level": "partial",
        "mapped_articles": ["Safeguards Rule (16 CFR Part 314)"],
        "mapped_controls": ["01 (Policy)", "07 (Access Control)", "10 (Network)", "11 (Monitoring)", "14 (Third-Party)"],
        "notes": "Healthcare organizations that also handle financial data (e.g., health savings accounts, medical billing processors) may be subject to GLBA. HITRUST CSF's administrative, technical, and physical controls support GLBA Safeguards Rule requirements for financial information security."
    },
    {
        "regulation_id": "INDIA_DPDPA",
        "standard_id": "HITRUST_CSF",
        "coverage_level": "partial",
        "mapped_articles": ["Section 8 (Security of personal data)", "Section 11 (Sensitive data)"],
        "mapped_controls": ["01 (Policy)", "07 (Access Control)", "11 (Monitoring)", "14 (Third-Party)"],
        "notes": "India DPDPA treats health data as sensitive personal data with enhanced protection requirements. HITRUST CSF provides healthcare-appropriate security controls that can support DPDPA compliance for healthcare data fiduciaries in India processing health and medical information."
    },

    # ── ISO 20000-1 (IT Service Management) ──────────────────────────────────
    {
        "regulation_id": "DORA",
        "standard_id": "ISO20000",
        "coverage_level": "substantial",
        "mapped_articles": ["Art. 5 (ICT risk governance)", "Art. 6 (ICT risk management)", "Art. 10 (Detection)", "Art. 11 (BCM)", "Art. 16 (Incident classification)"],
        "mapped_controls": ["8.2 (SMS planning)", "8.3 (Service portfolio)", "8.4.1 (Service level)", "8.6.1 (Incident mgmt)", "8.6.3 (Problem mgmt)", "8.3.3 (Service continuity)"],
        "notes": "ISO 20000-1 directly supports DORA's ICT risk management framework requirements. Its incident management (8.6.1) maps to DORA Art. 16-20 (ICT-related incident management). Problem management (8.6.3) supports Art. 10 (detection). Service continuity (8.3.3) supports Art. 11 (BCM). ISO 20000-1 certification is considered a strong indicator of DORA operational resilience compliance for ICT service providers."
    },
    {
        "regulation_id": "NIS2",
        "standard_id": "ISO20000",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 21(2)(a)", "Art. 21(2)(b)", "Art. 21(2)(e)", "Art. 23"],
        "mapped_controls": ["8.3.3 (Service continuity)", "8.6.1 (Incident)", "8.6.3 (Problem)", "9.1 (Monitoring)", "10.1 (Continual improvement)"],
        "notes": "NIS2 requires essential and important entities to implement policies on incident handling (Art. 21(2)(b)) and business continuity (Art. 21(2)(e)). ISO 20000-1's service continuity and incident management processes support NIS2 obligations for ICT-dependent essential service providers."
    },
    {
        "regulation_id": "SG_MAS_TRM",
        "standard_id": "ISO20000",
        "coverage_level": "partial",
        "mapped_articles": ["Chapter 5 (Technology operations)", "Para. 5.1", "Para. 5.2", "Para. 5.4"],
        "mapped_controls": ["8.3 (Service portfolio)", "8.4.1 (SLA management)", "8.6.1 (Incident)", "8.6.3 (Problem)", "9.1 (Performance monitoring)"],
        "notes": "MAS TRM Chapter 5 on Technology Operations requires FIs to establish IT service management processes including incident, problem, and change management. ISO 20000-1 provides the formalized ITSM framework that maps directly to MAS TRM operational requirements."
    },
    {
        "regulation_id": "OSFI_B13",
        "standard_id": "ISO20000",
        "coverage_level": "partial",
        "mapped_articles": ["Domain 4 (Technology operations)", "Outcome 4.1", "Outcome 4.2"],
        "mapped_controls": ["8.2 (SMS)", "8.4.1 (SLA)", "8.6.1 (Incident)", "8.6.3 (Problem)", "9.1 (Monitoring)"],
        "notes": "OSFI B-13 Technology Operations domain requires FRFIs to manage technology services with defined SLAs, incident response, and problem management. ISO 20000-1 provides the ITSM framework supporting OSFI B-13's technology operations requirements."
    },
    {
        "regulation_id": "AU_CPS234",
        "standard_id": "ISO20000",
        "coverage_level": "partial",
        "mapped_articles": ["Para. 36 (Incident response)", "Para. 15 (Third-party managed environments)"],
        "mapped_controls": ["8.6.1 (Incident)", "8.6.3 (Problem)", "8.4.2 (Supplier management)", "8.3.3 (Continuity)"],
        "notes": "CPS 234 requires APRA-regulated entities to have an information security incident response plan and manage third-party technology service providers. ISO 20000-1's incident management and supplier management processes support CPS 234 technology service management obligations."
    },
    {
        "regulation_id": "EU_MICA",
        "standard_id": "ISO20000",
        "coverage_level": "partial",
        "mapped_articles": ["Art. 70 (Operational risk)", "Art. 74 (Resilience)", "Art. 75 (Incident reporting)"],
        "mapped_controls": ["8.6.1 (Incident management)", "8.6.3 (Problem management)", "8.3.3 (Service continuity)", "9.1 (Monitoring)"],
        "notes": "MiCA requires crypto-asset service providers to have robust ICT risk management and incident response capabilities. ISO 20000-1's incident and problem management processes support MiCA's operational resilience requirements for CASPs."
    },

    # ── IEC 62443 (OT/Industrial Security) ───────────────────────────────────
    {
        "regulation_id": "NIS2",
        "standard_id": "IEC62443",
        "coverage_level": "substantial",
        "mapped_articles": ["Art. 21(2)(a)", "Art. 21(2)(d)", "Art. 21(2)(g)", "Art. 23", "Annex I (Sectors)"],
        "mapped_controls": ["2-1 (IACS Security Policy)", "2-2 (Patch management)", "2-3 (Patch management)", "2-4 (Requirements for integrators)", "3-2 (Risk assessment)", "3-3 (Security for IACS)"],
        "notes": "NIS2 Annex I includes energy, transport, water, and other critical infrastructure sectors that rely on industrial control systems. IEC 62443 is the primary OT/ICS security standard referenced for NIS2 compliance. It addresses supply chain security (Art. 21(2)(d)), network security (Art. 21(2)(g)), and risk assessment requirements for IACS environments."
    },
    {
        "regulation_id": "CIRCIA",
        "standard_id": "IEC62443",
        "coverage_level": "substantial",
        "mapped_articles": ["Section 2240 (Critical infrastructure)", "CISA Proposed Rules"],
        "mapped_controls": ["2-1 (Security management)", "3-2 (Security risk assessment)", "3-3 (System security requirements)", "4-1 (Product security)", "4-2 (Component requirements)"],
        "notes": "CIRCIA covers critical infrastructure sectors including energy, water, and manufacturing where OT/ICS systems are prevalent. IEC 62443 provides the OT security framework for entities required to meet CIRCIA reporting obligations, supporting the security posture needed to detect and respond to reportable cyber incidents affecting industrial systems."
    },
    {
        "regulation_id": "DE_BSIG2",
        "standard_id": "IEC62443",
        "coverage_level": "substantial",
        "mapped_articles": ["§8a BSIG (KRITIS security)", "BSI Orientierungshilfe ICS-Security"],
        "mapped_controls": ["2-1 (Security policy)", "2-2 (Patch)", "3-2 (Risk assessment)", "3-3 (System requirements)", "4-1 (Secure development)", "4-2 (Component security)"],
        "notes": "Germany's IT-SiG 2.0 and BSI explicitly reference IEC 62443 as the applicable security standard for KRITIS operators (critical infrastructure) running industrial control systems. The BSI publishes ICS security orientation guidance aligned with IEC 62443 for energy, water, and manufacturing sector operators."
    },
    {
        "regulation_id": "AUSTRALIA_SOCI",
        "standard_id": "IEC62443",
        "coverage_level": "partial",
        "mapped_articles": ["Part 2A (CIRMP)", "Rules for Critical Infrastructure Sectors"],
        "mapped_controls": ["2-1 (Security policy)", "3-2 (Risk assessment)", "3-3 (System security)", "2-4 (Integrator security)"],
        "notes": "Australia's SOCI Act covers critical infrastructure sectors (energy, water, ports, transport) that heavily rely on OT/ICS systems. IEC 62443 provides the OT security framework applicable to SOCI's Critical Infrastructure Risk Management Program requirements for these industrial sectors."
    },
    {
        "regulation_id": "ISRAEL_CYBER",
        "standard_id": "IEC62443",
        "coverage_level": "partial",
        "mapped_articles": ["INCD Critical Infrastructure Directive", "Cyber Defense Methodology"],
        "mapped_controls": ["2-1 (Security policy)", "3-2 (Risk assessment)", "3-3 (System security)", "4-2 (Component security)"],
        "notes": "Israel's INCD Cyber Directive for critical infrastructure references international standards including IEC 62443 for industrial and OT environments. The INCD Cyber Defense Methodology maps onto IEC 62443 zone/conduit concepts for critical infrastructure protection."
    },
    {
        "regulation_id": "SINGAPORE_CSA",
        "standard_id": "IEC62443",
        "coverage_level": "partial",
        "mapped_articles": ["CII Designation", "Cybersecurity Code of Practice for CII"],
        "mapped_controls": ["2-1 (Security policy)", "3-2 (Risk assessment)", "3-3 (System security)", "2-2 (Patch management)"],
        "notes": "Singapore Cybersecurity Act designates Critical Information Infrastructure (CII) operators including power, water, and transport sectors with OT systems. MAS and CSA guidance for CII OT/ICS security aligns with IEC 62443 zone and conduit segmentation and security level concepts."
    },
    {
        "regulation_id": "CYBER_ACT",
        "standard_id": "IEC62443",
        "coverage_level": "partial",
        "mapped_articles": ["ENISA Certification (Art. 46)", "IoT/ICS Candidate Scheme"],
        "mapped_controls": ["4-1 (Secure development lifecycle)", "4-2 (Component security)", "3-3 (System security requirements)"],
        "notes": "EU Cyber Act establishes ENISA-managed cybersecurity certification schemes including for industrial products and IoT. IEC 62443 Part 4-1 (secure development lifecycle) and Part 4-2 (component requirements) form the basis for industrial product certification under EU Cyber Act schemes."
    },
    {
        "regulation_id": "JP_CYBER_BASIC_ACT",
        "standard_id": "IEC62443",
        "coverage_level": "partial",
        "mapped_articles": ["Basic Plan on Cybersecurity", "METI Guidelines for Critical Infrastructure"],
        "mapped_controls": ["2-1 (Security policy)", "3-2 (Risk assessment)", "3-3 (System security)"],
        "notes": "Japan's Cybersecurity Basic Act and METI critical infrastructure guidelines reference IEC 62443 for securing industrial control systems in energy, transport, and manufacturing sectors. Japan's Industrial Cyber Security Centre of Excellence promotes IEC 62443 adoption for OT environments."
    },
]

def main():
    with open(MAPPINGS_FILE, encoding="utf-8") as f:
        data = json.load(f)

    existing = {(m["regulation_id"], m["standard_id"]) for m in data["mappings"]}
    added = 0
    skipped = 0

    for m in NEW_MAPPINGS:
        key = (m["regulation_id"], m["standard_id"])
        if key in existing:
            print(f"  SKIP (exists): {m['regulation_id']} ↔ {m['standard_id']}")
            skipped += 1
        else:
            data["mappings"].append(m)
            existing.add(key)
            print(f"  ADD: {m['regulation_id']:30} <-> {m['standard_id']:20} [{m['coverage_level']}]")
            added += 1

    data["last_updated"] = datetime.date.today().isoformat()
    data["version"] = "1.2.0"

    with open(MAPPINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nDone: {added} added, {skipped} skipped. Total mappings: {len(data['mappings'])}")

if __name__ == "__main__":
    main()
