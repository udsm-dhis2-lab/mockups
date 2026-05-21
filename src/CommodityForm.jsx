import React, { useState } from 'react'
import {
    Button,
    ButtonStrip,
    InputField,
    SingleSelectField,
    SingleSelectOption,
    MultiSelectField,
    MultiSelectOption,
    Transfer,
    SwitchField,
    TabBar,
    Tab,
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    NoticeBox,
    IconAdd16,
    IconSave16,
    IconDelete16,
    IconClock16,
} from '@dhis2/ui'
import {
    COMMODITY_GROUPS,
    PERIOD_TYPES,
    ORDERING_PERIODS,
    RULE_TYPES,
    RECIPIENT_GROUPS,
    DATA_SOURCES,
    DATASETS,
    describeCron,
    newId,
} from './data.js'

const emptyWorkflow = (idx = 1) => ({
    id: newId('w'),
    name: `Workflow ${idx}`,
    dataSources: [],
    processingRatio: 1,
    consumptionConversionFactor: 1,
    periodType: 'MONTH',
    periodOfData: 1,
    skipEmpty: true,
    removeAndComplement: false,
    aggregationType: 'SUM',
    rules: [],
})

const emptyCommodity = () => ({
    id: null,
    code: '',
    name: '',
    group: 'NMCP',
    syncInterval: '0 0 * * 1',
    orderingPeriodType: 'MONTH',
    orderingPeriod: 1,
    active: true,
    recipientGroups: [],
    workflows: [emptyWorkflow(1)],
})

