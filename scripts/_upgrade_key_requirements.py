"""
Convert string-format key_requirements to full object format for all 84 affected regulations.
Assigns control_theme by keyword matching, generates consequence from penalties field,
and generates evidence_guide from text context.
"""
import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

THEME_KEYWORDS = [
    ('incident_response',   ['breach', 'incident', 'notify', 'notification', '72 hour', '24 hour',
                              'security event', 'cyber attack', 'report.*incident', 'respond to']),
    ('access_control',      ['access control', 'authentication', 'password', 'authoris', 'authoriz',
                              'user access', 'role-based', 'privilege', 'login', 'credential',
                              'multi-factor', 'mfa', 'least privilege']),
    ('vendor_management',   ['third party', 'third-party', 'vendor', 'supplier', 'processor',
                              'sub-processor', 'outsourc', 'cross-border', 'transfer of data',
                              'data transfer', 'adequate protection', 'contract', 'due diligence',
                              'supply chain', 'service provider']),
    ('training_awareness',  ['train', 'awareness', 'employee', 'personnel', 'staff', 'workforce',
                              'education', 'competenc']),
    ('technical_controls',  ['encrypt', 'technical control', 'firewall', 'patch', 'penetration',
                              'vulnerability', 'security measure', 'implement.*security', 'log',
                              'monitoring', 'pseudonymis', 'anonymis', 'anonymiz', 'pseudonymiz',
                              'data minimis', 'retention period', 'secure', 'deletion', 'disposal',
                              'backup', 'network', 'system security']),
    ('risk_assessment',     ['risk assess', 'risk management', 'impact assessment', 'dpia', 'pia',
                              'audit', 'review', 'test', 'evaluation', 'due diligence.*risk',
                              'conduct.*assessment', 'annual.*audit', 'internal audit']),
    ('board_governance',    ['board', 'director', 'executive', 'c-suite', 'ciso', 'dpo',
                              'appoint', 'officer', 'committee', 'oversight', 'governance',
                              'senior management', 'management.*responsibl', 'compliance officer',
                              'data protection officer']),
    ('financial_controls',  ['financial', 'accounting', 'internal control', 'segregation',
                              'fraud', 'bribery', 'corruption', 'anti-corruption', 'anti-bribery',
                              'money laundering', 'aml', 'beneficial owner', 'sanction',
                              'gift', 'facilitation payment']),
    ('policy_procedures',   ['policy', 'procedure', 'document', 'record', 'ropa', 'register',
                              'registrar', 'privacy notice', 'consent', 'lawful basis', 'legal basis',
                              'purpose', 'publish', 'maintain.*record', 'keep.*record',
                              'data subject right', 'right to access', 'right to erasure',
                              'right to correct', 'data subject']),
]

EVIDENCE_TEMPLATES = {
    'incident_response':   'Incident response plan; breach notification logs; supervisor authority submission records; post-incident review reports',
    'access_control':      'Access control policy; user provisioning records; privileged access review logs; authentication configuration evidence',
    'vendor_management':   'Vendor contracts/DPAs; third-party risk assessments; supplier due diligence records; data transfer agreements',
    'training_awareness':  'Training completion records; awareness programme materials; staff acknowledgement logs; competency assessments',
    'technical_controls':  'Security configuration baselines; encryption certificates; vulnerability scan reports; penetration test results; patch management logs',
    'risk_assessment':     'Risk register; DPIA/PIA records; internal/external audit reports; risk treatment plans; review schedules',
    'board_governance':    'Board/committee minutes; appointment letters; terms of reference; senior management sign-off records; governance frameworks',
    'financial_controls':  'Anti-corruption policy; gift register; financial control documentation; internal audit reports; compliance certifications',
    'policy_procedures':   'Policy register; Records of Processing Activities; consent management records; privacy notices; data subject request logs',
    'data_governance':     'Data inventory/classification register; processing records; data lifecycle policy; records of lawful basis',
}


def infer_theme(text):
    t = text.lower()
    for theme, keywords in THEME_KEYWORDS:
        for kw in keywords:
            if re.search(kw, t):
                return theme
    return 'data_governance'


def make_consequence(reg, theme):
    penalty = reg.get('penalties', '')
    base = {
        'incident_response':   'Failure to notify may result in regulatory fines and enforcement action.',
        'access_control':      'Inadequate access controls can lead to data breaches and regulatory penalties.',
        'vendor_management':   'Unlawful data transfers or inadequate vendor contracts expose the organisation to fines.',
        'training_awareness':  'Insufficient staff training undermines compliance and may be cited in regulatory findings.',
        'technical_controls':  'Absence of required technical safeguards may result in enforcement notices and fines.',
        'risk_assessment':     'Failure to assess risks may constitute a compliance breach attracting regulatory action.',
        'board_governance':    'Lack of designated responsibility can result in personal liability for senior management.',
        'financial_controls':  'Non-compliance may result in criminal prosecution, fines, and reputational damage.',
        'policy_procedures':   'Missing or inadequate policies may be cited in regulatory audits and lead to sanctions.',
        'data_governance':     'Non-compliance with data governance obligations may attract regulatory fines and orders.',
    }[theme]
    if penalty:
        return base + f' Penalties: {penalty}.'
    return base


def make_evidence(theme):
    return EVIDENCE_TEMPLATES.get(theme, 'Policy documentation; operational records; audit evidence')


with open('data/regulations.json', encoding='utf-8') as f:
    data = json.load(f)

regs = data['regulations']
converted = 0

for reg in regs:
    reqs = reg.get('key_requirements', [])
    if not reqs:
        continue
    if isinstance(reqs[0], dict):
        continue  # already object format

    new_reqs = []
    for i, text in enumerate(reqs):
        if not isinstance(text, str):
            new_reqs.append(text)
            continue
        theme = infer_theme(text)
        req_id = reg['id'] + '-R' + str(i + 1).zfill(3)
        new_reqs.append({
            'id': req_id,
            'text': text,
            'consequence': make_consequence(reg, theme),
            'evidence_guide': make_evidence(theme),
            'control_theme': theme,
        })
    reg['key_requirements'] = new_reqs
    converted += 1
    print('Converted ' + reg['id'] + ' (' + reg['short_name'] + '): ' + str(len(new_reqs)) + ' reqs')

with open('data/regulations.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('\nDone. Converted ' + str(converted) + ' regulations.')
