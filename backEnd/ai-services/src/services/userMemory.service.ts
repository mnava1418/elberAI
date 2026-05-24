import fs from 'fs/promises';
import path from 'path';

export const MEMORY_DIR = path.resolve(__dirname, '../../data/memory');

export const MEMORY_TEMPLATE = `# Lo que sé del usuario

## Identidad

## Familia y relaciones

## Amistades

## Trabajo y estudios

## Preferencias e intereses

## Rutinas y hábitos

## Metas y proyectos

## Preocupaciones

## Bitácora de eventos
`;

export type MemorySection =
    | 'Identidad'
    | 'Familia y relaciones'
    | 'Amistades'
    | 'Trabajo y estudios'
    | 'Preferencias e intereses'
    | 'Rutinas y hábitos'
    | 'Metas y proyectos'
    | 'Preocupaciones'
    | 'Bitácora de eventos';

const memoryCache = new Map<string, string>();

// Serializa las escrituras por usuario para evitar perder updates cuando el
// agente de chat (foreground) y el keeper (background) escriben casi al mismo tiempo.
const writeLocks = new Map<string, Promise<unknown>>();

const withLock = async <T>(userId: string, fn: () => Promise<T>): Promise<T> => {
    const prev = writeLocks.get(userId) ?? Promise.resolve();
    const next = prev.catch(() => {}).then(fn);
    writeLocks.set(userId, next.catch(() => {}));
    return next;
};

const getMemoryPath = (userId: string): string =>
    path.join(MEMORY_DIR, `${userId}.md`);

const readOrCreate = async (userId: string): Promise<string> => {
    const memoryPath = getMemoryPath(userId);
    try {
        return await fs.readFile(memoryPath, 'utf-8');
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(MEMORY_DIR, { recursive: true });
            await fs.writeFile(memoryPath, MEMORY_TEMPLATE, 'utf-8');
            return MEMORY_TEMPLATE;
        }
        throw error;
    }
};

