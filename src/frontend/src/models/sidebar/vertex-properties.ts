import { BaseModel } from "../base";

enum RawVertexType {
    Vertex = 'v',
    Edge  = 'e',
}

type RawVertexId = string;

interface RawVertexData {
    '@cat': RawVertexType,
    '@rid': RawVertexId,
    '@type': string,
    [key: string]: string|number|boolean|null,
}

interface RawVertexAttributes {
    data: RawVertexData,
    x?: number,
    y?: number,
};

export class VertexPropertiesModel extends BaseModel {
    protected rawAttributes: RawVertexAttributes;

    setRawAttributes(attributes: any|null): this {
        const oldId = this.primaryKey;

        this.rawAttributes = attributes as RawVertexAttributes|null;

        if (this.primaryKey !== oldId) {
            this.events.emit(
                "change"
            )
        }

        return this;
    }

    get primaryKey (): RawVertexId|null {
        return this.rawAttributes?.data["@rid"];
    }

    get type (): RawVertexType|null {
        return this.rawAttributes?.data["@cat"];
    }

    get label (): string {
        return this.rawAttributes?.data["@type"]
    }

    get attributes (): RawVertexAttributes|null {
        return this.rawAttributes;
    }
}
