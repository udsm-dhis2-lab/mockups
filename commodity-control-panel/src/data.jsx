/* Mock data + helpers for Commodity Control app.
 * Realistic commodity codes/groups/cron strings for the DHIS2 LMIS domain. */

/* ---- Reference catalogs ---- */
const COMMODITY_GROUPS = [
    { value: 'NMCP', label: 'NMCP — National Malaria Control Programme' },
    { value: 'EPI',  label: 'EPI — Expanded Programme on Immunization' },
    { value: 'RH',   label: 'RH — Reproductive Health' },
    { value: 'HIV',  label: 'HIV — HIV / AIDS Programme' },
    { value: 'TB',   label: 'TB — Tuberculosis Programme' },
    { value: 'NCD',  label: 'NCD — Non-Communicable Diseases' },
];

const PERIOD_TYPES = [
    { value: 'DAY',     label: 'Daily' },
    { value: 'WEEKLY',  label: 'Weekly' },
    { value: 'MONTH',   label: 'Monthly' },
    { value: 'YEAR',    label: 'Yearly' },
];

const ORDERING_PERIODS = [
    { value: 'MONTH', label: 'MONTH' },
    { value: 'YEAR',  label: 'YEAR' },
];

const RULE_TYPES = [
    { value: 'ASSIGNED_TO_DATASET',     label: 'Assigned to dataset' },
    { value: 'NOT_ASSIGNED_TO_DATASET', label: 'Not assigned to dataset' },
];

/* ---- Recipient groups (UIDs are DHIS2-style 11-char base62) ---- */
const RECIPIENT_GROUPS = [
    { value: 'aQv1Rk7LP3z', label: 'District Pharmacists',     sub: 'aQv1Rk7LP3z · 142 users' },
    { value: 'bH4N9LkPq2x', label: 'Regional Logistics Officers', sub: 'bH4N9LkPq2x · 38 users' },
    { value: 'cR8mWv5XzL1', label: 'Facility In-Charges',      sub: 'cR8mWv5XzL1 · 1,204 users' },
    { value: 'dT2qPp9NfHy', label: 'Cold Chain Technicians',   sub: 'dT2qPp9NfHy · 67 users' },
    { value: 'eY6sKj3QbVm', label: 'Programme Managers',       sub: 'eY6sKj3QbVm · 24 users' },
    { value: 'fX0wDr7BcZj', label: 'Central Warehouse',        sub: 'fX0wDr7BcZj · 11 users' },
    { value: 'gJ8tEn4SaWk', label: 'CHWs — Tier 1',            sub: 'gJ8tEn4SaWk · 3,481 users' },
    { value: 'hL5yMq2VxRp', label: 'Procurement Unit, MoH',    sub: 'hL5yMq2VxRp · 8 users' },
];

/* ---- Data sources (data elements) ---- */
const DATA_SOURCES = [
    { value: 'dx7K3LpQvNa', label: 'Stock on hand — end of period',    sub: 'dx7K3LpQvNa · DataElement' },
    { value: 'dx2M9HrTwBz', label: 'Stock received',                   sub: 'dx2M9HrTwBz · DataElement' },
    { value: 'dx4F1PqBnLs', label: 'Stock issued to facility',         sub: 'dx4F1PqBnLs · DataElement' },
    { value: 'dx9R8VkXcMy', label: 'Consumption — adult dose',         sub: 'dx9R8VkXcMy · DataElement' },
    { value: 'dx0J5WnEzGp', label: 'Consumption — paediatric dose',    sub: 'dx0J5WnEzGp · DataElement' },
    { value: 'dx3D7YuHfQb', label: 'Wastage — expired',                sub: 'dx3D7YuHfQb · DataElement' },
    { value: 'dx6N2BkTrXw', label: 'Wastage — damaged in transit',     sub: 'dx6N2BkTrXw · DataElement' },
    { value: 'dx8C4LzMvPq', label: 'Adjustments',                      sub: 'dx8C4LzMvPq · DataElement' },
    { value: 'dx5T1QwSdNk', label: 'Orders placed',                    sub: 'dx5T1QwSdNk · DataElement' },
    { value: 'dx1A3FpRyCe', label: 'Days out of stock',                sub: 'dx1A3FpRyCe · DataElement' },
];

