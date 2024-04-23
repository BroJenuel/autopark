<script setup>
import { ref } from "vue";
import { isMobileNumberValid } from "@/utils/formValidator";

const showDialog = ref(false);
const paymentMethod = ref(null);
const paymentMethodData = ref({
    one_time_code: null,
    number: null,
});

function toggleDialog(PM) {
    paymentMethod.value = PM;
    showDialog.value = !showDialog.value;
}

defineExpose({
    toggleDialog,
});

defineEmits(["pay"]);
</script>

<template>
    <Dialog v-model:visible="showDialog" :style="{ width: '30rem', margin: '0 10px' }" header="Payment" modal>
        <Message severity="info">This is a payment simulation. You enter fake number and fake one time code.</Message>
        <div
            v-if="paymentMethod === 'gcash'"
            class="flex flex-column gap-3 justify-content-center align-items-center"
            style="margin-bottom: 30px"
        >
            <img alt="sdf" src="https://1000logos.net/wp-content/uploads/2023/05/GCash-Logo.png" width="200" />
            <div>
                <label>Enter GCash Number</label><br />
                <InputText v-model="paymentMethodData.number" :useGrouping="false" placeholder="ex. 09503277789" />
                <br />
                <Button :disabled="!isMobileNumberValid(paymentMethodData.number)" size="small" style="margin-top: 5px">
                    Send Code
                </Button>
            </div>
            <div>
                <label>Enter One Time Code</label><br />
                <InputText v-model="paymentMethodData.one_time_code" maxlength="4" placeholder="ex. 1234" />
            </div>

            <div class="flex justify-content-center">
                <Button :disabled="!paymentMethodData.one_time_code" @click="$emit('pay', paymentMethodData)"
                    >PAY</Button
                >
            </div>
        </div>

        <div
            v-if="paymentMethod === 'maya'"
            class="flex flex-column gap-3 justify-content-center align-items-center"
            style="margin-bottom: 30px"
        >
            <img alt="sdf" src="https://www.rankthemag.ph/wp-content/uploads/2022/05/Maya2-700x283.jpg" width="200" />
            <div>
                <label>Enter Maya Number</label><br />
                <InputText v-model="paymentMethodData.number" :useGrouping="false" placeholder="ex. 09503277789" />
                <br />
                <Button :disabled="!isMobileNumberValid(paymentMethodData.number)" size="small" style="margin-top: 5px">
                    Send Code
                </Button>
            </div>
            <div>
                <label>Enter One Time Code</label><br />
                <InputText v-model="paymentMethodData.one_time_code" maxlength="4" placeholder="ex. 1234" />
            </div>

            <div class="flex justify-content-center">
                <Button :disabled="!paymentMethodData.one_time_code" @click="$emit('pay', paymentMethodData)"
                    >PAY</Button
                >
            </div>
        </div>

        <div
            v-if="paymentMethod === 'cod'"
            class="flex flex-column gap-3 justify-content-center align-items-center"
            style="margin-bottom: 30px"
        >
            <img
                alt="sdf"
                src="https://www.pngitem.com/pimgs/m/291-2912475_vector-illustration-of-hand-offers-payment-cash-dollar.png"
                width="200"
            />

            <Message severity="warn">
                If you choose Cash on Hand, the slot will be reserved for 15 minutes. If you have not arrived after the
                time limit, the slot will be available for others to reserve.
            </Message>

            <div class="flex justify-content-center">
                <Button @click="$emit('pay', paymentMethodData)">Proceed</Button>
            </div>
        </div>
    </Dialog>
</template>

<style lang="scss" scoped></style>
