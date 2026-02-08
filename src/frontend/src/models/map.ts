import Graph from "graphology";
import { QueryResultEdge, QueryResultVertex } from "../backend/api/dto";
import noverlap from "graphology-layout-noverlap";
import { circlepack, circular, random } from "graphology-layout";
import forceLayout from "graphology-layout-force";
import forceAtlas2 from "graphology-layout-forceatlas2";

export enum MapLayout {
    Random = 'random',
    Circular = 'circular',
    CirclePack = 'circlePack',
    NoOverlap = 'noverlap',
    Force = 'force',
    ForceAtlas2 = 'forceatlas2',
}

export class MapModel {
    public readonly graph: Graph;

    protected  mapLayout: MapLayout|null = null;

    constructor () {
        this.graph = new Graph({
            multi: true,
        });
    }

    clearGraph (): this {
        this.graph.clear();

        return this;
    }

    addVertex (item: QueryResultVertex): this {
        this.graph.addNode(
            item.recordId,
            {
                data: item.recordProperties,

                x: 0,
                y: 0,
            }
        );

        return this;
    }


    addEdge (item: QueryResultEdge): this {
        this.graph.addEdge(
            item.from,
            item.to,
            {
                data: item.recordProperties,
            }
        );

        return this;
    }

    setMapLayout (mapLayout: MapLayout) {
        const isChanged = (mapLayout !== this.mapLayout);

        this.mapLayout = mapLayout;
        if (isChanged) {
            this.updateLayout();
        }
    }

    getMapLayout (): MapLayout|null {
        return this.mapLayout;
    }

    update () {
        this.updateLayout();
    }

    protected updateLayout () {
        let layout,
            layoutOptions = {};

        switch (this.mapLayout) {
            case MapLayout.NoOverlap:
                layout = noverlap;
                break;

            case MapLayout.Circular:
                layout = circular;
                break;

            case MapLayout.CirclePack:
                layout = circlepack;
                break;

            case MapLayout.Force:
                random.assign(this.graph);
                layout = forceLayout;
                layoutOptions = {iterations: 50};
                break;

            case MapLayout.ForceAtlas2:
                random.assign(this.graph);
                layout = forceAtlas2;
                layoutOptions = {iterations: 50};
                break;

            case MapLayout.Random:
            default:
                layout = random;
                break;


        }

        layout.assign(this.graph, layoutOptions);
    }
}
