/* DHIS2 atoms — recreations of @dhis2/ui primitives for the Commodity Control app.
 * Exposes Icon, Button, Tag, NoticeBox, Card, Input, Select, Field, Switch,
 * Checkbox, RadioGroup, Slider, MultiSelect, Transfer, Tabs, Modal, AlertBar,
 * CircularLoader, Pagination — all on window for cross-file usage. */

/* Some icons only ship in 24px from the DHIS2 set. If a 16px is requested for
 * an icon we don't have at that size, fall back to the 24px SVG and let CSS
 * scale it down. */
const SIZE16_AVAILABLE = new Set([
    'add', 'arrow-down', 'arrow-up', 'checkmark', 'chevron-down', 'chevron-up',
    'cross', 'drag-handle', 'edit', 'search',
]);

const Icon = ({ name, size = 24, color, className = "", style = {}, onClick }) => {
    /* Use the requested file size only if it's 24 (always available) or 16
     * and a 16-variant exists. Otherwise fall back to 24 and downscale. */
    const fileSize = (size === 24 || (size === 16 && SIZE16_AVAILABLE.has(name))) ? size : 24;
    return (
        <img
            src={`assets/icons/${name}-${fileSize}.svg`}
            alt=""
            width={size}
            height={size}
            className={className}
            onClick={onClick}
            style={{
                ...style,
                ...(color ? { filter: colorFilter(color) } : {}),
            }}
        />
    );
};

function colorFilter(c) {
    const map = {
        white: 'brightness(0) invert(1)',
        red: 'brightness(0) saturate(100%) invert(13%) sepia(81%) saturate(3934%) hue-rotate(354deg) brightness(91%) contrast(100%)',
        blue: 'brightness(0) saturate(100%) invert(28%) sepia(94%) saturate(1547%) hue-rotate(195deg) brightness(90%) contrast(96%)',
        green: 'brightness(0) saturate(100%) invert(36%) sepia(85%) saturate(454%) hue-rotate(78deg) brightness(94%) contrast(86%)',
        yellow: 'brightness(0) saturate(100%) invert(36%) sepia(98%) saturate(1058%) hue-rotate(7deg) brightness(96%) contrast(101%)',
        muted: 'brightness(0) saturate(100%) invert(45%) sepia(8%) saturate(530%) hue-rotate(178deg) brightness(94%) contrast(89%)',
        dark: 'brightness(0) saturate(100%) invert(15%) sepia(10%) saturate(400%) hue-rotate(178deg) brightness(96%) contrast(90%)',
    };
    return map[c] || '';
}

const Button = ({ variant, size, icon, iconColor, children, onClick, disabled, style, loading, iconOnly, type, title }) => {
    const cls = ['dhis2-btn'];
    if (variant) cls.push(variant);
    if (size) cls.push(size);
    if (disabled) cls.push('disabled');
    if (iconOnly) cls.push('icon-only');
    const ic = iconColor || (variant === 'primary' || variant === 'destructive' ? 'white' : 'muted');
    return (
        <button
            className={cls.join(' ')}
            onClick={onClick}
            disabled={disabled || loading}
            style={style}
            type={type || 'button'}
            title={title}
        >
            {loading
                ? <span className={`dhis2-loader ${variant === 'primary' || variant === 'destructive' ? '' : 'dark'}`} />
                : (icon && <Icon name={icon} size={16} color={ic} />)
            }
            {children}
        </button>
    );
};

const Tag = ({ variant, bold, icon, children }) => (
    <span className={`dhis2-tag ${variant || ''} ${bold ? 'bold' : ''}`}>
        {icon && <Icon name={icon} size={16} color={
            variant === 'negative' ? 'red' :
            variant === 'positive' ? 'green' :
            variant === 'neutral' ? 'blue' : 'muted'
        } />}
        {children}
    </span>
);

