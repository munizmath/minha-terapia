import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Trash2, Database } from 'lucide-react';
import { useMedications } from '../../context/MedicationContext';
import './SubPage.css'; // Shared styles

const DataManagement = () => {
    const navigate = useNavigate();
    const { exportData, importData, clearAllData } = useMedications();
    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            if (window.confirm('Isso substituirá todos os dados atuais pelos da planilha. Continuar?')) {
                await importData(file);
                alert('Dados importados com sucesso!');
                navigate('/');
            }
        } catch (err) {
            alert('Erro ao importar: ' + err.message);
            console.error(err);
        }
    };

    return (
        <div className="sub-page">
            <header className="page-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Meus Dados</h1>
            </header>

            <div className="sub-content">
                <div className="info-card" style={{ textAlign: 'center', padding: 24 }}>
                    <Database size={48} color="var(--color-primary)" style={{ marginBottom: 16 }} />
                    <p>Seus dados são armazenados neste dispositivo. Use as opções abaixo para criar cópias de segurança ou editar em planilha.</p>
                </div>

                <div className="action-buttons-stack">
                    <button className="action-btn primary" onClick={exportData}>
                        <div className="icon-box">
                            <Download size={24} />
                        </div>
                        <div className="text-box">
                            <h3>Baixar Planilha (Backup)</h3>
                            <p>Salvar arquivo Excel (.xlsx)</p>
                        </div>
                    </button>

                    <button className="action-btn secondary" onClick={handleImportClick}>
                        <div className="icon-box">
                            <Upload size={24} />
                        </div>
                        <div className="text-box">
                            <h3>Carregar Planilha</h3>
                            <p>Restaurar de arquivo Excel</p>
                        </div>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                    />

                    <div style={{ height: 32 }}></div>

                    <button className="action-btn danger" onClick={clearAllData}>
                        <div className="icon-box">
                            <Trash2 size={24} />
                        </div>
                        <div className="text-box">
                            <h3>Apagar Tudo</h3>
                            <p>Resetar aplicativo</p>
                        </div>
                    </button>
                </div>

                <div className="info-alert">
                    <strong>⚠️ Atenção:</strong> Ao importar uma planilha, os dados atuais serão substituídos. Mantenha o formato das colunas ao editar no Excel.
                </div>
            </div>
        </div>
    );
};

export default DataManagement;
