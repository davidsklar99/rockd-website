import { hyperStyled } from "@macrostrat/hyper";
import { GeologicPatternProvider } from "@macrostrat/column-components";
import { preprocessUnits, Column } from "@macrostrat/column-views";
import { UnitLong } from "@macrostrat/api-types";
import "@macrostrat/column-components/main.module.styl";
import { ExpansionPanel } from "../../expansion-panel";

import styles from "./strat-column.module.styl";
import { ColumnSummary } from "~/map-interface/app-state/handlers/columns";
import { NonIdealState } from "@blueprintjs/core";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import { LinkButton } from "../../buttons";
import { InfoPanelSection } from "../../expansion-panel";

const h = hyperStyled(styles);

function BackButton() {
  const breadcrumbs = useBreadcrumbs();
  const prevRoute = breadcrumbs[breadcrumbs.length - 2];
  let to = prevRoute?.match.pathname;
  return h(LinkButton, { to, icon: "arrow-left", minimal: true, small: true });
}

function ColumnOverlay({ columnInfo }: { columnInfo: ColumnSummary | null }) {
  const units = columnInfo?.units;
  if (units == null)
    return h(NonIdealState, { title: "No column available", icon: "error" }, [
      h("p", "A stratigraphic column has not been assigned for this location."),
    ]);

  const unitsA = preprocessUnits(units);

  const headerElement = h([
    h("div.controls", [h(BackButton)]),
    h("h4", columnInfo.col_name),
    h("div.spacer"),
    h("code", columnInfo.col_id),
  ]);

  return h(
    InfoPanelSection,
    { className: "strat-column-panel", headerElement },
    h("div.strat-column-container", [
      h(Column, {
        data: unitsA,
        showLabels: true,
        targetUnitHeight: 40,
        unconformityLabels: true,
        width: 280,
        columnWidth: 180,
      }),
    ])
  );
}

function resolvePattern(name: string | number) {
  return `//visualization-assets.s3.amazonaws.com/geologic-patterns/svg/${name}.svg`;
}

export function StratColumn(props) {
  return h(
    GeologicPatternProvider,
    { resolvePattern },
    h(ColumnOverlay, props)
  );
}
