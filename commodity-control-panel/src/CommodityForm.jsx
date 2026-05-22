/* CommodityForm — create/edit commodity configuration modal.
 * Sections: Basic Info, Recipient Groups, Workflows (tabbed, each with rules). */
import React from 'react';
import { Button, Input, Select, Field, Card, Icon, Modal, RadioGroup, NoticeBox, Checkbox, Transfer } from './Atoms.jsx';
import { newId, RECIPIENT_GROUPS, DATASETS, describeCron } from './data.jsx';

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
});

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
});

const CommodityForm = ({ initial, onClose, onSave }) => {
    const [form, setForm] = React.useState(() => initial
        ? JSON.parse(JSON.stringify(initial))
        : emptyCommodity()
    );
    const [activeWf, setActiveWf] = React.useState(form.workflows[0]?.id);
    const [errors, setErrors] = React.useState({});
    const [saving, setSaving] = React.useState(false);

    const set = (patch) => setForm(f => ({ ...f, ...patch }));
    const cron = describeCron(form.syncInterval);

    /* ---- Workflow editors ---- */
    const currentWfIdx = form.workflows.findIndex(w => w.id === activeWf);
    const currentWf = form.workflows[currentWfIdx];

    const updateWf = (patch) => {
        setForm(f => ({
            ...f,
            workflows: f.workflows.map(w => w.id === activeWf ? { ...w, ...patch } : w),
        }));
    };

    const addWorkflow = () => {
        const nw = emptyWorkflow(form.workflows.length + 1);
        setForm(f => ({ ...f, workflows: [...f.workflows, nw] }));
        setActiveWf(nw.id);
    };

    const removeWorkflow = (id) => {
        if (form.workflows.length === 1) return; // keep at least one
        setForm(f => {
            const next = f.workflows.filter(w => w.id !== id);
            if (id === activeWf) setActiveWf(next[0].id);
            return { ...f, workflows: next };
        });
    };

    /* ---- Rules ---- */
    const addRule = () => {
        updateWf({
            rules: [...currentWf.rules, { id: newId('r'), type: 'ASSIGNED_TO_DATASET', datasets: [] }],
        });
    };
    const updateRule = (rid, patch) => {
        updateWf({
            rules: currentWf.rules.map(r => r.id === rid ? { ...r, ...patch } : r),
        });
    };
    const removeRule = (rid) => {
        updateWf({ rules: currentWf.rules.filter(r => r.id !== rid) });
    };

    /* ---- Validate + save ---- */
    const validate = () => {
        const e = {};
        if (!form.code.trim()) e.code = 'Commodity code is required';
        if (!form.name.trim()) e.name = 'Commodity name is required';
        if (!cron.ok) e.syncInterval = cron.text;
        if (!form.orderingPeriod || form.orderingPeriod < 1) e.orderingPeriod = 'Ordering period must be at least 1';
        if (form.recipientGroups.length === 0) e.recipientGroups = 'Select at least one recipient group';
        form.workflows.forEach((w, idx) => {
            if (w.dataSources.length === 0) e[`wf-${w.id}-ds`] = `Workflow "${w.name}" needs at least one data source`;
        });
        return e;
    };

    const submit = () => {
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length > 0) {
            // jump to first workflow with errors
            const firstWfErr = Object.keys(e).find(k => k.startsWith('wf-'));
            if (firstWfErr) setActiveWf(firstWfErr.split('-')[1]);
            return;
        }
        setSaving(true);
        setTimeout(() => {
            onSave(form);
            setSaving(false);
        }, 450); // simulate async
    };

    const periodTypeOptions = PERIOD_TYPES;
    const orderingOptions = ORDERING_PERIODS;
    const groupOptions = COMMODITY_GROUPS.map(g => ({ value: g.value, label: g.label }));

    return (
        <Modal
            size="lg"
            title={initial ? `Edit configuration — ${initial.code}` : 'New commodity configuration'}
            subtitle={initial ? initial.name : 'Define a new commodity sync configuration'}
            onClose={onClose}
            footer={
                <>
                    <span className="hint">
                        {form.workflows.length} {form.workflows.length === 1 ? 'workflow' : 'workflows'} ·
                        {' '}{form.workflows.reduce((s, w) => s + w.rules.length, 0)} rules
                    </span>
                    <div className="right">
                        <Button onClick={onClose} disabled={saving}>Cancel</Button>
                        <Button variant="primary" icon="save" iconColor="white" onClick={submit} loading={saving}>
                            {initial ? 'Save changes' : 'Create configuration'}
                        </Button>
                    </div>
                </>
            }
        >
            {Object.keys(errors).length > 0 && (
                <div style={{ marginBottom: 18 }}>
                    <NoticeBox variant="error" title="Some fields need your attention">
                        <ul style={{ margin: '6px 0 0', paddingInlineStart: 18 }}>
                            {Object.values(errors).map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                    </NoticeBox>
                </div>
            )}

            {/* ---- Section A: Basic Info ---- */}
            <div className="form-section">
                <h3 className="section-heading">
                    Basic information
                    <span className="hint">Identifiers, scheduling, and ordering cadence</span>
                </h3>
                <div className="form-grid">
                    <Field label="Commodity code" required error={errors.code} help="Short identifier — letters, digits and hyphens.">
                        <Input
                            value={form.code}
                            onChange={e => set({ code: e.target.value.toUpperCase() })}
                            placeholder="e.g. 89LATY78"
                            error={!!errors.code}
                        />
                    </Field>
                    <Field label="Commodity name" required error={errors.name}>
                        <Input
                            value={form.name}
                            onChange={e => set({ name: e.target.value })}
                            placeholder="e.g. Amoxicillin 500mg capsules"
                            error={!!errors.name}
                        />
                    </Field>
                    <Field label="Commodity group" required>
                        <Select
                            value={form.group}
                            onChange={e => set({ group: e.target.value })}
                            options={groupOptions}
                        />
                    </Field>
                    <Field label="Synchronization interval" required error={errors.syncInterval} help="Standard 5-field cron expression in UTC.">
                        <Input
                            value={form.syncInterval}
                            onChange={e => set({ syncInterval: e.target.value })}
                            placeholder="0 0 * * 1"
                            error={!cron.ok}
                            style={{ fontFamily: 'var(--font-family-mono)' }}
                        />
                        <div className={`cron-preview ${cron.ok ? '' : 'invalid'}`}>
                            <Icon name={cron.ok ? 'clock' : 'error'} size={16} color={cron.ok ? 'blue' : 'red'} />
                            <span className="label">{cron.ok ? 'Runs' : 'Invalid'}:</span>
                            <span>{cron.text}</span>
                        </div>
                    </Field>
                    <Field label="Ordering period type" required>
                        <Select
                            value={form.orderingPeriodType}
                            onChange={e => set({ orderingPeriodType: e.target.value })}
                            options={orderingOptions}
                        />
                    </Field>
                    <Field label="Ordering period" required error={errors.orderingPeriod} help={`Number of ${form.orderingPeriodType.toLowerCase()}s between orders.`}>
                        <Input
                            type="number"
                            value={form.orderingPeriod}
                            onChange={e => set({ orderingPeriod: parseInt(e.target.value) || 0 })}
                            error={!!errors.orderingPeriod}
                        />
                    </Field>
                </div>
            </div>

            {/* ---- Section B: Recipient Groups ---- */}
            <div className="form-section">
                <h3 className="section-heading">
                    Recipient groups
                    <span className="hint">User groups that receive alerts when this configuration runs</span>
                </h3>
                {errors.recipientGroups && <div className="field-error" style={{ marginBottom: 8 }}>{errors.recipientGroups}</div>}
                <Transfer
                    value={form.recipientGroups}
                    onChange={(v) => set({ recipientGroups: v })}
                    options={RECIPIENT_GROUPS}
                    leftLabel="Available groups"
                    rightLabel="Selected groups"
                />
            </div>

            {/* ---- Section C: Workflows ---- */}
            <div className="form-section">
                <h3 className="section-heading">
                    Workflows
                    <span className="hint">Each workflow pulls one slice of data on this configuration's schedule</span>
                </h3>
                <div className="dhis2-tabs" style={{ marginBottom: 16 }}>
                    {form.workflows.map(w => (
                        <button
                            key={w.id}
                            type="button"
                            className={`dhis2-tab ${activeWf === w.id ? 'active' : ''}`}
                            onClick={() => setActiveWf(w.id)}
                        >
                            <Icon name="sync" size={16} color={activeWf === w.id ? 'blue' : 'muted'} />
                            {w.name}
                            <span className="badge">{w.rules.length}</span>
                            {form.workflows.length > 1 && (
                                <span
                                    className="close"
                                    onClick={(e) => { e.stopPropagation(); removeWorkflow(w.id); }}
                                    title="Remove workflow"
                                >×</span>
                            )}
                        </button>
                    ))}
                    <button
                        type="button"
                        className="dhis2-tab add"
                        onClick={addWorkflow}
                    >
                        <Icon name="add" size={16} color="blue" />
                        Add workflow
                    </button>
                </div>

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
        </Modal>
    );
};

