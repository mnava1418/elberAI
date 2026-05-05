import fs from 'fs/promises';
import {
    loadProfile,
    clearProfileCache,
    addProfileEntry,
    editProfileEntry,
    forgetProfileEntries,
    resetProfileData,
    PROFILE_TEMPLATE,
} from '../../services/profile.service';

jest.mock('fs/promises');

const USER_ID = 'user_test_123';

const PROFILE_WITH_DATA = `# Perfil del Usuario

## Datos Personales
- Tiene 30 años
- Vive en Ciudad de México

## Trabajo
- Trabaja en Anthropic

## Familia y Relaciones

## Proyectos Activos

## Preferencias

## Hábitos y Rutina

## Metas
`;

const mockReadFile  = fs.readFile  as jest.Mock;
const mockWriteFile = fs.writeFile as jest.Mock;
const mockMkdir     = fs.mkdir     as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    clearProfileCache(USER_ID);
});

// ── loadProfile ────────────────────────────────────────────────────────────────

describe('loadProfile', () => {
    it('reads file from disk and returns its content', async () => {
        mockReadFile.mockResolvedValue(PROFILE_WITH_DATA);

        const result = await loadProfile(USER_ID);

        expect(result).toBe(PROFILE_WITH_DATA);
        expect(mockReadFile).toHaveBeenCalledTimes(1);
    });

    it('returns cached value without hitting disk on subsequent calls', async () => {
        mockReadFile.mockResolvedValue(PROFILE_WITH_DATA);

        await loadProfile(USER_ID);
        await loadProfile(USER_ID);

        expect(mockReadFile).toHaveBeenCalledTimes(1);
    });

    it('creates file with template and returns it when file does not exist', async () => {
        const enoent = Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
        mockReadFile.mockRejectedValue(enoent);
        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockResolvedValue(undefined);

        const result = await loadProfile(USER_ID);

        expect(result).toBe(PROFILE_TEMPLATE);
        expect(mockMkdir).toHaveBeenCalled();
        expect(mockWriteFile).toHaveBeenCalledWith(expect.any(String), PROFILE_TEMPLATE, 'utf-8');
    });

    it('throws for unexpected read errors', async () => {
        const error = Object.assign(new Error('Permission denied'), { code: 'EACCES' });
        mockReadFile.mockRejectedValue(error);

        await expect(loadProfile(USER_ID)).rejects.toThrow('Permission denied');
    });
});

// ── clearProfileCache ──────────────────────────────────────────────────────────

describe('clearProfileCache', () => {
    it('forces a re-read from disk on the next loadProfile call', async () => {
        mockReadFile.mockResolvedValue(PROFILE_WITH_DATA);

        await loadProfile(USER_ID);
        clearProfileCache(USER_ID);
        await loadProfile(USER_ID);

        expect(mockReadFile).toHaveBeenCalledTimes(2);
    });

    it('only clears the cache for the given userId', async () => {
        const OTHER_USER = 'other_user';
        mockReadFile.mockResolvedValue(PROFILE_WITH_DATA);

        await loadProfile(USER_ID);
        await loadProfile(OTHER_USER);
        clearProfileCache(USER_ID);
        await loadProfile(OTHER_USER); // should still be cached

        expect(mockReadFile).toHaveBeenCalledTimes(2); // USER_ID x1 + OTHER_USER x1
        clearProfileCache(OTHER_USER);
    });
});

// ── addProfileEntry ────────────────────────────────────────────────────────────

