import fs from 'fs/promises';
import path from 'path';

export const PROFILES_DIR = path.resolve(__dirname, '../../data/profiles');

export const PROFILE_TEMPLATE = `# Perfil del Usuario

## Datos Personales

## Trabajo

## Familia y Relaciones

## Proyectos Activos

## Preferencias

## Hábitos y Rutina

## Metas
`;

export type ProfileSection =
    | 'Datos Personales'
    | 'Trabajo'
    | 'Familia y Relaciones'
    | 'Proyectos Activos'
    | 'Preferencias'
    | 'Hábitos y Rutina'
    | 'Metas';

const profileCache = new Map<string, string>();

const tokenize = (text: string): string[] =>
    text.toLowerCase()
        .split(/[\s,.:;]+/)
        .filter(w => w.length > 3);

const isDuplicateBullet = (content: string, newInfo: string): boolean => {
    const bullets = content
        .split('\n')
        .filter(l => l.trimStart().startsWith('- '))
        .map(l => l.replace(/^[\s-]+/, '').trim());

    const newTokens = tokenize(newInfo);
    if (newTokens.length === 0) return false;

    return bullets.some(bullet => {
        const bulletTokens = tokenize(bullet);
        if (bulletTokens.length === 0) return false;
        const matches = newTokens.filter(t => bulletTokens.includes(t));
        // Duplicate if 70%+ of either set is covered by the other (bidirectional)
        return matches.length / newTokens.length >= 0.7 ||
               matches.length / bulletTokens.length >= 0.7;
    });
};

const getProfilePath = (userId: string): string =>
    path.join(PROFILES_DIR, `${userId}.md`);

export const loadProfile = async (userId: string): Promise<string> => {
    const cached = profileCache.get(userId);
    if (cached !== undefined) return cached;

    const profilePath = getProfilePath(userId);

    try {
        const content = await fs.readFile(profilePath, 'utf-8');
        profileCache.set(userId, content);
        return content;
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(PROFILES_DIR, { recursive: true });
            await fs.writeFile(profilePath, PROFILE_TEMPLATE, 'utf-8');
            profileCache.set(userId, PROFILE_TEMPLATE);
            return PROFILE_TEMPLATE;
        }
        throw error;
    }
};

export const clearProfileCache = (userId: string): void => {
    profileCache.delete(userId);
};

export const addProfileEntry = async (
    userId: string,
    section: ProfileSection,
    info: string
): Promise<string> => {
    let content: string;
    const profilePath = getProfilePath(userId);

    try {
        content = await fs.readFile(profilePath, 'utf-8');
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(PROFILES_DIR, { recursive: true });
            content = PROFILE_TEMPLATE;
        } else {
            throw error;
        }
    }

    if (isDuplicateBullet(content, info)) {
        return `Perfil actualizado: información agregada en "${section}".`;
    }

    const sectionHeader = `## ${section}`;
    const sectionIndex = content.indexOf(sectionHeader);

    if (sectionIndex === -1) {
        return `No se encontró la sección "${section}" en el perfil.`;
    }

    const afterHeader = sectionIndex + sectionHeader.length;
    const nextSectionIndex = content.indexOf('\n## ', afterHeader);
    const insertionPoint = nextSectionIndex !== -1 ? nextSectionIndex : content.length;

    const updatedContent =
        content.slice(0, insertionPoint) + `\n- ${info}` + content.slice(insertionPoint);

    await fs.writeFile(profilePath, updatedContent, 'utf-8');
    clearProfileCache(userId);

    return `Perfil actualizado: información agregada en "${section}".`;
};

export const editProfileEntry = async (
    userId: string,
    section: ProfileSection,
    oldInfo: string,
    newInfo: string | null
): Promise<string> => {
    const profilePath = getProfilePath(userId);
    const content = await fs.readFile(profilePath, 'utf-8');

    const sectionHeader = `## ${section}`;
    const sectionStart = content.indexOf(sectionHeader);

    if (sectionStart === -1) {
        return `No se encontró la sección "${section}" en el perfil.`;
    }

    const afterHeader = sectionStart + sectionHeader.length;
    const nextSectionIndex = content.indexOf('\n## ', afterHeader);
    const sectionEnd = nextSectionIndex !== -1 ? nextSectionIndex : content.length;

    const sectionBody = content.slice(afterHeader, sectionEnd);
    const bulletToFind = `- ${oldInfo}`;

    if (!sectionBody.includes(bulletToFind)) {
        return `No se encontró "${oldInfo}" en la sección "${section}".`;
    }

    let updatedBody: string;
    if (newInfo && newInfo.trim() !== '') {
        updatedBody = sectionBody.replace(bulletToFind, `- ${newInfo}`);
    } else {
        updatedBody = sectionBody.replace(`\n${bulletToFind}`, '');
    }

    const updatedContent =
        content.slice(0, afterHeader) + updatedBody + content.slice(sectionEnd);

    await fs.writeFile(profilePath, updatedContent, 'utf-8');
    clearProfileCache(userId);

    const action = newInfo && newInfo.trim() !== '' ? 'actualizado' : 'eliminado';
    return `Perfil ${action}: "${oldInfo}" en la sección "${section}".`;
};

export const forgetProfileEntries = async (
    userId: string,
    keyword: string
): Promise<string> => {
    const profilePath = getProfilePath(userId);
    const content = await fs.readFile(profilePath, 'utf-8');

    const lines = content.split('\n');
    const lowerKeyword = keyword.toLowerCase();
    const removed: string[] = [];

    const updatedLines = lines.filter((line) => {
        const isBullet = line.trimStart().startsWith('- ');
        const matches = line.toLowerCase().includes(lowerKeyword);
        if (isBullet && matches) {
            removed.push(line.trim());
            return false;
        }
        return true;
    });

    if (removed.length === 0) {
        return `No se encontró ningún dato relacionado con "${keyword}" en el perfil.`;
    }

    await fs.writeFile(profilePath, updatedLines.join('\n'), 'utf-8');
    clearProfileCache(userId);

    return `Eliminado del perfil (${removed.length} registro${removed.length > 1 ? 's' : ''}): ${removed.join(' | ')}`;
};

export const resetProfileData = async (userId: string): Promise<string> => {
    const profilePath = getProfilePath(userId);
    await fs.mkdir(PROFILES_DIR, { recursive: true });
    await fs.writeFile(profilePath, PROFILE_TEMPLATE, 'utf-8');
    clearProfileCache(userId);
    return 'He borrado todo tu perfil. Ya no recuerdo nada sobre ti.';
};
