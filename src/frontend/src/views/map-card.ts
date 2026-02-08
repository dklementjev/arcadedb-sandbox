import { FormModel } from "../models/form";
import { BaseView } from "./base";
import { RunActionViewEvent } from "./events";


export type MapCardViewEvent =
    | RunActionViewEvent
;

export class MapCardView extends BaseView<MapCardViewEvent, FormModel> {
    render () {
        this.setupDOMEvents();
    }

    protected setupDOMEvents () {
        this.getEl()?.addEventListener(
            "change",
            (e) => {
                const el = e.target as HTMLElement;

                if (el.matches("[name=query]")) {
                    this.updateQuery();
                }
            }
        )

        this.getEl()?.addEventListener(
            "click",
            (e) => {
                const el = e.target as HTMLElement;

                if (el.matches(".btn")) {
                    this.events.emit(
                        "action",
                        {
                            type: "run-action",
                            name: el.dataset.action || null,
                        }
                    );
                }
            }
        )
    }

    update () {
        this.updateQuery();
    }

    protected updateQuery() {
        const el = this.getEl()?.querySelector('[name=query]') as HTMLInputElement|null;

        if (el) {
            this.model.setQuery(el.value);
        }
    }
}
