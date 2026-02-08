import { API, QueryLanguage } from "../backend/api";
import { FormModel } from "../models/form";

export class FormController {
    constructor (
        protected readonly api: API
    ) { }

    async actionHandler (actionName: string|null, formModel: FormModel) {
        switch (actionName) {
            case "run-query":
                this.runQueryHandler(formModel);
                break;

            default:
                console.log("Unhandled button click", actionName);
                break;
        }
    }

    async runQueryHandler(formModel: FormModel) {
        const queryResult = await this.api.runQuery(
            formModel.getQuery(),
            QueryLanguage.Gremlin
        );
        formModel.setQueryResult(queryResult?.data);
    }
}
