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
          <div v-if="position.altitude">
            {{ position.altitude }}
          </div>

          <div v-if="position.accuracy">
            {{ position.accuracy }}
          </div>
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <TheMap></TheMap>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useAppStore } from "../stores/appStore.js";
import { computed, defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import TheMap from "components/TheMap.vue";

const linksList = [
  {
    title: "Docs",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
  {
    title: "Github",
    caption: "github.com/quasarframework",
    icon: "code",
    link: "https://github.com/quasarframework",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
    TheMap,
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const appStore = useAppStore();
    const position = computed(() => {
      return appStore.getPosition;
    });

    return {
      essentialLinks: linksList,
      position,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
