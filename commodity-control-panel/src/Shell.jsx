import React from 'react'
import {
    IconTable24,
    IconShare24,
    IconFileDocument24,
    IconSync24,
    IconInfo24,
    IconApps24,
    IconMail24,
} from '@dhis2/ui'

export const AppHeader = ({ appName, instance }) => (
    <header className="app-header">
        <img src="/assets/logo-icon.svg" alt="DHIS2" className="hb-logo" />
        <div className="hb-sep" />
        <span className="hb-title">{appName}</span>
        {instance && <span className="hb-instance">· {instance}</span>}
        <div className="hb-spacer" />
        <button className="hb-icon-btn" title="Documentation"><IconInfo24 /></button>
        <button className="hb-icon-btn" title="Messages"><IconMail24 /></button>
        <button className="hb-icon-btn" title="Apps"><IconApps24 /></button>
        <div className="hb-avatar">FK</div>
    </header>
)

const SECTIONS = [
    {
        heading: 'Configuration',
        items: [
            { id: 'commodities',   label: 'Commodity configurations',    Icon: IconTable24 },
            { id: 'distributions', label: 'Distribution configurations', Icon: IconShare24 },
        ],
    },
    {
        heading: 'Operations',
        items: [
            { id: 'logs',   label: 'Transaction logs',   Icon: IconFileDocument24 },
            { id: 'resend', label: 'Manual data resend', Icon: IconSync24 },
        ],
    },
]

export const Sidebar = ({ active, onSelect, badges = {} }) => (
    <nav className="sb">
        {SECTIONS.map(sec => (
            <div key={sec.heading}>
                <div className="sb-section">{sec.heading}</div>
                {sec.items.map(({ id, label, Icon }) => (
                    <div
                        key={id}
                        className={`sb-item ${active === id ? 'active' : ''}`}
                        onClick={() => onSelect(id)}
                    >
                        <Icon />
                        <span>{label}</span>
                        {badges[id] != null && (
                            <span className="sb-badge">{badges[id]}</span>
                        )}
                    </div>
                ))}
            </div>
        ))}
    </nav>
)
