import { useState, useEffect, useCallback } from 'react';
import { encryptData, decryptData, isEncrypted, migrateToEncrypted } from '../utils/encryption';

/**
 * Hook para gerenciar criptografia de dados
 * Gerencia senha mestre e estado de criptografia
 */
export const useEncryption = () => {
    const [masterPassword, setMasterPassword] = useState(() => {
        // Senha mestre armazenada em sessionStorage (apenas durante sessão)
        return sessionStorage.getItem('master_password') || null;
    });

    const [encryptionEnabled, setEncryptionEnabled] = useState(() => {
        return localStorage.getItem('encryption_enabled') === 'true';
    });

    // Salvar senha mestre na sessão quando definida
    useEffect(() => {
        if (masterPassword) {
            sessionStorage.setItem('master_password', masterPassword);
        } else {
            sessionStorage.removeItem('master_password');
        }
    }, [masterPassword]);

    // Salvar preferência de criptografia
    useEffect(() => {
        if (encryptionEnabled) {
            localStorage.setItem('encryption_enabled', 'true');
        } else {
            localStorage.removeItem('encryption_enabled');
        }
    }, [encryptionEnabled]);

    /**
     * Define a senha mestre e habilita criptografia
     */
    const enableEncryption = useCallback(async (password) => {
        if (!password || password.length < 6) {
            throw new Error('Senha deve ter pelo menos 6 caracteres');
        }

        setMasterPassword(password);
        setEncryptionEnabled(true);

        // Migrar dados existentes
        const keysToMigrate = [
            'medications',
            'medication_logs',
            'measurements',
            'symptoms',
            'activities',
            'user_profile',
            'doctors',
            'emergency_contacts',
            'care_recipients',
            'tcc_habits',
            'tcc_thoughts',
            'tcc_abc',
            'tcc_cards'
        ];

        for (const key of keysToMigrate) {
            await migrateToEncrypted(key, password);
        }
    }, []);

    /**
     * Desabilita criptografia e descriptografa todos os dados
     */
    const disableEncryption = useCallback(async () => {
        if (!masterPassword) return;

        const keysToDecrypt = [
            'medications',
            'medication_logs',
            'measurements',
            'symptoms',
            'activities',
            'user_profile',
            'doctors',
            'emergency_contacts',
            'care_recipients',
            'tcc_habits',
            'tcc_thoughts',
            'tcc_abc',
            'tcc_cards'
        ];

        for (const key of keysToDecrypt) {
            const encrypted = localStorage.getItem(key);
            if (encrypted && isEncrypted(encrypted)) {
                try {
                    const decrypted = await decryptData(encrypted, masterPassword);
                    localStorage.setItem(key, decrypted);
                    localStorage.removeItem(`${key}_encrypted`);
                } catch (error) {
                    console.error(`Erro ao descriptografar ${key}:`, error);
                }
            }
        }

        setMasterPassword(null);
        setEncryptionEnabled(false);
    }, [masterPassword]);

    /**
     * Lê dados do localStorage com descriptografia automática se necessário
     */
    const readEncryptedData = useCallback(async (key, defaultValue = null) => {
        const data = localStorage.getItem(key);
        if (!data) return defaultValue;

        if (encryptionEnabled && masterPassword && isEncrypted(data)) {
            try {
                const decrypted = await decryptData(data, masterPassword);
                return JSON.parse(decrypted);
            } catch (error) {
                console.error(`Erro ao descriptografar ${key}:`, error);
                return defaultValue;
            }
        }

        // Dados não criptografados
        try {
            return JSON.parse(data);
        } catch {
            return defaultValue;
        }
    }, [encryptionEnabled, masterPassword]);

    /**
     * Salva dados no localStorage com criptografia automática se necessário
     */
    const saveEncryptedData = useCallback(async (key, data) => {
        const jsonData = JSON.stringify(data);

        if (encryptionEnabled && masterPassword) {
            try {
                const encrypted = await encryptData(jsonData, masterPassword);
                localStorage.setItem(key, encrypted);
                localStorage.setItem(`${key}_encrypted`, 'true');
            } catch (error) {
                console.error(`Erro ao criptografar ${key}:`, error);
                throw error;
            }
        } else {
            localStorage.setItem(key, jsonData);
            localStorage.removeItem(`${key}_encrypted`);
        }
    }, [encryptionEnabled, masterPassword]);

    return {
        masterPassword,
        encryptionEnabled,
        enableEncryption,
        disableEncryption,
        readEncryptedData,
        saveEncryptedData,
        setMasterPassword
    };
};