const NoticeBox = ({ variant = 'info', title, children }) => {
    const iconMap = {
        info: { name: 'info-filled', color: 'blue' },
        warning: { name: 'error', color: 'yellow' },
        valid: { name: 'checkmark-circle', color: 'green' },
        error: { name: 'error-filled', color: 'red' },
    };
    const cls = variant === 'info' ? '' : variant;
    const { name, color } = iconMap[variant] || iconMap.info;
    return (
        <div className={`dhis2-notice ${cls}`}>
            <Icon name={name} size={24} color={color} />
            <div>
                {title && <p className="title">{title}</p>}
                {children && <div className="msg">{children}</div>}
            </div>
        </div>
    );
};

const Card = ({ className = "", children, style }) => (
    <div className={`dhis2-card ${className}`} style={style}>{children}</div>
);

const Input = ({ value, onChange, placeholder, error, warning, disabled, prefixIcon, type = 'text', style, compact, onKeyDown, autoFocus }) => (
    <div style={{ position: 'relative', ...style }}>
        {prefixIcon && (
            <span style={{
                position: 'absolute', insetInlineStart: 10, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none',
                display: 'inline-flex',
            }}>
                <Icon name={prefixIcon} size={16} color="muted" />
            </span>
        )}
        <input
            type={type}
            className={`dhis2-input ${error ? 'error' : ''} ${warning ? 'warning' : ''} ${disabled ? 'disabled' : ''} ${compact ? 'compact' : ''}`}
            value={value ?? ''}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            style={prefixIcon ? { paddingInlineStart: 32 } : {}}
            onKeyDown={onKeyDown}
            autoFocus={autoFocus}
        />
    </div>
);

const Select = ({ value, onChange, options, placeholder, disabled, compact, error, style }) => (
    <div className="dhis2-select-wrap" style={style}>
        <select
            className={`dhis2-input ${error ? 'error' : ''} ${disabled ? 'disabled' : ''} ${compact ? 'compact' : ''}`}
            value={value ?? ''}
            onChange={onChange}
            disabled={disabled}
        >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    </div>
);

const Field = ({ label, required, help, error, children, dense }) => (
    <div style={{ marginBottom: dense ? 0 : 0 }}>
        {label && (
            <label className="dhis2-label" style={{ display: 'block', marginBottom: 4 }}>
                {label}{required && <span className="req"> *</span>}
            </label>
        )}
        {children}
        {(help || error) && (
            <div className={`dhis2-help ${error ? 'error' : ''}`}>{error || help}</div>
        )}
    </div>
);

const Checkbox = ({ checked, label, onChange }) => (
    <label className={`dhis2-check ${checked ? 'checked' : ''}`} onClick={() => onChange && onChange(!checked)}>
        <span className="box"></span> {label}
    </label>
);

const Switch = ({ on, label, onChange, disabled }) => (
    <label
        className={`dhis2-switch ${on ? 'on' : ''}`}
        onClick={() => !disabled && onChange && onChange(!on)}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
        <span className="track"><span className="thumb"></span></span> {label && <span>{label}</span>}
    </label>
);

const RadioGroup = ({ value, onChange, options }) => (
    <div className="radio-group">
        {options.map(o => (
            <button
                key={o.value}
                type="button"
                className={value === o.value ? 'active' : ''}
                onClick={() => onChange(o.value)}
            >{o.label}</button>
        ))}
    </div>
);

const Slider = ({ value, onChange, min = 0, max = 1, step = 0.01, formatVal }) => (
    <div className="dhis2-slider">
        <input
            type="range"
            min={min} max={max} step={step}
            value={value}
            onChange={e => onChange(parseFloat(e.target.value))}
        />
        <span className="val">{formatVal ? formatVal(value) : value}</span>
    </div>
);

