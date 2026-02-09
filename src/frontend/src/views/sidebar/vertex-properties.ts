import { VertexPropertiesModel } from "../../models/sidebar/vertex-properties";
import { BaseView } from "../base";
import { BaseViewEvent } from "../events";

export class VertexPropertiesView extends BaseView<BaseViewEvent, VertexPropertiesModel> {
    render () {
        this.setupEvents();
    }

    protected setupEvents(): void {
        this.model.events.on("change", () => this.modelChangeHandler());
    }

    protected modelChangeHandler(): void {
        this.getTableContainerEl().replaceChildren(this.renderTable());
    }

    protected renderTable(): HTMLElement {
        const tableTemplate = this.getTableTemplate(),
            rowTemplate = this.getTableRowTemplate(),
            table = tableTemplate.content.cloneNode(true) as HTMLElement,
            tbody = table.querySelector("tbody") as HTMLElement
        ;

        const renderRowTemplate = (label: string, value: any): HTMLElement => {
            const res = rowTemplate.content.cloneNode(true) as HTMLElement;

            res.querySelector('th').innerText = label;
            res.querySelector('td').innerText = value;

            return res as HTMLElement;
        }

        tbody.appendChild(renderRowTemplate('Type', this.model.label));
        tbody.appendChild(renderRowTemplate('Record id', this.model.primaryKey));

        const data = this.model.attributes?.data ?? {},
            keys = Object.keys(data).filter((k) => !k.startsWith('@'))
        ;

        for (const key of keys) {
            tbody.appendChild(renderRowTemplate(key, data[key]))
        }

        return table;
    }

    protected getTableContainerEl(): HTMLElement {
        const res = this.getEl().querySelector('#vertex-properties-table');

        if (!res) {
            throw new Error("Element not found");
        }

        return res as HTMLElement;
    }

    protected getTableTemplate(): HTMLTemplateElement {
        const res = this.getEl().querySelector('#vertex-properties-table-template'); //TODO: ctor arg

        if (!res) {
            throw new Error("Element not found");
        }

        return res as HTMLTemplateElement;
    }

    protected getTableRowTemplate(): HTMLTemplateElement {
        const res = this.getEl().querySelector("#vertex-properties-table-row-template"); //TODO: ctor arg

        if (!res) {
            throw new Error("Element not found");
        }

        return res as HTMLTemplateElement;
    }
}
