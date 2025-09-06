<template>
  <div class="participant-select">
    <b-form-input
      v-model="search"
      placeholder="Ad veya e-posta ile ara"
      @input="filterUsers"
      class="mb-2"
    />
    <b-list-group v-if="filteredUsers.length">
      <b-list-group-item
        v-for="user in filteredUsers"
        :key="user.id"
        button
        @click="selectUser(user)"
        class="d-flex justify-content-between align-items-center list-hover"
      >
        <div>
          <strong>{{ user.name }}</strong>
          <div class="text-muted small">{{ user.email }}</div>
        </div>
        <b-icon icon="plus-circle" />
      </b-list-group-item>
    </b-list-group>

    <div class="selected mt-3">
      <label class="text-subu font-weight-bold mb-1">Seçilenler</label>
      <div class="d-flex flex-wrap">
        <b-badge
          v-for="user in selectedUsers"
          :key="user.id"
          variant="primary"
          class="m-1 p-2 rounded-pill"
          style="color: #fff; background-color: #0093D1;"
        >
          {{ user.name }}
          <b-icon
            icon="x-circle-fill"
            class="ml-1 cursor-pointer"
            @click="removeUser(user)"
          />
        </b-badge>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "ParticipantSelector",
  data() {
    return {
      search: "",
      selectedUsers: [],
      filteredUsers: [],
    };
  },
  computed: {
    ...mapGetters("users", ["allUsers"]),
  },
  methods: {
    filterUsers() {
      const term = this.search.toLowerCase().trim();
      this.filteredUsers = this.allUsers
        .filter(u =>
          u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
        )
        .filter(u => !this.selectedUsers.some(sel => sel.id === u.id));
    },
    selectUser(user) {
      if (!this.selectedUsers.some(u => u.id === user.id)) {
        this.selectedUsers.push(user);
        this.search = "";
        this.filteredUsers = [];
        this.emitSelection();
      }
    },
    removeUser(user) {
      this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
      this.emitSelection();
    },
    emitSelection() {
      this.$emit("update-participants", this.selectedUsers);
    },
  },
};
</script>

<style scoped>
.text-subu { color: #002855; }
.cursor-pointer { cursor: pointer; }
.list-hover:hover { background-color: #f1f5f9; }
</style>
