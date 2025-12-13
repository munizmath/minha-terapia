/**
 * SECURITY-NOTES: Verificação de Interações Medicamentosas
 * 
 * Sistema de verificação de interações medicamentosas e alergias.
 * 
 * Controles de Segurança:
 * - Validação de entrada (nomes de medicamentos sanitizados)
 * - Base de dados local para verificação rápida
 * - Alertas visuais para interações graves
 * - Armazenamento seguro de alergias
 * 
 * Riscos Mitigados:
 * - Reações adversas por interações medicamentosas
 * - Prescrição de medicamentos com alergias conhecidas
 */

/**
 * Base de dados simplificada de interações medicamentosas comuns
 * Em produção, usar API especializada (ex: DrugBank, RxNorm)
 */
const DRUG_INTERACTIONS = {
    // Anticoagulantes
    'warfarina': {
        interactions: ['aspirina', 'ibuprofeno', 'dipirona', 'paracetamol'],
        severity: 'grave',
        description: 'Aumenta risco de sangramento'
    },
    'aspirina': {
        interactions: ['warfarina', 'ibuprofeno', 'dipirona'],
        severity: 'moderada',
        description: 'Pode aumentar risco de sangramento'
    },
    'ibuprofeno': {
        interactions: ['aspirina', 'warfarina', 'dipirona'],
        severity: 'moderada',
        description: 'Pode aumentar risco de sangramento'
    },
    // Antidepressivos
    'fluoxetina': {
        interactions: ['tramadol', 'codeína'],
        severity: 'grave',
        description: 'Risco de síndrome serotoninérgica'
    },
    'sertralina': {
        interactions: ['tramadol', 'codeína'],
        severity: 'grave',
        description: 'Risco de síndrome serotoninérgica'
    },
    // Antibióticos
    'amoxicilina': {
        interactions: ['anticoncepcional'],
        severity: 'leve',
        description: 'Pode reduzir eficácia de anticoncepcionais'
    }
};

/**
 * Normaliza nome de medicamento para comparação
 */
function normalizeDrugName(name) {
    return name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .trim();
}

/**
 * Verifica interações entre medicamentos
 * @param {Array} medications - Lista de medicamentos
 * @returns {Array} Lista de interações encontradas
 */
export function checkDrugInteractions(medications) {
    const interactions = [];
    const normalizedMeds = medications.map(m => ({
        ...m,
        normalizedName: normalizeDrugName(m.name)
    }));

    for (let i = 0; i < normalizedMeds.length; i++) {
        const med1 = normalizedMeds[i];
        const drugInfo = DRUG_INTERACTIONS[med1.normalizedName];

        if (drugInfo) {
            for (let j = i + 1; j < normalizedMeds.length; j++) {
                const med2 = normalizedMeds[j];
                const med2Normalized = med2.normalizedName;

                if (drugInfo.interactions.some(int => 
                    normalizeDrugName(int) === med2Normalized
                )) {
                    interactions.push({
                        medication1: med1.name,
                        medication2: med2.name,
                        severity: drugInfo.severity,
                        description: drugInfo.description
                    });
                }
            }
        }
    }

    return interactions;
}

/**
 * Verifica se medicamento está na lista de alergias
 * @param {string} medicationName - Nome do medicamento
 * @param {Array} allergies - Lista de alergias
 * @returns {boolean} True se há alergia conhecida
 */
export function checkAllergy(medicationName, allergies = []) {
    const normalizedMed = normalizeDrugName(medicationName);
    return allergies.some(allergy => 
        normalizeDrugName(allergy) === normalizedMed ||
        normalizedMed.includes(normalizeDrugName(allergy)) ||
        normalizeDrugName(allergy).includes(normalizedMed)
    );
}

/**
 * Obtém severidade da interação (para cores/alertas)
 */
export function getSeverityColor(severity) {
    switch (severity) {
        case 'grave':
            return '#d32f2f'; // Vermelho
        case 'moderada':
            return '#f57c00'; // Laranja
        case 'leve':
            return '#fbc02d'; // Amarelo
        default:
            return '#666';
    }
}

/**
 * Obtém ícone de alerta baseado na severidade
 */
export function getSeverityIcon(severity) {
    switch (severity) {
        case 'grave':
            return '⚠️'; // Alerta crítico
        case 'moderada':
            return '⚡'; // Atenção
        case 'leve':
            return 'ℹ️'; // Informação
        default:
            return '📋';
    }
}

