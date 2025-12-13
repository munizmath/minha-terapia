import React, { useState } from 'react';
import { useMedications } from '../context/MedicationContext';
import { BarChart3, CheckCircle, XCircle, Calendar, AlertCircle, Zap, Smile } from 'lucide-react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MeasurementChart from '../components/dashboard/MeasurementChart';
import './Progress.css';

const Progress = () => {
    const { logs, medications, measurements, activities, symptoms } = useMedications();
    const today = new Date();
    const [selectedClinical, setSelectedClinical] = useState('blood_pressure');
    const [selectedBody, setSelectedBody] = useState('weight');
    const [selectedLab, setSelectedLab] = useState('glucose');

    // Weekly Stats
    const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const MEASUREMENT_DICT = {
        blood_pressure: 'Pressão Arterial',
        heart_rate: 'Frequência Cardíaca',
        temperature: 'Temperatura',
        oxygen: 'Saturação (SpO2)',
        resp_rate: 'Freq. Respiratória',

        // Body
        weight: 'Peso',
        head_circ: 'Cabeça',
        neck_circ: 'Pescoço',

        chest_circ: 'Peito (Genérico)', // Legacy
        chest_circ_axilla: 'Tórax (Axilar)',
        chest_circ_nipple: 'Tórax (Mamilo)',
        chest_circ_xiphoid: 'Tórax (Xifoide)',

        waist_circ: 'Cintura',
        abdomen_circ: 'Abdômen',
        hip_circ: 'Quadril',

        // Arms
        arm_left: 'Braço Esq.',
        arm_right: 'Braço Dir.',
        forearm_left: 'Antebraço Esq.',
        forearm_right: 'Antebraço Dir.',
        wrist_left: 'Punho Esq.',
        wrist_right: 'Punho Dir.',
        hand_left: 'Mão Esq.',
        hand_right: 'Mão Dir.',

        // Legs
        thigh_glute_left: 'Coxa Sup. Esq.',
        thigh_glute_right: 'Coxa Sup. Dir.',
        thigh_mid_left: 'Coxa Média Esq.',
        thigh_mid_right: 'Coxa Média Dir.',
        knee_left: 'Joelho Esq.',
        knee_right: 'Joelho Dir.',
        calf_left: 'Panturrilha Esq.',
        calf_right: 'Panturrilha Dir.',
        ankle_left: 'Tornozelo Esq.',
        ankle_right: 'Tornozelo Dir.',
        foot_left: 'Pé Esq.',
        foot_right: 'Pé Dir.',

        body_fat: '% Gordura',
        body_water: '% Água',
        bone_density: 'Densidade Óssea',
        bmr: 'Taxa Metabólica',

        // Lab
        glucose: 'Glicose',
        glucose_post: 'Glicemia Pós',
        hba1c: 'HbA1c',
        cholesterol_total: 'Colesterol Total',
        cholesterol_hdl: 'HDL',
        cholesterol_ldl: 'LDL',
        triglycerides: 'Triglicerídeos',
        creatinine: 'Creatinina',
        urea: 'Ureia',
        gfr: 'TFG (Rins)',
        uacr: 'Albúmina/Creatinina',
        uric_acid: 'Ácido Úrico',
        sodium: 'Sódio',
        potassium: 'Potássio',
        calcium: 'Cálcio',
        lactate: 'Lactato',
        inr: 'INR',
        ferritin: 'Ferritina',
        apob: 'Apo B',
        lpa: 'Lp(a)',
        alt: 'ALT (TGP)',
        ast: 'AST (TGO)',
        ggt: 'GGT',
        alp: 'Fosfatase Alc.',
        bilirubin: 'Bilirrubina',
        albumin: 'Albumina',
        tsh: 'TSH',
        t4_free: 'T4 Livre',
        t3_free: 'T3 Livre',
        psa: 'PSA',
        pcr: 'PCR',
        platelets: 'Plaquetas',
        cd4: 'CD4',
        viral_load: 'Carga Viral',
        vit_d: 'Vitamina D',
        ck: 'CK',
        lithium: 'Lítio',
        alcohol_level: 'Álcool',
        nicotine: 'Nicotina'
    };

    // Calculate daily compliance
    const weeklyData = weekDays.map(day => {
        // Find logs for this day
        const dayLogs = logs.filter(log => isSameDay(parseISO(log.takenAt), day));
        // Calculate expected doses for this day
        const expectedDoses = medications.reduce((acc, med) => {
            if (med.frequency === 'daily') return acc + 1;
            if (med.frequency === 'every_other_day') return acc + 0.5; // Avg compliance target
            if (med.frequency === 'interval') {
                const hours = parseInt(med.intervalHours) || 8;
                return acc + (24 / hours);
            }
            return acc + 1;
        }, 0);

        // Safety check div by zero
        // Allow over 100% if they take extra doses (e.g. PRN), but cap at 100 for visual bar
        // Actually, cap at 100 is better for UI.
        const compliance = expectedDoses > 0
            ? Math.min(100, Math.round((dayLogs.length / expectedDoses) * 100))
            : (dayLogs.length > 0 ? 100 : 0);

        return {
            day: format(day, 'EEE', { locale: ptBR }),
            date: day,
            compliance,
            taken: dayLogs.length
        };
    });

    // --- NEW STATISTICS ---

    // 1. Total Taken
    const totalTaken = logs.filter(l => l.status === 'taken').length;

    // 2. Total Skipped (Explicitly logged as skipped)
    const totalSkipped = logs.filter(l => l.status === 'skipped').length;

    // 3. Days Calculation
    // Get unique days present in logs
    const logDates = logs.map(l => l.takenAt.split('T')[0]);
    const uniqueLogDays = new Set(logDates);
    const daysWithLogs = uniqueLogDays.size;

    // Calculate total days since "start" (earliest med creation or first log)
    // If no data, default to 0
    let daysWithoutLogs = 0;

    if (medications.length > 0 || logs.length > 0) {
        const dates = [
            ...medications.map(m => new Date(m.createdAt)),
            ...logs.map(l => new Date(l.takenAt))
        ].filter(d => !isNaN(d));

        if (dates.length > 0) {
            const startDate = new Date(Math.min(...dates));
            const now = new Date();

            // Total days elapsed since start
            const diffTime = Math.abs(now - startDate);
            const totalDaysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // at least 1 day

            daysWithoutLogs = Math.max(0, totalDaysElapsed - daysWithLogs);
        }
    }

    return (
        <div className="progress-page">
            <header className="page-header">
                <h1>Meu Progresso</h1>
            </header>

            <div className="progress-container">
                {/* Weekly Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <BarChart3 size={20} color="var(--color-primary)" />
                        <h2>Adesão Semanal</h2>
                    </div>
                    <div className="bar-chart">
                        {weeklyData.map((data, index) => (
                            <div key={index} className="bar-group">
                                <div className="bar-wrapper">
                                    <div
                                        className="bar-fill"
                                        style={{ height: `${data.compliance}%` }}
                                        title={`${data.taken} tomados`}
                                    ></div>
                                </div>
                                <span className="bar-label">{data.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <CheckCircle size={24} color="var(--color-success)" />
                        <div className="stat-info">
                            <span className="stat-value">{totalTaken}</span>
                            <span className="stat-label">Total Tomados</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <XCircle size={24} color="var(--color-error)" />
                        <div className="stat-info">
                            <span className="stat-value">{totalSkipped}</span>
                            <span className="stat-label">Registros Perdidos</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <Calendar size={24} color="var(--color-primary)" />
                        <div className="stat-info">
                            <span className="stat-value">{daysWithLogs}</span>
                            <span className="stat-label">Dias com Registro</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <AlertCircle size={24} color="var(--color-warning)" />
                        <div className="stat-info">
                            <span className="stat-value">{daysWithoutLogs}</span>
                            <span className="stat-label">Dias sem Preenchimento</span>
                        </div>
                    </div>
                </div>



                {/* --- MEASUREMENT CHARTS --- */}
                {/* --- SEÇÃO 1: SINAIS VITAIS --- */}
                <div style={{ marginTop: 24, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 18, margin: 0 }}>Sinais Vitais</h3>
                        <select
                            value={selectedClinical}
                            onChange={(e) => setSelectedClinical(e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
                        >
                            <option value="blood_pressure">Pressão Arterial</option>
                            <option value="heart_rate">Frequência Cardíaca</option>
                            <option value="temperature">Temperatura</option>
                            <option value="oxygen">Saturação (SpO2)</option>
                            <option value="resp_rate">Freq. Respiratória</option>
                        </select>
                    </div>

                    <MeasurementChart
                        data={measurements.filter(m => m.subtype === selectedClinical)}
                        title={MEASUREMENT_DICT[selectedClinical]}
                        isBP={selectedClinical === 'blood_pressure'}
                        unit=""
                    />

                    {/* Recent Measurements List */}
                    <div style={{ marginTop: 16, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12 }}>
                        <h4 style={{ fontSize: 14, margin: '0 0 8px 0', color: '#666' }}>Últimos Registros</h4>
                        <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                            {measurements
                                .filter(m => m.subtype === selectedClinical)
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .slice(0, 10)
                                .map((m, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '6px 0',
                                        borderBottom: idx < 9 ? '1px solid #eee' : 'none',
                                        fontSize: 13
                                    }}>
                                        <span style={{ color: '#666' }}>{format(parseISO(m.date), 'dd/MM/yyyy HH:mm')}</span>
                                        <span style={{ fontWeight: 500, color: '#333' }}>{m.value} {m.unit}</span>
                                    </div>
                                ))}
                            {measurements.filter(m => m.subtype === selectedClinical).length === 0 && (
                                <p style={{ fontSize: 12, color: '#999', margin: 0 }}>Nenhum registro ainda.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- SEÇÃO 2: MEDIDAS CORPORAIS --- */}
                <div style={{ marginTop: 24, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 18, margin: 0 }}>Medidas Corporais</h3>
                        <select
                            value={selectedBody}
                            onChange={(e) => setSelectedBody(e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, maxWidth: '50%' }}
                        >
                            <option value="weight">Peso</option>
                            <optgroup label="Tronco">
                                <option value="head_circ">Cabeça</option>
                                <option value="neck_circ">Pescoço</option>
                                <option value="chest_circ_axilla">Tórax (Axilar)</option>
                                <option value="chest_circ_nipple">Tórax (Mamilo)</option>
                                <option value="chest_circ_xiphoid">Tórax (Xifoide)</option>
                                <option value="waist_circ">Cintura</option>
                                <option value="abdomen_circ">Abdômen</option>
                                <option value="hip_circ">Quadril</option>
                            </optgroup>
                            <optgroup label="Membros Superiores">
                                <option value="arm_left">Braço Esq.</option>
                                <option value="arm_right">Braço Dir.</option>
                                <option value="forearm_left">Antebraço Esq.</option>
                                <option value="forearm_right">Antebraço Dir.</option>
                                <option value="wrist_left">Punho Esq.</option>
                                <option value="wrist_right">Punho Dir.</option>
                                <option value="hand_left">Mão Esq.</option>
                                <option value="hand_right">Mão Dir.</option>
                            </optgroup>
                            <optgroup label="Membros Inferiores">
                                <option value="thigh_glute_left">Coxa Sup. Esq.</option>
                                <option value="thigh_glute_right">Coxa Sup. Dir.</option>
                                <option value="thigh_mid_left">Coxa Média Esq.</option>
                                <option value="thigh_mid_right">Coxa Média Dir.</option>
                                <option value="knee_left">Joelho Esq.</option>
                                <option value="knee_right">Joelho Dir.</option>
                                <option value="calf_left">Panturrilha Esq.</option>
                                <option value="calf_right">Panturrilha Dir.</option>
                                <option value="ankle_left">Tornozelo Esq.</option>
                                <option value="ankle_right">Tornozelo Dir.</option>
                                <option value="foot_left">Pé Esq.</option>
                                <option value="foot_right">Pé Dir.</option>
                            </optgroup>
                            <optgroup label="Composição">
                                <option value="body_fat">% Gordura</option>
                                <option value="body_water">% Água</option>
                                <option value="bone_density">Densidade Óssea</option>
                            </optgroup>
                        </select>
                    </div>

                    <MeasurementChart
                        data={measurements.filter(m => m.subtype === selectedBody)}
                        title={MEASUREMENT_DICT[selectedBody]}
                        color="#4CAF50"
                        unit=""
                    />

                    {/* Recent Measurements List */}
                    <div style={{ marginTop: 16, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12 }}>
                        <h4 style={{ fontSize: 14, margin: '0 0 8px 0', color: '#666' }}>Últimos Registros</h4>
                        <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                            {measurements
                                .filter(m => m.subtype === selectedBody)
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .slice(0, 10)
                                .map((m, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '6px 0',
                                        borderBottom: idx < 9 ? '1px solid #eee' : 'none',
                                        fontSize: 13
                                    }}>
                                        <span style={{ color: '#666' }}>{format(parseISO(m.date), 'dd/MM/yyyy HH:mm')}</span>
                                        <span style={{ fontWeight: 500, color: '#333' }}>{m.value} {m.unit}</span>
                                    </div>
                                ))}
                            {measurements.filter(m => m.subtype === selectedBody).length === 0 && (
                                <p style={{ fontSize: 12, color: '#999', margin: 0 }}>Nenhum registro ainda.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- SEÇÃO 3: EXAMES --- */}
                <div style={{ marginTop: 24, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 18, margin: 0 }}>Exames Laboratoriais</h3>
                        <select
                            value={selectedLab}
                            onChange={(e) => setSelectedLab(e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, maxWidth: '50%' }}
                        >
                            <optgroup label="Destaques / Diabetes">
                                <option value="glucose">Glicose</option>
                                <option value="hba1c">HbA1c</option>
                                <option value="glucose_post">Glicemia Pós</option>
                            </optgroup>
                            <optgroup label="Colesterol / Lipídios">
                                <option value="cholesterol_total">Total</option>
                                <option value="triglycerides">Triglicerídeos</option>
                                <option value="cholesterol_hdl">HDL</option>
                                <option value="cholesterol_ldl">LDL</option>
                                <option value="apob">Apo B</option>
                                <option value="lpa">Lp(a)</option>
                            </optgroup>
                            <optgroup label="Rins / Eletrólitos">
                                <option value="creatinine">Creatinina</option>
                                <option value="urea">Ureia</option>
                                <option value="sodium">Sódio</option>
                                <option value="potassium">Potássio</option>
                            </optgroup>
                            <optgroup label="Fígado">
                                <option value="alt">ALT (TGP)</option>
                                <option value="ast">AST (TGO)</option>
                                <option value="ggt">GGT</option>
                            </optgroup>
                            <optgroup label="Hormônios">
                                <option value="tsh">TSH</option>
                                <option value="t4_free">T4 Livre</option>
                                <option value="t3_free">T3 Livre</option>
                            </optgroup>
                            <optgroup label="Outros">
                                <option value="vit_d">Vitamina D</option>
                                <option value="pcr">PCR</option>
                                <option value="ferritin">Ferritina</option>
                                <option value="lithium">Lítio</option>
                            </optgroup>
                        </select>
                    </div>

                    <MeasurementChart
                        data={measurements.filter(m => m.subtype === selectedLab)}
                        title={MEASUREMENT_DICT[selectedLab]}
                        color="#9C27B0"
                        unit=""
                    />

                    {/* Recent Measurements List */}
                    <div style={{ marginTop: 16, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12 }}>
                        <h4 style={{ fontSize: 14, margin: '0 0 8px 0', color: '#666' }}>Últimos Registros</h4>
                        <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                            {measurements
                                .filter(m => m.subtype === selectedLab)
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .slice(0, 10)
                                .map((m, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '6px 0',
                                        borderBottom: idx < 9 ? '1px solid #eee' : 'none',
                                        fontSize: 13
                                    }}>
                                        <span style={{ color: '#666' }}>{format(parseISO(m.date), 'dd/MM/yyyy HH:mm')}</span>
                                        <span style={{ fontWeight: 500, color: '#333' }}>{m.value} {m.unit}</span>
                                    </div>
                                ))}
                            {measurements.filter(m => m.subtype === selectedLab).length === 0 && (
                                <p style={{ fontSize: 12, color: '#999', margin: 0 }}>Nenhum registro ainda.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- ACTIVITY STATS --- */}
                <div style={{ marginTop: 24, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 18, marginBottom: 12 }}>Atividade Física</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <Zap size={24} color="#FF9800" />
                            <div className="stat-info">
                                <span className="stat-value">{activities.length}</span>
                                <span className="stat-label">Total de Sessões</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <CheckCircle size={24} color="#FF9800" />
                            <div className="stat-info">
                                <span className="stat-value">{activities.reduce((acc, curr) => acc + (parseInt(curr.duration) || 0), 0)} min</span>
                                <span className="stat-label">Tempo Total</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SYMPTOM STATS --- */}
                <div style={{ marginTop: 24, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 18, marginBottom: 12 }}>Humor & Sintomas</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <Smile size={24} color="#9C27B0" />
                            <div className="stat-info">
                                <span className="stat-value">{symptoms.length}</span>
                                <span className="stat-label">Registros</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <AlertCircle size={24} color="#9C27B0" />
                            <div className="stat-info">
                                <span className="stat-value">{symptoms.filter(s => parseInt(s.severity) >= 7).length}</span>
                                <span className="stat-label">Intensos (7+)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Progress;
