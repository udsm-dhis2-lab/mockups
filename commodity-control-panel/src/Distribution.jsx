import React, { useState } from 'react'
import {
    Button,
    ButtonStrip,
    InputField,
    Transfer,
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    DataTable,
    DataTableHead,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    Tag,
    IconAdd16,
    IconEdit16,
    IconDelete16,
    IconSave16,
} from '@dhis2/ui'
import { newId } from './data.js'

export function DistributionList({ items, commodities, onAdd, onEdit, onDelete }) {
    const [q, setQ] = useState('')

    const filtered = items.filter(d =>
        !q ||
        d.name.toLowerCase().includes(q.toLowerCase()) ||
        d.id.toLowerCase().includes(q.toLowerCase())
    )

    return (
        <div>
            <div className="ph">
                <div>
                    <p className="breadcrumb">Commodity Control / Distribution configurations</p>
                    <h1>Distribution configurations</h1>
                    <p className="lede">
                        Bundle commodity configurations into named distributions so multiple commodities
                        can be synced together on a shared trigger.
                    </p>
                </div>
                <div className="ph-actions">
                    <Button primary icon={<IconAdd16 />} onClick={onAdd}>Add distribution</Button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-search">
                    <InputField
                        dense
                        label="Search"
                        value={q}
                        onChange={({ value }) => setQ(value)}
                        placeholder="Search by distribution name or ID…"
                    />
                </div>
                <div className="filter-meta">
                    Showing <strong>{filtered.length}</strong> of {items.length} distributions
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <h2>No distributions yet</h2>
                    <p>Create a distribution to sync several commodity configurations together on one trigger.</p>
                    <Button primary icon={<IconAdd16 />} onClick={onAdd}>Add distribution</Button>
                </div>
            ) : (
                <div className="table-container">
                    <DataTable>
                        <DataTableHead>
                            <DataTableRow>
                                <DataTableColumnHeader>Distribution name</DataTableColumnHeader>
                                <DataTableColumnHeader>ID</DataTableColumnHeader>
                                <DataTableColumnHeader align="center">Linked configurations</DataTableColumnHeader>
                                <DataTableColumnHeader>Included commodities</DataTableColumnHeader>
                                <DataTableColumnHeader align="right">Actions</DataTableColumnHeader>
                            </DataTableRow>
                        </DataTableHead>
                        <DataTableBody>
                            {filtered.map(d => {
                                const linked = d.configurations
                                    .map(id => commodities.find(c => c.id === id))
                                    .filter(Boolean)
                                return (
                                    <DataTableRow
                                        key={d.id}
                                        className="clickable-row"
                                        onClick={() => onEdit(d)}
                                    >
                                        <DataTableCell>
                                            <span style={{ fontWeight: 500 }}>{d.name}</span>
                                        </DataTableCell>
                                        <DataTableCell>
                                            <span className="mono" style={{ fontSize: 12.5, color: 'var(--grey-800)' }}>
                                                {d.id}
                                            </span>
                                        </DataTableCell>
                                        <DataTableCell align="center">
                                            <span style={{
                                                display: 'inline-block', minWidth: 22, padding: '2px 8px',
                                                borderRadius: 10, background: 'var(--blue-100)',
                                                color: 'var(--blue-800)', fontSize: 12, fontWeight: 500,
                                            }}>
                                                {linked.length}
                                            </span>
                                        </DataTableCell>
                                        <DataTableCell>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                {linked.slice(0, 3).map(c => <Tag key={c.id}>{c.code}</Tag>)}
                                                {linked.length > 3 && (
                                                    <span style={{ fontSize: 12, color: 'var(--fg-muted)', alignSelf: 'center' }}>
                                                        +{linked.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </DataTableCell>
                                        <DataTableCell align="right" onClick={e => e.stopPropagation()}>
                                            <div className="row-actions">
                                                <button className="row-icon-btn" title="Edit" onClick={() => onEdit(d)}>
                                                    <IconEdit16 />
                                                </button>
                                                <button
                                                    className="row-icon-btn destructive"
                                                    title="Delete"
                                                    onClick={() => onDelete(d)}
                                                >
                                                    <IconDelete16 />
                                                </button>
                                            </div>
                                        </DataTableCell>
                                    </DataTableRow>
                                )
                            })}
                        </DataTableBody>
                    </DataTable>
                </div>
            )}
        </div>
    )
}

export function DistributionForm({ initial, commodities, onClose, onSave }) {
    const [form, setForm] = useState(() =>
        initial
            ? JSON.parse(JSON.stringify(initial))
            : { id: newId('dist'), name: '', configurations: [] }
    )
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    const set = patch => setForm(f => ({ ...f, ...patch }))

    const submit = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Distribution name is required'
        if (form.configurations.length === 0) e.configurations = 'Pick at least one commodity configuration'
        setErrors(e)
        if (Object.keys(e).length > 0) return
        setSaving(true)
        setTimeout(() => { onSave(form); setSaving(false) }, 400)
    }

    const options = commodities.map(c => ({
        value: c.id,
        label: `${c.name} (${c.code})`,
    }))

    return (
        <Modal onClose={onClose}>
            <ModalTitle>
                {initial ? `Edit distribution — ${initial.name}` : 'New distribution'}
                {initial && (
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--grey-600)', fontWeight: 400 }}>
                        {initial.id}
                    </p>
                )}
            </ModalTitle>

            <ModalContent>
                <div className="form-section">
                    <div className="form-grid">
                        <InputField
                            label="Distribution name"
                            required
                            value={form.name}
                            onChange={({ value }) => set({ name: value })}
                            placeholder="e.g. Malaria & Antimalarial Sync"
                            error={!!errors.name}
                            validationText={errors.name}
                        />
                        <InputField
                            label="Distribution ID"
                            helpText="Auto-generated. Used in API payloads."
                            value={form.id}
                            disabled
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-heading">
                        Commodity configurations
                        <span className="hint">Pick which configurations are bundled into this distribution</span>
                    </h3>
                    {errors.configurations && (
                        <p style={{ color: 'var(--red-700)', fontSize: 12, margin: '0 0 8px' }}>
                            {errors.configurations}
                        </p>
                    )}
                    <Transfer
                        options={options}
                        selected={form.configurations}
                        onChange={({ selected }) => set({ configurations: selected })}
                        leftHeader={<span style={{ fontWeight: 500 }}>Available configurations</span>}
                        rightHeader={<span style={{ fontWeight: 500 }}>Included in distribution</span>}
                        filterable
                        filterPlaceholder="Filter configurations…"
                        height="260px"
                    />
                </div>
            </ModalContent>

            <ModalActions>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontSize: 12, color: 'var(--grey-600)' }}>
                        {form.configurations.length}{' '}
                        {form.configurations.length === 1 ? 'configuration' : 'configurations'} selected
                    </span>
                    <ButtonStrip end>
                        <Button onClick={onClose} disabled={saving}>Cancel</Button>
                        <Button primary icon={<IconSave16 />} onClick={submit} loading={saving}>
                            {initial ? 'Save changes' : 'Create distribution'}
                        </Button>
                    </ButtonStrip>
                </div>
            </ModalActions>
        </Modal>
    )
}