/* ---- Datasets ---- */
const DATASETS = [
    { value: 'dsM2lkLP8Qv', label: 'Monthly LMIS — Health Facility',   sub: 'dsM2lkLP8Qv · DataSet' },
    { value: 'dsK7tNvWxBz', label: 'Monthly LMIS — District Warehouse', sub: 'dsK7tNvWxBz · DataSet' },
    { value: 'dsR4hPqBnLs', label: 'Cold Chain Inventory',             sub: 'dsR4hPqBnLs · DataSet' },
    { value: 'dsY9VkXcMqp', label: 'Vaccine Wastage Returns',          sub: 'dsY9VkXcMqp · DataSet' },
    { value: 'dsJ5WnEzGpY', label: 'Antimalarial Commodities Report',  sub: 'dsJ5WnEzGpY · DataSet' },
    { value: 'dsD7YuHfQbT', label: 'HIV Commodities — ART Sites',      sub: 'dsD7YuHfQbT · DataSet' },
    { value: 'dsN2BkTrXwM', label: 'Family Planning Logistics',        sub: 'dsN2BkTrXwM · DataSet' },
    { value: 'dsC4LzMvPqA', label: 'TB Drugs Quarterly Return',        sub: 'dsC4LzMvPqA · DataSet' },
];

/* ---- Seed: 3+ commodity configurations ---- */
const SEED_COMMODITIES = [
    {
        id: 'cf-amx-500',
        code: '89LATY78',
        name: 'Amoxicillin 500mg capsules',
        group: 'NMCP',
        syncInterval: '0 0 * * 1',
        orderingPeriodType: 'MONTH',
        orderingPeriod: 2,
        active: true,
        recipientGroups: ['aQv1Rk7LP3z', 'cR8mWv5XzL1', 'fX0wDr7BcZj'],
        workflows: [
            {
                id: 'w1',
                name: 'Consumption sync',
                dataSources: ['dx7K3LpQvNa', 'dx9R8VkXcMy', 'dx3D7YuHfQb'],
                processingRatio: 0.85,
                consumptionConversionFactor: 1,
                periodType: 'MONTH',
                periodOfData: 3,
                skipEmpty: true,
                removeAndComplement: false,
                aggregationType: 'SUM',
                rules: [
                    { id: 'r1', type: 'ASSIGNED_TO_DATASET', datasets: ['dsM2lkLP8Qv', 'dsK7tNvWxBz'] },
                ],
            },
            {
                id: 'w2',
                name: 'Wastage tracking',
                dataSources: ['dx3D7YuHfQb', 'dx6N2BkTrXw'],
                processingRatio: 1,
                consumptionConversionFactor: 1,
                periodType: 'MONTH',
                periodOfData: 1,
                skipEmpty: false,
                removeAndComplement: true,
                aggregationType: 'SUM',
                rules: [],
            },
        ],
    },
    {
        id: 'cf-bcg-vac',
        code: 'V67BCGPED',
        name: 'BCG vaccine (paediatric, freeze-dried)',
        group: 'EPI',
        syncInterval: '0 2 * * *',
        orderingPeriodType: 'MONTH',
        orderingPeriod: 1,
        active: true,
        recipientGroups: ['bH4N9LkPq2x', 'dT2qPp9NfHy', 'eY6sKj3QbVm'],
        workflows: [
            {
                id: 'w1',
                name: 'Cold chain consumption',
                dataSources: ['dx0J5WnEzGp', 'dx7K3LpQvNa'],
                processingRatio: 1,
                consumptionConversionFactor: 20,
                periodType: 'MONTH',
                periodOfData: 6,
                skipEmpty: true,
                removeAndComplement: true,
                aggregationType: 'SUM',
                rules: [
                    { id: 'r1', type: 'ASSIGNED_TO_DATASET',     datasets: ['dsR4hPqBnLs'] },
                    { id: 'r2', type: 'NOT_ASSIGNED_TO_DATASET', datasets: ['dsY9VkXcMqp'] },
                ],
            },
        ],
    },
    {
        id: 'cf-iud-cu380',
        code: 'RH-IUD-C380',
        name: 'Copper IUD (TCu 380A)',
        group: 'RH',
        syncInterval: '15 3 1 */2 *',
        orderingPeriodType: 'YEAR',
        orderingPeriod: 1,
        active: false,
        recipientGroups: ['eY6sKj3QbVm', 'hL5yMq2VxRp'],
        workflows: [
            {
                id: 'w1',
                name: 'Default workflow',
                dataSources: ['dx9R8VkXcMy', 'dx8C4LzMvPq'],
                processingRatio: 0.5,
                consumptionConversionFactor: 1,
                periodType: 'YEAR',
                periodOfData: 1,
                skipEmpty: true,
                removeAndComplement: false,
                aggregationType: 'AVERAGE',
                rules: [],
            },
        ],
    },
    {
        id: 'cf-tdf-ftc',
        code: 'HIV-TDF300',
        name: 'TDF / FTC 300/200mg tablets',
        group: 'HIV',
        syncInterval: '30 4 * * *',
        orderingPeriodType: 'MONTH',
        orderingPeriod: 3,
        active: true,
        recipientGroups: ['cR8mWv5XzL1', 'eY6sKj3QbVm', 'gJ8tEn4SaWk'],
        workflows: [
            {
                id: 'w1',
                name: 'ART site consumption',
                dataSources: ['dx9R8VkXcMy', 'dx2M9HrTwBz', 'dx1A3FpRyCe'],
                processingRatio: 0.95,
                consumptionConversionFactor: 30,
                periodType: 'MONTH',
                periodOfData: 6,
                skipEmpty: true,
                removeAndComplement: false,
                aggregationType: 'SUM',
                rules: [
                    { id: 'r1', type: 'ASSIGNED_TO_DATASET', datasets: ['dsD7YuHfQbT'] },
                ],
            },
        ],
    },
    {
        id: 'cf-rh-ral',
        code: 'TB-RAL150',
        name: 'Rifampicin / Isoniazid 150/75mg',
        group: 'TB',
        syncInterval: '0 0 1 * *',
        orderingPeriodType: 'MONTH',
        orderingPeriod: 6,
        active: false,
        recipientGroups: ['eY6sKj3QbVm'],
        workflows: [
            {
                id: 'w1',
                name: 'Quarterly returns',
                dataSources: ['dx9R8VkXcMy', 'dx5T1QwSdNk'],
                processingRatio: 1,
                consumptionConversionFactor: 1,
                periodType: 'MONTH',
                periodOfData: 3,
                skipEmpty: false,
                removeAndComplement: false,
                aggregationType: 'SUM',
                rules: [
                    { id: 'r1', type: 'ASSIGNED_TO_DATASET', datasets: ['dsC4LzMvPqA'] },
                ],
            },
        ],
    },
];

