/* AppHeader — top app shell. 48px, --header-bar-bg, white logo + text. */
import React from 'react';
import { Icon } from './Atoms.jsx';

const AppHeader = ({ appName, instance }) => (
    <header className="hb">
        <img src="assets/logo-icon.svg" alt="DHIS2" className="hb-logo" />
        <div className="hb-sep" />
        <span className="hb-title">{appName}</span>
        {instance && <span className="hb-instance">· {instance}</span>}
        <div className="hb-spacer" />
        <button className="hb-icon-btn" title="Documentation">
            <Icon name="info" size={24} />
        </button>
        <button className="hb-icon-btn" title="Messages">
            <Icon name="messages" size={24} />
        </button>
        <button className="hb-icon-btn" title="Apps">
            <Icon name="apps" size={24} />
        </button>
        <div className="hb-avatar">FK</div>
    </header>
);

/* Sidebar — left section nav for the four app sections. */

const Sidebar = ({ active, onSelect, badges }) => {
    const sections = [
        {
            heading: 'Configuration',
            items: [
                { id: 'commodities',    label: 'Commodity configurations',   icon: 'table',           badge: badges.commodities },
                { id: 'distributions',  label: 'Distribution configurations', icon: 'share',           badge: badges.distributions },
            ],
        },
        {
            heading: 'Operations',
            items: [
                { id: 'logs',    label: 'Transaction logs',    icon: 'file-document', badge: badges.logs },
                { id: 'resend',  label: 'Manual data resend',  icon: 'sync' },
            ],
        },
        {
            heading: 'Reports',
            items: [
                { id: 'report-matrix',   label: 'Configuration matrix', icon: 'table' },
                { id: 'report-transfer', label: 'Data transfer status', icon: 'sync' },
            ],
        },
    ];

    return (
        <nav className="sb">
            {sections.map(sec => (
                <div key={sec.heading}>
                    <div className="sb-section">{sec.heading}</div>
                    {sec.items.map(item => (
                        <div
                            key={item.id}
                            className={`sb-item ${active === item.id ? 'active' : ''}`}
                            onClick={() => onSelect(item.id)}
                        >
                            <Icon name={item.icon} size={24} />
                            <span>{item.label}</span>
                            {item.badge != null && <span className="badge">{item.badge}</span>}
                        </div>
                    ))}
                </div>
            ))}
        </nav>
    );
};

export { AppHeader, Sidebar };
Object.assign(window, { AppHeader, Sidebar });
