/**
 * SECURITY-NOTES: Criptografia de Dados Sensíveis
 * 
 * Implementação de criptografia AES-GCM para proteção de dados de saúde.
 * Usa Web Crypto API nativa do navegador (sem dependências externas).
 * 
 * Controles de Segurança:
 * - AES-GCM 256-bit para criptografia simétrica
 * - PBKDF2 para derivação de chave (100.000 iterações)
 * - IV (Initialization Vector) único por operação
 * - Autenticação de integridade via GCM
 * - Dados descriptografados apenas em memória
 * 
 * Riscos Mitigados:
 * - Acesso não autorizado a dados em dispositivos compartilhados
 * - Leitura de dados em texto plano no localStorage
 * - Alteração não autorizada de dados (integridade)
 */

/**
 * Deriva uma chave de criptografia a partir de uma senha usando PBKDF2
 * @param {string} password - Senha mestre do usuário
 * @param {Uint8Array} salt - Salt para derivação
 * @returns {Promise<CryptoKey>} Chave de criptografia
 */
async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000, // Alto custo computacional para resistência a brute-force
            hash: 'SHA-256'
        },
        passwordKey,
        {
            name: 'AES-GCM',
            length: 256
        },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Gera um salt aleatório
 * @returns {Uint8Array} Salt de 16 bytes
 */
function generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Criptografa dados usando AES-GCM
 * @param {string} data - Dados em texto plano (JSON string)
 * @param {string} password - Senha mestre
 * @returns {Promise<string>} Dados criptografados (base64)
 */
export async function encryptData(data, password) {
    if (!data || !password) {
        throw new Error('Dados e senha são obrigatórios');
    }

    try {
        const salt = generateSalt();
        const key = await deriveKey(password, salt);
        const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes para GCM
        
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        
        const encrypted = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            dataBuffer
        );

        // Combinar salt + iv + dados criptografados
        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);

        // Converter para base64 para armazenamento
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Erro ao criptografar dados:', error);
        throw new Error('Falha na criptografia dos dados');
    }
}

/**
 * Descriptografa dados usando AES-GCM
 * @param {string} encryptedData - Dados criptografados (base64)
 * @param {string} password - Senha mestre
 * @returns {Promise<string>} Dados descriptografados (JSON string)
 */
export async function decryptData(encryptedData, password) {
    if (!encryptedData || !password) {
        throw new Error('Dados criptografados e senha são obrigatórios');
    }

    try {
        // Converter de base64 para Uint8Array
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        
        // Extrair salt, IV e dados criptografados
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const encrypted = combined.slice(28);

        const key = await deriveKey(password, salt);
        
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encrypted
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    } catch (error) {
        console.error('Erro ao descriptografar dados:', error);
        throw new Error('Falha na descriptografia. Verifique a senha.');
    }
}

/**
 * Verifica se os dados estão criptografados
 * @param {string} data - Dados a verificar
 * @returns {boolean} True se os dados parecem estar criptografados
 */
export function isEncrypted(data) {
    if (!data || typeof data !== 'string') return false;
    
    // Dados criptografados são base64 válido e têm tamanho mínimo esperado
    try {
        const decoded = atob(data);
        return decoded.length >= 28; // salt(16) + iv(12) + mínimo de dados
    } catch {
        return false;
    }
}

/**
 * Migra dados não criptografados para formato criptografado
 * @param {string} key - Chave do localStorage
 * @param {string} password - Senha mestre
 * @returns {Promise<boolean>} True se migração foi bem-sucedida
 */
export async function migrateToEncrypted(key, password) {
    try {
        const plainData = localStorage.getItem(key);
        if (!plainData || isEncrypted(plainData)) {
            return false; // Já está criptografado ou não existe
        }

        const encrypted = await encryptData(plainData, password);
        localStorage.setItem(key, encrypted);
        localStorage.setItem(`${key}_encrypted`, 'true'); // Flag de migração
        
        return true;
    } catch (error) {
        console.error(`Erro ao migrar ${key}:`, error);
        return false;
    }
}

