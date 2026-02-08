import { BaseModel, BaseModelEvent } from "./base";

export class FormModel extends BaseModel<BaseModelEvent> {
    protected query: string|null = null;

    protected queryResult: Object|null = null;

    setQuery (query: string|null): this {
        const oldValue = this.query;
        this.query = query;
        this.triggerChangeHandlersIfNeeded('query', oldValue, query);

        return this;
    }

    getQuery (): string|null {
        return this.query;
    }

    setQueryResult (queryResult: Object|null): this {
        const oldValue = this.queryResult;
        this.queryResult = queryResult;
        this.triggerChangeHandlersIfNeeded('queryResult', oldValue, queryResult);

        return this;
    }

    getQueryResult (): Object|null {
        return this.queryResult;
    }

    triggerChangeHandlersIfNeeded (fieldName: string, oldValue: any, newValue: any) {
        if (!this.isChanged(oldValue, newValue)) {
            return;
        }

        this.events.emit(
            "change",
            {
                type: "change",
                fieldName: fieldName,
                oldValue: oldValue,
                newValue: newValue,
            }
        );
    }

    isChanged (oldValue: any, newValue: any) {
        return oldValue != newValue;
    }
}
