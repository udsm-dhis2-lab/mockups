/* TransactionLogs — list view of transaction logs with filter, pagination, and detail modal */
import React from 'react';
import { Button, Tag, Modal, Input, Icon, Pagination, NoticeBox } from './Atoms.jsx';

const STATUS_TAG = (status) => {
    if (status === 'SUCCESS') return <Tag variant="positive" bold>SUCCESS</Tag>;
    if (status === 'FAILED')  return <Tag variant="negative" bold>FAILED</Tag>;
    if (status === 'PARTIAL') return <Tag variant="neutral"  bold style={{ background: 'var(--yellow-700)', color: 'white' }}>PARTIAL</Tag>;
    return <Tag>{status}</Tag>;
};
/* PARTIAL gets a custom yellow render — the design system doesn't have a "yellow bold tag" variant. */
const PartialTag = () => (
    <span className="dhis2-tag bold" style={{ background: 'var(--yellow-700)', color: 'white' }}>PARTIAL</span>
);

const renderStatus = (s) => {
    if (s === 'SUCCESS') return <Tag variant="positive" bold>SUCCESS</Tag>;
    if (s === 'FAILED')  return <Tag variant="negative" bold>FAILED</Tag>;
    if (s === 'PARTIAL') return <PartialTag />;
    return <Tag>{s}</Tag>;
};

