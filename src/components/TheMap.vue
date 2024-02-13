<template>
  <div class="map-wrap">
    <div id="myMap" class="map" ref="mapContainer"></div>
  </div>
</template>

<script>
import { Map, NavigationControl } from "maplibre-gl";
import {
  ref,
  watch,
  computed,
  shallowRef,
  onMounted,
  markRaw,
  onBeforeUnmount,
} from "vue";
import { registerPlugin } from "@capacitor/core";
import { useAppStore } from "../stores/appStore.js";
import { Capacitor } from "@capacitor/core";
import { GPS } from "../classes/GPS";
import { Track } from "../classes/Track";
import { centerMap, setDataLocation } from "../lib/map-utils.js";
import "maplibre-gl/dist/maplibre-gl.css";

export default {
  name: "TheMap",

  setup(props, context) {
    const appStore = useAppStore();
    const map = shallowRef(null);
    const timeGap = 1500;

    const tracking = computed(() => {
      return appStore.getTracking;
    });

    const position = ref();
    // const position = computed(() => {
    //   return appStore.getPosition;
    // });

    onBeforeUnmount(() => {
      // we do cleanup
      // Geolocation.clearWatch(geoId);
    });

    onMounted(async () => {
      //   const apiKey = 'YOUR_MAPTILER_API_KEY_HERE';
      // const initialState = { lng: -70.11617, lat: 43.6844, zoom: 14 };
      const style = {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap Contributors",
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm", // This must match the source key above
          },
        ],
      };

      map.value = markRaw(
        new Map({
          container: "myMap",
          renderWorldCopies: false,
          // style: "estils_mapa_base.json",
          style: style,
          center: [2.8, 41.95],
          zoom: 14,
          maxZoom: 22,
        })
      );

      let nav = new NavigationControl();

      const track = new Track();
      map.value.once("load", async () => {
        const myLocation = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [2.8, 41.95],
          },
          properties: {
            name: "My position",
          },
        };

        // add it to the map
        map.value.addControl(nav, "top-left");
        map.value.addSource("trace", { type: "geojson", data: myLocation });
        map.value.addSource("track", { type: "geojson", data: track.geojson });

        map.value.addLayer({
          id: "trace",
          type: "circle",
          source: "trace",
          paint: {
            "circle-radius": 8,
            "circle-color": "#B42222",
          },
        });

        map.value.addLayer({
          id: "track",
          source: "track",
          type: "line",
          paint: {
            "line-color": "orange",
            "line-width": 2,
          },
        });

        let options = {
          maximumAge: 3000,
          timeout: 10000,
          enableHighAccuracy: false,
        };

        // navigator.permissions.query({ name: "geolocation" }).then(console.log);
        let loop = 0;
        const processTracking = async () => {
          let coords;
          if (tracking.value) {
            console.log("in tracking " + tracking.value);
            const newPosition = await gps.getCurrentPosition();
            if (tracking.value && newPosition !== undefined) {
              position.value = newPosition;
              coords = newPosition.coords;
              appStore.setPosition({
                altitude: coords.altitude,
                accuracy: coords.accuracy,
                latitude: coords.latitude,
                longitude: coords.longitude,
              });

              const data = setDataLocation(coords);
              map.value.getSource("trace").setData(data);
              centerMap(map, coords);
              if (loop < 1) {
                loop += 1;
                setTimeout(processTracking, timeGap);
              }
            }
            // setTimeout(processTracking, timeGap);
          }
        };

        // GPS SETTINGS
        // const gps = new GPS();
        // if (Capacitor.isNativePlatform()) {
        //   console.log(Capacitor.getPlatform());
        //   await gps.checkPermission();
        //   if (!gps.gpsEnabled) {
        //     if (confirm("Need to activate the GPS")) {
        //       await gps.openSettings();
        //     }
        //   }
        //   appStore.setMsg(gps.permissionStatus.location);
        //   if (gps.permissionStatus.location != "granted") {
        //     return;
        //   } else {
        //     processTracking();
        //   }
        // } else {
        //   processTracking();
        // }

        // watch(tracking, (cur, old) => {
        //   console.log(cur);
        //   if (cur) {
        //     processTracking();
        //   }
        // });
      });

      if (!Capacitor.isNativePlatform()) {
        return;
      }

      const BackgroundGeolocation = registerPlugin("BackgroundGeolocation");

      BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: "Cancel to prevent battery drain.",
          backgroundTitle: "Tracking You.",
          requestPermissions: true,
          stale: false,
          distanceFilter: 10,
        },
        function callback(location, error) {
          if (error) {
            console.log(error);
            if (error.code === "NOT_AUTHORIZED") {
              if (
                window.confirm(
                  "This app needs your location, " +
                    "but does not have permission.\n\n" +
                    "Open settings now?"
                )
              ) {
                // It can be useful to direct the user to their device's
                // settings when location permissions have been denied. The
                // plugin provides the 'openSettings' method to do exactly
                // this.
                // BackgroundGeolocation.openSettings();
                const gps = new GPS();
                gps.openBatterySettings();
                gps.openSettings();
              }
            }

            return console.error(error);
          }
          console.log(location);
          track.addCoords(location);
          // map.value.getSource("track").setData(track.geojson);

          const data = setDataLocation(location.longitude, location.latitude);

          map.value.getSource("trace").setData(data);
          centerMap(map, location.longitude, location.latitude);

          return console.log(location);
        }
      ).then(function after_the_watcher_has_been_added(watcher_id) {
        // When a watcher is no longer needed, it should be removed by calling
        // 'removeWatcher' with an object containing its ID.
        // BackgroundGeolocation.removeWatcher({
        //   id: watcher_id,
        // });
      });
    });

    return {
      map,
      tracking,
    };
  },
};
</script>
<style>
.map,
.map-wrap {
  width: 100%;
  height: 100vh;
}
</style>
