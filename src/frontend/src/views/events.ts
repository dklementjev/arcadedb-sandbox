export interface BaseViewEvent {
    type: string,
}

export interface RunActionViewEvent extends BaseViewEvent {
    type: "run-action",
    name: string|null,
    data?: Record<string, any>
}
