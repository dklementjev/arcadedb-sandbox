import { BaseView } from "./base";
import { BaseViewEvent } from "./events";

enum TabEventName {
    Show = "show.bs.tab",
    Shown = "shown.bs.tab",
    Hide = "hide.bs.tab",
    Hidden =  "hidden.bs.tab"
}

export enum QueryResultTabEventName {
    Show = "show",
    Shown = "shown",
    Hide = "hide",
    Hidden = "hidden"
}

export interface QueryResultTabEvent extends BaseViewEvent {
    type: "tab",
    kind: QueryResultTabEventName,
    tag: string,
}

export type QueryResultTabsViewEvent =
    | QueryResultTabEvent
;

export class QueryResultTabsView extends BaseView<QueryResultTabsViewEvent> {
    render () {
        this.setupDOMEvents();
    }

    protected setupDOMEvents (): void {
        const el = this.getEl(),
            events = [
                TabEventName.Show,
                TabEventName.Shown,
                TabEventName.Hide,
                TabEventName.Hidden,
            ]
        ;

        if (!el) {
            throw new Error("Invalid root element");
        }

        events.forEach((eventName) => el.addEventListener(eventName, (event) => this.triggerShowEventHandler(event)))
    }

    protected triggerShowEventHandler (event): void {
        const eventName = this.mapBootstrapEventToViewEvent(event.type),
            el = event.target as HTMLElement,
            tag = el.dataset.tag
        ;

        if (!eventName) {
            return;
        }

        this.events.emit(
            "tab",
            {
                type: "tab",
                kind: eventName,
                tag: tag,
            }
        )
    }

    protected mapBootstrapEventToViewEvent (bootstrapEventName: string): QueryResultTabEventName|null {
        switch (bootstrapEventName) {
            case TabEventName.Show:
                return QueryResultTabEventName.Show;

            case TabEventName.Shown:
                return QueryResultTabEventName.Shown;

            case TabEventName.Hide:
                return QueryResultTabEventName.Hide;

            case TabEventName.Hidden:
                return QueryResultTabEventName.Hidden;
        }

        return null;
    }
}
