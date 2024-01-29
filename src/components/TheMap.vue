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
import { Geolocation } from "@capacitor/geolocation";
import { useAppStore } from "../stores/appStore.js";
import {
  NativeSettings,
  IOSSettings,
  AndroidSettings,
} from "capacitor-native-settings";
import { Capacitor } from "@capacitor/core";
export default {
  name: "TheMap",

  setup(props, context) {
    const appStore = useAppStore();
    const map = shallowRef(null);

    let geoId;

    const position = computed(() => {
      return appStore.getPosition;
    });

    onBeforeUnmount(() => {
      // we do cleanup
      Geolocation.clearWatch(geoId);
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
          center: [2.18, 41.15],
          zoom: 18,
          maxZoom: 22,
        })
      );

      var tilesUrl = process.env.DEV
        ? "http://localhost:9000/countries/{z}/{x}/{y}.pbf"
        : "https://mapscloud.udg.edu/tesis/countries/{z}/{x}/{y}.pbf";

      map.value.once("load", async () => {
        const myLocation = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [2.18, 42.15],
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

        // GPS SETTINGS
        async function getCurrentPosition() {
          try {
            const permissionStatus = await Geolocation.checkPermissions();
            console.log("Permission status " + permissionStatusStatus.location);
            if (permissionStatus.location != "granted") {
              const requestStatus = await Geolocation.requestPermissions();
              if (requestStatus.location != "granted") {
                // go to location settings
                await openSettings(true);
                return;
              }
            }

            // if (Capacitor.getPlatform() == "android") {
            //   this.enableGps;
            // }

            let options = {
              maximumAge: 3000,
              timeout: 10000,
              enableHighAccuracy: false,
            };

            const position = await Geolocation.getCurrentPosition(options);
          } catch (e) {
            if (e.message) console.log(e.message);
            await openSettings();
          }
          // Geolocation.getCurrentPosition().then((newPosition) => {
          //   position.value = newPosition;
          // });
        }

        function openSettings(app = false) {
          console.log("Open settings ...");
          return NativeSettings.open({
            optionAndroid: app
              ? AndroidSettings.ApplicationDetails
              : AndroidSettings.Location,
            optionIOS: app ? IOSSettings.App : IOSSettings.LocationServices,
          });
        }

        //         async function enableGps () {
        // const canRequest = await locationAA
        //         }

        // we start listening
        geoId = Geolocation.watchPosition({}, (newPosition, err) => {
          position.value = newPosition;
          console.log(newPosition);
          appStore.setPosition({
            altitude: newPosition.coords.altitude,
            accuracy: newPosition.coords.accuracy,
            latitude: newPosition.coords.latitude,
            longitude: newPosition.coords.longitude,
          });
        });

        watch(position, (cur, old) => {
          if (map.value) {
            let data = {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [cur.longitude, cur.latitude],
              },
            };

            map.value.getSource("trace").setData(data);
            map.value.setCenter([cur.longitude, cur.latitude]);
          }
        });
      });
    });

    return {
      map,
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
