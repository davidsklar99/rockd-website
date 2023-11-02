import { PageContextBuiltInServer } from "vite-plugin-ssr/types";
import { SETTINGS } from "~/map-interface/settings";
import h from "@macrostrat/hyper";
import { ClientOnly } from "~/renderer/client-only";

const apiAddress = "http://localhost:5001" + "/v2/defs/sources";

export async function onBeforeRender(pageContext: PageContextBuiltInServer) {
  const { id } = pageContext.routeParams;

  const params = new URLSearchParams({
    format: "geojson",
    source_id: id,
  });
  const response = await fetch(apiAddress + "?" + params);
  const data: any = await response.json();
  const map = data?.success?.data?.features[0];

  return {
    pageContext: {
      pageProps: {
        map,
      },
      documentProps: {
        // The page's <title>
        title: map.properties.name,
      },
    },
  };
}

const MapInterface = () => import("./map-interface");

export function Page({ map }) {
  return h("div.single-map", h(ClientOnly, { component: MapInterface, map }));
}
