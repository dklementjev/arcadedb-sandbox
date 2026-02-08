import { BaseView } from "../base";
import { BaseViewEvent } from "../events";

export class MapView extends BaseView<BaseViewEvent> {
    getMapContainer (): HTMLElement {
        const res = this.getEl()?.querySelector("#graph-canvas");

        if (!res) {
            throw new Error("Map container not found")
        }

        return res as HTMLElement;
    }
}
