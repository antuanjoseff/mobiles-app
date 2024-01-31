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

import { useAppStore } from "../stores/appStore.js";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";
import { GPS } from "../classes/GPS";
import { centerMap, setDataLocation } from "../lib/map-utils.js";

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
        map.value.addSource("trace", { type: "geojson", data: myLocation });

        map.value.addLayer({
          id: "trace",
          type: "circle",
          source: "trace",
          paint: {
            "circle-radius": 8,
            "circle-color": "#B42222",
          },
        });

        let options = {
          maximumAge: 3000,
          timeout: 10000,
          enableHighAccuracy: false,
        };
        // Geolocation.getCurrentPosition(options).then((newPosition) => {
        //   console.log("Current", newPosition);
        //   position.value = newPosition;
        // });

        // navigator.permissions.query({ name: "geolocation" }).then(console.log);

        const processTracking = async () => {
          let coords;
          if (tracking.value) {
            console.log("in tracking " + tracking.value);
            const newPosition = await gps.getCurrentPosition();
            if (tracking.value && newPosition !== undefined) {
              console.log(newPosition);
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
              setTimeout(processTracking, timeGap);
            }
            // setTimeout(processTracking, timeGap);
          }
        };

        // GPS SETTINGS
        const gps = new GPS();
        if (Capacitor.isNativePlatform()) {
          // do something
          await gps.checkPermission();

          appStore.setMsg(gps.permissionStatus.location);
          if (gps.permissionStatus.location != "granted") {
            alert("Permission not granted");
            return;
          } else {
            processTracking();
          }
        } else {
          processTracking();
        }

        watch(tracking, (cur, old) => {
          console.log(cur);
          if (cur) {
            processTracking();
          }
        });
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
