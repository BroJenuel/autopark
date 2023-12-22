<script setup>
import { onMounted, ref } from 'vue';
// import { CustomerService } from '@/service/CustomerService';

onMounted(() => {
    // loading.value = true;

    lazyParams.value = {
        first: dt.value.first,
        rows: dt.value.rows,
        sortField: null,
        sortOrder: null,
        filters: filters.value
    };

    loadLazyData();
});

const dt = ref();
const loading = ref(false);
const totalRecords = ref(0);
const customers = ref();
const selectedCustomers = ref();
const selectAll = ref(false);
const first = ref(0);
const filters = ref({
    'name': { value: '', matchMode: 'contains' },
    'country.name': { value: '', matchMode: 'contains' },
    'company': { value: '', matchMode: 'contains' },
    'representative.name': { value: '', matchMode: 'contains' }
});
const lazyParams = ref({});
const columns = ref([
    { field: 'name', header: 'Name' },
    { field: 'country.name', header: 'Country' },
    { field: 'company', header: 'Company' },
    { field: 'representative.name', header: 'Representative' }
]);

const loadLazyData = (event) => {
    // loading.value = true;
    lazyParams.value = { ...lazyParams.value, first: event?.first || first.value };

    // CustomerService.getCustomers({ lazyEvent: JSON.stringify(lazyParams.value) }).then((data) => {
    //     customers.value = data.customers;
    //     totalRecords.value = data.totalRecords;
    //     loading.value = false;
    // });
};
const onPage = (event) => {
    lazyParams.value = event;
    loadLazyData(event);
};
const onSort = (event) => {
    lazyParams.value = event;
    loadLazyData(event);
};
const onFilter = (event) => {
    lazyParams.value.filters = filters.value;
    loadLazyData(event);
};
const onSelectAllChange = (event) => {
    selectAll.value = event.checked;

    if (selectAll) {
        // CustomerService.getCustomers().then(data => {
        //     selectAll.value = true;
        //     selectedCustomers.value = data.customers;
        // });
    } else {
        selectAll.value = false;
        selectedCustomers.value = [];
    }
};
const onRowSelect = () => {
    selectAll.value = selectedCustomers.value.length === totalRecords.value;
};
const onRowUnselect = () => {
    selectAll.value = false;
};

</script>


<template>
    <DataTable ref="dt" v-model:filters="filters" v-model:selection="selectedCustomers" :first="first"
               :globalFilterFields="['name','country.name', 'company', 'representative.name']" :loading="loading"
               :rows="10"
               :selectAll="selectAll"
               :totalRecords="totalRecords" :value="customers" dataKey="id" filterDisplay="row"
               lazy paginator
               tableStyle="min-width: 75rem"
               @filter="onFilter($event)" @page="onPage($event)" @sort="onSort($event)"
               @select-all-change="onSelectAllChange" @row-select="onRowSelect" @row-unselect="onRowUnselect">
        <Column headerStyle="width: 3rem" selectionMode="multiple"></Column>
        <Column field="name" filterMatchMode="startsWith" header="Name" sortable>
            <template #filter="{filterModel,filterCallback}">
                <InputText v-model="filterModel.value" class="p-column-filter" placeholder="Search"
                           type="text" @keydown.enter="filterCallback()" />
            </template>
        </Column>
        <Column field="country.name" filterField="country.name" filterMatchMode="contains" header="Country"
                sortable>
            <template #body="{ data }">
                <div class="flex align-items-center gap-2">
                    <img :class="`flag flag-${data.country.code}`" alt="flag"
                         src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png"
                         style="width: 24px" />
                    <span>{{ data.country.name }}</span>
                </div>
            </template>
            <template #filter="{filterModel,filterCallback}">
                <InputText v-model="filterModel.value" class="p-column-filter" placeholder="Search"
                           type="text" @keydown.enter="filterCallback()" />
            </template>
        </Column>
        <Column field="company" filterMatchMode="contains" header="Company" sortable>
            <template #filter="{filterModel,filterCallback}">
                <InputText v-model="filterModel.value" class="p-column-filter" placeholder="Search"
                           type="text" @keydown.enter="filterCallback()" />
            </template>
        </Column>
        <Column field="representative.name" filterField="representative.name" header="Representative" sortable>
            <template #body="{ data }">
                <div class="flex align-items-center gap-2">
                    <img :alt="data.representative.name"
                         :src="`https://primefaces.org/cdn/primevue/images/avatar/${data.representative.image}`"
                         style="width: 32px" />
                    <span>{{ data.representative.name }}</span>
                </div>
            </template>
            <template #filter="{filterModel,filterCallback}">
                <InputText v-model="filterModel.value" class="p-column-filter" placeholder="Search"
                           type="text" @keydown.enter="filterCallback()" />
            </template>
        </Column>
    </DataTable>
</template>

