import mitt, { Emitter } from "mitt";

export interface ModelChangeEvent {
    type: "change",
    fieldName: string,
    oldValue: any,
    newValue: any,
}

export type BaseModelEvent =
    | ModelChangeEvent
;

export abstract class BaseModel<EventDataType extends BaseModelEvent = BaseModelEvent> {
    public readonly events: Emitter<Record<string, EventDataType>>;

    constructor () {
        this.events = mitt<Record<string, EventDataType>>()
    }
}
