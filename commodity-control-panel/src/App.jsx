import React, { useState } from 'react'
import {
    AlertBar,
    AlertStack,
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    ButtonStrip,
} from '@dhis2/ui'
import { AppHeader, Sidebar } from './Shell.jsx'
import CommodityList from './CommodityList.jsx'
import CommodityForm from './CommodityForm.jsx'
import { DistributionList, DistributionForm } from './Distribution.jsx'
import { TransactionLogs, TransactionLogDetail } from './TransactionLogs.jsx'
import ManualResend, { SEED_RESENDS } from './ManualResend.jsx'
import { ConfigurationMatrixReport, DataTransferReport } from './Reports.jsx'
import {
    SEED_COMMODITIES,
    SEED_DISTRIBUTIONS,
    SEED_LOGS,
    newId,
} from './data.jsx'

function ConfirmModal({ title, body, danger, onConfirm, onClose }) {
    return (
        <Modal small onClose={onClose}>
            <ModalTitle>{title}</ModalTitle>
            <ModalContent>
                <p style={{ margin: 0, color: 'var(--grey-700)', fontSize: 14 }}>{body}</p>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onClose}>Cancel</Button>
                    {danger
                        ? <Button destructive onClick={() => { onConfirm(); onClose() }}>Delete</Button>
                        : <Button primary onClick={() => { onConfirm(); onClose() }}>Confirm</Button>
                    }
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

export default function App() {
    const [screen, setScreen] = useState('commodities')
    const [commodities, setCommodities] = useState(SEED_COMMODITIES)
    const [distributions, setDistributions] = useState(SEED_DISTRIBUTIONS)
    const [logs] = useState(SEED_LOGS)
    const [resends, setResends] = useState(SEED_RESENDS)

    const [editingCommodity, setEditingCommodity] = useState(null)
    const [editingDistribution, setEditingDistribution] = useState(null)
    const [viewingLog, setViewingLog] = useState(null)
    const [confirm, setConfirm] = useState(null)
    const [alerts, setAlerts] = useState([])

    const addAlert = (message, type = 'success') => {
        const id = newId('alert')
        setAlerts(prev => [...prev, { id, message, type }])
    }
    const removeAlert = (id) => setAlerts(prev => prev.filter(a => a.id !== id))

    const handleSaveCommodity = (form) => {
        const isNew = !commodities.find(c => c.id === form.id)
        if (isNew) {
            setCommodities(prev => [...prev, form])
            addAlert(`${form.name} added`, 'success')
        } else {
            setCommodities(prev => prev.map(c => c.id === form.id ? form : c))
            addAlert(`${form.name} updated`, 'success')
        }
        setEditingCommodity(null)
    }

    const handleDeleteCommodity = (c) => {
        setCommodities(prev => prev.filter(x => x.id !== c.id))
        addAlert(`${c.name} deleted`, 'warning')
    }

    const handleToggleActive = (c) => {
        setCommodities(prev => prev.map(x => x.id === c.id ? { ...x, active: !x.active } : x))
        addAlert(`${c.name} ${c.active ? 'deactivated' : 'activated'}`, 'success')
    }

    const handleSaveDistribution = (form) => {
        const isNew = !distributions.find(d => d.id === form.id)
        if (isNew) {
            setDistributions(prev => [...prev, form])
            addAlert(`${form.name} created`, 'success')
        } else {
            setDistributions(prev => prev.map(d => d.id === form.id ? form : d))
            addAlert(`${form.name} updated`, 'success')
        }
        setEditingDistribution(null)
    }

    const handleDeleteDistribution = (d) => {
        setDistributions(prev => prev.filter(x => x.id !== d.id))
        addAlert(`${d.name} deleted`, 'warning')
    }

    const handleResend = ({ configurationIds, period, reason, estimatedRecords }) => {
        const r = {
            id: newId('rs'),
            date: new Date().toISOString(),
            period,
            configurationIds,
            status: 'SUCCESS',
            records: estimatedRecords,
            triggeredBy: 'fkoroma@moh.gov.sl',
            reason: reason || null,
        }
        setResends(prev => [r, ...prev])
        addAlert(`Resend queued — ${estimatedRecords.toLocaleString()} est. records`, 'success')
    }

    const badges = {
        commodities: commodities.length,
        distributions: distributions.length,
        logs: logs.length,
    };

    return (
        <div className="app">
            <AppHeader appName="Commodity Control" instance="HMIS Sierra Leone" />
            <div className="app-body">
                <Sidebar active={screen} onSelect={setScreen} badges={badges} />
                <main className="main">
                    {screen === 'commodities' && (
                        <CommodityList
                            items={commodities}
                            onAdd={() => setEditingCommodity('new')}
                            onEdit={c => setEditingCommodity(c)}
                            onView={c => setEditingCommodity(c)}
                            onToggleActive={c => setConfirm({
                                title: c.active ? 'Deactivate configuration?' : 'Activate configuration?',
                                body: `${c.name} will be ${c.active ? 'deactivated and excluded from future sync runs' : 'activated and included in the next scheduled sync'}.`,
                                onConfirm: () => handleToggleActive(c),
                            })}
                            onDelete={c => setConfirm({
                                title: 'Delete configuration?',
                                body: `${c.name} (${c.code}) will be permanently removed. This cannot be undone.`,
                                danger: true,
                                onConfirm: () => handleDeleteCommodity(c),
                            })}
                        />
                    )}

                    {screen === 'distributions' && (
                        <DistributionList
                            items={distributions}
                            commodities={commodities}
                            onAdd={() => setEditingDistribution('new')}
                            onEdit={d => setEditingDistribution(d)}
                            onDelete={d => setConfirm({
                                title: 'Delete distribution?',
                                body: `"${d.name}" will be permanently removed.`,
                                danger: true,
                                onConfirm: () => handleDeleteDistribution(d),
                            })}
                        />
                    )}

                    {screen === 'logs' && (
                        <TransactionLogs
                            logs={logs}
                            commodities={commodities}
                            onView={l => setViewingLog(l)}
                        />
                    )}

                    {screen === 'resend' && (
                        <ManualResend
                            commodities={commodities}
                            recentResends={resends}
                            onResend={handleResend}
                        />
                    )}

                    {screen === 'report-matrix' && (
                        <ConfigurationMatrixReport
                            commodities={commodities}
                            distributions={distributions}
                        />
                    )}

                    {screen === 'report-transfer' && (
                        <DataTransferReport
                            commodities={commodities}
                        />
                    )}
                </main>
            </div>

            {editingCommodity && (
                <CommodityForm
                    initial={editingCommodity === 'new' ? null : editingCommodity}
                    onClose={() => setEditingCommodity(null)}
                    onSave={handleSaveCommodity}
                />
            )}

            {editingDistribution && (
                <DistributionForm
                    initial={editingDistribution === 'new' ? null : editingDistribution}
                    commodities={commodities}
                    onClose={() => setEditingDistribution(null)}
                    onSave={handleSaveDistribution}
                />
            )}

            {viewingLog && (
                <TransactionLogDetail
                    log={viewingLog}
                    commodities={commodities}
                    onClose={() => setViewingLog(null)}
                />
            )}

            {confirm && (
                <ConfirmModal
                    {...confirm}
                    onClose={() => setConfirm(null)}
                />
            )}

            <AlertStack>
                {alerts.map(a => (
                    <AlertBar
                        key={a.id}
                        success={a.type === 'success'}
                        critical={a.type === 'error'}
                        warning={a.type === 'warning'}
                        duration={4500}
                        onHidden={() => removeAlert(a.id)}
                    >
                        {a.message}
                    </AlertBar>
                ))}
            </AlertStack>
        </div>
    )
}