/* ---------- MultiSelect ---------- */
const MultiSelect = ({ value = [], onChange, options, placeholder = 'Select…', searchable = true, renderOption }) => {
    const [open, setOpen] = React.useState(false);
    const [q, setQ] = React.useState('');
    const wrapRef = React.useRef(null);

    React.useEffect(() => {
        if (!open) return;
        const onDoc = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);

    const selected = value.map(v => options.find(o => o.value === v)).filter(Boolean);
    const available = options.filter(o =>
        !value.includes(o.value) &&
        (!q || (o.label || '').toLowerCase().includes(q.toLowerCase()) || (o.value || '').toLowerCase().includes(q.toLowerCase()))
    );

    const remove = (v, e) => {
        e && e.stopPropagation();
        onChange(value.filter(x => x !== v));
    };
    const add = (v) => {
        onChange([...value, v]);
        setQ('');
    };

    return (
        <div className="multi-select-wrap" ref={wrapRef}>
            <div className={`multi-select ${open ? 'open' : ''}`} onClick={() => setOpen(true)}>
                {selected.map(s => (
                    <span key={s.value} className="ms-chip" onClick={e => e.stopPropagation()}>
                        {s.value}
                        <span className="x" onClick={(e) => remove(s.value, e)}>×</span>
                    </span>
                ))}
                {searchable
                    ? <input
                        className="ms-input"
                        value={q}
                        onChange={e => { setQ(e.target.value); setOpen(true); }}
                        placeholder={selected.length === 0 ? placeholder : ''}
                        onClick={e => e.stopPropagation()}
                    />
                    : (selected.length === 0 && <span className="ms-placeholder">{placeholder}</span>)
                }
            </div>
            {open && available.length > 0 && (
                <div className="ms-dropdown">
                    {available.slice(0, 30).map(o => (
                        <div key={o.value} className="opt" onClick={() => add(o.value)}>
                            {renderOption ? renderOption(o) : (
                                <>
                                    <span>{o.label}</span>
                                    <span className="code">{o.value}</span>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ---------- Transfer ---------- */
const Transfer = ({ value = [], onChange, options, leftLabel = 'Available', rightLabel = 'Selected', searchable = true }) => {
    const [leftSel, setLeftSel] = React.useState([]);
    const [rightSel, setRightSel] = React.useState([]);
    const [lq, setLq] = React.useState('');
    const [rq, setRq] = React.useState('');

    const valueSet = new Set(value);
    const leftOpts = options.filter(o => !valueSet.has(o.value));
    const rightOpts = value.map(v => options.find(o => o.value === v)).filter(Boolean);

    const fil = (arr, q) => !q ? arr : arr.filter(o =>
        (o.label || '').toLowerCase().includes(q.toLowerCase()) ||
        (o.value || '').toLowerCase().includes(q.toLowerCase()) ||
        (o.sub || '').toLowerCase().includes(q.toLowerCase())
    );
    const left = fil(leftOpts, lq);
    const right = fil(rightOpts, rq);

    const toggle = (set, setSet, v) =>
        set.includes(v) ? setSet(set.filter(x => x !== v)) : setSet([...set, v]);

    const moveRight = () => { onChange([...value, ...leftSel]); setLeftSel([]); };
    const moveLeft = () => { onChange(value.filter(v => !rightSel.includes(v))); setRightSel([]); };
    const allRight = () => { onChange([...value, ...leftOpts.map(o => o.value)]); setLeftSel([]); };
    const allLeft = () => { onChange([]); setRightSel([]); };

    return (
        <div className="transfer">
            <div className="col">
                <div className="col-head">
                    <span>{leftLabel}</span>
                    <span className="count">{leftOpts.length}</span>
                </div>
                {searchable && (
                    <div className="col-search">
                        <Input compact value={lq} onChange={e => setLq(e.target.value)} prefixIcon="search" placeholder="Filter…" />
                    </div>
                )}
                <div className="col-list">
                    {left.length === 0
                        ? <div className="col-empty">No items</div>
                        : left.map(o => (
                            <div
                                key={o.value}
                                className={`col-item ${leftSel.includes(o.value) ? 'selected' : ''}`}
                                onClick={() => toggle(leftSel, setLeftSel, o.value)}
                            >
                                <div className="stack">
                                    <span className="name">{o.label}</span>
                                    {o.sub && <span className="sub">{o.sub}</span>}
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className="controls">
                <button onClick={allRight} disabled={leftOpts.length === 0} title="Move all">»</button>
                <button onClick={moveRight} disabled={leftSel.length === 0} title="Move selected">›</button>
                <button onClick={moveLeft} disabled={rightSel.length === 0} title="Remove selected">‹</button>
                <button onClick={allLeft} disabled={rightOpts.length === 0} title="Remove all">«</button>
            </div>
            <div className="col">
                <div className="col-head">
                    <span>{rightLabel}</span>
                    <span className="count">{rightOpts.length}</span>
                </div>
                {searchable && (
                    <div className="col-search">
                        <Input compact value={rq} onChange={e => setRq(e.target.value)} prefixIcon="search" placeholder="Filter…" />
                    </div>
                )}
                <div className="col-list">
                    {right.length === 0
                        ? <div className="col-empty">Nothing selected</div>
                        : right.map(o => (
                            <div
                                key={o.value}
                                className={`col-item ${rightSel.includes(o.value) ? 'selected' : ''}`}
                                onClick={() => toggle(rightSel, setRightSel, o.value)}
                            >
                                <div className="stack">
                                    <span className="name">{o.label}</span>
                                    {o.sub && <span className="sub">{o.sub}</span>}
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

/* ---------- Modal ---------- */
const Modal = ({ size, title, subtitle, onClose, children, footer }) => {
    React.useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
        <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose && onClose()}>
            <div className={`modal ${size || ''}`} onMouseDown={e => e.stopPropagation()}>
                <div className="modal-head">
                    <div>
                        <h2>{title}</h2>
                        {subtitle && <p className="sub">{subtitle}</p>}
                    </div>
                    <button className="close-btn" onClick={onClose} title="Close">
                        <Icon name="cross" size={24} color="muted" />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-foot">{footer}</div>}
            </div>
        </div>
    );
};

/* ---------- AlertBar (toast) ---------- */
const AlertBar = ({ variant, children, onClose, action }) => {
    const iconMap = { success: 'checkmark-circle', error: 'error-filled', warning: 'error', info: 'info-filled' };
    return (
        <div className={`alert-bar ${variant || ''}`}>
            <Icon name={iconMap[variant] || 'info-filled'} size={20} />
            <span className="body">{children}</span>
            {action && <button className="undo" onClick={action.onClick}>{action.label}</button>}
            <button className="x" onClick={onClose}>×</button>
        </div>
    );
};

/* ---------- Pagination ---------- */
const Pagination = ({ page, totalPages, pageSize, total, onPage, onPageSize }) => {
    if (totalPages <= 1 && total <= pageSize) {
        return (
            <div className="tbl-foot">
                <span>{total} {total === 1 ? 'row' : 'rows'}</span>
                <div className="pg">
                    <span className="rows-per">
                        Rows per page
                        <select value={pageSize} onChange={e => onPageSize(parseInt(e.target.value))}>
                            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </span>
                </div>
            </div>
        );
    }
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
        else if (pages[pages.length - 1] !== '…') pages.push('…');
    }
    return (
        <div className="tbl-foot">
            <span>{start}–{end} of {total}</span>
            <div className="pg">
                <span className="rows-per">
                    Rows per page
                    <select value={pageSize} onChange={e => onPageSize(parseInt(e.target.value))}>
                        {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </span>
                <button disabled={page === 1} onClick={() => onPage(page - 1)}>‹ Prev</button>
                {pages.map((p, i) =>
                    p === '…'
                        ? <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--fg-subtle)' }}>…</span>
                        : <button
                            key={p}
                            className={p === page ? 'current' : ''}
                            onClick={() => onPage(p)}
                        >{p}</button>
                )}
                <button disabled={page === totalPages} onClick={() => onPage(page + 1)}>Next ›</button>
            </div>
        </div>
    );
};

export { Icon, Button, Tag, NoticeBox, Card, Input, Select, Field, Checkbox, Switch, RadioGroup, Slider, MultiSelect, Transfer, Modal, AlertBar, Pagination };
Object.assign(window, {
    Icon, Button, Tag, NoticeBox, Card, Input, Select, Field, Checkbox, Switch,
    RadioGroup, Slider, MultiSelect, Transfer, Modal, AlertBar, Pagination,
});