export default function CommodityForm({ initial, onClose, onSave }) {
    const [form, setForm] = useState(() =>
        initial ? JSON.parse(JSON.stringify(initial)) : emptyCommodity()
    )
    const [activeWf, setActiveWf] = useState(form.workflows[0]?.id)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    const set = patch => setForm(f => ({ ...f, ...patch }))
    const cron = describeCron(form.syncInterval)

    const currentWf = form.workflows.find(w => w.id === activeWf)

    const updateWf = patch => {
        setForm(f => ({
            ...f,
            workflows: f.workflows.map(w => w.id === activeWf ? { ...w, ...patch } : w),
        }))
    }

    const addWorkflow = () => {
        const nw = emptyWorkflow(form.workflows.length + 1)
        setForm(f => ({ ...f, workflows: [...f.workflows, nw] }))
        setActiveWf(nw.id)
    }

    const removeWorkflow = id => {
        if (form.workflows.length === 1) return
        setForm(f => {
            const next = f.workflows.filter(w => w.id !== id)
            if (id === activeWf) setActiveWf(next[0].id)
            return { ...f, workflows: next }
        })
    }

    const addRule = () => updateWf({
        rules: [...currentWf.rules, { id: newId('r'), type: 'ASSIGNED_TO_DATASET', datasets: [] }],
    })

    const updateRule = (rid, patch) => updateWf({
        rules: currentWf.rules.map(r => r.id === rid ? { ...r, ...patch } : r),
    })

    const removeRule = rid => updateWf({ rules: currentWf.rules.filter(r => r.id !== rid) })

    const validate = () => {
        const e = {}
        if (!form.code.trim()) e.code = 'Commodity code is required'
        if (!form.name.trim()) e.name = 'Commodity name is required'
        if (!cron.ok) e.syncInterval = cron.text
        if (!form.orderingPeriod || form.orderingPeriod < 1) e.orderingPeriod = 'Must be at least 1'
        if (form.recipientGroups.length === 0) e.recipientGroups = 'Select at least one recipient group'
        form.workflows.forEach(w => {
            if (w.dataSources.length === 0) e[`wf-${w.id}-ds`] = `Workflow "${w.name}" needs at least one data source`
        })
        return e
    }

    const submit = () => {
        const e = validate()
        setErrors(e)
        if (Object.keys(e).length > 0) {
            const firstWfErr = Object.keys(e).find(k => k.startsWith('wf-'))
            if (firstWfErr) setActiveWf(firstWfErr.split('-')[1])
            return
        }
        setSaving(true)
        setTimeout(() => { onSave(form); setSaving(false) }, 450)
    }

    const groupOptions = COMMODITY_GROUPS.map(g => ({ value: g.value, label: g.label }))
    const recipientOptions = RECIPIENT_GROUPS.map(g => ({ value: g.value, label: g.label }))

    return (
        <Modal large onClose={onClose}>
            <ModalTitle>
                {initial ? `Edit configuration — ${initial.code}` : 'New commodity configuration'}
                {initial && (
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--grey-600)', fontWeight: 400 }}>
                        {initial.name}
                    </p>
                )}
            </ModalTitle>

            <ModalContent>
                {Object.keys(errors).length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                        <NoticeBox error title="Some fields need your attention">
                            <ul style={{ margin: '6px 0 0', paddingInlineStart: 18 }}>
                                {Object.values(errors).map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                        </NoticeBox>
                    </div>
                )}

                {/* ── Section A: Basic Info ── */}
                <div className="form-section">
                    <h3 className="section-heading">
                        Basic information
                        <span className="hint">Identifiers, scheduling, and ordering cadence</span>
                    </h3>
                    <div className="form-grid">
                        <InputField
                            label="Commodity code"
                            required
                            value={form.code}
                            onChange={({ value }) => set({ code: value.toUpperCase() })}
                            placeholder="e.g. 89LATY78"
                            error={!!errors.code}
                            validationText={errors.code}
                            helpText="Short identifier — letters, digits and hyphens."
                        />
                        <InputField
                            label="Commodity name"
                            required
                            value={form.name}
                            onChange={({ value }) => set({ name: value })}
                            placeholder="e.g. Amoxicillin 500mg capsules"
                            error={!!errors.name}
                            validationText={errors.name}
                        />
                        <SingleSelectField
                            label="Commodity group"
                            required
                            selected={form.group}
                            onChange={({ selected }) => set({ group: selected })}
                        >
                            {groupOptions.map(o => (
                                <SingleSelectOption key={o.value} label={o.label} value={o.value} />
                            ))}
                        </SingleSelectField>

                        <div>
                            <InputField
                                label="Synchronization interval"
                                required
                                value={form.syncInterval}
                                onChange={({ value }) => set({ syncInterval: value })}
                                placeholder="0 0 * * 1"
                                error={!cron.ok}
                                validationText={!cron.ok ? cron.text : undefined}
                                helpText="Standard 5-field cron expression in UTC."
                                inputWidth="100%"
                            />
                            <div className={`cron-preview ${cron.ok ? '' : 'invalid'}`}>
                                <IconClock16 />
                                <span className="cron-label">{cron.ok ? 'Runs' : 'Invalid'}:</span>
                                <span>{cron.text}</span>
                            </div>
                        </div>

                        <SingleSelectField
                            label="Ordering period type"
                            required
                            selected={form.orderingPeriodType}
                            onChange={({ selected }) => set({ orderingPeriodType: selected })}
                        >
                            {ORDERING_PERIODS.map(o => (
                                <SingleSelectOption key={o.value} label={o.label} value={o.value} />
                            ))}
                        </SingleSelectField>
                        <InputField
                            label="Ordering period"
                            required
                            type="number"
                            value={String(form.orderingPeriod)}
                            onChange={({ value }) => set({ orderingPeriod: parseInt(value) || 0 })}
                            error={!!errors.orderingPeriod}
                            validationText={errors.orderingPeriod}
                            helpText={`Number of ${form.orderingPeriodType.toLowerCase()}s between orders.`}
                        />
                    </div>
                </div>

                {/* ── Section B: Recipient Groups ── */}
                <div className="form-section">
                    <h3 className="section-heading">
                        Recipient groups
                        <span className="hint">User groups that receive alerts when this configuration runs</span>
                    </h3>
                    {errors.recipientGroups && (
                        <p style={{ color: 'var(--red-700)', fontSize: 12, margin: '0 0 8px' }}>
                            {errors.recipientGroups}
                        </p>
                    )}
                    <Transfer
                        options={recipientOptions}
                        selected={form.recipientGroups}
                        onChange={({ selected }) => set({ recipientGroups: selected })}
                        leftHeader={<span style={{ fontWeight: 500 }}>Available groups</span>}
                        rightHeader={<span style={{ fontWeight: 500 }}>Selected groups</span>}
                        filterable
                        filterPlaceholder="Filter groups…"
                        height="280px"
                    />
                </div>

                {/* ── Section C: Workflows ── */}
                <div className="form-section">
                    <h3 className="section-heading">
                        Workflows
                        <span className="hint">Each workflow pulls one slice of data on this configuration's schedule</span>
                    </h3>
                    <TabBar>
                        {form.workflows.map(w => (
                            <Tab
                                key={w.id}
                                selected={activeWf === w.id}
                                onClick={() => setActiveWf(w.id)}
                            >
                                {w.name}
                                {form.workflows.length > 1 && (
                                    <span
                                        onClick={e => { e.stopPropagation(); removeWorkflow(w.id) }}
                                        style={{
                                            marginLeft: 6, cursor: 'pointer', fontSize: 14,
                                            width: 16, height: 16, borderRadius: '50%',
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                        title="Remove workflow"
                                    >×</span>
                                )}
                            </Tab>
                        ))}
                        <Tab onClick={addWorkflow}>
                            + Add workflow
                        </Tab>
                    </TabBar>

                    {currentWf && (
                        <WorkflowEditor
                            workflow={currentWf}
                            onChange={updateWf}
                            onAddRule={addRule}
                            onUpdateRule={updateRule}
                            onRemoveRule={removeRule}
                            errors={errors}
                        />
                    )}
                </div>
            </ModalContent>

            <ModalActions>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontSize: 12, color: 'var(--grey-600)' }}>
                        {form.workflows.length} {form.workflows.length === 1 ? 'workflow' : 'workflows'} ·{' '}
                        {form.workflows.reduce((s, w) => s + w.rules.length, 0)} rules
                    </span>
                    <ButtonStrip end>
                        <Button onClick={onClose} disabled={saving}>Cancel</Button>
                        <Button primary icon={<IconSave16 />} onClick={submit} loading={saving}>
                            {initial ? 'Save changes' : 'Create configuration'}
                        </Button>
                    </ButtonStrip>
                </div>
            </ModalActions>
        </Modal>
    )
}

