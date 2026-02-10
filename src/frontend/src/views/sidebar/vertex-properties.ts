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
        this.getTableContainerEl().innerHTML = this.renderTable();
    }

    protected renderTable(): string {
        const tableTemplate = this.getTableTemplate(),
            data = this.model.attributes?.data ?? {},
            keys = Object.keys(data).filter((k) => !k.startsWith('@')),
            propertyData = keys.map((key: string) => ({title: key, value: data[key]}))
        ;

        return this.template.renderString(
            tableTemplate,
            {
                rows: [
                    {title: "Type", value: this.model.label},
                    {title: "Record id", value: this.model.primaryKey},
                    ...propertyData,
                ]
            }
        );
    }

    protected getTableContainerEl(): HTMLElement {
        const res = this.getEl().querySelector('#vertex-properties-table');

        if (!res) {
            throw new Error("Element not found");
        }

        return res as HTMLElement;
    }

    protected getTableTemplate(): string {
        return `<table class="table table-striped table-sm">
            <tbody>
            <% for(const row of it.rows) { %>
            <tr>
                <th scope="row" class="w-50"><%= row.title %></th>
                <td><%= row.value %></td>
            </tr>
            <% } %>
            </tbody>
        </table>`;
    }
}
