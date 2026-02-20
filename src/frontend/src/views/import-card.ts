import { BaseView } from "./base";

export class ImportCardView extends BaseView {
    render () {
        this.setupDOMEvents();
    }

    protected setupDOMEvents() {
        const formEl = this.getFormEl(),
            mappingFileInput = this.getFormInput("import-mapping"),
            dataFileinput = this.getFormInput("import-data"),
            formAction = '/app/db/import'
        ;

        formEl.addEventListener(
            "change",
            (e) => {
                const el = e.target as HTMLElement;

                if (el.matches("input[type=file]")) {
                    this.fileChangeHandler()
                }
            }
        );

        formEl.addEventListener(
            "submit",
            (e) => {
                e.preventDefault();

                const formData = new FormData(),
                    mappingJSONBlob = mappingFileInput.files[0],
                    dataJSONBlob = dataFileinput.files[0]
                ;

                formData.append("mapping", mappingJSONBlob);
                formData.append("data", dataJSONBlob);

                fetch (
                    formAction,
                    {
                        body: formData,
                        method: "POST",
                    }
                )
                .then(
                    (response) => response.json()
                )
                .then(
                    (json) => {
                        console.log(json);
                    }
                )
                .catch(
                    (error) => {
                        console.error(error);
                    }
                )
            }
        )
    }

    protected fileChangeHandler(): void {
        const formEl = this.getFormEl(),
            fileInputs = formEl.querySelectorAll("input[type=file]"),
            isFilesValid = Array.from(fileInputs).reduce((res: boolean, el: HTMLInputElement) => res && el.validity?.valid, true),
            submitButton = formEl.querySelector("button[type=submit]") as HTMLButtonElement
        ;

        submitButton.disabled = isFilesValid ? null : true;
    }

    protected getFormEl(): HTMLFormElement {
        const res = this.getEl().querySelector("form");

        if (!res) {
            throw new Error("Element not found");
        }

        return res as HTMLFormElement;
    }

    protected getFormInput(name: string): HTMLInputElement {
        const selector = `input[name=${name}]`,
            el = this.getFormEl().querySelector(selector) as HTMLInputElement|null
        ;

        if (!el) {
            throw new Error("Element not found");
        }

        return el;
    }
}
