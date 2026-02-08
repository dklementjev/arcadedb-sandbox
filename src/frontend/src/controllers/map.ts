import { QueryResultVertex, QueryResultEdge } from "../backend/api/dto";
import { RawQueryResult, RawQueryResultStudio } from "../backend/api/types";
import { FormModel } from "../models/form";
import { MapLayout, MapModel } from "../models/map";
import { Sigma } from "sigma";
import Graph from "graphology";

export class MapController {
    protected sigma: Sigma|null = null;

    constructor (
        protected readonly formModel: FormModel,
        protected readonly mapModel: MapModel,
        protected readonly mapContainerFactory: () => HTMLElement,
    ) { }

    render () {
        this.sigma = this.createSigma(this.mapModel.graph, this.mapContainerFactory());
        this.setupEvents();
    }

    scheduleRefresh () {
        if (!this.sigma) {
            return;
        }

        this.sigma.scheduleRefresh();
    }

    updateLayout (layoutTag: string) {
        this.mapModel.setMapLayout(layoutTag as MapLayout); // TODO: strict value check
    }

    protected createSigma (
        graph: Graph,
        el: HTMLElement,
    ): Sigma {
        const res = new Sigma(graph, el, {allowInvalidContainer: true});

        this.setupNodeReducer(res);
        this.setupNodeDragging(graph, res);

        return res;
    }

    protected setupEvents() {
        this.formModel.events.on(
            "change",
            (e) => {
                if (e.type === "change" && e.fieldName === 'queryResult') {
                    this.updateMapModel();
                    this.sigma?.refresh();
                }
            }
        );
    }

    protected updateMapModel() {
        const data = this.formModel.getQueryResult();

        this.ensureIsStudioQueryResult(data);

        this.mapModel.clearGraph();
        for (const item of data.vertices) {
            this.mapModel.addVertex(new QueryResultVertex(item));
        }
        for (const item of data.edges) {
            this.mapModel.addEdge(new QueryResultEdge(item));
        }
        this.mapModel.update();
    }

    protected ensureIsStudioQueryResult (data: Object|null): asserts data is RawQueryResultStudio{
        this.ensureIsQueryResult(data);
        if (data !== null && 'edges' in data && 'vertices' in data) {
            return;
        }

        throw new Error('Not a Studio query result');
    }

    protected ensureIsQueryResult(_data: Object|null): asserts _data is RawQueryResult {
        return;
    }

    protected setupNodeReducer(sigma: Sigma) {
        const getNodeType = (_attr) => "circle";
        const getNodeSize = (attr) => {
            const nodeType = attr.data['@type'];

            switch (nodeType) {
                case "payment":
                    return 35;

                case "payment-handler":
                    return 25;

                case "agent":
                    return 15;
            }

            return 10
        };
        const getNodeLabel = (id, attr) => {
            const nodeType = attr.data['@type'];

            switch (nodeType) {
                case "agent":
                    return `Agent #${attr.data.id}`;

                case "subagent":
                    return `Subagent #${attr.data.id}`;

                case "payment-handler":
                    return `Payment handler: ${attr.data.kind} ${attr.data.name}`;

                case "payment":
                    return `Payment direction: ${attr.data.direction}`;

                default:
                    return `?${nodeType} ${id}`;
            }
        };

        sigma.setSetting(
            "nodeReducer",
            (id, attr) => {
                attr.type = getNodeType(attr)
                attr.size = getNodeSize(attr)
                attr.label = getNodeLabel(id, attr)

                return attr;
            }
        )
    }

    protected setupNodeDragging(graph: Graph, sigma: Sigma) {

        let draggedNode: string | null = null;
        let isDragging = false;

        sigma.on("downNode", (e) => {
            isDragging = true;
            draggedNode = e.node;
            graph.setNodeAttribute(draggedNode, "highlighted", true);
            if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
        });

        sigma.on("moveBody", ({ event }) => {
            if (!isDragging || !draggedNode) return;

            const pos = sigma.viewportToGraph(event);

            graph.setNodeAttribute(draggedNode, "x", pos.x);
            graph.setNodeAttribute(draggedNode, "y", pos.y);

            event.preventSigmaDefault();
            event.original.preventDefault();
            event.original.stopPropagation();
        });

        const handleUp = () => {
            if (draggedNode) {
            graph.removeNodeAttribute(draggedNode, "highlighted");
            }
            isDragging = false;
            draggedNode = null;
        };
        sigma.on("upNode", handleUp);
        sigma.on("upStage", handleUp);
    }
}