describe('addProfileEntry', () => {
    it('inserts bullet in the correct section', async () => {
        mockReadFile.mockResolvedValue(PROFILE_TEMPLATE);
        mockWriteFile.mockResolvedValue(undefined);

        const result = await addProfileEntry(USER_ID, 'Datos Personales', 'Tiene 25 años');

        expect(result).toBe('Perfil actualizado: información agregada en "Datos Personales".');
        const written = mockWriteFile.mock.calls[0][1] as string;
        expect(written).toContain('- Tiene 25 años');
    });

    it('inserts bullet between its section header and the next section', async () => {
        mockReadFile.mockResolvedValue(PROFILE_TEMPLATE);
        mockWriteFile.mockResolvedValue(undefined);

        await addProfileEntry(USER_ID, 'Datos Personales', 'Tiene 25 años');

        const written = mockWriteFile.mock.calls[0][1] as string;
        const bulletIdx = written.indexOf('- Tiene 25 años');
        expect(bulletIdx).toBeGreaterThan(written.indexOf('## Datos Personales'));
        expect(bulletIdx).toBeLessThan(written.indexOf('## Trabajo'));
    });

    it('creates file with template when it does not exist and inserts bullet', async () => {
        const enoent = Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
        mockReadFile.mockRejectedValue(enoent);
        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockResolvedValue(undefined);

        const result = await addProfileEntry(USER_ID, 'Trabajo', 'Trabaja en Anthropic');

        expect(result).toBe('Perfil actualizado: información agregada en "Trabajo".');
        const written = mockWriteFile.mock.calls[0][1] as string;
        expect(written).toContain('- Trabaja en Anthropic');
    });

    it('returns not-found message and does not write when section is missing', async () => {
        mockReadFile.mockResolvedValue('# Perfil\n\n## Datos Personales\n');

        const result = await addProfileEntry(USER_ID, 'Metas', 'Aprender TypeScript');

        expect(result).toBe('No se encontró la sección "Metas" en el perfil.');
        expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('invalidates cache after writing', async () => {
        mockReadFile.mockResolvedValue(PROFILE_TEMPLATE);
        mockWriteFile.mockResolvedValue(undefined);

        await loadProfile(USER_ID);                                        // read 1 (cache miss)
        await addProfileEntry(USER_ID, 'Datos Personales', 'Tiene 25 años'); // read 2 (internal)
        await loadProfile(USER_ID);                                        // read 3 (cache cleared)

        expect(mockReadFile).toHaveBeenCalledTimes(3);
    });
});

// ── editProfileEntry ───────────────────────────────────────────────────────────

describe('editProfileEntry', () => {
    it('replaces bullet with new text when newInfo is provided', async () => {
        mockReadFile.mockResolvedValue(PROFILE_WITH_DATA);
        mockWriteFile.mockResolvedValue(undefined);

        const result = await editProfileEntry(USER_ID, 'Datos Personales', 'Tiene 30 años', 'Tiene 31 años');

        expect(result).toBe('Perfil actualizado: "Tiene 30 años" en la sección "Datos Personales".');
        const written = mockWriteFile.mock.calls[0][1] as string;
        expect(written).toContain('- Tiene 31 años');
        expect(written).not.toContain('- Tiene 30 años');
    });

    it('removes bullet when newInfo is null', async () => {
        mockReadFile.mockResolvedValue(PROFILE_WITH_DATA);
        mockWriteFile.mockResolvedValue(undefined);

        const result = await editProfileEntry(USER_ID, 'Datos Personales', 'Tiene 30 años', null);

        expect(result).toBe('Perfil eliminado: "Tiene 30 años" en la sección "Datos Personales".');
        const written = mockWriteFile.mock.calls[0][1] as string;
        expect(written).not.toContain('Tiene 30 años');
    });

    it('removes bullet when newInfo is empty string', async () => {
        mockReadFile.mockResolvedValue(PROFILE_WITH_DATA);
        mockWriteFile.mockResolvedValue(undefined);

        const result = await editProfileEntry(USER_ID, 'Datos Personales', 'Tiene 30 años', '');

        expect(result).toContain('eliminado');
        const written = mockWriteFile.mock.calls[0][1] as string;
        expect(written).not.toContain('Tiene 30 años');
    });

    it('returns not-found message when section does not exist', async () => {
        mockReadFile.mockResolvedValue('# Perfil\n\n## Datos Personales\n- Tiene 30 años\n');

        const result = await editProfileEntry(USER_ID, 'Metas', 'algo', 'otro');

        expect(result).toBe('No se encontró la sección "Metas" en el perfil.');
        expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('returns not-found message when bullet text does not exist in section', async () => {
        mockReadFile.mockResolvedValue(PROFILE_WITH_DATA);

        const result = await editProfileEntry(USER_ID, 'Datos Personales', 'Texto inexistente', 'Reemplazo');

        expect(result).toBe('No se encontró "Texto inexistente" en la sección "Datos Personales".');
        expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('only modifies the bullet within the specified section, not duplicates in other sections', async () => {
        const profileWithDuplicate = `# Perfil del Usuario

## Datos Personales
- Trabaja desde casa

## Trabajo
- Trabaja desde casa

## Familia y Relaciones

## Proyectos Activos

## Preferencias

## Hábitos y Rutina

## Metas
`;
        mockReadFile.mockResolvedValue(profileWithDuplicate);
        mockWriteFile.mockResolvedValue(undefined);

        await editProfileEntry(USER_ID, 'Datos Personales', 'Trabaja desde casa', 'Trabaja en oficina');

        const written = mockWriteFile.mock.calls[0][1] as string;
        expect(written).toContain('## Datos Personales\n- Trabaja en oficina');
        expect(written).toContain('## Trabajo\n- Trabaja desde casa');
    });

    it('invalidates cache after writing', async () => {
        mockReadFile.mockResolvedValue(PROFILE_WITH_DATA);
        mockWriteFile.mockResolvedValue(undefined);

        await loadProfile(USER_ID);                                                              // read 1
        await editProfileEntry(USER_ID, 'Datos Personales', 'Tiene 30 años', 'Tiene 31 años'); // read 2
        await loadProfile(USER_ID);                                                              // read 3

        expect(mockReadFile).toHaveBeenCalledTimes(3);
    });
});

// ── forgetProfileEntries ───────────────────────────────────────────────────────

describe('forgetProfileEntries', () => {
    it('removes all bullets matching keyword across all sections', async () => {
        const profileWithBirthday = `# Perfil del Usuario

## Datos Personales
- Tiene cumpleaños el 15 de marzo

## Preferencias
- Le gustan los cumpleaños ajenos

## Metas
- Celebrar su cumpleaños en París
`;
        mockReadFile.mockResolvedValue(profileWithBirthday);
        mockWriteFile.mockResolvedValue(undefined);

        const result = await forgetProfileEntries(USER_ID, 'cumpleaños');

        expect(result).toContain('3 registros');
        const written = mockWriteFile.mock.calls[0][1] as string;
        expect(written).not.toContain('cumpleaños');
    });

    it('search is case-insensitive', async () => {
        mockReadFile.mockResolvedValue(PROFILE_WITH_DATA);
        mockWriteFile.mockResolvedValue(undefined);

        const result = await forgetProfileEntries(USER_ID, 'ANTHROPIC');

        expect(result).toContain('1 registro');
        const written = mockWriteFile.mock.calls[0][1] as string;
        expect(written).not.toContain('Anthropic');
    });

    it('returns not-found message and does not write when no bullets match', async () => {
        mockReadFile.mockResolvedValue(PROFILE_WITH_DATA);

        const result = await forgetProfileEntries(USER_ID, 'mascotas');

        expect(result).toBe('No se encontró ningún dato relacionado con "mascotas" en el perfil.');
        expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('does not remove section headers or non-bullet lines matching the keyword', async () => {
        const profile = `# Perfil del Usuario\n\n## Datos Personales\n- Tiene 30 años\n`;
        mockReadFile.mockResolvedValue(profile);

        const result = await forgetProfileEntries(USER_ID, 'Datos');

        expect(result).toBe('No se encontró ningún dato relacionado con "Datos" en el perfil.');
        expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('invalidates cache after writing', async () => {
        mockReadFile.mockResolvedValue(PROFILE_WITH_DATA);
        mockWriteFile.mockResolvedValue(undefined);

        await loadProfile(USER_ID);                              // read 1
        await forgetProfileEntries(USER_ID, 'Anthropic');       // read 2
        await loadProfile(USER_ID);                              // read 3

        expect(mockReadFile).toHaveBeenCalledTimes(3);
    });
});

// ── resetProfileData ───────────────────────────────────────────────────────────

describe('resetProfileData', () => {
    it('overwrites file with the empty template', async () => {
        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockResolvedValue(undefined);

        const result = await resetProfileData(USER_ID);

        expect(result).toBe('He borrado todo tu perfil. Ya no recuerdo nada sobre ti.');
        expect(mockWriteFile).toHaveBeenCalledWith(expect.any(String), PROFILE_TEMPLATE, 'utf-8');
    });

    it('invalidates cache after resetting', async () => {
        mockReadFile.mockResolvedValue(PROFILE_WITH_DATA);
        mockMkdir.mockResolvedValue(undefined);
        mockWriteFile.mockResolvedValue(undefined);

        await loadProfile(USER_ID);    // read 1 (populates cache)
        await resetProfileData(USER_ID); // clears cache, no read
        await loadProfile(USER_ID);    // read 2 (cache was cleared)

        expect(mockReadFile).toHaveBeenCalledTimes(2);
    });
});
