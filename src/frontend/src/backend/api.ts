export enum QueryLanguage {
    Gremlin = "gremlin",
}

export class API {
    constructor (
        protected readonly apiUrl: string
    ) { }

    async isAppOnline  (): Promise<boolean> {
        return fetch (this.getApiUrl('/app/'))
            .then(
                (response) => response.text(),
                () => null
            )
            .then(
                (responseText) => responseText ==='OK'
            )
        ;
    }

    async isDBOnline() {
        return fetch (this.getApiUrl('/app/db/'))
            .then(
                (response) => response.json(),
            )
            .then(
                (json) => !!json.status,
            )
            .catch (
                () => null, // Also handles invalid JSON
            )
    }

    async runQuery (query: string, queryLanguage: QueryLanguage) {
        console.log("runQuery", queryLanguage, query);

        const postData = {
            language: queryLanguage,
            query: query,
        };

        return fetch (
            this.getApiUrl("/app/db/query/"),
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postData),
            }
        )
        .then (
            (response) => response.json(),
        )
        .catch (
            () => null,
        )
    }

    getApiUrl (path: string): string {
        const normalizedPath = path.replace(/^\/+/, '');

        return `${this.apiUrl}/${normalizedPath}`;
    }
}
