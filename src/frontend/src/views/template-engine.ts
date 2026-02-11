import { Eta } from "eta/core";

interface TemplateData {
    [index: string]: any,
}

export interface TemplateEngine {
    renderString(template: string, data: TemplateData): string;
    renderStringAsync(template: string, data: TemplateData): Promise<string>;
}

let instance = null;

function createInstance (): TemplateEngine {
    return new Eta({
        debug: true,
    });
}

export function getInstance(): TemplateEngine {
    if (!instance) {
        instance = createInstance();
    }

    return instance;
}
