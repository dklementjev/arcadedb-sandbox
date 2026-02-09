"use strict";

import { API } from "./backend/api";

import { FormModel } from "./models/form";
import { FormController } from "./controllers/form";

import { MapCardView } from "./views/map-card";
import { StatusBarView } from "./views/status-bar";
import { MapModel } from "./models/map";
import { MapController } from "./controllers/map";
import { JSONView } from "./views/query-result/json";
import { BaseView } from "./views/base";
import { BaseViewEvent } from "./views/events";
import { MapView } from "./views/query-result/map";
import { QueryResultTabEventName, QueryResultTabsView } from "./views/query-result-tabs";
import { MapLayoutSelectorView } from "./views/sidebar/map-layout-selector";
import { VertexPropertiesView } from "./views/sidebar/vertex-properties";
import { VertexPropertiesModel } from "./models/sidebar/vertex-properties";

const api = new API(''),
    queryFormModel = new FormModel(),
    mapModel = new MapModel(),
    vertexPropertiesModel = new VertexPropertiesModel(),
    formController = new FormController(api),
    statusBar = new StatusBarView(api, "#status-bar", null),
    mapCard = new MapCardView("#graph-map", queryFormModel),
    queryResultTabsView = new QueryResultTabsView("#result > .nav", null),
    queryResultJSONView = new JSONView("#json-tab-pane", queryFormModel),
    queryResultMapView = new MapView("#map-tab-pane", queryFormModel),
    mapLayoutSelectorView = new MapLayoutSelectorView("#map-layout-selector-form", null),
    vertexPropertiesView = new VertexPropertiesView("#vertex-properties", vertexPropertiesModel),
    mapController = new MapController(
        queryFormModel,
        mapModel,
        vertexPropertiesModel,
        () => queryResultMapView.getMapContainer()
    )
;

function setupStatusBar(view: StatusBarView)
{
    view.show();
    view.update();
}

function setupView<EventType extends BaseViewEvent>(view: BaseView<EventType>): BaseView<EventType>
{
    view.render();
    view.update();
    view.show();

    return view;
}

function setup()
{
    setupStatusBar(statusBar);

    setupView(mapCard);
    mapCard.events.on(
        "action",
        (e) => formController.actionHandler(e.name, queryFormModel)
    );

    setupView(queryResultTabsView);
    queryResultTabsView.events.on(
        "tab",
        (e) => {
            if (e.kind === QueryResultTabEventName.Shown && e.tag === 'map') {
                mapController.scheduleRefresh();
            }
        }
    )
    setupView(queryResultJSONView);
    setupView(queryResultMapView);
    setupView(mapLayoutSelectorView);
    mapLayoutSelectorView.events.on(
        "change",
        (e) => mapController.updateLayout(e.layout),
    );
    setupView(vertexPropertiesView);

    mapController.render();
}

window.addEventListener("DOMContentLoaded", setup);
