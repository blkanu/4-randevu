<template>
  <b-card class="add-card mb-3 shadow-sm border-left-right-subu">
    <b-form @submit.prevent="handleSubmit" class="w-100">
      <b-row class="align-items-end no-gutters">
        <!-- Tarih -->
        <b-col cols="12" md="3" class="pr-md-2 mb-2 mb-md-0">
          <label class="form-label">Tarih</label>
          <b-form-datepicker
            v-model="form.date"
            :hide-header="true"
            locale="tr"
            class="w-100"
            required
          />
        </b-col>

        <!-- Açıklama -->
        <b-col cols="12" md="7" class="px-md-2 mb-2 mb-md-0">
          <label class="form-label">Açıklama</label>
          <b-input-group size="sm" class="input-elevated">
            <b-input-group-prepend is-text>
              <b-icon icon="calendar2-event" />
            </b-input-group-prepend>
            <b-form-input
              v-model.trim="form.description"
              placeholder="Örn: Cumhuriyet Bayramı"
              maxlength="120"
              required
            />
          </b-input-group>
        </b-col>

        <!-- Ekle Butonu -->
        <b-col cols="12" md="2" class="pl-md-2">
          <label class="form-label d-none d-md-block">&nbsp;</label>
          <b-button block variant="subu" type="submit">
            <b-icon icon="plus-circle" class="mr-1" /> Ekle
          </b-button>
        </b-col>
      </b-row>

      <small class="text-muted d-block mt-2">
        Aynı tarih yalnızca bir kez eklenebilir. Eklendiğinde o gün toplantı planlanamaz.
      </small>
    </b-form>
  </b-card>
</template>

<script>
export default {
  name: "NewAddSpecialDay",
  data() {
    return {
      form: {
        date: null,
        description: ""
      }
    };
  },
  methods: {
    handleSubmit() {
      this.$emit("submit", { ...this.form });
    }
  }
};
</script>

<style scoped lang="scss">
.add-card {
  border-radius: 14px;
  background: #ffffff;
  padding: 0.85rem 1rem 0.75rem 1rem;
}
.form-label {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}
.input-elevated {
  border-radius: 12px;
  overflow: hidden;

  .input-group-text {
    background: #f6f9fc;
    border: 1px solid #e6edf3;
  }

  .form-control,
  .custom-select {
    border: 1px solid #e6edf3;
    background: #fff;
  }
}
.border-left-right-subu {
  border-left: 5px solid #0093d1 !important;
  border-right: 5px solid #0093d1 !important;
}
.btn-subu,
.btn-subu:hover {
  background-color: #0093d1;
  border-color: #0093d1;
  color: #fff;
}
.no-gutters {
  margin-left: 0;
  margin-right: 0;

  > [class^="col-"],
  > [class*=" col-"] {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
}
</style>
