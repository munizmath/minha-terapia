import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MeasurementChart = ({ data, unit, title, color = '#2196F3', isBP = false }) => {
    const [hovered, setHovered] = useState(null);

    if (!data || data.length < 2) {
        return (
            <div style={{ padding: 20, textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: 8, color: 'var(--color-text-secondary)' }}>
                <p>Insira pelo menos 2 registros para ver o gráfico de {title}.</p>
            </div>
        );
    }

    // Sort by date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Dimensions
    const width = 600;
    const height = 200;
    const padding = 40; // Increased for labels

    // Helper to get value(s)
    const getVal = (d) => {
        if (isBP) {
            const [sys, dia] = d.value.split('/');
            return { sys: parseFloat(sys), dia: parseFloat(dia) };
        }
        return parseFloat(d.value);
    };

    // Min/Max Calculation
    let minVal, maxVal;
    if (isBP) {
        const allSys = sortedData.map(d => getVal(d).sys);
        const allDia = sortedData.map(d => getVal(d).dia);
        minVal = Math.min(...allDia) - 10;
        maxVal = Math.max(...allSys) + 10;
    } else {
        const vals = sortedData.map(d => getVal(d));
        minVal = Math.min(...vals);
        maxVal = Math.max(...vals);
        const range = maxVal - minVal || 10;
        minVal -= range * 0.1;
        maxVal += range * 0.1;
    }

    // Scaling functions
    const xScale = (index) => padding + (index / (sortedData.length - 1)) * (width - 2 * padding);
    const yScale = (val) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);

    // Path Generators
    const generatePath = (valExtractor) => {
        return sortedData.map((d, i) =>
            `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(valExtractor(d))}`
        ).join(' ');
    };

    return (
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 16, borderRadius: 12, boxShadow: 'var(--shadow-sm)', maxWidth: '100%', overflow: 'hidden' }}>
            <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--color-text-primary)' }}>Evolução: {title}</h3>

            <div style={{ maxWidth: 500, margin: '0 auto', position: 'relative' }}>
                <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
                    {/* Grid Lines & Labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map(t => {
                        const y = height - padding - t * (height - 2 * padding);
                        const val = minVal + t * (maxVal - minVal);
                        return (
                            <g key={t}>
                                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--color-surface-dim)" strokeWidth="1" />
                                <text x={padding - 5} y={y + 4} fontSize="12" fill="var(--color-text-secondary)" textAnchor="end">
                                    {Math.round(val)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Lines */}
                    {isBP ? (
                        <>
                            {/* Systolic */}
                            <path d={generatePath(d => getVal(d).sys)} fill="none" stroke="#F44336" strokeWidth="3" />
                            {/* Diastolic */}
                            <path d={generatePath(d => getVal(d).dia)} fill="none" stroke="#2196F3" strokeWidth="3" />
                        </>
                    ) : (
                        <path d={generatePath(d => getVal(d))} fill="none" stroke={color} strokeWidth="3" />
                    )}

                    {/* Dots with Hover */}
                    {sortedData.map((d, i) => {
                        if (isBP) {
                            const v = getVal(d);
                            return (
                                <React.Fragment key={i}>
                                    <circle
                                        cx={xScale(i)} cy={yScale(v.sys)} r="6" fill="transparent"
                                        onMouseEnter={() => setHovered({ x: xScale(i), y: yScale(v.sys), val: v.sys, date: d.date, label: 'Sys' })}
                                        onMouseLeave={() => setHovered(null)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <circle cx={xScale(i)} cy={yScale(v.sys)} r="4" fill="#F44336" pointerEvents="none" />

                                    <circle
                                        cx={xScale(i)} cy={yScale(v.dia)} r="6" fill="transparent"
                                        onMouseEnter={() => setHovered({ x: xScale(i), y: yScale(v.dia), val: v.dia, date: d.date, label: 'Dia' })}
                                        onMouseLeave={() => setHovered(null)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <circle cx={xScale(i)} cy={yScale(v.dia)} r="4" fill="#2196F3" pointerEvents="none" />
                                </React.Fragment>
                            );
                        } else {
                            const val = getVal(d);
                            return (
                                <React.Fragment key={i}>
                                    <circle
                                        cx={xScale(i)} cy={yScale(val)} r="6" fill="transparent"
                                        onMouseEnter={() => setHovered({ x: xScale(i), y: yScale(val), val, date: d.date })}
                                        onMouseLeave={() => setHovered(null)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <circle cx={xScale(i)} cy={yScale(val)} r="4" fill={color} pointerEvents="none" />
                                </React.Fragment>
                            );
                        }
                    })}
                </svg>

                {/* Tooltip */}
                {hovered && (
                    <div style={{
                        position: 'absolute',
                        left: hovered.x,
                        top: hovered.y - 45,
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '6px 10px',
                        borderRadius: 6,
                        pointerEvents: 'none',
                        fontSize: 12,
                        zIndex: 10,
                        whiteSpace: 'nowrap'
                    }}>
                        <div style={{ fontWeight: 'bold' }}>
                            {hovered.label ? `${hovered.label}: ` : ''}{hovered.val}
                        </div>
                        <div style={{ fontSize: 10, opacity: 0.8 }}>
                            {format(parseISO(hovered.date), 'dd/MM/yyyy HH:mm')}
                        </div>
                        {/* Triangle */}
                        <div style={{
                            position: 'absolute',
                            bottom: -5,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderTop: '5px solid rgba(0,0,0,0.8)'
                        }}></div>
                    </div>
                )}
            </div>

            {/* Labels / Legend */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8, paddingLeft: 10, paddingRight: 10 }}>
                <span>{format(parseISO(sortedData[0].date), 'dd/MM')}</span>
                {isBP && (
                    <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ color: '#F44336', fontWeight: 500 }}>Sys</span>
                        <span style={{ color: '#2196F3', fontWeight: 500 }}>Dia</span>
                    </div>
                )}
                <span>{format(parseISO(sortedData[sortedData.length - 1].date), 'dd/MM')}</span>
            </div>
        </div>
    );
};

export default MeasurementChart;
