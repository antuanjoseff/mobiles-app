<template>
  <div>
    GPS position:
    <div v-if="!position.coords">Determining...</div>
    <div v-else>
      <strong> {{ position.coords.latitude }} </strong>
      <strong> {{ position.coords.longitude }} </strong>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Geolocation } from "@capacitor/geolocation";

export default {
  setup() {
    const position = ref("determining...");

    function getCurrentPosition() {
      Geolocation.getCurrentPosition().then((newPosition) => {
        console.log("Current", newPosition.coords.latitude);
        console.log("Current", newPosition.coords.longitude);
        position.value = newPosition;
      });
    }

    let geoId;

    onMounted(() => {
      getCurrentPosition();

      // we start listening
      geoId = Geolocation.watchPosition({}, (newPosition, err) => {
        console.log("New GPS position");
        position.value = newPosition;
      });
    });

    onBeforeUnmount(() => {
      // we do cleanup
      Geolocation.clearWatch(geoId);
    });

    return {
      position,
    };
  },
};
</script>
