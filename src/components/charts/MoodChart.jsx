import React from 'react';
import './MoodChart.css';

const MoodChart = ({ entries }) => {
    if (!entries || entries.length === 0) {
        return <div className="chart-empty">Insira registros para ver o gráfico</div>;
    }

    // Agrupar por data
    const groupedByDate = entries.reduce((acc, entry) => {
        const date = new Date(entry.date).toLocaleDateString('pt-BR');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(entry);
        return acc;
    }, {});

    // Calcular média de intensidade por data
    const chartData = Object.keys(groupedByDate)
        .sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')))
        .map(date => {
            const dayEntries = groupedByDate[date];
            const avgIntensity = dayEntries.reduce((sum, e) => sum + e.intensity, 0) / dayEntries.length;
            return { date, avgIntensity, count: dayEntries.length };
        });

    const maxIntensity = 5;
    const maxValue = Math.max(...chartData.map(d => d.avgIntensity), 1);

    return (
        <div className="mood-chart">
            <div className="chart-container">
                {chartData.map((data, index) => (
                    <div key={index} className="chart-bar-container">
                        <div className="chart-bar-wrapper">
                            <div
                                className="chart-bar"
                                style={{
                                    height: `${(data.avgIntensity / maxValue) * 100}%`,
                                    backgroundColor: `hsl(${210 - (data.avgIntensity * 20)}, 70%, 50%)`
                                }}
                            >
                                <span className="bar-value">{data.avgIntensity.toFixed(1)}</span>
                            </div>
                        </div>
                        <div className="chart-label">
                            {new Date(data.date.split('/').reverse().join('-')).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit'
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <div className="chart-legend">
                <span>Intensidade Média por Dia</span>
            </div>
        </div>
    );
};

export default MoodChart;

