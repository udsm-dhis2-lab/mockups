import React, { useState } from 'react'
import {
    Button,
    ButtonStrip,
    InputField,
    SingleSelectField,
    SingleSelectOption,
    Transfer,
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    NoticeBox,
    DataTable,
    DataTableHead,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    Tag,
    IconSync16,
    IconCalendar16,
} from '@dhis2/ui'
import { monthName, monthShort, quickPickMonths, formatDate, newId } from './data.js'

export default function ManualResend({ commodities, onResend, recentResends }) {
    const today = new Date()
    const [selectedIds, setSelectedIds] = useState([])
    const [year, setYear] = useState(today.getUTCFullYear())
    const [month, setMonth] = useState(today.getUTCMonth() === 0 ? 11 : today.getUTCMonth() - 1)
    const [reason, setReason] = useState('')
    const [confirming, setConfirming] = useState(false)
    const [resending, setResending] = useState(false)

    const yearOptions = []
    for (let y = today.getUTCFullYear() + 1; y >= 2024; y--)
        yearOptions.push({ value: String(y), label: String(y) })
    const monthOptions = Array.from({ length: 12 }, (_, m) => ({ value: String(m), label: monthName(m) }))

    const periodLabel = `${monthName(month)} ${year}`
    const periodCode = `${year}${String(month + 1).padStart(2, '0')}`
    const selectedConfigs = commodities.filter(c => selectedIds.includes(c.id))
    const estimatedRecords = selectedConfigs.reduce((s, c) => s + c.workflows.length * 240, 0)
    const isFuture = year > today.getUTCFullYear() ||
        (year === today.getUTCFullYear() && month > today.getUTCMonth())
    const canSubmit = selectedIds.length > 0 && !isFuture

    const doResend = () => {
        setResending(true)
        setTimeout(() => {
            onResend({
                configurationIds: selectedIds,
                period: { year, month },
                reason: reason.trim() || null,
                estimatedRecords,
            })
            setResending(false)
            setConfirming(false)
            setSelectedIds([])
            setReason('')
        }, 900)
    }

    const commodityOptions = commodities.map(c => ({
        value: c.id,
        label: `${c.name} (${c.code})`,
    }))

    const sectionStyle = { padding: 24 }
    const dividerStyle = { borderTop: '1px solid var(--grey-300)', padding: 24 }
    const stepNumStyle = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 18, height: 18, borderRadius: '50%',
        background: 'var(--blue-700)', color: 'white',
        fontSize: 11, marginInlineEnd: 8, fontWeight: 500,
    }

    return (
        <div>
            <div className="ph">
                <div>
                    <p className="breadcrumb">Commodity Control / Manual data resend</p>
                    <h1>Manual data resend</h1>
                    <p className="lede">
                        Re-push a specific reporting period's data to the LMIS backend. Use this when an
                        automated sync failed, a reporting correction was made downstream, or a previously-deactivated
                        configuration needs to backfill.
                    </p>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: 3, boxShadow: 'var(--elevation-e100)', marginBottom: 16 }}>
                {/* ── Step 1 ── */}
                <div style={sectionStyle}>
                    <h3 className="section-heading">
                        <span>
                            <span style={stepNumStyle}>1</span>
                            Select commodity configurations
                        </span>
                        <span className="hint">{selectedIds.length} of {commodities.length} selected</span>
                    </h3>
                    <Transfer
                        options={commodityOptions}
                        selected={selectedIds}
                        onChange={({ selected }) => setSelectedIds(selected)}
                        leftHeader={<span style={{ fontWeight: 500 }}>Available configurations</span>}
                        rightHeader={<span style={{ fontWeight: 500 }}>Selected for resend</span>}
                        filterable
                        filterPlaceholder="Filter configurations…"
                        height="260px"
                    />
                </div>

                {/* ── Step 2 ── */}
                <div style={dividerStyle}>
                    <h3 className="section-heading">
                        <span>
                            <span style={stepNumStyle}>2</span>
                            Pick the reporting period to resend
                        </span>
                        <span className="hint">Monthly periods only — pick a past month</span>
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16, alignItems: 'start' }}>
                        <SingleSelectField
                            label="Year"
                            required
                            selected={String(year)}
                            onChange={({ selected }) => setYear(parseInt(selected))}
                        >
                            {yearOptions.map(o => (
                                <SingleSelectOption key={o.value} label={o.label} value={o.value} />
                            ))}
                        </SingleSelectField>
                        <SingleSelectField
                            label="Month"
                            required
                            selected={String(month)}
                            onChange={({ selected }) => setMonth(parseInt(selected))}
                        >
                            {monthOptions.map(o => (
                                <SingleSelectOption key={o.value} label={o.label} value={o.value} />
                            ))}
                        </SingleSelectField>
                        <div>
                            <p style={{ fontSize: 14, color: 'var(--grey-700)', margin: '0 0 4px' }}>Period code</p>
                            <div className="cron-preview" style={{ marginTop: 0 }}>
                                <IconCalendar16 />
                                <span className="cron-label">{periodLabel}:</span>
                                <span className="mono">{periodCode}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Quick pick
                        </span>
                        {quickPickMonths(today).map(qp => (
                            <button
                                key={qp.key}
                                type="button"
                                onClick={() => { setYear(qp.year); setMonth(qp.month) }}
                                style={{
                                    padding: '0 10px', height: 28, fontSize: 13, borderRadius: 3,
                                    border: '1px solid', cursor: 'pointer',
                                    fontFamily: 'var(--font-family)',
                                    background: (qp.year === year && qp.month === month) ? 'var(--blue-050)' : 'white',
                                    borderColor: (qp.year === year && qp.month === month) ? 'var(--blue-700)' : 'var(--grey-400)',
                                    color: (qp.year === year && qp.month === month) ? 'var(--blue-800)' : 'var(--grey-800)',
                                }}
                            >
                                {qp.label}
                            </button>
                        ))}
                    </div>

                    {isFuture && (
                        <div style={{ marginTop: 12 }}>
                            <NoticeBox warning title="That period is in the future">
                                You can only resend a past reporting period — there's no source data for {periodLabel} yet.
                            </NoticeBox>
                        </div>
                    )}
                </div>

                {/* ── Step 3 ── */}
                <div style={dividerStyle}>
                    <h3 className="section-heading">
                        <span>
                            <span style={stepNumStyle}>3</span>
                            Reason for resend
                        </span>
                        <span className="hint">Optional, but recorded against the audit log</span>
                    </h3>
                    <InputField
                        value={reason}
                        onChange={({ value }) => setReason(value)}
                        placeholder="e.g. Retry after upstream timeout, reporting correction, etc."
                    />
                </div>

                {/* ── Summary + submit ── */}
                <div style={{
                    borderTop: '1px solid var(--grey-300)', padding: '14px 24px',
                    background: 'var(--grey-050)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gap: 16, flexWrap: 'wrap',
                }}>
                    <div style={{ fontSize: 13, color: 'var(--grey-600)' }}>
                        {selectedIds.length === 0 ? (
                            <>Pick at least one configuration to enable resend.</>
                        ) : (
                            <>
                                Resending <strong style={{ color: 'var(--grey-900)' }}>{selectedIds.length}</strong>{' '}
                                {selectedIds.length === 1 ? 'configuration' : 'configurations'} for{' '}
                                <strong style={{ color: 'var(--grey-900)' }}>{periodLabel}</strong> —
                                estimated <strong style={{ color: 'var(--grey-900)' }}>{estimatedRecords.toLocaleString()}</strong> records
                            </>
                        )}
                    </div>
                    <Button
                        primary
                        icon={<IconSync16 />}
                        onClick={() => setConfirming(true)}
                        disabled={!canSubmit}
                    >
                        Resend {periodLabel} data
                    </Button>
                </div>
            </div>

            {/* ── Recent resends ── */}
            <h3 className="section-heading" style={{ marginTop: 24 }}>
                Recent manual resends
                <span className="hint">Audit log of operator-initiated resends</span>
            </h3>

            {recentResends.length === 0 ? (
                <div className="empty-state">
                    <h2>No manual resends yet</h2>
                    <p>Operator-initiated resends will be logged here, separately from scheduled sync runs.</p>
                </div>
            ) : (
                <div className="table-container">
                    <DataTable>
                        <DataTableHead>
                            <DataTableRow>
                                <DataTableColumnHeader>Resend ID</DataTableColumnHeader>
                                <DataTableColumnHeader>Initiated</DataTableColumnHeader>
                                <DataTableColumnHeader>Period</DataTableColumnHeader>
                                <DataTableColumnHeader>Configurations</DataTableColumnHeader>
                                <DataTableColumnHeader align="right">Records</DataTableColumnHeader>
                                <DataTableColumnHeader>Status</DataTableColumnHeader>
                                <DataTableColumnHeader>Reason</DataTableColumnHeader>
                            </DataTableRow>
                        </DataTableHead>
                        <DataTableBody>
                            {recentResends.map(r => {
                                const cfgs = r.configurationIds
                                    .map(id => commodities.find(c => c.id === id))
                                    .filter(Boolean)
                                return (
                                    <DataTableRow key={r.id}>
                                        <DataTableCell>
                                            <span className="mono" style={{ fontSize: 12.5, color: 'var(--grey-800)' }}>{r.id}</span>
                                        </DataTableCell>
                                        <DataTableCell>
                                            <div className="row-stack">
                                                <span className="primary">{formatDate(r.date)}</span>
                                                <span className="secondary">{r.triggeredBy}</span>
                                            </div>
                                        </DataTableCell>
                                        <DataTableCell>
                                            {monthShort(r.period.month)} {r.period.year}
                                        </DataTableCell>
                                        <DataTableCell>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 280 }}>
                                                {cfgs.slice(0, 2).map(c => <Tag key={c.id}>{c.code}</Tag>)}
                                                {cfgs.length > 2 && (
                                                    <span style={{ fontSize: 12, color: 'var(--fg-muted)', alignSelf: 'center' }}>
                                                        +{cfgs.length - 2} more
                                                    </span>
                                                )}
                                            </div>
                                        </DataTableCell>
                                        <DataTableCell align="right">
                                            <span className="mono">{r.records.toLocaleString()}</span>
                                        </DataTableCell>
                                        <DataTableCell>
                                            {r.status === 'SUCCESS' && <Tag positive bold>SUCCESS</Tag>}
                                            {r.status === 'PARTIAL' && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 6px', borderRadius: 3, background: 'var(--yellow-700)', color: 'white', fontSize: 13, fontWeight: 700, height: 23 }}>PARTIAL</span>
                                            )}
                                            {r.status === 'FAILED' && <Tag negative bold>FAILED</Tag>}
                                        </DataTableCell>
                                        <DataTableCell>
                                            <span style={{ color: r.reason ? 'var(--grey-900)' : 'var(--fg-muted)' }}>
                                                {r.reason || '—'}
                                            </span>
                                        </DataTableCell>
                                    </DataTableRow>
                                )
                            })}
                        </DataTableBody>
                    </DataTable>
                </div>
            )}

            {/* ── Confirm modal ── */}
            {confirming && (
                <Modal onClose={() => !resending && setConfirming(false)}>
                    <ModalTitle>
                        Confirm manual data resend
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--grey-600)', fontWeight: 400 }}>
                            {selectedConfigs.length} {selectedConfigs.length === 1 ? 'configuration' : 'configurations'} · {periodLabel}
                        </p>
                    </ModalTitle>
                    <ModalContent>
                        <NoticeBox warning title="This will overwrite any existing data for this period">
                            Existing records for <strong>{periodLabel}</strong> on the LMIS backend will be replaced
                            with the values currently held by the source dataset. There's no automatic rollback after the run completes.
                        </NoticeBox>

                        <h3 className="section-heading" style={{ marginTop: 20 }}>Resend summary</h3>
                        <dl className="kv-grid">
                            <dt>Reporting period</dt>
                            <dd>
                                {periodLabel}{' '}
                                <span className="mono" style={{ color: 'var(--grey-600)' }}>· {periodCode}</span>
                            </dd>
                            <dt>Configurations</dt>
                            <dd>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {selectedConfigs.map(c => (
                                        <Tag key={c.id}>
                                            <strong style={{ fontWeight: 500 }}>{c.code}</strong>
                                            <span style={{ color: 'var(--fg-muted)' }}> · {c.workflows.length} {c.workflows.length === 1 ? 'workflow' : 'workflows'}</span>
                                        </Tag>
                                    ))}
                                </div>
                            </dd>
                            <dt>Estimated records</dt>
                            <dd>{estimatedRecords.toLocaleString()}</dd>
                            <dt>Reason</dt>
                            <dd style={{ color: reason ? 'var(--grey-900)' : 'var(--fg-muted)' }}>
                                {reason || '(none provided)'}
                            </dd>
                            <dt>Triggered by</dt>
                            <dd>FK · fkoroma@moh.gov.sl</dd>
                        </dl>
                    </ModalContent>
                    <ModalActions>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span style={{ fontSize: 12, color: 'var(--grey-600)' }}>
                                This will queue a sync run immediately.
                            </span>
                            <ButtonStrip end>
                                <Button onClick={() => setConfirming(false)} disabled={resending}>Cancel</Button>
                                <Button primary icon={<IconSync16 />} onClick={doResend} loading={resending}>
                                    Confirm resend
                                </Button>
                            </ButtonStrip>
                        </div>
                    </ModalActions>
                </Modal>
            )}
        </div>
    )
}
