/* Reports — read-only matrix views over the commodity & distribution config.
 *
 * The first report is the Commodity configuration matrix:
 *   one row per workflow, with S/N + Group + Commodity merged across the
 *   workflows that belong to the same commodity (rowspan).
 *
 *   Columns:
 *     S/N, Group, Commodity, Client data sources, Processing ratio,
 *     Conversion factor, Synchronization timelines.
 */
import React from 'react';
import { Button, Icon, Card, Tab } from './Atoms.jsx';
import { DATA_SOURCES, DATASETS, COMMODITY_GROUPS } from './data.jsx';

const AGGREGATION_LABEL = {
    SUM:     'Sum',
    AVERAGE: 'Average',
    LAST:    'Last value',
    COUNT:   'Count',
};

const PERIOD_NOUN = {
    DAY:    'days',
    WEEKLY: 'weeks',
    MONTH:  'months',
    YEAR:   'years',
};

/* "Sum of 3 months" / "Average of 6 months" */
function periodAndAggregationText(workflow) {
    const verb = AGGREGATION_LABEL[workflow.aggregationType] || workflow.aggregationType;
    const noun = PERIOD_NOUN[workflow.periodType] || workflow.periodType.toLowerCase();
    const n = workflow.periodOfData;
    if (n === 1) {
        // singularize
        const sing = noun.replace(/s$/, '');
        return `${verb} for the last ${sing}`;
    }
    return `${verb} of ${n} ${noun}`;
}

/* Lookup helpers */
const sourceLabel  = (uid) => (DATA_SOURCES.find(d => d.value === uid) || {}).label || uid;
const datasetLabel = (uid) => (DATASETS.find(d => d.value === uid) || {}).label || uid;
const groupLabel   = (val) => (COMMODITY_GROUPS.find(g => g.value === val) || {}).label || val;

