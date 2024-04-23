<script setup>
import { onMounted, ref } from "vue";
import { supabaseClient } from "@/service/supabase/supabase";
import { useToast } from "primevue/usetoast";
import { Loading } from "notiflix";
import BookSlot from "@/components/ParkingSlot/BookSlot.vue";
import { useRouter } from "vue-router";
import { Report } from "notiflix";
import dayjs from "dayjs";
import customParseFormat from "dayjs/esm/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const router = useRouter();
const BookSlotRef = ref(null);
const toast = useToast();
const availableSlots = ref([]);
const availableParkingHours = ref({
    from: null,
    to: null,
});

const customTimeFormat = "HH:mm:ssZ";

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

async function getParkingHours() {
    Loading.standard("Fetching data...");

    const { data, error } = await supabaseClient.from("parking_hours").select().eq("id", 1).limit(1).single();

    Loading.remove();

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 2000 });
        return;
    }

    availableParkingHours.value = reduceParkingHours(data);
    oldData.value = JSON.parse(JSON.stringify(data));
}

/**
 * Checks if the current time is within the available parking hours.
 * @returns {boolean} True if the current time is within the available parking hours, false otherwise.
 */
function isValidParkingTime() {
    if (process.env.NODE_ENV === "development") {
        return true;
    }

    const { from, to } = availableParkingHours.value;
    const currentTime = dayjs();
    const fromTime = dayjs(from);
    const toTime = dayjs(to);

    return currentTime.isAfter(fromTime) && currentTime.isBefore(toTime);
}

/**
 * Reduces the parking hours data.
 * @param {{ from: string, to: string }} data - The parking hours data.
 * @returns {{ from: Date, to: Date }}
 */
function reduceParkingHours(data) {
    return {
        from: dayjs(data.from, customTimeFormat).toDate(),
        to: dayjs(data.to, customTimeFormat).toDate(),
    };
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
            if (!isValidParkingTime()) {
                Report.info(
                    "Parking is not available",
                    `Currently, we only allow parking between ${dayjs(availableParkingHours.value.from).format(
                        "hh:mm A",
                    )} and ${dayjs(availableParkingHours.value.to).format("hh:mm A")}.`,
                    "Ok",
                    {
                        titleMaxLength: 999,
                        plainText: false,
                    },
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
    await getParkingHours();
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
