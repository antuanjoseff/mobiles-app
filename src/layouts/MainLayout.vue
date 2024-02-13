<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <div v-if="position">
            <div v-if="position.altitude">
              {{ parseInt(position.altitude) }}m
            </div>
          </div>
          <div v-if="msg">
            {{ msg }}
          </div>
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>
        <div @click="toggleTracking">Toggle Tracking</div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <TheMap></TheMap>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useAppStore } from "../stores/appStore.js";
import { computed, defineComponent, ref, onMounted } from "vue";
import TheMap from "components/TheMap.vue";
import { Capacitor } from "@capacitor/core";
import { BatteryOptimization } from "@capawesome-team/capacitor-android-battery-optimization";
import { ForegroundService } from "@capawesome-team/capacitor-android-foreground-service";

export default defineComponent({
  name: "MainLayout",

  components: {
    TheMap,
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const appStore = useAppStore();

    const msg = computed(() => {
      return appStore.getMsg;
    });

    const position = computed(() => {
      return appStore.getPosition;
    });

    const toggleTracking = () => {
      appStore.setTracking(!appStore.getTracking);
    };

    onMounted(async () => {
      const isBatteryOptimizationEnabled = async () => {
        if (Capacitor.getPlatform() !== "android") {
          return false;
        }
        const { enabled } =
          await BatteryOptimization.isBatteryOptimizationEnabled();
        return enabled;
      };

      const openBatteryOptimizationSettings = async () => {
        if (Capacitor.getPlatform() !== "android") {
          return;
        }
        await BatteryOptimization.openBatteryOptimizationSettings();
      };

      const requestIgnoreBatteryOptimization = async () => {
        if (Capacitor.getPlatform() !== "android") {
          return;
        }
        await BatteryOptimization.requestIgnoreBatteryOptimization();
      };

      // if (await isBatteryOptimizationEnabled()) {
      //   openBatteryOptimizationSettings();
      // }

      const startForegroundService = async () => {
        if (Capacitor.getPlatform() !== "android") {
          return false;
        }
        await ForegroundService.startForegroundService();
      };

      const stopForegroundService = async () => {
        if (Capacitor.getPlatform() !== "android") {
          return false;
        }
        await ForegroundService.stopForegroundService();
      };

      startForegroundService("hola", "mundo");
    });

    return {
      toggleTracking,
      msg,
      position,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