/* ---------- Client data sources cell ---------- */
const SourcesCell = ({ workflow }) => {
    // datasets come from rules of type ASSIGNED_TO_DATASET
    const datasetUids = workflow.rules
        .filter(r => r.type === 'ASSIGNED_TO_DATASET')
        .flatMap(r => r.datasets);
    const excludedUids = workflow.rules
        .filter(r => r.type === 'NOT_ASSIGNED_TO_DATASET')
        .flatMap(r => r.datasets);

    return (
        <div className="src-cell">
            <div className="src-head">{workflow.name}</div>

            <div className="src-block">
                <div className="src-label">Data elements involved</div>
                <ul className="src-list">
                    {workflow.dataSources.length === 0
                        ? <li className="src-empty">No data elements configured</li>
                        : workflow.dataSources.map(uid => (
                            <li key={uid}>
                                <span className="src-name">{sourceLabel(uid)}</span>
                                <span className="src-uid">[{uid}]</span>
                            </li>
                        ))
                    }
                </ul>
            </div>

            <div className="src-block">
                <div className="src-label">Datasets</div>
                {datasetUids.length === 0 ? (
                    <div className="src-empty">No dataset assignment rule</div>
                ) : (
                    <ul className="src-list">
                        {datasetUids.map(uid => (
                            <li key={uid}>
                                <span className="src-name">{datasetLabel(uid)}</span>
                                <span className="src-uid">[{uid}]</span>
                            </li>
                        ))}
                    </ul>
                )}
                {excludedUids.length > 0 && (
                    <ul className="src-list excluded">
                        {excludedUids.map(uid => (
                            <li key={uid}>
                                <span className="src-excl">Excluded:</span>
                                <span className="src-name">{datasetLabel(uid)}</span>
                                <span className="src-uid">[{uid}]</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="src-block last">
                <div className="src-label">Period and aggregation criteria</div>
                <div className="src-text">{periodAndAggregationText(workflow)}</div>
            </div>
        </div>
    );
};

/* ---------- Cron → human-friendly sync timeline ---------- */
const SyncTimelineCell = ({ cron }) => {
    const res = describeCron(cron);
    return (
        <div className="sync-cell">
            <div className="sync-human">{res.ok ? res.text : cron}</div>
            <div className="sync-cron mono">{cron}</div>
        </div>
    );
};

/* ---------- Numeric cell ---------- */
const NumCell = ({ value, mute }) => (
    <span className="num-cell" style={mute ? { color: 'var(--fg-muted)' } : {}}>
        {value}
    </span>
);

/* ---------- Main report ---------- */
const ConfigurationMatrixReport = ({ commodities, distributions }) => {
    const [group, setGroup] = React.useState('all');
    const [status, setStatus] = React.useState('all');
    const [q, setQ] = React.useState('');
    const [generatedAt] = React.useState(() => new Date().toISOString());

    const filtered = commodities.filter(c => {
        if (group !== 'all' && c.group !== group) return false;
        if (status === 'active' && !c.active) return false;
        if (status === 'inactive' && c.active) return false;
        if (q && !`${c.code} ${c.name}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
    });

    const totalRows = filtered.reduce((n, c) => n + Math.max(1, c.workflows.length), 0);

    const groupOptions = [
        { value: 'all', label: 'All groups' },
        ...COMMODITY_GROUPS.map(g => ({ value: g.value, label: `${g.value} — ${g.label.split('—')[1]?.trim() || g.label}` })),
    ];
    const statusOptions = [
        { value: 'all',      label: 'All statuses' },
        { value: 'active',   label: 'Active only' },
        { value: 'inactive', label: 'Inactive only' },
    ];

    const handlePrint = () => window.print();

    return (
        <div className="report">
            <div className="ph">
                <div>
                    <p className="breadcrumb">Commodity Control / Reports / Configuration matrix</p>
                    <h1>Commodity configuration matrix</h1>
                    <p className="lede">
                        Read-only snapshot of every commodity configuration and the workflows that move data into the
                        central LMIS warehouse. One row per workflow; commodities with multiple workflows span across
                        rows. Suitable for printing or archiving as a record of the active configuration.
                    </p>
                </div>
                <div className="actions">
                    <Button icon="download">Export CSV</Button>
                    <Button icon="file-document">Export PDF</Button>
                    <Button variant="primary" icon="launch" iconColor="white" onClick={handlePrint}>
                        Print
                    </Button>
                </div>
            </div>

            <div className="report-meta no-print">
                <div className="report-meta-item">
                    <div className="eyebrow">Generated</div>
                    <div className="val">{formatDate(generatedAt)} UTC</div>
                </div>
                <div className="report-meta-item">
                    <div className="eyebrow">Instance</div>
                    <div className="val">Ministry of Health, Sierra Leone</div>
                </div>
                <div className="report-meta-item">
                    <div className="eyebrow">Configurations</div>
                    <div className="val">
                        <strong>{filtered.length}</strong>
                        <span className="hint"> of {commodities.length}</span>
                    </div>
                </div>
                <div className="report-meta-item">
                    <div className="eyebrow">Workflow rows</div>
                    <div className="val"><strong>{totalRows}</strong></div>
                </div>
                <div className="report-meta-item">
                    <div className="eyebrow">Distributions</div>
                    <div className="val"><strong>{distributions.length}</strong></div>
                </div>
            </div>

            <div className="filter-bar no-print">
                <div className="search">
                    <span className="field-label">Search</span>
                    <Input
                        compact value={q} onChange={e => setQ(e.target.value)}
                        prefixIcon="search" placeholder="Filter by commodity name or code…"
                    />
                </div>
                <div className="compact-field">
                    <span className="field-label">Group</span>
                    <Select compact value={group} onChange={e => setGroup(e.target.value)} options={groupOptions} />
                </div>
                <div className="compact-field">
                    <span className="field-label">Status</span>
                    <Select compact value={status} onChange={e => setStatus(e.target.value)} options={statusOptions} />
                </div>
                <div className="meta">
                    <strong>{filtered.length}</strong> commodit{filtered.length === 1 ? 'y' : 'ies'} ·
                    &nbsp;<strong>{totalRows}</strong> workflow row{totalRows === 1 ? '' : 's'}
                </div>
            </div>

            {/* Print-only header banner */}
            <div className="print-header">
                <div className="ph-left">
                    <div className="ph-eyebrow">DHIS2 Commodity Control · Ministry of Health, Sierra Leone</div>
                    <div className="ph-title">Commodity configuration matrix</div>
                </div>
                <div className="ph-right">
                    <div><strong>Generated:</strong> {formatDate(generatedAt)} UTC</div>
                    <div><strong>Configurations:</strong> {filtered.length} · <strong>Rows:</strong> {totalRows}</div>
                </div>
            </div>

            <div className="tbl-wrap matrix-wrap">
                <table className="dhis2-table matrix-table">
                    <thead>
                        <tr>
                            <th style={{ width: 48 }}>S/N</th>
                            <th style={{ width: 96 }}>Group</th>
                            <th style={{ width: 240 }}>Commodity</th>
                            <th>Client data sources</th>
                            <th className="num" style={{ width: 90 }}>Processing<br/>ratio</th>
                            <th className="num" style={{ width: 100 }}>Conversion<br/>factor</th>
                            <th style={{ width: 220 }}>Synchronization<br/>timelines</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: 0 }}>
                                    <div className="empty-state" style={{ boxShadow: 'none', borderRadius: 0 }}>
                                        <Icon name="search" size={48} color="muted" />
                                        <h2>No configurations match your filters</h2>
                                        <p>Adjust the search term, group, or status to see more rows.</p>
                                        <Button onClick={() => { setQ(''); setGroup('all'); setStatus('all'); }}>
                                            Clear filters
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.flatMap((c, idx) => {
                            const wfs = c.workflows.length > 0 ? c.workflows : [null];
                            const span = wfs.length;
                            return wfs.map((wf, wIdx) => {
                                const first = wIdx === 0;
                                const isLastWf = wIdx === wfs.length - 1;
                                return (
                                    <tr
                                        key={`${c.id}-${wf ? wf.id : 'empty'}`}
                                        className={`matrix-row ${isLastWf ? 'cmty-boundary' : ''} ${!c.active ? 'inactive' : ''}`}
                                    >
                                        {first && (
                                            <td rowSpan={span} className="sn-cell">
                                                <span className="sn">{idx + 1}</span>
                                            </td>
                                        )}
                                        {first && (
                                            <td rowSpan={span} className="group-cell">
                                                <Tag>{c.group}</Tag>
                                                {!c.active && (
                                                    <div className="muted-tag" title="Configuration is inactive">
                                                        Inactive
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                        {first && (
                                            <td rowSpan={span} className="cmty-cell">
                                                <div className="cmty-name">{c.name}</div>
                                                <div className="cmty-code">
                                                    <span className="lbl">CODE:</span> {c.code}
                                                </div>
                                                <div className="cmty-meta">
                                                    Orders every {c.orderingPeriod}&nbsp;
                                                    {(PERIOD_NOUN[c.orderingPeriodType] || c.orderingPeriodType.toLowerCase()).replace(/s$/, c.orderingPeriod === 1 ? '' : 's')}
                                                </div>
                                                <div className="cmty-meta" title={groupLabel(c.group)}>
                                                    {wfs.length} workflow{wfs.length === 1 ? '' : 's'}
                                                </div>
                                            </td>
                                        )}
                                        {wf ? (
                                            <>
                                                <td><SourcesCell workflow={wf} /></td>
                                                <td className="num">
                                                    <NumCell value={wf.processingRatio} mute={wf.processingRatio === 1} />
                                                </td>
                                                <td className="num">
                                                    <NumCell value={wf.consumptionConversionFactor} mute={wf.consumptionConversionFactor === 1} />
                                                </td>
                                                <td><SyncTimelineCell cron={c.syncInterval} /></td>
                                            </>
                                        ) : (
                                            <td colSpan={4} className="no-workflow">
                                                <Icon name="error" size={16} color="yellow" />
                                                No workflows configured — this commodity will not sync.
                                            </td>
                                        )}
                                    </tr>
                                );
                            });
                        })}
                    </tbody>
                </table>
            </div>

            <div className="report-foot no-print">
                <div className="legend">
                    <span className="legend-title">Legend</span>
                    <span className="legend-item"><span className="sw sw-pr"></span> Processing ratio: fraction of raw consumption to keep (1 = pass through)</span>
                    <span className="legend-item"><span className="sw sw-cf"></span> Conversion factor: multiplier from facility unit to LMIS dispensing unit</span>
                </div>
                <div className="hint">
                    Source of truth: commodity configurations · Last edited fields are tracked in the audit log.
                </div>
            </div>
        </div>
    );
};

Object.assign(window, { ConfigurationMatrixReport });

/* ============================================================
 * Data Transfer Status report
 *
 * Operator picks a commodity + month → system loads the list of facilities
 * with their transfer status for that period. Region / District / Facility
 * filters cascade over the loaded rows.
 * ========================================================== */

const monthName2 = (m) => ['January','February','March','April','May','June','July','August','September','October','November','December'][m];

const TransferStatusTag = ({ status }) => {
    if (status === 'SUCCESS') return <Tag variant="positive" bold>SUCCESS</Tag>;
    if (status === 'FAILED')  return <Tag variant="negative" bold>FAILED</Tag>;
    return <Tag>{status}</Tag>;
};

const DataTransferReport = ({ commodities }) => {
    const today = new Date();

    /* Selection state — required before report loads */
    const [commodityId, setCommodityId] = React.useState('');
    const [year, setYear] = React.useState(today.getUTCFullYear());
    const [month, setMonth] = React.useState(today.getUTCMonth() === 0 ? 11 : today.getUTCMonth() - 1);
    const [loaded, setLoaded] = React.useState(null); // {commodityId, year, month} once loaded
    const [loading, setLoading] = React.useState(false);

    /* Filters that apply once loaded */
    const [region, setRegion] = React.useState('all');
    const [district, setDistrict] = React.useState('all');
    const [facility, setFacility] = React.useState('all');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(25);

    const yearOptions = [];
    for (let y = today.getUTCFullYear(); y >= 2023; y--) yearOptions.push({ value: y, label: String(y) });
    const monthOptions = Array.from({ length: 12 }).map((_, m) => ({ value: m, label: monthName2(m) }));

    const commodityOptions = [
        { value: '', label: 'Select a commodity…' },
        ...commodities.map(c => ({ value: c.id, label: `${c.code} — ${c.name}` })),
    ];

    const isFuturePeriod = year > today.getUTCFullYear() || (year === today.getUTCFullYear() && month > today.getUTCMonth());
    const canLoad = commodityId && !isFuturePeriod;

    const handleLoad = () => {
        if (!canLoad) return;
        setLoading(true);
        /* Simulate a short load to feel realistic */
        setTimeout(() => {
            setLoaded({ commodityId, year, month });
            setRegion('all'); setDistrict('all'); setFacility('all');
            setStatusFilter('all'); setPage(1);
            setLoading(false);
        }, 500);
    };

    /* Compute rows from current loaded selection */
    const allRows = React.useMemo(() => {
        if (!loaded) return [];
        return buildTransferStatusRows(loaded.commodityId, loaded.year, loaded.month);
    }, [loaded]);

    /* Cascading filter options */
    const regionOptions = React.useMemo(() => [
        { value: 'all', label: 'All regions' },
        ...[...new Set(allRows.map(r => r.region))].sort().map(r => ({ value: r, label: r })),
    ], [allRows]);
    const districtOptions = React.useMemo(() => {
        const districts = [...new Set(
            allRows.filter(r => region === 'all' || r.region === region).map(r => r.district)
        )].sort();
        return [{ value: 'all', label: 'All districts' }, ...districts.map(d => ({ value: d, label: d }))];
    }, [allRows, region]);
    const facilityOptions = React.useMemo(() => {
        const facilities = allRows
            .filter(r => (region === 'all' || r.region === region) && (district === 'all' || r.district === district))
            .map(r => r.facility);
        return [{ value: 'all', label: 'All facilities' }, ...[...new Set(facilities)].sort().map(f => ({ value: f, label: f }))];
    }, [allRows, region, district]);

    /* Reset cascaded filters if parent changes invalidate them */
    React.useEffect(() => {
        if (district !== 'all' && !districtOptions.some(o => o.value === district)) setDistrict('all');
    }, [region]);
    React.useEffect(() => {
        if (facility !== 'all' && !facilityOptions.some(o => o.value === facility)) setFacility('all');
    }, [region, district]);
    React.useEffect(() => { setPage(1); }, [region, district, facility, statusFilter, pageSize]);

    const filtered = allRows.filter(r => {
        if (region !== 'all' && r.region !== region) return false;
        if (district !== 'all' && r.district !== district) return false;
        if (facility !== 'all' && r.facility !== facility) return false;
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        return true;
    }).map((r, i) => ({ ...r, sn: i + 1 }));

    const counts = {
        SUCCESS: allRows.filter(r => r.status === 'SUCCESS').length,
        FAILED:  allRows.filter(r => r.status === 'FAILED').length,
    };
    const filteredCounts = {
        SUCCESS: filtered.filter(r => r.status === 'SUCCESS').length,
        FAILED:  filtered.filter(r => r.status === 'FAILED').length,
    };
    const totalValue = filtered.reduce((s, r) => s + (r.status === 'SUCCESS' ? r.value : 0), 0);
    const successRate = allRows.length === 0 ? 0 : (counts.SUCCESS / allRows.length * 100);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const start = (page - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    const loadedCommodity = loaded ? commodities.find(c => c.id === loaded.commodityId) : null;
    const loadedPeriodLabel = loaded ? `${monthName2(loaded.month)} ${loaded.year}` : '';
    const loadedPeriodCode = loaded ? `${loaded.year}${String(loaded.month + 1).padStart(2, '0')}` : '';

    return (
        <div className="report">
            <div className="ph">
                <div>
                    <p className="breadcrumb">Commodity Control / Reports / Data transfer status</p>
                    <h1>Data transfer status report</h1>
                    <p className="lede">
                        For a chosen commodity and reporting month, view the transfer status of every facility
                        that submitted data. Drill down by Region, District, or Facility to investigate failures.
                    </p>
                </div>
                {loaded && (
                    <div className="actions">
                        <Button icon="download">Export CSV</Button>
                        <Button icon="file-document">Export PDF</Button>
                        <Button variant="primary" icon="launch" iconColor="white" onClick={() => window.print()}>Print</Button>
                    </div>
                )}
            </div>

            {/* ----- Selection bar (always shown, even after load — lets user re-load) ----- */}
            <Card className="dts-selector flush no-print" style={{ padding: 20, marginBottom: 16 }}>
                <div className="dts-selector-grid">
                    <Field label="Commodity" required>
                        <Select
                            value={commodityId}
                            onChange={e => setCommodityId(e.target.value)}
                            options={commodityOptions}
                            placeholder="Select a commodity…"
                        />
                    </Field>
                    <Field label="Year" required>
                        <Select value={year} onChange={e => setYear(parseInt(e.target.value))} options={yearOptions} />
                    </Field>
                    <Field label="Month" required>
                        <Select value={month} onChange={e => setMonth(parseInt(e.target.value))} options={monthOptions} />
                    </Field>
                    <div className="dts-selector-load">
                        <Button
                            variant="primary"
                            icon="sync"
                            iconColor="white"
                            onClick={handleLoad}
                            disabled={!canLoad}
                            loading={loading}
                        >Load report</Button>
                    </div>
                </div>
                {isFuturePeriod && (
                    <div style={{ marginTop: 10 }}>
                        <NoticeBox variant="warning" title="Period is in the future">
                            Pick a past or current reporting month — no transfers have happened for {monthName2(month)} {year} yet.
                        </NoticeBox>
                    </div>
                )}
            </Card>

            {/* ----- Empty state when nothing loaded ----- */}
            {!loaded && !loading && (
                <div className="empty-state dts-empty">
                    <Icon name="file-document" size={48} color="muted" />
                    <h2>Select a commodity and a reporting month</h2>
                    <p>
                        The report lists every facility that should have reported on the chosen commodity for the chosen month,
                        with the outcome of its data transfer to the LMIS backend.
                    </p>
                </div>
            )}

            {loading && (
                <div className="empty-state dts-empty">
                    <span className="dhis2-loader dark lg" style={{ display: 'inline-block' }}></span>
                    <p style={{ marginTop: 8 }}>Loading transfer status for {monthName2(month)} {year}…</p>
                </div>
            )}

            {/* ----- Loaded report ----- */}
            {loaded && !loading && (
                <>
                    <div className="report-meta dts-meta no-print">
                        <div className="report-meta-item dts-grow">
                            <div className="eyebrow">Commodity</div>
                            <div className="val">
                                <strong>{loadedCommodity ? loadedCommodity.name : loaded.commodityId}</strong>
                                {loadedCommodity && <span className="hint"> · {loadedCommodity.code}</span>}
                            </div>
                        </div>
                        <div className="report-meta-item">
                            <div className="eyebrow">Reporting period</div>
                            <div className="val">
                                <strong>{loadedPeriodLabel}</strong>
                                <span className="hint mono"> · {loadedPeriodCode}</span>
                            </div>
                        </div>
                        <div className="report-meta-item">
                            <div className="eyebrow">Facilities loaded</div>
                            <div className="val"><strong>{allRows.length}</strong></div>
                        </div>
                        <div className="report-meta-item">
                            <div className="eyebrow">Success rate</div>
                            <div className="val">
                                <strong style={{ color: successRate >= 80 ? 'var(--green-800)' : successRate >= 50 ? 'var(--yellow-800)' : 'var(--red-700)' }}>
                                    {successRate.toFixed(1)}%
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Status-bucket chips (overview, not a filter) */}
                    <div className="dts-status-strip no-print">
                        <button
                            className={`dts-status-chip ${statusFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('all')}
                        >
                            <span className="dot all"></span>
                            <span className="chip-label">All</span>
                            <span className="chip-count">{allRows.length}</span>
                        </button>
                        <button
                            className={`dts-status-chip ${statusFilter === 'SUCCESS' ? 'active' : ''}`}
                            onClick={() => setStatusFilter(statusFilter === 'SUCCESS' ? 'all' : 'SUCCESS')}
                        >
                            <span className="dot success"></span>
                            <span className="chip-label">Success</span>
                            <span className="chip-count">{counts.SUCCESS}</span>
                        </button>
                        <button
                            className={`dts-status-chip ${statusFilter === 'FAILED' ? 'active' : ''}`}
                            onClick={() => setStatusFilter(statusFilter === 'FAILED' ? 'all' : 'FAILED')}
                        >
                            <span className="dot failed"></span>
                            <span className="chip-label">Failed</span>
                            <span className="chip-count">{counts.FAILED}</span>
                        </button>
                    </div>

                    {/* Cascade filter bar */}
                    <div className="filter-bar no-print">
                        <div className="compact-field lg">
                            <span className="field-label">Region</span>
                            <Select compact value={region} onChange={e => setRegion(e.target.value)} options={regionOptions} />
                        </div>
                        <div className="compact-field lg">
                            <span className="field-label">District</span>
                            <Select compact value={district} onChange={e => setDistrict(e.target.value)} options={districtOptions} />
                        </div>
                        <div className="compact-field lg">
                            <span className="field-label">Facility</span>
                            <Select compact value={facility} onChange={e => setFacility(e.target.value)} options={facilityOptions} />
                        </div>
                        <div className="meta">
                            Showing <strong>{filtered.length}</strong> of {allRows.length} facilities ·
                            &nbsp;total client data (successful only): <strong>{totalValue.toLocaleString()}</strong>
                        </div>
                    </div>

                    {/* Print-only header */}
                    <div className="print-header">
                        <div className="ph-left">
                            <div className="ph-eyebrow">DHIS2 Commodity Control · Data transfer status</div>
                            <div className="ph-title">
                                {loadedCommodity ? `${loadedCommodity.name} (${loadedCommodity.code})` : loaded.commodityId} · {loadedPeriodLabel}
                            </div>
                        </div>
                        <div className="ph-right">
                            <div><strong>Generated:</strong> {formatDate(new Date().toISOString())} UTC</div>
                            <div>
                                <strong>{filtered.length}</strong> facilities ·
                                Success {filteredCounts.SUCCESS} · Failed {filteredCounts.FAILED}
                            </div>
                        </div>
                    </div>

                    <div className="tbl-wrap">
                        <table className="dhis2-table dts-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 48 }}>S/N</th>
                                    <th style={{ width: 140 }}>Region</th>
                                    <th style={{ width: 180 }}>District</th>
                                    <th>Facility</th>
                                    <th style={{ width: 110 }}>Facility code</th>
                                    <th className="num" style={{ width: 130 }}>Client data sent</th>
                                    <th style={{ width: 110 }}>Status</th>
                                    <th>Status details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ padding: 0 }}>
                                            <div className="empty-state" style={{ boxShadow: 'none', borderRadius: 0 }}>
                                                <Icon name="search" size={48} color="muted" />
                                                <h2>No facilities match the current filters</h2>
                                                <p>Clear or change the Region / District / Facility / Status filters.</p>
                                                <Button onClick={() => {
                                                    setRegion('all'); setDistrict('all'); setFacility('all'); setStatusFilter('all');
                                                }}>Clear filters</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : pageRows.map(r => (
                                    <tr key={`${r.facilityCode}-${r.sn}`}>
                                        <td className="sn-cell" style={{ background: 'transparent', borderInlineEnd: 0 }}>
                                            <span className="sn">{r.sn}</span>
                                        </td>
                                        <td>{r.region}</td>
                                        <td>{r.district}</td>
                                        <td>
                                            <div className="row-stack">
                                                <span className="primary">{r.facility}</span>
                                                <span className="secondary" style={{ fontFamily: 'var(--font-family)', fontSize: 11.5 }}>
                                                    {r.level}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="mono">{r.facilityCode}</td>
                                        <td className="num">
                                            <span className={`dts-value ${r.status === 'FAILED' ? 'failed' : ''}`}>
                                                {r.value.toLocaleString()}
                                            </span>
                                        </td>
                                        <td><TransferStatusTag status={r.status} /></td>
                                        <td>
                                            <span style={{
                                                color: r.status === 'SUCCESS' ? 'var(--green-800)' : 'var(--red-700)',
                                                fontSize: 12.5, lineHeight: '17px',
                                            }}>{r.details}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination
                            page={page} totalPages={totalPages} pageSize={pageSize} total={filtered.length}
                            onPage={setPage} onPageSize={setPageSize}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

Object.assign(window, { DataTransferReport });
