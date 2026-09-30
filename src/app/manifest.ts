import type { MetadataRoute } from "next";
import { withBasePath } from "@/lib/site";

export const dynamic = "force-static";

/** Permette di aggiungere TrovaBenzina alla schermata Home del telefono come un'app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrovaBenzina - prezzi carburante",
    short_name: "TrovaBenzina",
    description: "Trova i distributori più economici e confronta i prezzi di benzina, diesel, GPL e metano in Italia.",
    lang: "it",
    start_url: withBasePath("/"),
    scope: withBasePath("/"),
    display: "standalone",
    background_color: "#fbfaf6",
    theme_color: "#165a67",
    categories: ["travel", "navigation", "utilities"],
    icons: [
      { src: withBasePath("/icon.png"), sizes: "192x192", type: "image/png" },
      { src: withBasePath("/brand/trovabenzina-mark.svg"), sizes: "any", type: "image/svg+xml" }
    ],
    shortcuts: [
      { name: "Mappa distributori", short_name: "Mappa", url: withBasePath("/mappa/") }
    ]
  };
}
