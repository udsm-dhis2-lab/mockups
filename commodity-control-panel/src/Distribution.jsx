/* DistributionList — distribution configurations list view + create/edit modal */

const DistributionList = ({ items, commodities, onAdd, onEdit, onDelete }) => {
    const [q, setQ] = React.useState('');
    const filtered = items.filter(d => !q || d.name.toLowerCase().includes(q.toLowerCase()) || d.id.toLowerCase().includes(q.toLowerCase()));

    return (
        <div>
            <div className="ph">
                <div>
                    <p className="breadcrumb">Commodity Control / Distribution configurations</p>
                    <h1>Distribution configurations</h1>
                    <p className="lede">
                        Bundle commodity configurations into named distributions so multiple commodities can be
                        synced together on a shared trigger.
                    </p>
                </div>
                <div className="actions">
                    <Button variant="primary" icon="add" iconColor="white" onClick={onAdd}>
                        Add distribution
                    </Button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="search">
                    <span className="field-label">Search</span>
                    <Input compact value={q} onChange={e => setQ(e.target.value)} prefixIcon="search" placeholder="Search by distribution name or ID…" />
                </div>
                <div className="meta">
                    Showing <strong>{filtered.length}</strong> of {items.length} distributions
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <Icon name="share" size={48} color="muted" />
                    <h2>No distributions yet</h2>
                    <p>Create a distribution to sync several commodity configurations together on one trigger.</p>
                    <Button variant="primary" icon="add" iconColor="white" onClick={onAdd}>Add distribution</Button>
                </div>
            ) : (
                <div className="tbl-wrap">
                    <table className="dhis2-table">
                        <thead>
                            <tr>
                                <th>Distribution name</th>
                                <th>ID</th>
                                <th className="center">Linked configurations</th>
                                <th>Included commodities</th>
                                <th style={{ width: 1, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(d => {
                                const linked = d.configurations.map(id => commodities.find(c => c.id === id)).filter(Boolean);
                                return (
                                    <tr key={d.id} className="clickable" onClick={() => onEdit(d)}>
                                        <td><span style={{ fontWeight: 500 }}>{d.name}</span></td>
                                        <td className="mono">{d.id}</td>
                                        <td className="center">
                                            <span style={{
                                                display: 'inline-block', minWidth: 22,
                                                padding: '2px 8px', borderRadius: 10,
                                                background: 'var(--blue-100)', color: 'var(--blue-800)',
                                                fontSize: 12, fontWeight: 500,
                                            }}>{linked.length}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                {linked.slice(0, 3).map(c => <Tag key={c.id}>{c.code}</Tag>)}
                                                {linked.length > 3 && (
                                                    <span style={{ fontSize: 12, color: 'var(--fg-muted)', alignSelf: 'center' }}>
                                                        +{linked.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="actions" onClick={e => e.stopPropagation()}>
                                            <div className="row">
                                                <button className="row-icon-btn" title="Edit" onClick={() => onEdit(d)}>
                                                    <Icon name="edit" size={16} color="muted" />
                                                </button>
                                                <button className="row-icon-btn destructive" title="Delete" onClick={() => onDelete(d)}>
                                                    <Icon name="delete" size={16} color="red" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const DistributionForm = ({ initial, commodities, onClose, onSave }) => {
    const [form, setForm] = React.useState(() => initial
        ? JSON.parse(JSON.stringify(initial))
        : { id: newId('dist'), name: '', configurations: [] }
    );
    const [errors, setErrors] = React.useState({});
    const [saving, setSaving] = React.useState(false);

    const set = (patch) => setForm(f => ({ ...f, ...patch }));

    const submit = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Distribution name is required';
        if (form.configurations.length === 0) e.configurations = 'Pick at least one commodity configuration';
        setErrors(e);
        if (Object.keys(e).length > 0) return;
        setSaving(true);
        setTimeout(() => {
            onSave(form);
            setSaving(false);
        }, 400);
    };

    const options = commodities.map(c => ({
        value: c.id,
        label: c.name,
        sub: `${c.code} · ${c.group} · ${c.active ? 'Active' : 'Inactive'}`,
    }));

    return (
        <Modal
            title={initial ? `Edit distribution — ${initial.name}` : 'New distribution'}
            subtitle={initial ? initial.id : 'Group commodity configurations into a named distribution'}
            onClose={onClose}
            footer={
                <>
                    <span className="hint">{form.configurations.length} {form.configurations.length === 1 ? 'configuration' : 'configurations'} selected</span>
                    <div className="right">
                        <Button onClick={onClose} disabled={saving}>Cancel</Button>
                        <Button variant="primary" icon="save" iconColor="white" onClick={submit} loading={saving}>
                            {initial ? 'Save changes' : 'Create distribution'}
                        </Button>
                    </div>
                </>
            }
        >
            <div className="form-section">
                <div className="form-grid">
                    <Field label="Distribution name" required error={errors.name}>
                        <Input
                            value={form.name}
                            onChange={e => set({ name: e.target.value })}
                            placeholder="e.g. Malaria & Antimalarial Sync"
                            error={!!errors.name}
                        />
                    </Field>
                    <Field label="Distribution ID" help="Auto-generated. Used in API payloads.">
                        <Input value={form.id} disabled />
                    </Field>
                </div>
            </div>

            <div className="form-section">
                <h3 className="section-heading">
                    Commodity configurations
                    <span className="hint">Pick which configurations are bundled into this distribution</span>
                </h3>
                {errors.configurations && <div className="field-error" style={{ marginBottom: 8 }}>{errors.configurations}</div>}
                <Transfer
                    value={form.configurations}
                    onChange={(v) => set({ configurations: v })}
                    options={options}
                    leftLabel="Available configurations"
                    rightLabel="Included in distribution"
                />
            </div>
        </Modal>
    );
};

Object.assign(window, { DistributionList, DistributionForm });