/* ---- Seed: distribution configurations ---- */
const SEED_DISTRIBUTIONS = [
    {
        id: 'dist-malaria',
        name: 'Malaria & Antimalarial Sync',
        configurations: ['cf-amx-500', 'cf-iud-cu380'],
    },
    {
        id: 'dist-epi-cold',
        name: 'EPI Cold-Chain Distribution',
        configurations: ['cf-bcg-vac'],
    },
    {
        id: 'dist-hiv-tb',
        name: 'HIV + TB Quarterly Sync',
        configurations: ['cf-tdf-ftc', 'cf-rh-ral'],
    },
];

/* ---- Seed: transaction logs (12 entries) ---- */
const SEED_LOGS = [
    { id: 'tx-9f3a2b1c', date: '2026-05-20T14:32:00Z', status: 'SUCCESS', dataLink: 'https://hmis.example.org/api/dataSets/dsM2lkLP8Qv/dataValueSets?period=202604',
      configurationId: 'cf-amx-500', stats: { total: 450, success: 450, failed: 0 }, durationMs: 4831, triggeredBy: 'Cron scheduler' },
    { id: 'tx-7c4d8e2a', date: '2026-05-20T08:15:00Z', status: 'PARTIAL', dataLink: 'https://hmis.example.org/api/dataSets/dsR4hPqBnLs/dataValueSets?period=202604',
      configurationId: 'cf-bcg-vac', stats: { total: 312, success: 298, failed: 14 }, durationMs: 9210, triggeredBy: 'Cron scheduler' },
    { id: 'tx-2b9f1d6e', date: '2026-05-19T22:00:00Z', status: 'FAILED', dataLink: 'https://hmis.example.org/api/dataSets/dsD7YuHfQbT/dataValueSets?period=202604',
      configurationId: 'cf-tdf-ftc', stats: { total: 1024, success: 0, failed: 1024 }, durationMs: 23100, triggeredBy: 'Manual — fkoroma@moh.gov.sl', errorMessage: 'Connection timed out after 23.1s. Upstream endpoint hmis.example.org/api unreachable.' },
    { id: 'tx-5a8e3c7d', date: '2026-05-19T14:32:00Z', status: 'SUCCESS', dataLink: 'https://hmis.example.org/api/dataSets/dsC4LzMvPqA/dataValueSets?period=202604',
      configurationId: 'cf-rh-ral', stats: { total: 88, success: 88, failed: 0 }, durationMs: 1140, triggeredBy: 'Cron scheduler' },
    { id: 'tx-1d4f6b2c', date: '2026-05-18T14:32:00Z', status: 'SUCCESS', dataLink: 'https://hmis.example.org/api/dataSets/dsM2lkLP8Qv/dataValueSets?period=202603',
      configurationId: 'cf-amx-500', stats: { total: 445, success: 445, failed: 0 }, durationMs: 4602, triggeredBy: 'Cron scheduler' },
    { id: 'tx-6e2a9c1f', date: '2026-05-18T08:15:00Z', status: 'PARTIAL', dataLink: 'https://hmis.example.org/api/dataSets/dsR4hPqBnLs/dataValueSets?period=202603',
      configurationId: 'cf-bcg-vac', stats: { total: 310, success: 287, failed: 23 }, durationMs: 11203, triggeredBy: 'Cron scheduler' },
    { id: 'tx-4b1d8e3a', date: '2026-05-17T22:00:00Z', status: 'SUCCESS', dataLink: 'https://hmis.example.org/api/dataSets/dsD7YuHfQbT/dataValueSets?period=202603',
      configurationId: 'cf-tdf-ftc', stats: { total: 1018, success: 1018, failed: 0 }, durationMs: 18204, triggeredBy: 'Cron scheduler' },
    { id: 'tx-9c5f2e8b', date: '2026-05-17T14:32:00Z', status: 'FAILED', dataLink: 'https://hmis.example.org/api/dataSets/dsM2lkLP8Qv/dataValueSets?period=202603',
      configurationId: 'cf-amx-500', stats: { total: 440, success: 0, failed: 440 }, durationMs: 8100, triggeredBy: 'Cron scheduler', errorMessage: 'Authentication failed (HTTP 401). API token expired on 2026-05-17 00:00 UTC.' },
    { id: 'tx-3e7a1b4c', date: '2026-05-16T14:32:00Z', status: 'SUCCESS', dataLink: 'https://hmis.example.org/api/dataSets/dsM2lkLP8Qv/dataValueSets?period=202603',
      configurationId: 'cf-amx-500', stats: { total: 438, success: 438, failed: 0 }, durationMs: 4503, triggeredBy: 'Cron scheduler' },
    { id: 'tx-8f6d2c9a', date: '2026-05-15T08:15:00Z', status: 'SUCCESS', dataLink: 'https://hmis.example.org/api/dataSets/dsR4hPqBnLs/dataValueSets?period=202603',
      configurationId: 'cf-bcg-vac', stats: { total: 308, success: 308, failed: 0 }, durationMs: 7884, triggeredBy: 'Cron scheduler' },
    { id: 'tx-2a9b3e7f', date: '2026-05-14T14:32:00Z', status: 'PARTIAL', dataLink: 'https://hmis.example.org/api/dataSets/dsM2lkLP8Qv/dataValueSets?period=202603',
      configurationId: 'cf-amx-500', stats: { total: 442, success: 431, failed: 11 }, durationMs: 5621, triggeredBy: 'Manual — abalogun@moh.gov.sl' },
    { id: 'tx-5d8c1f6b', date: '2026-05-13T22:00:00Z', status: 'SUCCESS', dataLink: 'https://hmis.example.org/api/dataSets/dsD7YuHfQbT/dataValueSets?period=202603',
      configurationId: 'cf-tdf-ftc', stats: { total: 1012, success: 1012, failed: 0 }, durationMs: 17522, triggeredBy: 'Cron scheduler' },
];

