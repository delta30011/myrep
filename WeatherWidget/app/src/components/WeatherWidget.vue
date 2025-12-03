<template>

  <div class="WeatherWidget rounded-borders q-pa-md">
    <h2>WeatherWidget</h2>
    <q-btn icon="settings" flat rounded dense class="absolute-top-right" @click="toggleSettings"/>
    <q-dialog v-model="settings" ref="dialog">
      <q-card>
        <q-card-section><h5 class="q-ma-none">Settings</h5>
        </q-card-section>
        <q-card-section>
          <DragList :items="places"/>
          <div class="row justify-between">
            <q-field class="flex" label="Add location">
              <q-input v-model="newPlace"/>
            </q-field>
            <q-btn @click="setNewPlace({title:newPlace}); newPlace=''" flat icon="keyboard_return"/>
          </div>
        </q-card-section>
        <q-btn icon="close" class="absolute-top-right" flat round dense v-close-popup @click="toggleSettings"/>
      </q-card>
    </q-dialog>
    <div class="placesList">
      <div v-for="(place, i) in places" :key="i">
        <strong>{{ place.name }}, {{ place.sys.country }}</strong>
        <div class="flex items-center">
          <span><img :src="'http://openweathermap.org/img/wn/'+place.weather[0]?.icon+'@2x.png'"
                     :title="place.weather[0].description"/></span>
          <h3 style="margin: 0">{{ place.main.temp }}</h3>
        </div>
        <div class="row">
          <div class="col-6">
            <p class="row"><small class="col">Feels like: {{ place.main.feels_like }}
              {{ place.weather[0].description }}</small></p>
            <p class="row">
              <small class="col">{{ place.wind.speed }}m/s {{ windDirections[place.wind.deg] }}</small>
              <small class="col"> {{ place.main.pressure }}hPa </small>
            </p>
            <p class="row">
              <small class="col">Humidity {{ place.main.humidity }}%</small>
              <small class="col"> Dew point: <sup>o</sup>C</small>
            </p>
            <p><small>Visibility {{ (place.visibility * 10 / 10000).toFixed(1) }}km</small></p>
            <small v-if="false">{{ place }}</small></div>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, watch} from 'vue';
import axios from 'axios';

import {defineStore} from 'pinia';

import DragList from "components/DragList.vue";

interface PlaceLocation {
  long?: string
  latt?: string
  title?: string
}

const useLocStore = defineStore('LocStore', {
  state: () => ({
    locations: [] as PlaceLocation[]
  }),

  actions: {
    updateLocations(items: []) {
      this.locations.length = 0;
      items.map((i: any) => {
        this.locations.push({title: i.title, long: i.coord.lon, latt: i.coord.lat})
      })
    },
    getLocations(location?: PlaceLocation) {
      return (location) ?
        this.locations.filter((i) => (i.long == location.long && i.latt == location.latt)) :
        this.locations;
    }
  },
  persist: true, // Enable persistence for this store
});

const locStore = useLocStore();

const places = ref<any[]>([]);
const windDirections = {
  0: 'N',
  45: 'NE',
  90: 'E',
  135: 'SE',
  180: 'S',
  225: 'SW',
  270: 'W',
  315: 'NW'
}

watch(places, (val, val2) => {
  locStore.updateLocations(val as []);
}, {deep: true})

const newPlace = ref('');

const settings = ref(false);

async function getData(location: PlaceLocation) {
  const {data} = await axios.get(``/* URL here */, {params:{...location}});
  return data;
}

async function setNewPlace(place: PlaceLocation) {

  const data = await getData(place);
  places.value.push({title: place.title || data.name, ...data});
}

function toggleSettings() {
  settings.value = !settings.value;
}

onMounted(async () => {
  const locations = locStore.getLocations();
  if (!locations.length) {
    navigator.geolocation.getCurrentPosition(
      async function (position) {
        const {latitude, longitude} = position.coords;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        setNewPlace({latt: `${latitude}`, long: `${longitude}`});
      },
      (e) => {
        console.log(e)
      }
    );

  } else {
    locations.map((place: PlaceLocation) => setNewPlace(place))
  }
})
</script>

<style lang="scss">
.WeatherWidget {
  max-width: 90vw;
  width: 500px;
  margin: 2em auto;
  position: relative;
  border: solid 1px;

  .placesList {
    & > div + div {
      margin-top: 3em;
      border-top: 1px solid;
      padding-top: 3em
    }
  }
}

.draggable {
  margin: 0;

  .q-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-width: 250px;
    gap: 10px;

    strong {
      margin: 0;
      line-height: 1;
      flex-grow: 1
    }

    .q-btn {
      padding: 0;

      .q-focus-helper {
        display: none !important;
      }
    }
  }
}
</style>
