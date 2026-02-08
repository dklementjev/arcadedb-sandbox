import { FormModel } from "../../models/form";
import { BaseView } from "../base";
import { BaseViewEvent } from "../events";

export class JSONView extends BaseView<BaseViewEvent, FormModel> {
    render () {
        super.render();

        this.setupEvents();
    }

    protected setupEvents (): void {
        this.model.events.on(
            "change",
            (e) => {
                if (e.type === "change" && e.fieldName === 'queryResult') {
                    this.updateQueryResult();
                }
            }
        );
    }

    protected updateQueryResult(): void {
        const el = this.getEl()?.querySelector("[name=query-result]") as HTMLInputElement|null;

        if (el) {
            el.value = JSON.stringify(this.model.getQueryResult(), null, '  ');
        }
    }
}
