<script setup>
import { ref } from 'vue';

const showModal = ref(false);
const latSelected = ref(0.00);
const lngSelected = ref(0.00);

function toggleModal(lat, lng) {
    latSelected.value = lat ?? 16.405950364340057;
    lngSelected.value = lng ?? 120.59147320190415;
    showModal.value = !showModal.value;
    setTimeout(() => {
        setMap();
    }, 1000);
}

function setMap() {
    const defaultCenter = { lat: Number(latSelected.value), lng: Number(lngSelected.value) };

    const map = new google.maps.Map(document.getElementById('map_canvas'), {
        zoom: 17, // Initial zoom level
        center: defaultCenter,
        mapTypeControl: true
    });

    // Disable default UI elements
    map.setOptions({
        disableDefaultUI: true
    });

    // Hide POI markers (optional)
    map.data.setStyle({
        visible: false
    });

    const marker = new google.maps.Marker({
        position: defaultCenter, // Marker position
        map: map // Attach the marker to the map
    });

    map.addListener('click', function(e) {
        const latLng = e.latLng;
        const lat = latLng.lat();
        const lng = latLng.lng();
        marker.setPosition({ lat, lng });
        latSelected.value = lat;
        lngSelected.value = lng;
    });
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
            :style="{ width: '80rem' }"
            header="Select Parking Slot Lat & Long" modal>
        <div>
            <div v-if="showModal" id="map_canvas"></div>
        </div>
        <div class="flex mt-3 justify-content-end gap-2">
            <Button severity="primary" @click="selectLatLong()">Select</Button>
            <Button severity="secondary" @click="showModal = false">Close</Button>
        </div>
    </Dialog>
</template>

<style lang="scss" scoped>
#map_canvas {
    height: 70vh;
}
</style>