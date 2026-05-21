import React, { useState, useEffect } from 'react'
import {
    Button,
    ButtonStrip,
    InputField,
    DataTable,
    DataTableHead,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    Tag,
    Pagination,
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    NoticeBox,
    IconDownload16,
    IconSync16,
    IconLaunch16,
} from '@dhis2/ui'
import { formatDate, formatDuration } from './data.js'

const StatusTag = ({ status }) => {
    if (status === 'SUCCESS') return <Tag positive bold>SUCCESS</Tag>
    if (status === 'FAILED')  return <Tag negative bold>FAILED</Tag>
    if (status === 'PARTIAL') return (
        <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '5px 6px', borderRadius: 3,
            background: 'var(--yellow-700)', color: 'white',
            fontSize: 13, fontWeight: 700, height: 23,
        }}>PARTIAL</span>
    )
    return <Tag>{status}</Tag>
}

export function TransactionLogs({ logs, commodities, onView }) {
    const [filter, setFilter] = useState('all')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const counts = {
        all:     logs.length,
        success: logs.filter(l => l.status === 'SUCCESS').length,
        partial: logs.filter(l => l.status === 'PARTIAL').length,
        failed:  logs.filter(l => l.status === 'FAILED').length,
    }

    const filtered = logs.filter(l => {
        if (filter !== 'all' && l.status !== filter.toUpperCase()) return false
        if (from && new Date(l.date) < new Date(from)) return false
        if (to && new Date(l.date) > new Date(to + 'T23:59:59Z')) return false
        return true
    })

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

    useEffect(() => { setPage(1) }, [filter, from, to, pageSize])

    const filterBtnStyle = (id) => ({
        padding: '0 12px', height: 36, border: '1px solid',
        borderRadius: 3, cursor: 'pointer', fontSize: 13,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: filter === id ? 'var(--blue-700)' : 'white',
        color: filter === id ? 'white' : 'var(--grey-800)',
        borderColor: filter === id ? 'var(--blue-700)' : 'var(--grey-400)',
        fontFamily: 'var(--font-family)',
    })
    const countStyle = (id) => ({
        fontFamily: 'var(--font-family-mono)', fontSize: 11,
        background: filter === id ? 'rgba(255,255,255,0.18)' : 'var(--grey-200)',
        color: filter === id ? 'white' : 'var(--grey-700)',
        padding: '1px 6px', borderRadius: 8,
    })

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
                <div className="ph-actions">
                    <Button icon={<IconDownload16 />}>Export CSV</Button>
                    <Button icon={<IconSync16 />}>Refresh</Button>
                </div>
            </div>

            <div className="filter-bar">
                <div>
                    <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--grey-600)', margin: '0 0 4px', fontWeight: 500 }}>
                        Status
                    </p>
                    <div style={{ display: 'flex', gap: 0, border: '1px solid var(--grey-400)', borderRadius: 3, overflow: 'hidden' }}>
                        {[
                            { id: 'all',     label: 'All' },
                            { id: 'success', label: 'Success' },
                            { id: 'partial', label: 'Partial' },
                            { id: 'failed',  label: 'Failed' },
                        ].map(({ id, label }) => (
                            <button
                                key={id}
                                style={{
                                    ...filterBtnStyle(id),
                                    borderRadius: 0,
                                    border: 0,
                                    borderInlineEnd: '1px solid var(--grey-400)',
                                }}
                                onClick={() => setFilter(id)}
                            >
                                {label}
                                <span style={countStyle(id)}>{counts[id]}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="filter-field" style={{ maxWidth: 170 }}>
                    <InputField
                        dense
                        label="From"
                        type="date"
                        value={from}
                        onChange={({ value }) => setFrom(value)}
                    />
                </div>
                <div className="filter-field" style={{ maxWidth: 170 }}>
                    <InputField
                        dense
                        label="To"
                        type="date"
                        value={to}
                        onChange={({ value }) => setTo(value)}
                    />
                </div>
                <div className="filter-meta">
                    Showing <strong>{total}</strong> of {logs.length} logs
                </div>
            </div>

            <div className="table-container">
                <DataTable>
                    <DataTableHead>
                        <DataTableRow>
                            <DataTableColumnHeader>ID</DataTableColumnHeader>
                            <DataTableColumnHeader>Date</DataTableColumnHeader>
                            <DataTableColumnHeader>Configuration</DataTableColumnHeader>
                            <DataTableColumnHeader>Status</DataTableColumnHeader>
                            <DataTableColumnHeader align="right">Total</DataTableColumnHeader>
                            <DataTableColumnHeader align="right">Success</DataTableColumnHeader>
                            <DataTableColumnHeader align="right">Failed</DataTableColumnHeader>
                            <DataTableColumnHeader align="right">Data link</DataTableColumnHeader>
                        </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                        {pageRows.length === 0 ? (
                            <DataTableRow>
                                <DataTableCell colSpan="8">
                                    <div className="empty-state" style={{ boxShadow: 'none' }}>
                                        <h2>No transaction logs match these filters</h2>
                                        <p>Clear the date range or pick a different status to see more entries.</p>
                                    </div>
                                </DataTableCell>
                            </DataTableRow>
                        ) : pageRows.map(l => {
                            const cfg = commodities.find(c => c.id === l.configurationId)
                            return (
                                <DataTableRow
                                    key={l.id}
                                    className="clickable-row"
                                    onClick={() => onView(l)}
                                >
                                    <DataTableCell>
                                        <span className="mono" style={{ fontSize: 12.5, color: 'var(--grey-800)' }}>
                                            {l.id}
                                        </span>
                                    </DataTableCell>
                                    <DataTableCell>{formatDate(l.date)}</DataTableCell>
                                    <DataTableCell>
                                        {cfg ? (
                                            <div className="row-stack">
                                                <span className="primary">{cfg.name}</span>
                                                <span className="secondary">{cfg.code}</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--fg-muted)' }}>—</span>
                                        )}
                                    </DataTableCell>
                                    <DataTableCell><StatusTag status={l.status} /></DataTableCell>
                                    <DataTableCell align="right">
                                        <span className="mono">{l.stats.total.toLocaleString()}</span>
                                    </DataTableCell>
                                    <DataTableCell align="right">
                                        <span className="mono" style={{ color: l.stats.success > 0 ? 'var(--green-700)' : 'inherit' }}>
                                            {l.stats.success.toLocaleString()}
                                        </span>
                                    </DataTableCell>
                                    <DataTableCell align="right">
                                        <span className="mono" style={{ color: l.stats.failed > 0 ? 'var(--red-700)' : 'inherit' }}>
                                            {l.stats.failed.toLocaleString()}
                                        </span>
                                    </DataTableCell>
                                    <DataTableCell align="right" onClick={e => e.stopPropagation()}>
                                        <a
                                            className="app-link"
                                            href={l.dataLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Open payload in new tab"
                                        >
                                            <IconLaunch16 />
                                        </a>
                                    </DataTableCell>
                                </DataTableRow>
                            )
                        })}
                    </DataTableBody>
                </DataTable>

                <Pagination
                    page={page}
                    pageCount={totalPages}
                    total={total}
                    pageSize={pageSize}
                    pageSizeSet={[10, 25, 50, 100]}
                    onPageChange={setPage}
                    onPageSizeChange={({ pageSize: ps }) => setPageSize(ps)}
                />
            </div>
        </div>
    )
}

export function TransactionLogDetail({ log, commodities, onClose }) {
    if (!log) return null
    const cfg = commodities.find(c => c.id === log.configurationId)
    const successRate = log.stats.total > 0
        ? (log.stats.success / log.stats.total * 100).toFixed(1)
        : '0.0'

    return (
        <Modal large onClose={onClose}>
            <ModalTitle>
                Transaction {log.id}
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--grey-600)', fontWeight: 400 }}>
                    {formatDate(log.date)} UTC
                </p>
            </ModalTitle>

            <ModalContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                    <StatusTag status={log.status} />
                    <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
                        {log.status === 'SUCCESS' && 'All records synced successfully.'}
                        {log.status === 'PARTIAL' && `${log.stats.failed.toLocaleString()} of ${log.stats.total.toLocaleString()} records failed to sync.`}
                        {log.status === 'FAILED'  && 'Run aborted — no records were synced.'}
                    </span>
                </div>

                <div className="stat-chips" style={{ marginBottom: 20 }}>
                    <div className="stat-chip">
                        <div className="eyebrow">Total records</div>
                        <div className="chip-val">{log.stats.total.toLocaleString()}</div>
                    </div>
                    <div className="stat-chip chip-success">
                        <div className="eyebrow">Synced</div>
                        <div className="chip-val">{log.stats.success.toLocaleString()}</div>
                    </div>
                    <div className="stat-chip chip-error">
                        <div className="eyebrow">Failed</div>
                        <div className="chip-val">{log.stats.failed.toLocaleString()}</div>
                    </div>
                    <div className="stat-chip">
                        <div className="eyebrow">Success rate</div>
                        <div className="chip-val">{successRate}%</div>
                    </div>
                    <div className="stat-chip">
                        <div className="eyebrow">Duration</div>
                        <div className="chip-val">{formatDuration(log.durationMs)}</div>
                    </div>
                </div>

                {log.errorMessage && (
                    <div style={{ marginBottom: 20 }}>
                        <NoticeBox error title="Failure reason">{log.errorMessage}</NoticeBox>
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
                    <dd>
                        <a className="app-link" href={log.dataLink} target="_blank" rel="noopener noreferrer">
                            {log.dataLink} <IconLaunch16 />
                        </a>
                    </dd>
                </dl>
            </ModalContent>

            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onClose}>Close</Button>
                    <Button icon={<IconLaunch16 />} onClick={() => window.open(log.dataLink, '_blank')}>
                        Open payload
                    </Button>
                    {log.status !== 'SUCCESS' && (
                        <Button primary icon={<IconSync16 />}>Retry</Button>
                    )}
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
