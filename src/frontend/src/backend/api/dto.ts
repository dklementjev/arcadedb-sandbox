import { RawQueryResultEdge, RawQueryResultRecord, RawQueryResultVertex } from "./types";

export class QueryResultEdge {
    constructor (
        protected readonly data: RawQueryResultEdge
    ) { }

    get recordId () {
        return this.data.r;
    }

    get recordType () {
        return this.data.t;
    }

    get recordProperties () {
        return this.data.p;
    }

    get from () {
        return this.data.o;
    }

    get to () {
        return this.data.i;
    }
}

export class QueryResultRecord {
    constructor (
        protected readonly data: RawQueryResultRecord,
    ) {}

    get recordId () {
        return this.data['@type'];
    }

    get recordType () {
        return this.data['@type']
    }
}

export class QueryResultVertex {
    constructor (
        protected readonly data: RawQueryResultVertex,
    ) {}

    get recordId () {
        return this.data.r;
    }

    get recordType () {
        return this.data.t;
    }

    get recordProperties () {
        return this.data.p;
    }
}
