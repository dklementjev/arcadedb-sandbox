import Debug from "debug";
import { access, constants, unlink } from "node:fs/promises";

const debug = Debug("util.fs");

export const unlinkOnExit = async (filenames: string[], cb: () => Promise<void>): Promise<void> => {
    debug('unlinkOnExit(%o)',filenames)

    try {
        await cb();
    } finally {
        for (const filename of filenames) {
            try {
                debug("unlinkOnExit.unlink(%s)", filename);
                await access(filename, constants.W_OK);
                await unlink(filename);
            } catch (_e) {
                // Skip
            }

        }
    }

    return Promise.resolve();
}
