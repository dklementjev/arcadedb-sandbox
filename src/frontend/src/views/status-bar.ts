import { API } from "../backend/api";
import { FormModel } from "../models/form";
import { BaseView } from "./base";
import { BaseViewEvent } from "./events";

export class StatusBarView extends BaseView<BaseViewEvent> {
    constructor (
        protected readonly api: API,
        selector: string,
        formModel: FormModel
    ) {
        super(selector, formModel);
    }

    update () {
        this.updateAppStatus();
        this.updateDBStatus();
    }

    async updateAppStatus () {
        const isAppOnline = await this.api.isAppOnline();

        this.updateAvailabilityStatus(this.getEl()?.querySelector('#app-status .icon'), isAppOnline);
    }

    async updateDBStatus() {
        const isDBOnline = await this.api.isDBOnline();

        this.updateAvailabilityStatus(this.getEl()?.querySelector('#db-status .icon'), isDBOnline);
    }

    private updateAvailabilityStatus(el: HTMLElement|null, status: boolean|null): void {
        if (!el) {
            return;
        }

        el.innerHTML = (status ? 'OK' : 'Unavailable');
    }
}
