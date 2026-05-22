/* ManualResend — operator UI for re-pushing a specific reporting period's
 * data to the LMIS backend. Pared back to the period picker only. */

const monthName = (m) => ['January','February','March','April','May','June','July','August','September','October','November','December'][m];
const monthShort = (m) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m];

/* Mock recent-resends — retained for App state compatibility but no longer rendered here. */
const SEED_RESENDS = [
    {
        id: 'rs-7c9a2b3d',
        date: '2026-05-19T09:14:00Z',
        period: { year: 2026, month: 3 },
        configurationIds: ['cf-amx-500'],
        status: 'SUCCESS',
        records: 445,
        triggeredBy: 'fkoroma@moh.gov.sl',
        reason: 'Retry after upstream timeout',
    },
];

const ManualResend = ({ commodities, onResend }) => {
    const today = new Date();
    const [year, setYear] = React.useState(today.getUTCFullYear());
    const [month, setMonth] = React.useState(today.getUTCMonth() === 0 ? 11 : today.getUTCMonth() - 1);

    const yearOptions = [];
    for (let y = today.getUTCFullYear() + 1; y >= 2024; y--) yearOptions.push({ value: y, label: String(y) });
    const monthOptions = Array.from({ length: 12 }).map((_, m) => ({ value: m, label: monthName(m) }));

    const periodLabel = `${monthName(month)} ${year}`;
    const periodCode = `${year}${String(month + 1).padStart(2, '0')}`;
    const isFuture = year > today.getUTCFullYear() || (year === today.getUTCFullYear() && month > today.getUTCMonth());

    return (
        <div>
            <div className="ph">
                <div>
                    <p className="breadcrumb">Commodity Control / Manual data resend</p>
                    <h1>Manual data resend</h1>
                    <p className="lede">
                        Re-push a specific reporting period's data to the LMIS backend. Use this when an automated
                        sync failed or a reporting correction was made downstream.
                    </p>
                </div>
            </div>

            <Card className="flush" style={{ padding: 24 }}>
                <h3 className="section-heading">
                    <span>Pick the reporting period to resend</span>
                    <span className="hint">Monthly periods only — pick a past month</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16, alignItems: 'start' }}>
                    <Field label="Year" required>
                        <Select value={year} onChange={e => setYear(parseInt(e.target.value))} options={yearOptions} />
                    </Field>
                    <Field label="Month" required>
                        <Select value={month} onChange={e => setMonth(parseInt(e.target.value))} options={monthOptions} />
                    </Field>
                    <div>
                        <span className="dhis2-label" style={{ display: 'block', marginBottom: 4 }}>Period code</span>
                        <div className="cron-preview" style={{ marginTop: 0 }}>
                            <Icon name="calendar" size={16} color="blue" />
                            <span className="label">{periodLabel}:</span>
                            <span style={{ fontFamily: 'var(--font-family-mono)' }}>{periodCode}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: 0.5, marginInlineEnd: 4 }}>
                        Quick pick
                    </span>
                    {quickPickMonths(today).map(qp => (
                        <button
                            key={qp.key}
                            type="button"
                            className="dhis2-btn small"
                            style={{
                                background: (qp.year === year && qp.month === month) ? 'var(--blue-050)' : 'white',
                                borderColor: (qp.year === year && qp.month === month) ? 'var(--blue-700)' : 'var(--grey-400)',
                                color: (qp.year === year && qp.month === month) ? 'var(--blue-800)' : 'var(--grey-800)',
                            }}
                            onClick={() => { setYear(qp.year); setMonth(qp.month); }}
                        >{qp.label}</button>
                    ))}
                </div>

                {isFuture && (
                    <div style={{ marginTop: 12 }}>
                        <NoticeBox variant="warning" title="That period is in the future">
                            You can only resend a past reporting period — there's no source data for {periodLabel} yet.
                        </NoticeBox>
                    </div>
                )}
            </Card>
        </div>
    );
};

/* Build a list of up to 4 quick-pick months ending at "last completed month". */
function quickPickMonths(today) {
    const out = [];
    let y = today.getUTCFullYear();
    let m = today.getUTCMonth() - 1;
    if (m < 0) { m = 11; y--; }
    for (let i = 0; i < 4; i++) {
        out.push({
            year: y,
            month: m,
            label: i === 0 ? `Last month (${monthShort(m)} ${y})` : `${monthShort(m)} ${y}`,
            key: `${y}-${m}`,
        });
        m--;
        if (m < 0) { m = 11; y--; }
    }
    return out;
}

Object.assign(window, { ManualResend, SEED_RESENDS });
