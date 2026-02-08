import mitt, { Emitter } from "mitt"
import { BaseViewEvent } from "./events";
import { BaseModel } from "../models/base";

export class BaseView<EventDataType extends BaseViewEvent = BaseViewEvent, ModelType extends BaseModel = BaseModel> {
    public readonly events: Emitter<Record<string, EventDataType>>;

    constructor (
        protected readonly selector: string,
        protected readonly model: ModelType|null,
    ) {
        this.events = mitt<Record<string, EventDataType>>();
    }

    show () {
        this.getEl()?.classList.remove('d-none');
    }

    hide () {
        this.getEl()?.classList.add('d-none');
    }

    render() {}

    update () {}

    getEl (): HTMLElement|null {
        return document.querySelector(this.selector);
    }
}