// Dedup determinístico: el keeper (LLM) no es confiable para evitar duplicados,
// así que comparamos el dato nuevo contra los bullets que ya existen en la sección.
const normalizeTokens = (text: string): string[] =>
    text
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .split(/[\s,.:;¿?¡!()"'`-]+/)
        .filter((w) => w.length > 3);

const bulletsInSection = (sectionBody: string): string[] =>
    sectionBody
        .split('\n')
        .filter((l) => l.trimStart().startsWith('- '))
        .map((l) => l.replace(/^[\s-]+/, '').trim());

const isDuplicateInfo = (existingBullets: string[], candidate: string): boolean => {
    const candTokens = normalizeTokens(candidate);
    if (candTokens.length === 0) return false;

    return existingBullets.some((bullet) => {
        const bulletTokens = normalizeTokens(bullet);
        if (bulletTokens.length === 0) return false;
        const matches = candTokens.filter((t) => bulletTokens.includes(t)).length;
        // Duplicado si el 75%+ de cualquiera de los dos conjuntos está cubierto (bidireccional)
        return matches / candTokens.length >= 0.75 || matches / bulletTokens.length >= 0.75;
    });
};

export const loadUserMemory = async (userId: string): Promise<string> => {
    const cached = memoryCache.get(userId);
    if (cached !== undefined) return cached;

    const content = await readOrCreate(userId);
    memoryCache.set(userId, content);
    return content;
};

export const clearUserMemoryCache = (userId: string): void => {
    memoryCache.delete(userId);
};

export const recordMemoryFact = async (
    userId: string,
    section: MemorySection,
    info: string
): Promise<string> =>
    withLock(userId, async () => {
        const memoryPath = getMemoryPath(userId);
        const content = await readOrCreate(userId);

        const sectionHeader = `## ${section}`;
        const sectionIndex = content.indexOf(sectionHeader);
        if (sectionIndex === -1) {
            return `No se encontró la sección "${section}" en la memoria.`;
        }

        const afterHeader = sectionIndex + sectionHeader.length;
        const nextSectionIndex = content.indexOf('\n## ', afterHeader);
        const insertionPoint = nextSectionIndex !== -1 ? nextSectionIndex : content.length;

        const sectionBody = content.slice(afterHeader, insertionPoint);
        if (isDuplicateInfo(bulletsInSection(sectionBody), info)) {
            return `El dato ya estaba registrado en "${section}".`;
        }

        const updatedContent =
            content.slice(0, insertionPoint) + `\n- ${info}` + content.slice(insertionPoint);

        await fs.writeFile(memoryPath, updatedContent, 'utf-8');
        memoryCache.set(userId, updatedContent);

        return `Memoria actualizada: información agregada en "${section}".`;
    });

export const editMemoryFact = async (
    userId: string,
    section: MemorySection,
    oldInfo: string,
    newInfo: string | null
): Promise<string> =>
    withLock(userId, async () => {
        const memoryPath = getMemoryPath(userId);
        const content = await readOrCreate(userId);

        const sectionHeader = `## ${section}`;
        const sectionStart = content.indexOf(sectionHeader);
        if (sectionStart === -1) {
            return `No se encontró la sección "${section}" en la memoria.`;
        }

        const afterHeader = sectionStart + sectionHeader.length;
        const nextSectionIndex = content.indexOf('\n## ', afterHeader);
        const sectionEnd = nextSectionIndex !== -1 ? nextSectionIndex : content.length;

        const sectionBody = content.slice(afterHeader, sectionEnd);
        const bulletToFind = `- ${oldInfo}`;

        if (!sectionBody.includes(bulletToFind)) {
            return `No se encontró "${oldInfo}" en la sección "${section}".`;
        }

        const updatedBody =
            newInfo && newInfo.trim() !== ''
                ? sectionBody.replace(bulletToFind, `- ${newInfo}`)
                : sectionBody.replace(`\n${bulletToFind}`, '');

        const updatedContent =
            content.slice(0, afterHeader) + updatedBody + content.slice(sectionEnd);

        await fs.writeFile(memoryPath, updatedContent, 'utf-8');
        memoryCache.set(userId, updatedContent);

        const action = newInfo && newInfo.trim() !== '' ? 'actualizado' : 'eliminado';
        return `Memoria: "${oldInfo}" ${action} en la sección "${section}".`;
    });

export const forgetMemoryFacts = async (
    userId: string,
    keyword: string
): Promise<string> =>
    withLock(userId, async () => {
        const memoryPath = getMemoryPath(userId);
        const content = await readOrCreate(userId);

        const lowerKeyword = keyword.toLowerCase();
        const removed: string[] = [];

        const updatedLines = content.split('\n').filter((line) => {
            const isBullet = line.trimStart().startsWith('- ');
            if (isBullet && line.toLowerCase().includes(lowerKeyword)) {
                removed.push(line.trim());
                return false;
            }
            return true;
        });

        if (removed.length === 0) {
            return `No se encontró ningún dato relacionado con "${keyword}" en la memoria.`;
        }

        const updatedContent = updatedLines.join('\n');
        await fs.writeFile(memoryPath, updatedContent, 'utf-8');
        memoryCache.set(userId, updatedContent);

        return `Olvidado (${removed.length} registro${removed.length > 1 ? 's' : ''}): ${removed.join(' | ')}`;
    });

export const resetMemoryData = async (userId: string): Promise<string> =>
    withLock(userId, async () => {
        const memoryPath = getMemoryPath(userId);
        await fs.mkdir(MEMORY_DIR, { recursive: true });
        await fs.writeFile(memoryPath, MEMORY_TEMPLATE, 'utf-8');
        memoryCache.set(userId, MEMORY_TEMPLATE);
        return 'He borrado toda tu memoria. Ya no recuerdo nada sobre ti.';
    });
