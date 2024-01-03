<script setup>
import { ref } from 'vue';
import L from 'leaflet'

const showModal = ref(false);
const latSelected = ref(null);
const lngSelected = ref(null);

function toggleModal() {
    showModal.value = !showModal.value;
    setTimeout(() => {
        const mapElement = document.getElementById('map_canvas')

        const map = L.map(mapElement, {
            center: [16.405950364340057, 480.5919456481934],
            zoom: 15
        });

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        let marker = L.marker([16.405950364340057, 480.5919456481934]).addTo(map);

        map.on('click', function(e) {
            let lat = e.latlng.lat;
            let lng = e.latlng.lng;

            // Do something with lat and lng, like displaying them or sending them to a server.
            console.log("Clicked at: ", lat, ",", lng);
            marker.setLatLng([lat, lng])
            latSelected.value = lat;
            lngSelected.value = lng;
        });
    }, 1000);
}

function selectLatLong() {
    emit('selected', { latitude: latSelected.value, longitude: lngSelected.value });
    showModal.value = false;
}

const emit = defineEmits(['selected']);

defineExpose({
    toggleModal
});
</script>

<template>
    <Dialog v-model:visible="showModal"
            header="Set Mark"
            :style="{ width: '80rem' }" modal>
        <div>
            <div v-if="showModal" id="map_canvas"></div>
        </div>
        <div class="flex mt-3 justify-content-end gap-2">
            <Button @click="selectLatLong()" severity="primary">Select</Button>
            <Button @click="showModal = false" severity="secondary">Close</Button>
        </div>
    </Dialog>
</template>

<style lang="scss" scoped>
#map_canvas { height: 70vh; }
</style>