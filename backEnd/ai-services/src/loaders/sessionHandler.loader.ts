import ShortTermMemory from "../models/shortTermMemory.model";

const cleanOldSessions = () => {
    const CLEAN_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
    setInterval(() => {
        console.info('Cleaning old sessions from ShortTermMemory')
        ShortTermMemory.getInstance().deleteOldSessions()
    }, CLEAN_INTERVAL);

    console.info("Ready to clean short term memory...")
}

export default cleanOldSessions