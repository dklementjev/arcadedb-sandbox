enum RawQueryResultDataType {
    Edge = "e",
    Vertex = "v",
}

export type RawQueryResultRecordId = string;

export type RawQueryResultRecordType = string;

export interface RawQueryResultEdgeData {
    "@cat": RawQueryResultDataType.Edge,
    "@type": RawQueryResultRecordType,
    "@rid": RawQueryResultRecordId,
    "@in": RawQueryResultRecordId,
    "@out": RawQueryResultRecordId,
}

export interface RawQueryResultEdge {
    p: RawQueryResultEdgeData,
    r: RawQueryResultRecordId,
    t: RawQueryResultRecordType,
    i: RawQueryResultRecordId,
    o: RawQueryResultRecordId,
}

export interface RawQueryResultRecord {
    "@cat": RawQueryResultDataType,
    "@in": number,
    "@out": number,
    "@rid": RawQueryResultRecordId,
    "@type": RawQueryResultRecordType
}

export interface RawQueryResultVertexData {
    "@cat": RawQueryResultDataType.Vertex,
    "@rid": RawQueryResultRecordId,
    "@type": RawQueryResultRecordType,
    [index: string]: string|number|boolean|null
}

export interface RawQueryResultVertex {
    i: number,
    o: number,
    p: RawQueryResultVertexData,
    r: RawQueryResultRecordId,
    t: RawQueryResultRecordType,
}

export interface RawQueryResult {}

export interface RawQueryResultStudio {
    edges: RawQueryResultEdge[];
    records: RawQueryResultRecord[];
    vertices: RawQueryResultVertex[];
}