/* ---------- Workflow editor sub-component ---------- */
const WorkflowEditor = ({ workflow, onChange, onAddRule, onUpdateRule, onRemoveRule, errors }) => {
    return (
        <div>
            <div className="form-grid" style={{ marginBottom: 18 }}>
                <Field label="Workflow name" required>
                    <Input value={workflow.name} onChange={e => onChange({ name: e.target.value })} />
                </Field>
                <Field label="Aggregation type" required>
                    <RadioGroup
                        value={workflow.aggregationType}
                        onChange={(v) => onChange({ aggregationType: v })}
                        options={[
                            { value: 'SUM',     label: 'Sum' },
                            { value: 'AVERAGE', label: 'Average' },
                        ]}
                    />
                </Field>
            </div>

            <Field
                label="Data sources"
                required
                help="Data elements pulled by this workflow."
                error={errors[`wf-${workflow.id}-ds`]}
            >
                <Transfer
                    value={workflow.dataSources}
                    onChange={(v) => onChange({ dataSources: v })}
                    options={DATA_SOURCES}
                    leftLabel="Available data sources"
                    rightLabel="Selected data sources"
                />
            </Field>

            <div className="spacer-h" />

            <div className="form-grid three" style={{ marginBottom: 18 }}>
                <Field label="Processing ratio" help="0 = ignore, 1 = full weight. Applied to each pulled value.">
                    <Slider
                        value={workflow.processingRatio}
                        onChange={(v) => onChange({ processingRatio: v })}
                        min={0} max={1} step={0.05}
                        formatVal={(v) => v.toFixed(2)}
                    />
                </Field>
                <Field label="Consumption conversion factor" help="Multiplier from reported units to base units.">
                    <Input
                        type="number"
                        value={workflow.consumptionConversionFactor}
                        onChange={e => onChange({ consumptionConversionFactor: parseFloat(e.target.value) || 0 })}
                    />
                </Field>
                <Field label="Period of data" help={`Number of ${workflow.periodType.toLowerCase()}s to pull each run.`}>
                    <Input
                        type="number"
                        value={workflow.periodOfData}
                        onChange={e => onChange({ periodOfData: parseInt(e.target.value) || 1 })}
                    />
                </Field>
                <Field label="Period type" required>
                    <Select
                        value={workflow.periodType}
                        onChange={e => onChange({ periodType: e.target.value })}
                        options={PERIOD_TYPES}
                    />
                </Field>
                <div className="span-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignSelf: 'end' }}>
                    <div className="switch-row">
                        <div className="label">
                            Skip empty data
                            <span className="sub">Drop facility periods with no reported values.</span>
                        </div>
                        <Switch on={workflow.skipEmpty} onChange={(v) => onChange({ skipEmpty: v })} />
                    </div>
                    <div className="switch-row">
                        <div className="label">
                            Remove &amp; complement empty data
                            <span className="sub">Fill gaps with zero values during aggregation.</span>
                        </div>
                        <Switch on={workflow.removeAndComplement} onChange={(v) => onChange({ removeAndComplement: v })} />
                    </div>
                </div>
            </div>

            {/* Rules */}
            <h3 className="section-heading" style={{ marginTop: 20 }}>
                Rules
                <span className="hint">Filter which org units this workflow runs against, by dataset assignment</span>
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
                        <span className="title">Rule {idx + 1}</span>
                        <Button size="small" variant="destructive" icon="delete" iconColor="white" onClick={() => onRemoveRule(r.id)}>
                            Remove rule
                        </Button>
                    </div>
                    <div className="form-grid">
                        <Field label="Rule type" required>
                            <Select
                                value={r.type}
                                onChange={e => onUpdateRule(r.id, { type: e.target.value })}
                                options={RULE_TYPES}
                            />
                        </Field>
                        <Field label="Datasets" required help="Org units assigned to (or excluded from) these datasets.">
                            <MultiSelect
                                value={r.datasets}
                                onChange={(v) => onUpdateRule(r.id, { datasets: v })}
                                options={DATASETS}
                                placeholder="Pick datasets…"
                            />
                        </Field>
                    </div>
                </div>
            ))}

            <Button icon="add" onClick={onAddRule} style={{ marginTop: 4 }}>Add rule</Button>
        </div>
    );
};

export default CommodityForm;
window.CommodityForm = CommodityForm;
