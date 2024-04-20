<script setup>
import { onMounted, ref } from "vue";
import { supabaseClient } from "@/service/supabase/supabase";
import { useToast } from "primevue/usetoast";
import { Loading } from "notiflix";
import BookSlot from "@/components/ParkingSlot/BookSlot.vue";
import { useRouter } from "vue-router";
import { Report } from "notiflix";
import dayjs from "dayjs";

const router = useRouter();
const BookSlotRef = ref(null);
const toast = useToast();
const availableSlots = ref([]);

async function getAvailableParkingSlots() {
    Loading.standard("loading parking slots...");
    const { data, error } = await supabaseClient.from("parking_slot").select().eq("status", "available").limit(1000);
    Loading.remove();

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 6000 });
        return;
    }

    availableSlots.value = data;
    setMap();
}

function setMap() {
    const map = new google.maps.Map(document.getElementById("map_canvas"), {
        zoom: 13, // Initial zoom level
        center: { lat: 16.412115179298162, lng: 120.59332392612443 },
        mapTypeControl: true,
    });

    // Disable default UI elements
    map.setOptions({
        disableDefaultUI: true,
    });

    // Hide POI markers (optional)
    map.data.setStyle({
        visible: false,
    });

    availableSlots.value.forEach((slot) => {
        // add markers
        const marker = new google.maps.Marker({
            title: `${slot.area}, ${slot.street} - ${slot.status}`,
            position: { lat: Number(slot.latitude), lng: Number(slot.longitude) },
            map,
            icon: {
                url: "https://i.imgur.com/DSmnYUj.png",
                scaledSize: new google.maps.Size(40, 50), // Displayed size
            },
        });

        // add click event to each markers
        google.maps.event.addListener(marker, "click", () => {
            // check if time is greater than 7am and less than 7pm
            if (dayjs().hour() < 7 || dayjs().hour() > 19) {
                Report.info(
                    "Currently, parking is not available.",
                    "Currently, parking is not available. <b>We allow parking between 7am and 7pm. </b>",
                    "Ok",
                    {
                        titleMaxLength: 999,
                        plainText: false,
                    }
                );
                return;
            }

            BookSlotRef.value.toggleModal(JSON.parse(JSON.stringify(slot)));
        });
    });
}

function BookedSlot(data) {
    router.push("/my-bookings");
}

onMounted(async () => {
    await getAvailableParkingSlots();
});
</script>

<template>
    <div>
        <BookSlot ref="BookSlotRef" @booked="BookedSlot" />
        <div id="map_canvas"></div>
    </div>
</template>

<style lang="scss" scoped>
#map_canvas {
    height: 70vh;
}
</style>
