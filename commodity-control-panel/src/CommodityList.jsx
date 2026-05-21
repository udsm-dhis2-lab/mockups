import React, { useState, useEffect } from 'react'
import {
    Button,
    InputField,
    SingleSelectField,
    SingleSelectOption,
    DataTable,
    DataTableHead,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    Tag,
    Pagination,
    NoticeBox,
    IconAdd16,
    IconDownload16,
    IconEdit16,
    IconLock16,
    IconLockOpen16,
    IconDelete16,
} from '@dhis2/ui'
import { COMMODITY_GROUPS, describeCron } from './data.js'

export default function CommodityList({ items, onAdd, onEdit, onView, onToggleActive, onDelete }) {
    const [q, setQ] = useState('')
    const [group, setGroup] = useState('')
    const [status, setStatus] = useState('')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const filtered = items.filter(c => {
        if (q && !`${c.code} ${c.name}`.toLowerCase().includes(q.toLowerCase())) return false
        if (group && c.group !== group) return false
        if (status === 'active' && !c.active) return false
        if (status === 'inactive' && c.active) return false
        return true
    })

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

    useEffect(() => { setPage(1) }, [q, group, status, pageSize])

    const groupOptions = [
        { value: '', label: 'All groups' },
        ...COMMODITY_GROUPS.map(g => ({ value: g.value, label: g.value })),
    ]
    const statusOptions = [
        { value: '',         label: 'All statuses' },
        { value: 'active',   label: 'Active only' },
        { value: 'inactive', label: 'Inactive only' },
    ]

    return (
        <div>
            <div className="ph">
                <div>
                    <p className="breadcrumb">Commodity Control / Commodity configurations</p>
                    <h1>Commodity configurations</h1>
                    <p className="lede">
                        Define how each commodity's stock and consumption data are pulled, transformed,
                        and synced from facility data sets into the central LMIS warehouse.
                    </p>
                </div>
                <div className="ph-actions">
                    <Button icon={<IconDownload16 />}>Export</Button>
                    <Button primary icon={<IconAdd16 />} onClick={onAdd}>Add configuration</Button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-search">
                    <InputField
                        dense
                        label="Search"
                        value={q}
                        onChange={({ value }) => setQ(value)}
                        placeholder="Search by name or code…"
                    />
                </div>
                <div className="filter-field">
                    <SingleSelectField
                        dense
                        label="Group"
                        selected={group}
                        onChange={({ selected }) => setGroup(selected)}
                    >
                        {groupOptions.map(o => (
                            <SingleSelectOption key={o.value} label={o.label} value={o.value} />
                        ))}
                    </SingleSelectField>
                </div>
                <div className="filter-field">
                    <SingleSelectField
                        dense
                        label="Status"
                        selected={status}
                        onChange={({ selected }) => setStatus(selected)}
                    >
                        {statusOptions.map(o => (
                            <SingleSelectOption key={o.value} label={o.label} value={o.value} />
                        ))}
                    </SingleSelectField>
                </div>
                <div className="filter-meta">
                    Showing <strong>{total}</strong> of {items.length} configurations
                </div>
            </div>

            <div className="table-container">
                <DataTable>
                    <DataTableHead>
                        <DataTableRow>
                            <DataTableColumnHeader>Commodity</DataTableColumnHeader>
                            <DataTableColumnHeader>Group</DataTableColumnHeader>
                            <DataTableColumnHeader>Ordering period</DataTableColumnHeader>
                            <DataTableColumnHeader>Sync interval</DataTableColumnHeader>
                            <DataTableColumnHeader align="center">Workflows</DataTableColumnHeader>
                            <DataTableColumnHeader>Status</DataTableColumnHeader>
                            <DataTableColumnHeader align="right">Actions</DataTableColumnHeader>
                        </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                        {pageRows.length === 0 ? (
                            <DataTableRow>
                                <DataTableCell colSpan="7">
                                    <div className="empty-state" style={{ boxShadow: 'none', borderRadius: 0 }}>
                                        <h2>No configurations match your filters</h2>
                                        <p>Try clearing the search term, or pick a different group / status.</p>
                                        <Button onClick={() => { setQ(''); setGroup(''); setStatus('') }}>
                                            Clear filters
                                        </Button>
                                    </div>
                                </DataTableCell>
                            </DataTableRow>
                        ) : pageRows.map(c => (
                            <DataTableRow
                                key={c.id}
                                className="clickable-row"
                                onClick={() => onView(c)}
                            >
                                <DataTableCell>
                                    <div className="row-stack">
                                        <span className="primary">{c.name}</span>
                                        <span className="secondary">{c.code}</span>
                                    </div>
                                </DataTableCell>
                                <DataTableCell>
                                    <Tag>{c.group}</Tag>
                                </DataTableCell>
                                <DataTableCell>
                                    {c.orderingPeriod} {c.orderingPeriodType}
                                </DataTableCell>
                                <DataTableCell>
                                    <span
                                        className="mono"
                                        style={{ fontSize: 12.5, color: 'var(--grey-800)' }}
                                        title={describeCron(c.syncInterval).text}
                                    >
                                        {c.syncInterval}
                                    </span>
                                </DataTableCell>
                                <DataTableCell align="center">
                                    <span style={{
                                        display: 'inline-block', minWidth: 22, padding: '2px 8px',
                                        borderRadius: 10, background: 'var(--grey-200)',
                                        color: 'var(--grey-800)', fontSize: 12, fontWeight: 500,
                                    }}>
                                        {c.workflows.length}
                                    </span>
                                </DataTableCell>
                                <DataTableCell>
                                    {c.active
                                        ? <Tag positive bold>Active</Tag>
                                        : <Tag>Inactive</Tag>
                                    }
                                </DataTableCell>
                                <DataTableCell
                                    align="right"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="row-actions">
                                        <button className="row-icon-btn" title="Edit" onClick={() => onEdit(c)}>
                                            <IconEdit16 />
                                        </button>
                                        <button
                                            className="row-icon-btn"
                                            title={c.active ? 'Deactivate' : 'Activate'}
                                            onClick={() => onToggleActive(c)}
                                        >
                                            {c.active ? <IconLock16 /> : <IconLockOpen16 />}
                                        </button>
                                        <button
                                            className="row-icon-btn destructive"
                                            title="Delete"
                                            onClick={() => onDelete(c)}
                                        >
                                            <IconDelete16 />
                                        </button>
                                    </div>
                                </DataTableCell>
                            </DataTableRow>
                        ))}
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