function WorkflowEditor({ workflow, onChange, onAddRule, onUpdateRule, onRemoveRule, errors }) {
    const dsOptions = DATA_SOURCES.map(d => ({ value: d.value, label: d.label }))

    return (
        <div style={{ paddingTop: 16 }}>
            <div className="form-grid" style={{ marginBottom: 18 }}>
                <InputField
                    label="Workflow name"
                    required
                    value={workflow.name}
                    onChange={({ value }) => onChange({ name: value })}
                />
                <SingleSelectField
                    label="Aggregation type"
                    required
                    selected={workflow.aggregationType}
                    onChange={({ selected }) => onChange({ aggregationType: selected })}
                >
                    <SingleSelectOption label="Sum" value="SUM" />
                    <SingleSelectOption label="Average" value="AVERAGE" />
                </SingleSelectField>
            </div>

            <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 14, color: 'var(--grey-700)', margin: '0 0 6px', fontWeight: 500 }}>
                    Data sources <span style={{ color: 'var(--red-700)' }}>*</span>
                </p>
                {errors[`wf-${workflow.id}-ds`] && (
                    <p style={{ color: 'var(--red-700)', fontSize: 12, margin: '0 0 6px' }}>
                        {errors[`wf-${workflow.id}-ds`]}
                    </p>
                )}
                <Transfer
                    options={dsOptions}
                    selected={workflow.dataSources}
                    onChange={({ selected }) => onChange({ dataSources: selected })}
                    leftHeader={<span style={{ fontWeight: 500 }}>Available data sources</span>}
                    rightHeader={<span style={{ fontWeight: 500 }}>Selected data sources</span>}
                    filterable
                    filterPlaceholder="Filter sources…"
                    height="240px"
                />
            </div>

            <div className="spacer-h" />

            <div className="form-grid three" style={{ marginBottom: 18 }}>
                <InputField
                    label="Processing ratio"
                    type="number"
                    helpText="0 = ignore, 1 = full weight."
                    value={String(workflow.processingRatio)}
                    onChange={({ value }) => onChange({ processingRatio: parseFloat(value) || 0 })}
                    min="0"
                    max="1"
                    step="0.05"
                />
                <InputField
                    label="Consumption conversion factor"
                    type="number"
                    helpText="Multiplier from reported units to base units."
                    value={String(workflow.consumptionConversionFactor)}
                    onChange={({ value }) => onChange({ consumptionConversionFactor: parseFloat(value) || 0 })}
                />
                <InputField
                    label="Period of data"
                    type="number"
                    helpText={`Number of ${workflow.periodType.toLowerCase()}s to pull each run.`}
                    value={String(workflow.periodOfData)}
                    onChange={({ value }) => onChange({ periodOfData: parseInt(value) || 1 })}
                />
                <SingleSelectField
                    label="Period type"
                    required
                    selected={workflow.periodType}
                    onChange={({ selected }) => onChange({ periodType: selected })}
                >
                    {PERIOD_TYPES.map(o => (
                        <SingleSelectOption key={o.value} label={o.label} value={o.value} />
                    ))}
                </SingleSelectField>
                <div className="span-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignSelf: 'end' }}>
                    <div className="switch-row">
                        <div className="sw-label">
                            Skip empty data
                            <span className="sw-sub">Drop facility periods with no reported values.</span>
                        </div>
                        <SwitchField
                            label=""
                            checked={workflow.skipEmpty}
                            onChange={({ checked }) => onChange({ skipEmpty: checked })}
                        />
                    </div>
                    <div className="switch-row">
                        <div className="sw-label">
                            Remove &amp; complement empty data
                            <span className="sw-sub">Fill gaps with zero values during aggregation.</span>
                        </div>
                        <SwitchField
                            label=""
                            checked={workflow.removeAndComplement}
                            onChange={({ checked }) => onChange({ removeAndComplement: checked })}
                        />
                    </div>
                </div>
            </div>

            {/* ── Rules ── */}
            <h3 className="section-heading" style={{ marginTop: 20 }}>
                Rules
                <span className="hint">Filter which org units this workflow runs against</span>
            </h3>

            {workflow.rules.length === 0 && (
                <NoticeBox title="No rules defined">
                    Without rules, this workflow runs against <strong>all org units</strong> in the data sources.
                    Add a rule to scope it to specific dataset assignments.
                </NoticeBox>
            )}

            {workflow.rules.map((r, idx) => (
                <div key={r.id} className="rule-card">
                    <div className="rule-card-head">
                        <span className="rule-title">Rule {idx + 1}</span>
                        <Button destructive small icon={<IconDelete16 />} onClick={() => onRemoveRule(r.id)}>
                            Remove rule
                        </Button>
                    </div>
                    <div className="form-grid">
                        <SingleSelectField
                            label="Rule type"
                            required
                            selected={r.type}
                            onChange={({ selected }) => onUpdateRule(r.id, { type: selected })}
                        >
                            {RULE_TYPES.map(o => (
                                <SingleSelectOption key={o.value} label={o.label} value={o.value} />
                            ))}
                        </SingleSelectField>
                        <MultiSelectField
                            label="Datasets"
                            required
                            helpText="Org units assigned to (or excluded from) these datasets."
                            selected={r.datasets}
                            onChange={({ selected }) => onUpdateRule(r.id, { datasets: selected })}
                            placeholder="Pick datasets…"
                            filterable
                        >
                            {DATASETS.map(d => (
                                <MultiSelectOption key={d.value} label={d.label} value={d.value} />
                            ))}
                        </MultiSelectField>
                    </div>
                </div>
            ))}

            <Button icon={<IconAdd16 />} onClick={onAddRule} style={{ marginTop: 4 }}>
                Add rule
            </Button>
        </div>
    )
}