const TransactionLogs = ({ logs, commodities, onView }) => {
    const [from, setFrom] = React.useState('');
    const [to, setTo] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);

    const filtered = logs.filter(l => {
        if (from) {
            const d = new Date(l.date), f = new Date(from);
            if (d < f) return false;
        }
        if (to) {
            const d = new Date(l.date), t = new Date(to + 'T23:59:59Z');
            if (d > t) return false;
        }
        return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    React.useEffect(() => { setPage(1); }, [from, to, pageSize]);

    return (
        <div>
            <div className="ph">
                <div>
                    <p className="breadcrumb">Commodity Control / Transaction logs</p>
                    <h1>Transaction logs</h1>
                    <p className="lede">
                        Every sync run logged with its outcome, record counts, and a link back to the source payload.
                    </p>
                </div>
                <div className="actions">
                    <Button icon="download">Export CSV</Button>
                    <Button icon="sync">Refresh</Button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="compact-field" style={{ maxWidth: 170 }}>
                    <span className="field-label">From</span>
                    <Input compact type="date" value={from} onChange={e => setFrom(e.target.value)} />
                </div>
                <div className="compact-field" style={{ maxWidth: 170 }}>
                    <span className="field-label">To</span>
                    <Input compact type="date" value={to} onChange={e => setTo(e.target.value)} />
                </div>
                <div className="meta">
                    Showing <strong>{total}</strong> of {logs.length} logs
                </div>
            </div>

            <div className="tbl-wrap">
                <table className="dhis2-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Configuration</th>
                            <th>Status</th>
                            <th className="num">Total</th>
                            <th className="num">Success</th>
                            <th className="num">Failed</th>
                            <th style={{ width: 1, textAlign: 'right' }}>Data link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ padding: 0 }}>
                                    <div className="empty-state" style={{ boxShadow: 'none', borderRadius: 0 }}>
                                        <Icon name="file-document" size={48} color="muted" />
                                        <h2>No transaction logs match these filters</h2>
                                        <p>Clear the date range or pick a different status to see more entries.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : pageRows.map(l => {
                            const cfg = commodities.find(c => c.id === l.configurationId);
                            return (
                                <tr key={l.id} className="clickable" onClick={() => onView(l)}>
                                    <td className="mono">{l.id}</td>
                                    <td>{formatDate(l.date)}</td>
                                    <td>
                                        {cfg
                                            ? <div className="row-stack">
                                                <span className="primary">{cfg.name}</span>
                                                <span className="secondary">{cfg.code}</span>
                                              </div>
                                            : <span style={{ color: 'var(--fg-muted)' }}>—</span>
                                        }
                                    </td>
                                    <td>{renderStatus(l.status)}</td>
                                    <td className="num">{l.stats.total.toLocaleString()}</td>
                                    <td className="num" style={{ color: l.stats.success > 0 ? 'var(--green-800)' : 'inherit' }}>
                                        {l.stats.success.toLocaleString()}
                                    </td>
                                    <td className="num" style={{ color: l.stats.failed > 0 ? 'var(--red-700)' : 'inherit' }}>
                                        {l.stats.failed.toLocaleString()}
                                    </td>
                                    <td style={{ textAlign: 'end' }} onClick={e => e.stopPropagation()}>
                                        <a className="link" href={l.dataLink} target="_blank" rel="noopener noreferrer" title="Open payload in new tab">
                                            <Icon name="launch" size={16} color="blue" />
                                        </a>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <Pagination
                    page={page} totalPages={totalPages} pageSize={pageSize} total={total}
                    onPage={setPage} onPageSize={setPageSize}
                />
            </div>
        </div>
    );
};

const TransactionLogDetail = ({ log, commodities, onClose }) => {
    if (!log) return null;
    const cfg = commodities.find(c => c.id === log.configurationId);
    const successRate = log.stats.total > 0 ? (log.stats.success / log.stats.total * 100).toFixed(1) : '0.0';

    return (
        <Modal
            title={`Transaction ${log.id}`}
            subtitle={formatDate(log.date) + ' UTC'}
            onClose={onClose}
            footer={
                <>
                    <span className="hint">Run by: {log.triggeredBy}</span>
                    <div className="right">
                        <Button onClick={onClose}>Close</Button>
                        <Button icon="launch" onClick={() => window.open(log.dataLink, '_blank')}>Open payload</Button>
                        {log.status !== 'SUCCESS' && (
                            <Button variant="primary" icon="sync" iconColor="white">Retry</Button>
                        )}
                    </div>
                </>
            }
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                {renderStatus(log.status)}
                <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
                    {log.status === 'SUCCESS' && 'All records synced successfully.'}
                    {log.status === 'PARTIAL' && `${log.stats.failed.toLocaleString()} of ${log.stats.total.toLocaleString()} records failed to sync.`}
                    {log.status === 'FAILED'  && 'Run aborted — no records were synced.'}
                </span>
            </div>

            <div className="stat-chips" style={{ marginBottom: 20 }}>
                <div className="stat-chip">
                    <div className="eyebrow">Total records</div>
                    <div className="val">{log.stats.total.toLocaleString()}</div>
                </div>
                <div className="stat-chip success">
                    <div className="eyebrow">Synced</div>
                    <div className="val">{log.stats.success.toLocaleString()}</div>
                </div>
                <div className="stat-chip error">
                    <div className="eyebrow">Failed</div>
                    <div className="val">{log.stats.failed.toLocaleString()}</div>
                </div>
                <div className="stat-chip">
                    <div className="eyebrow">Success rate</div>
                    <div className="val">{successRate}%</div>
                </div>
                <div className="stat-chip">
                    <div className="eyebrow">Duration</div>
                    <div className="val">{formatDuration(log.durationMs)}</div>
                </div>
            </div>

            {log.errorMessage && (
                <div style={{ marginBottom: 20 }}>
                    <NoticeBox variant="error" title="Failure reason">
                        {log.errorMessage}
                    </NoticeBox>
                </div>
            )}

            <h3 className="section-heading">Details</h3>
            <dl className="kv-grid">
                <dt>Configuration</dt>
                <dd>{cfg ? `${cfg.name} (${cfg.code})` : log.configurationId}</dd>
                <dt>Group</dt>
                <dd>{cfg ? <Tag>{cfg.group}</Tag> : '—'}</dd>
                <dt>Run timestamp (UTC)</dt>
                <dd className="mono">{log.date}</dd>
                <dt>Triggered by</dt>
                <dd>{log.triggeredBy}</dd>
                <dt>Transaction ID</dt>
                <dd className="mono">{log.id}</dd>
                <dt>Data link</dt>
                <dd><a className="link" href={log.dataLink} target="_blank" rel="noopener noreferrer">{log.dataLink} <Icon name="launch" size={14} color="blue" /></a></dd>
            </dl>
        </Modal>
    );
};

export { TransactionLogs, TransactionLogDetail };
Object.assign(window, { TransactionLogs, TransactionLogDetail });