/* ---- Helpers ---- */

/** Convert a cron string to a human-readable English description.
 *  Limited to the common cases the DHIS2 LMIS scheduler accepts:
 *  "min hour dom month dow". Returns { ok, text }. */
function describeCron(cron) {
    if (!cron || typeof cron !== 'string') return { ok: false, text: 'Empty cron expression' };
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5) return { ok: false, text: 'Cron must have exactly 5 fields (min hour day-of-month month day-of-week)' };
    const [min, hour, dom, mon, dow] = parts;
    const validField = (f) => /^([0-9*\/,\-]+)$/.test(f);
    if (!parts.every(validField)) return { ok: false, text: 'Invalid characters in cron expression' };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const time = (() => {
        const h = hour === '*' ? null : parseInt(hour);
        const m = min === '*' ? null : parseInt(min);
        if (h !== null && m !== null) {
            return `at ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }
        if (h === null && min !== '*') return `at minute ${min} of every hour`;
        if (m === null && hour !== '*') return `every minute of hour ${hour}`;
        return 'every minute';
    })();

    if (dow !== '*' && dom === '*') {
        const days = dow.split(',').map(d => dayNames[parseInt(d)] || d).join(', ');
        if (mon === '*') return { ok: true, text: `Every ${days} ${time}` };
        const m = monNames[parseInt(mon)] || mon;
        return { ok: true, text: `Every ${days} in ${m} ${time}` };
    }
    if (dom !== '*' && dow === '*') {
        if (mon === '*') return { ok: true, text: `Day ${dom} of every month ${time}` };
        if (mon.includes('/')) {
            const [, step] = mon.split('/');
            return { ok: true, text: `Day ${dom} of every ${step} months ${time}` };
        }
        const m = monNames[parseInt(mon)] || mon;
        return { ok: true, text: `${m} ${dom} ${time}` };
    }
    if (dom === '*' && dow === '*' && mon === '*') {
        return { ok: true, text: `Every day ${time}` };
    }
    return { ok: true, text: `${time}, day-of-month ${dom}, month ${mon}, day-of-week ${dow}` };
}

/** Format an ISO date string as "20 May 2026, 14:32". */
function formatDate(iso) {
    const d = new Date(iso);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getUTCDate();
    const mon = months[d.getUTCMonth()];
    const yr = d.getUTCFullYear();
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${day} ${mon} ${yr}, ${hh}:${mm}`;
}

function formatDuration(ms) {
    if (ms < 1000) return `${ms} ms`;
    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(1)} s`;
    const m = Math.floor(s / 60);
    const rs = Math.round(s - m * 60);
    return `${m}m ${rs}s`;
}

function newId(prefix = 'id') {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function commodityCodeFor(id, commodities) {
    const c = commodities.find(x => x.id === id);
    return c ? `${c.code} — ${c.name}` : id;
}

/* ---- Facilities (Tanzania-style health facility hierarchy) ---- */
const FACILITIES = [
    /* Mwanza Region */
    { region: 'Mwanza Region', district: 'Ilemela Municipal Council', name: 'ILEMELA District Hospital', code: '113672-0', level: 'Hospital' },
    { region: 'Mwanza Region', district: 'Ilemela Municipal Council', name: 'Nyamanoro Health Centre',    code: '113678-2', level: 'Health Centre' },
    { region: 'Mwanza Region', district: 'Ilemela Municipal Council', name: 'Pasiansi Dispensary',         code: '113681-4', level: 'Dispensary' },
    { region: 'Mwanza Region', district: 'Ilemela Municipal Council', name: 'Buzuruga Dispensary',         code: '113684-6', level: 'Dispensary' },
    { region: 'Mwanza Region', district: 'Nyamagana Municipal Council', name: 'Sekou Toure Regional Referral Hospital', code: '112440-1', level: 'Regional Referral' },
    { region: 'Mwanza Region', district: 'Nyamagana Municipal Council', name: 'Bugando Medical Centre',    code: '112451-9', level: 'Zonal Referral' },
    { region: 'Mwanza Region', district: 'Nyamagana Municipal Council', name: 'Mahina Health Centre',      code: '112458-3', level: 'Health Centre' },
    { region: 'Mwanza Region', district: 'Magu District Council',       name: 'Magu District Hospital',    code: '114012-7', level: 'Hospital' },
    { region: 'Mwanza Region', district: 'Magu District Council',       name: 'Kisesa Health Centre',      code: '114019-2', level: 'Health Centre' },
    { region: 'Mwanza Region', district: 'Magu District Council',       name: 'Ng\u2019hungumalwa Dispensary', code: '114024-8', level: 'Dispensary' },

    /* Mara Region */
    { region: 'Mara Region', district: 'Musoma Municipal Council', name: 'Musoma Regional Referral Hospital', code: '209110-3', level: 'Regional Referral' },
    { region: 'Mara Region', district: 'Musoma Municipal Council', name: 'Makoko Health Centre',              code: '209114-5', level: 'Health Centre' },
    { region: 'Mara Region', district: 'Musoma Municipal Council', name: 'Bweri Dispensary',                  code: '209119-1', level: 'Dispensary' },
    { region: 'Mara Region', district: 'Tarime District Council',  name: 'Tarime District Hospital',          code: '209304-2', level: 'Hospital' },
    { region: 'Mara Region', district: 'Tarime District Council',  name: 'Sirari Health Centre',              code: '209311-7', level: 'Health Centre' },
    { region: 'Mara Region', district: 'Tarime District Council',  name: 'Nyamwaga Dispensary',               code: '209318-4', level: 'Dispensary' },

    /* Mbeya Region */
    { region: 'Mbeya Region', district: 'Mbeya City Council', name: 'Mbeya Zonal Referral Hospital', code: '405210-9', level: 'Zonal Referral' },
    { region: 'Mbeya Region', district: 'Mbeya City Council', name: 'Iyunga Health Centre',          code: '405218-2', level: 'Health Centre' },
    { region: 'Mbeya Region', district: 'Mbeya City Council', name: 'Sisimba Dispensary',            code: '405224-5', level: 'Dispensary' },
    { region: 'Mbeya Region', district: 'Mbeya District Council', name: 'Mbeya District Hospital',   code: '405402-1', level: 'Hospital' },
    { region: 'Mbeya Region', district: 'Mbeya District Council', name: 'Ilembo Health Centre',      code: '405408-7', level: 'Health Centre' },

    /* Dodoma Region */
    { region: 'Dodoma Region', district: 'Dodoma City Council', name: 'Dodoma Regional Referral Hospital', code: '301110-0', level: 'Regional Referral' },
    { region: 'Dodoma Region', district: 'Dodoma City Council', name: 'Makole Health Centre',              code: '301117-3', level: 'Health Centre' },
    { region: 'Dodoma Region', district: 'Dodoma City Council', name: 'Chamwino Dispensary',               code: '301122-8', level: 'Dispensary' },
    { region: 'Dodoma Region', district: 'Bahi District Council', name: 'Bahi District Hospital',          code: '301308-6', level: 'Hospital' },
    { region: 'Dodoma Region', district: 'Bahi District Council', name: 'Chipanga Health Centre',          code: '301315-1', level: 'Health Centre' },
];

/* ---- Deterministic pseudo-random based on a string seed ---- */
function seededRand(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    /* Return a function that generates values 0..1 from the seed */
    return () => {
        h = Math.imul(h ^ (h >>> 15), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        h ^= h >>> 16;
        return ((h >>> 0) % 100000) / 100000;
    };
}

const FAILURE_REASONS = [
    'Connection timed out after 30s — upstream endpoint unreachable',
    'Authentication failed (HTTP 401) — API token expired',
    'No data values reported for this period',
    'Validation error — negative consumption value rejected by backend',
    'Upstream API returned HTTP 500 — backend logged in failure queue',
    'Dataset not assigned to this facility for the period',
    'Conflict (HTTP 409) — data values already submitted from another source',
];
const PARTIAL_REASONS = [
    (n, t) => `${n} of ${t} values rejected by backend validation`,
    (n, t) => `${n} of ${t} data elements unmapped — synced remainder only`,
    (n, t) => `${n} of ${t} values exceeded plausibility threshold`,
];

/* Generate one transfer row per facility for the given (commodity, period).
 * "Client data sent" is the actual reported numeric value (e.g. number of
 * clients seen / units consumed) — not a record count. Status is binary:
 * SUCCESS or FAILED. */
function buildTransferStatusRows(commodityId, year, month) {
    const periodCode = `${year}${String(month + 1).padStart(2, '0')}`;
    return FACILITIES.map((f, idx) => {
        const rand = seededRand(`${commodityId}|${periodCode}|${f.code}`);
        const r1 = rand(); const r2 = rand(); const r3 = rand();

        const levelBonus = f.level === 'Dispensary' ? -0.04 : (f.level === 'Hospital' || f.level.includes('Referral') ? 0.04 : 0);
        const p = r1 + levelBonus;

        /* The reported value scales with facility size */
        const base = f.level === 'Dispensary' ? 14 : f.level === 'Health Centre' ? 40 : 95;
        const value = Math.max(0, Math.round(base + (r2 - 0.5) * base * 0.7));

        let status, details;
        if (p < 0.12) {
            status = 'FAILED';
            details = FAILURE_REASONS[Math.floor(r3 * FAILURE_REASONS.length)];
        } else {
            status = 'SUCCESS';
            details = 'Successfully sent';
        }

        return {
            sn: idx + 1,
            region: f.region,
            district: f.district,
            facility: f.name,
            facilityCode: f.code,
            level: f.level,
            value,
            status,
            details,
        };
    });
}

Object.assign(window, {
    FACILITIES, buildTransferStatusRows,
});

/* ---- Existing exports ---- */
export {
    COMMODITY_GROUPS, PERIOD_TYPES, ORDERING_PERIODS, RULE_TYPES,
    RECIPIENT_GROUPS, DATA_SOURCES, DATASETS,
    SEED_COMMODITIES, SEED_DISTRIBUTIONS, SEED_LOGS,
    describeCron, formatDate, formatDuration, newId, commodityCodeFor,
    FACILITIES, buildTransferStatusRows,
};
Object.assign(window, {
    COMMODITY_GROUPS, PERIOD_TYPES, ORDERING_PERIODS, RULE_TYPES,
    RECIPIENT_GROUPS, DATA_SOURCES, DATASETS,
    SEED_COMMODITIES, SEED_DISTRIBUTIONS, SEED_LOGS,
    describeCron, formatDate, formatDuration, newId, commodityCodeFor,
});
