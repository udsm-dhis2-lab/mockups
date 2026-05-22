/* CommodityList — list view of commodity configurations
 * Search + group/status filters + DataTable + actions. */
import React from 'react';
import { Button, Input, Select, Icon, Tag, Pagination } from './Atoms.jsx';
import { COMMODITY_GROUPS, describeCron } from './data.jsx';

const CommodityList = ({ items, onAdd, onEdit, onToggleActive, onDelete, onView }) => {
    const [q, setQ] = React.useState('');
    const [group, setGroup] = React.useState('all');
    const [status, setStatus] = React.useState('all');
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);

    const filtered = items.filter(c => {
        if (q && !`${c.code} ${c.name}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (group !== 'all' && c.group !== group) return false;
        if (status === 'active' && !c.active) return false;
        if (status === 'inactive' && c.active) return false;
        return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    React.useEffect(() => { setPage(1); }, [q, group, status, pageSize]);

    const groupOptions = [
        { value: 'all', label: 'All groups' },
        ...COMMODITY_GROUPS.map(g => ({ value: g.value, label: g.value })),
    ];
    const statusOptions = [
        { value: 'all',      label: 'All statuses' },
        { value: 'active',   label: 'Active only' },
        { value: 'inactive', label: 'Inactive only' },
    ];

    return (
        <div>
            <div className="ph">
                <div>
                    <p className="breadcrumb">Commodity Control / Commodity configurations</p>
                    <h1>Commodity configurations</h1>
                    <p className="lede">
                        Define how each commodity's stock and consumption data are pulled, transformed, and synced
                        from facility data sets into the central LMIS warehouse.
                    </p>
                </div>
                <div className="actions">
                    <Button variant="primary" icon="add" iconColor="white" onClick={onAdd}>
                        Add configuration
                    </Button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="search">
                    <span className="field-label">Search</span>
                    <Input
                        compact
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        prefixIcon="search"
                        placeholder="Search by name or code…"
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
                    Showing <strong>{total}</strong> of {items.length} configurations
                </div>
            </div>

            <div className="tbl-wrap">
                <table className="dhis2-table">
                    <thead>
                        <tr>
                            <th>Commodity</th>
                            <th>Group</th>
                            <th>Ordering period</th>
                            <th>Sync interval</th>
                            <th className="center">Workflows</th>
                            <th>Status</th>
                            <th style={{ width: 1, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: 0 }}>
                                    <div className="empty-state" style={{ boxShadow: 'none', borderRadius: 0 }}>
                                        <Icon name="search" size={24} color="muted" />
                                        <h2>No configurations match your filters</h2>
                                        <p>Try clearing the search term, or pick a different group / status.</p>
                                        <Button onClick={() => { setQ(''); setGroup('all'); setStatus('all'); }}>Clear filters</Button>
                                    </div>
                                </td>
                            </tr>
                        ) : pageRows.map(c => (
                            <tr key={c.id} className="clickable" onClick={() => onView(c)}>
                                <td>
                                    <div className="row-stack">
                                        <span className="primary">{c.name}</span>
                                        <span className="secondary">{c.code}</span>
                                    </div>
                                </td>
                                <td><Tag>{c.group}</Tag></td>
                                <td>{c.orderingPeriod} {c.orderingPeriodType}</td>
                                <td className="mono" title={describeCron(c.syncInterval).text}>{c.syncInterval}</td>
                                <td className="center">
                                    <span style={{
                                        display: 'inline-block', minWidth: 22,
                                        padding: '2px 8px', borderRadius: 10,
                                        background: 'var(--grey-200)', color: 'var(--grey-800)',
                                        fontSize: 12, fontWeight: 500,
                                    }}>{c.workflows.length}</span>
                                </td>
                                <td>
                                    {c.active
                                        ? <Tag variant="positive" bold>Active</Tag>
                                        : <Tag>Inactive</Tag>
                                    }
                                </td>
                                <td className="actions" onClick={e => e.stopPropagation()}>
                                    <div className="row">
                                        <button className="row-icon-btn" title="Edit" onClick={() => onEdit(c)}>
                                            <Icon name="edit" size={16} color="muted" />
                                        </button>
                                        <button
                                            className="row-icon-btn"
                                            title={c.active ? 'Deactivate' : 'Activate'}
                                            onClick={() => onToggleActive(c)}
                                        >
                                            <Icon name={c.active ? 'lock' : 'checkmark'} size={16} color="muted" />
                                        </button>
                                        <button
                                            className="row-icon-btn destructive"
                                            title="Delete"
                                            onClick={() => onDelete(c)}
                                        >
                                            <Icon name="delete" size={16} color="red" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
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

export default CommodityList;
window.CommodityList = CommodityList;
