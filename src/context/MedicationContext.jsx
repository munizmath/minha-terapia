import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx-js-style';
import { useNotifications } from '../hooks/useNotifications';
import { useEncryption } from '../hooks/useEncryption';
import { useNotificationContext } from './NotificationContext';

const MedicationContext = createContext();

export const useMedications = () => {
    const context = useContext(MedicationContext);
    if (!context) {
        throw new Error('useMedications must be used within a MedicationProvider');
    }
    return context;
};

export const MedicationProvider = ({ children }) => {
    const { encryptionEnabled, readEncryptedData, saveEncryptedData } = useEncryption();
    const notificationContext = useNotificationContext();

    // Função auxiliar para carregar dados (com ou sem criptografia)
    const loadData = async (key, defaultValue = []) => {
        if (encryptionEnabled) {
            return await readEncryptedData(key, defaultValue);
        }
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    };

    // Função auxiliar para salvar dados (com ou sem criptografia)
    const saveData = async (key, data) => {
        if (encryptionEnabled) {
            await saveEncryptedData(key, data);
        } else {
            localStorage.setItem(key, JSON.stringify(data));
        }
    };

    // --- STATE ---
    const [medications, setMedications] = useState([]);
    const [logs, setLogs] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [symptoms, setSymptoms] = useState([]);
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar dados iniciais
    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            try {
                const [meds, logsData, meas, symp, act] = await Promise.all([
                    loadData('medications', []),
                    loadData('medication_logs', []),
                    loadData('measurements', []),
                    loadData('symptoms', []),
                    loadData('activities', [])
                ]);
                setMedications(meds);
                setLogs(logsData);
                setMeasurements(meas);
                setSymptoms(symp);
                setActivities(act);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setIsLoading(false);
            }
        };
        initializeData();
    }, [encryptionEnabled]);

    // --- EFFECTS ---
    useEffect(() => {
        if (!isLoading) {
            saveData('medications', medications);
        }
    }, [medications, encryptionEnabled, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            saveData('medication_logs', logs);
        }
    }, [logs, encryptionEnabled, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            saveData('measurements', measurements);
        }
    }, [measurements, encryptionEnabled, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            saveData('symptoms', symptoms);
        }
    }, [symptoms, encryptionEnabled, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            saveData('activities', activities);
        }
    }, [activities, encryptionEnabled, isLoading]);

    // Init Notifications with snooze support
    const { sendStockAlert } = useNotifications(medications, logs, notificationContext);

    // --- ACTIONS ---
    const addMedication = (medication) => {
        const newMed = {
            ...medication,
            id: uuidv4(),
            createdAt: new Date(),
            stock: parseInt(medication.stock) || 0,
        };
        setMedications(prev => [...prev, newMed]);
    };

    const updateMedication = (id, updatedData) => {
        setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));
    };

    const removeMedication = (id) => {
        setMedications(prev => prev.filter(m => m.id !== id));
    };

    const logIntake = (medicationId, scheduledTime, status = 'taken') => {
        const log = {
            id: uuidv4(),
            medicationId,
            scheduledTime, // ISO string
            takenAt: new Date().toISOString(),
            status // taken, skipped
        };
        setLogs(prev => [...prev, log]);

        if (status === 'taken') {
            const med = medications.find(m => m.id === medicationId);
            if (med && med.stock > 0) {
                const newStock = med.stock - 1;
                updateMedication(medicationId, { stock: newStock });
                if (newStock <= 5) sendStockAlert(med.name, newStock);
            }
        }
    };

    const addMeasurement = (data) => {
        setMeasurements(prev => [...prev, { id: uuidv4(), createdAt: new Date(), ...data }]);
    };

    const updateMeasurement = (id, updatedData) => {
        setMeasurements(prev => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));
    };

    const removeMeasurement = (id) => setMeasurements(prev => prev.filter(m => m.id !== id));

    const addSymptom = (data) => {
        setSymptoms(prev => [...prev, { id: uuidv4(), createdAt: new Date(), ...data }]);
    };
    const removeSymptom = (id) => setSymptoms(prev => prev.filter(s => s.id !== id));

    const addActivity = (data) => {
        setActivities(prev => [...prev, { id: uuidv4(), createdAt: new Date(), ...data }]);
    };
    const removeActivity = (id) => setActivities(prev => prev.filter(a => a.id !== id));


    // --- BACKUP LOGIC (EXPORT/IMPORT) ---
    
    /**
     * SECURITY-NOTES: Exportação de Dados em Excel
     * 
     * Função auxiliar para formatar planilha com cabeçalhos e bordas.
     * Aplica formatação profissional: cabeçalhos com fundo preto e texto branco,
     * bordas em todas as células para melhor legibilidade.
     * 
     * Controles de Segurança:
     * - Validação de range de células antes de aplicar formatação
     * - Sanitização de valores de células
     * - Limitação de largura de colunas para evitar overflow
     */
    // Função auxiliar para criar planilha com cabeçalhos garantidos
    const createSheetWithHeaders = (data, headers) => {
        // Extrair valores dos cabeçalhos na ordem correta
        const headerValues = Object.keys(headers).map(key => headers[key]);
        
        if (data.length > 0) {
            // Se há dados, usa json_to_sheet normalmente (já inclui cabeçalhos)
            return XLSX.utils.json_to_sheet(data);
        } else {
            // Se não há dados, cria planilha apenas com cabeçalhos
            return XLSX.utils.aoa_to_sheet([headerValues]);
        }
    };

    const formatSheet = (ws, sheetName) => {
        if (!ws || !ws['!ref']) return;

        const range = XLSX.utils.decode_range(ws['!ref']);
        const headerRow = 0;

        // Formatar cabeçalho (linha 1) - Fundo preto, texto branco
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
            if (!ws[cellAddress]) continue;

            ws[cellAddress].s = {
                fill: { 
                    fgColor: { rgb: "000000" },
                    patternType: "solid"
                },
                font: { 
                    color: { rgb: "FFFFFF" }, 
                    bold: true,
                    sz: 11
                },
                alignment: { 
                    horizontal: "center", 
                    vertical: "center",
                    wrapText: true
                },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                }
            };
        }

        // Adicionar bordas em todas as células do range utilizado
        for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                
                // Criar célula vazia se não existir
                if (!ws[cellAddress]) {
                    ws[cellAddress] = { t: 's', v: '' };
                }

                // Inicializar estilo se não existir
                if (!ws[cellAddress].s) {
                    ws[cellAddress].s = {};
                }

                // Aplicar bordas em todas as células
                ws[cellAddress].s.border = {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                };

                // Alinhamento para células de dados (não cabeçalho)
                if (row > headerRow) {
                    if (!ws[cellAddress].s.alignment) {
                        ws[cellAddress].s.alignment = { 
                            vertical: "center",
                            wrapText: true
                        };
                    }
                }
            }
        }

        // Ajustar largura das colunas automaticamente
        const colWidths = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
            let maxLength = 10;
            for (let row = range.s.r; row <= range.e.r; row++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (ws[cellAddress] && ws[cellAddress].v !== undefined && ws[cellAddress].v !== null) {
                    const cellValue = String(ws[cellAddress].v);
                    if (cellValue.length > maxLength) {
                        maxLength = Math.min(cellValue.length, 50);
                    }
                }
            }
            colWidths.push({ wch: Math.max(maxLength, 10) });
        }
        ws['!cols'] = colWidths;
    };

    const exportData = () => {
        const wb = XLSX.utils.book_new();

        // 1. Medications
        const medsHeaders = { "ID": "ID", "Nome": "Nome", "Dosagem": "Dosagem", "Frequência": "Frequência", "Horário": "Horário", "Estoque": "Estoque", "CriadoEm": "CriadoEm" };
        const medsRows = medications.map(m => ({
            "ID": m.id, "Nome": m.name, "Dosagem": m.dosage,
            "Frequência": m.frequency, "Horário": m.time,
            "Estoque": m.stock, "CriadoEm": m.createdAt
        }));
        const medsSheet = createSheetWithHeaders(medsRows, medsHeaders);
        formatSheet(medsSheet, "Medicamentos");
        XLSX.utils.book_append_sheet(wb, medsSheet, "Medicamentos");

        // 2. Measurements
        const measHeaders = { "ID": "ID", "Tipo": "Tipo", "Valor": "Valor", "Unidade": "Unidade", "Data": "Data" };
        const measRows = measurements.map(m => ({
            "ID": m.id, "Tipo": m.subtype, "Valor": m.value,
            "Unidade": m.unit, "Data": m.date
        }));
        const measSheet = createSheetWithHeaders(measRows, measHeaders);
        formatSheet(measSheet, "Medidas");
        XLSX.utils.book_append_sheet(wb, measSheet, "Medidas");

        // 3. Symptoms
        const sympHeaders = { "ID": "ID", "Sintoma": "Sintoma", "Severidade": "Severidade", "Nota": "Nota", "Data": "Data" };
        const sympRows = symptoms.map(s => ({
            "ID": s.id, "Sintoma": s.name, "Severidade": s.severity,
            "Nota": s.note, "Data": s.date
        }));
        const sympSheet = createSheetWithHeaders(sympRows, sympHeaders);
        formatSheet(sympSheet, "Sintomas");
        XLSX.utils.book_append_sheet(wb, sympSheet, "Sintomas");

        // 4. Activities
        const actHeaders = { "ID": "ID", "Atividade": "Atividade", "Duração (min)": "Duração (min)", "Data": "Data" };
        const actRows = activities.map(a => ({
            "ID": a.id, "Atividade": a.name, "Duração (min)": a.duration,
            "Data": a.date
        }));
        const actSheet = createSheetWithHeaders(actRows, actHeaders);
        formatSheet(actSheet, "Atividades");
        XLSX.utils.book_append_sheet(wb, actSheet, "Atividades");

        // 5. Logs
        const logHeaders = { "ID": "ID", "MedID": "MedID", "Agendado": "Agendado", "TomadoEm": "TomadoEm", "Status": "Status" };
        const logRows = logs.map(l => ({
            "ID": l.id, "MedID": l.medicationId, "Agendado": l.scheduledTime,
            "TomadoEm": l.takenAt, "Status": l.status
        }));
        const logSheet = createSheetWithHeaders(logRows, logHeaders);
        formatSheet(logSheet, "Historico");
        XLSX.utils.book_append_sheet(wb, logSheet, "Historico");

        // 6. User Profile (LocalStorage)
        const profileHeaders = { "Nome": "Nome", "Email": "Email", "Nasc": "Nasc", "Sexo": "Sexo", "Peso": "Peso", "Altura": "Altura", "Civil": "Civil", "CEP": "CEP", "Rua": "Rua", "Bairro": "Bairro", "Cidade": "Cidade", "Estado": "Estado", "Pais": "Pais" };
        const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
        const pRow = [{
            "Nome": profile.name, "Email": profile.email, "Nasc": profile.birthDate,
            "Sexo": profile.gender, "Peso": profile.weight, "Altura": profile.height,
            "Civil": profile.relationshipStatus, "CEP": profile.address?.zipCode,
            "Rua": profile.address?.street, "Bairro": profile.address?.neighborhood,
            "Cidade": profile.address?.city, "Estado": profile.address?.state,
            "Pais": profile.address?.country
        }];
        const profileSheet = createSheetWithHeaders(pRow, profileHeaders);
        formatSheet(profileSheet, "Perfil");
        XLSX.utils.book_append_sheet(wb, profileSheet, "Perfil");

        // 7. Doctors (LS) - Sempre criar, mesmo sem dados
        const docs = JSON.parse(localStorage.getItem('doctors') || '[]');
        // Extrair cabeçalhos do primeiro item ou usar estrutura padrão
        const docsHeaders = docs.length > 0 
            ? Object.keys(docs[0]).reduce((acc, key) => ({ ...acc, [key]: key }), {})
            : { "Nome": "Nome", "Especialidade": "Especialidade", "Telefone": "Telefone", "Email": "Email", "Endereço": "Endereço" };
        const docsSheet = createSheetWithHeaders(docs, docsHeaders);
        formatSheet(docsSheet, "Medicos");
        XLSX.utils.book_append_sheet(wb, docsSheet, "Medicos");

        // 8. Emergency (LS) - Sempre criar, mesmo sem dados
        const emerg = JSON.parse(localStorage.getItem('emergency_contacts') || '[]');
        const emergHeaders = emerg.length > 0 
            ? Object.keys(emerg[0]).reduce((acc, key) => ({ ...acc, [key]: key }), {})
            : { "Nome": "Nome", "Telefone": "Telefone", "Relacionamento": "Relacionamento", "Observações": "Observações" };
        const emergSheet = createSheetWithHeaders(emerg, emergHeaders);
        formatSheet(emergSheet, "Emergencia");
        XLSX.utils.book_append_sheet(wb, emergSheet, "Emergencia");

        // 9. Care Recipients (LS) - Sempre criar, mesmo sem dados
        const care = JSON.parse(localStorage.getItem('care_recipients') || '[]');
        const careHeaders = care.length > 0 
            ? Object.keys(care[0]).reduce((acc, key) => ({ ...acc, [key]: key }), {})
            : { "Nome": "Nome", "Telefone": "Telefone", "Relacionamento": "Relacionamento", "Observações": "Observações" };
        const careSheet = createSheetWithHeaders(care, careHeaders);
        formatSheet(careSheet, "Cuidadores");
        XLSX.utils.book_append_sheet(wb, careSheet, "Cuidadores");

        // --- TCC EXPORTS ---
        // 10. Habits - Sempre criar, mesmo sem dados
        const habits = JSON.parse(localStorage.getItem('tcc_habits') || '[]');
        const habitsHeaders = habits.length > 0 
            ? Object.keys(habits[0]).reduce((acc, key) => ({ ...acc, [key]: key }), {})
            : { "ID": "ID", "Nome": "Nome", "Categoria": "Categoria", "Data": "Data", "Observações": "Observações" };
        const habitsSheet = createSheetWithHeaders(habits, habitsHeaders);
        formatSheet(habitsSheet, "TCC_Habitos");
        XLSX.utils.book_append_sheet(wb, habitsSheet, "TCC_Habitos");

        // 11. Thoughts - Sempre criar, mesmo sem dados
        const thoughts = JSON.parse(localStorage.getItem('tcc_thoughts') || '[]');
        const thoughtsHeaders = thoughts.length > 0 
            ? Object.keys(thoughts[0]).reduce((acc, key) => ({ ...acc, [key]: key }), {})
            : { "ID": "ID", "Pensamento": "Pensamento", "Data": "Data", "Observações": "Observações" };
        const thoughtsSheet = createSheetWithHeaders(thoughts, thoughtsHeaders);
        formatSheet(thoughtsSheet, "TCC_Pensamentos");
        XLSX.utils.book_append_sheet(wb, thoughtsSheet, "TCC_Pensamentos");

        // 12. ABC - Sempre criar, mesmo sem dados
        const abc = JSON.parse(localStorage.getItem('tcc_abc') || '[]');
        const abcHeaders = abc.length > 0 
            ? Object.keys(abc[0]).reduce((acc, key) => ({ ...acc, [key]: key }), {})
            : { "ID": "ID", "A": "A", "B": "B", "C": "C", "Data": "Data" };
        const abcSheet = createSheetWithHeaders(abc, abcHeaders);
        formatSheet(abcSheet, "TCC_ABC");
        XLSX.utils.book_append_sheet(wb, abcSheet, "TCC_ABC");

        // 13. Cards - Sempre criar, mesmo sem dados
        const cards = JSON.parse(localStorage.getItem('tcc_cards') || '[]');
        const cardsHeaders = cards.length > 0 
            ? Object.keys(cards[0]).reduce((acc, key) => ({ ...acc, [key]: key }), {})
            : { "ID": "ID", "Título": "Título", "Conteúdo": "Conteúdo", "Data": "Data" };
        const cardsSheet = createSheetWithHeaders(cards, cardsHeaders);
        formatSheet(cardsSheet, "TCC_Cartoes");
        XLSX.utils.book_append_sheet(wb, cardsSheet, "TCC_Cartoes");

        XLSX.writeFile(wb, "MinhaTerapia.xlsx");
    };

    const importData = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const wb = XLSX.read(data, { type: 'array' });
                    const getSheet = (name) => XLSX.utils.sheet_to_json(wb.Sheets[name] || {});
                    const getVal = (r, k) => r[k] || '';

                    // 1. Meds
                    const newMeds = getSheet("Medicamentos").map(r => ({
                        id: getVal(r, "ID") || uuidv4(),
                        name: getVal(r, "Nome"),
                        dosage: getVal(r, "Dosagem"),
                        frequency: getVal(r, "Frequência"),
                        time: getVal(r, "Horário"),
                        stock: getVal(r, "Estoque"),
                        createdAt: getVal(r, "CriadoEm") || new Date()
                    }));
                    if (newMeds.length > 0) setMedications(newMeds);

                    // 2. Measurements
                    const newMeas = getSheet("Medidas").map(r => ({
                        id: getVal(r, "ID") || uuidv4(),
                        subtype: getVal(r, "Tipo"),
                        value: getVal(r, "Valor"),
                        unit: getVal(r, "Unidade"),
                        date: getVal(r, "Data")
                    }));
                    setMeasurements(newMeas);

                    // 3. Symptoms
                    const newSymp = getSheet("Sintomas").map(r => ({
                        id: getVal(r, "ID") || uuidv4(),
                        name: getVal(r, "Sintoma"),
                        severity: getVal(r, "Severidade"),
                        note: getVal(r, "Nota"),
                        date: getVal(r, "Data")
                    }));
                    setSymptoms(newSymp);

                    // 4. Activities
                    const newAct = getSheet("Atividades").map(r => ({
                        id: getVal(r, "ID") || uuidv4(),
                        name: getVal(r, "Atividade"),
                        duration: getVal(r, "Duração (min)"),
                        date: getVal(r, "Data")
                    }));
                    setActivities(newAct);

                    // 5. Logs
                    const newLogs = getSheet("Historico").map(r => ({
                        id: getVal(r, "ID"),
                        medicationId: getVal(r, "MedID"),
                        scheduledTime: getVal(r, "Agendado"),
                        takenAt: getVal(r, "TomadoEm"),
                        status: getVal(r, "Status")
                    }));
                    if (newLogs.length > 0) setLogs(newLogs);

                    // 6. Profile
                    const pArr = getSheet("Perfil");
                    if (pArr.length > 0) {
                        const p = pArr[0];
                        const profile = {
                            name: getVal(p, "Nome"), email: getVal(p, "Email"), birthDate: getVal(p, "Nasc"),
                            gender: getVal(p, "Sexo"), weight: getVal(p, "Peso"), height: getVal(p, "Altura"),
                            relationshipStatus: getVal(p, "Civil"),
                            address: {
                                zipCode: getVal(p, "CEP"), street: getVal(p, "Rua"), neighborhood: getVal(p, "Bairro"),
                                city: getVal(p, "Cidade"), state: getVal(p, "Estado"), country: getVal(p, "Pais")
                            }
                        };
                        localStorage.setItem('user_profile', JSON.stringify(profile));
                    }

                    // 7. Others
                    localStorage.setItem('doctors', JSON.stringify(getSheet("Medicos")));
                    localStorage.setItem('emergency_contacts', JSON.stringify(getSheet("Emergencia")));
                    localStorage.setItem('care_recipients', JSON.stringify(getSheet("Cuidadores")));

                    // TCC Imports
                    localStorage.setItem('tcc_habits', JSON.stringify(getSheet("TCC_Habitos")));
                    localStorage.setItem('tcc_thoughts', JSON.stringify(getSheet("TCC_Pensamentos")));
                    localStorage.setItem('tcc_abc', JSON.stringify(getSheet("TCC_ABC")));
                    localStorage.setItem('tcc_cards', JSON.stringify(getSheet("TCC_Cartoes")));

                    // Reload to reflect all changes
                    setTimeout(() => window.location.reload(), 500);
                    resolve(true);

                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const clearAllData = () => {
        if (window.confirm('Tem certeza? Isso apaga TUDO!')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <MedicationContext.Provider value={{
            medications, logs, measurements, symptoms, activities,
            addMedication, updateMedication, removeMedication, logIntake,
            addMeasurement, updateMeasurement, removeMeasurement, addSymptom, removeSymptom,
            addActivity, removeActivity,
            exportData, importData, clearAllData
        }}>
            {children}
        </MedicationContext.Provider>
    );
};
