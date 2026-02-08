import { BaseView } from "../base";
import { BaseViewEvent } from "../events";

interface MapLayoutSelectorChangeEvent extends BaseViewEvent {
    type: "change",
    layout: string,
}

type MapLayoutSelectorViewEvent =
    | MapLayoutSelectorChangeEvent
;

export class MapLayoutSelectorView extends BaseView<MapLayoutSelectorViewEvent> {
    render () {
        this.setupDOMEvents();
    }

    protected setupDOMEvents(): void {
        this.getSelectEl().addEventListener(
            "change",
            (e) => {
                const el = e.target as HTMLSelectElement,
                    selectedLayout = el.value
                ;

                this.events.emit(
                    "change",
                    {
                        type: "change",
                        layout: selectedLayout
                    }
                )
            }
        );
    }

    protected getSelectEl (): HTMLElement {
        const res = this.getEl().querySelector("#graph-map-layout-selector") as HTMLElement|null;

        if (!res) {
            throw new Error("Element not found");
        }

        return res;
    }
}
