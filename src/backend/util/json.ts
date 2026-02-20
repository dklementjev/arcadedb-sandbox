import { readFile } from "node:fs/promises";
import Debug from "debug";

const debug = Debug("utils.json");

export const parseJsonFile = async (filename: string): Promise<any> => {
    const jsonStr = (await readFile(filename)).toString();

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        debug("JSON parse error: %o", e);
        debug("JSON: %s", jsonStr);
        throw new Error("JSON pare error");
    }
}
