import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { useNotifications } from '../hooks/useNotifications';

const MedicationContext = createContext();

export const useMedications = () => {
    const context = useContext(MedicationContext);
    if (!context) {
        throw new Error('useMedications must be used within a MedicationProvider');
    }
    return context;
};

export const MedicationProvider = ({ children }) => {
    // --- STATE ---
    const [medications, setMedications] = useState(() => {
        const saved = localStorage.getItem('medications');
        return saved ? JSON.parse(saved) : [];
    });

    const [logs, setLogs] = useState(() => {
        const saved = localStorage.getItem('medication_logs');
        return saved ? JSON.parse(saved) : [];
    });

    const [measurements, setMeasurements] = useState(() => {
        const saved = localStorage.getItem('measurements');
        return saved ? JSON.parse(saved) : [];
    });

    const [symptoms, setSymptoms] = useState(() => {
        const saved = localStorage.getItem('symptoms');
        return saved ? JSON.parse(saved) : [];
    });

    const [activities, setActivities] = useState(() => {
        const saved = localStorage.getItem('activities');
        return saved ? JSON.parse(saved) : [];
    });

    // --- EFFECTS ---
    useEffect(() => localStorage.setItem('medications', JSON.stringify(medications)), [medications]);
    useEffect(() => localStorage.setItem('medication_logs', JSON.stringify(logs)), [logs]);
    useEffect(() => localStorage.setItem('measurements', JSON.stringify(measurements)), [measurements]);
    useEffect(() => localStorage.setItem('symptoms', JSON.stringify(symptoms)), [symptoms]);
    useEffect(() => localStorage.setItem('activities', JSON.stringify(activities)), [activities]);

    // Init Notifications
    const { sendStockAlert } = useNotifications(medications, logs);

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
    const exportData = () => {
        const wb = XLSX.utils.book_new();

        // 1. Medications
        const medsRows = medications.map(m => ({
            "ID": m.id, "Nome": m.name, "Dosagem": m.dosage,
            "Frequência": m.frequency, "Horário": m.time,
            "Estoque": m.stock, "CriadoEm": m.createdAt
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(medsRows), "Medicamentos");

        // 2. Measurements
        const measRows = measurements.map(m => ({
            "ID": m.id, "Tipo": m.subtype, "Valor": m.value,
            "Unidade": m.unit, "Data": m.date
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(measRows), "Medidas");

        // 3. Symptoms
        const sympRows = symptoms.map(s => ({
            "ID": s.id, "Sintoma": s.name, "Severidade": s.severity,
            "Nota": s.note, "Data": s.date
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sympRows), "Sintomas");

        // 4. Activities
        const actRows = activities.map(a => ({
            "ID": a.id, "Atividade": a.name, "Duração (min)": a.duration,
            "Data": a.date
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(actRows), "Atividades");

        // 5. Logs
        const logRows = logs.map(l => ({
            "ID": l.id, "MedID": l.medicationId, "Agendado": l.scheduledTime,
            "TomadoEm": l.takenAt, "Status": l.status
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logRows), "Historico");

        // 6. User Profile (LocalStorage)
        const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
        const pRow = [{
            "Nome": profile.name, "Email": profile.email, "Nasc": profile.birthDate,
            "Sexo": profile.gender, "Peso": profile.weight, "Altura": profile.height,
            "Civil": profile.relationshipStatus, "CEP": profile.address?.zipCode,
            "Rua": profile.address?.street, "Bairro": profile.address?.neighborhood,
            "Cidade": profile.address?.city, "Estado": profile.address?.state,
            "Pais": profile.address?.country
        }];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pRow), "Perfil");

        // 7. Doctors (LS)
        const docs = JSON.parse(localStorage.getItem('doctors') || '[]');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(docs), "Medicos");

        // 8. Emergency (LS)
        const emerg = JSON.parse(localStorage.getItem('emergency_contacts') || '[]');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(emerg), "Emergencia");

        // 9. Care Recipients (LS)
        const care = JSON.parse(localStorage.getItem('care_recipients') || '[]');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(care), "Cuidadores");

        XLSX.writeFile(wb, "MinhaTerapia_TUDO.xlsx");
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
            addMeasurement, removeMeasurement, addSymptom, removeSymptom,
            addActivity, removeActivity,
            exportData, importData, clearAllData
        }}>
            {children}
        </MedicationContext.Provider>
    );
};
