<template> 
  <div class="participant-select">

    <!-- Arama Girişi -->
    <b-form-input
      v-model="search"
      placeholder="Ad veya e-posta ile ara"
      @input="filterUsers"
      class="mb-2"
    />

    <!-- Kullanıcı Seçim Listesi -->
    <b-list-group v-if="filteredUsers.length">
      <b-list-group-item
        v-for="user in filteredUsers"
        :key="user.email"
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

    <!-- Seçilen Katılımcılar -->
    <div class="selected mt-3">
      <label class="text-subu font-weight-bold mb-1">Seçilenler</label>
      <div class="d-flex flex-wrap">
        <b-badge
          v-for="user in selectedUsers"
          :key="user.email"
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
export default {
  name: "ParticipantSelector",
  data() {
    return {
      search: "",
      selectedUsers: [],
      filteredUsers: [],
      allUsers: [
        { name: "Ahmet Yılmaz", email: "ahmet@subu.edu.tr" },
        { name: "Ayşe Demir", email: "ayse@subu.edu.tr" },
        { name: "Mehmet Kaya", email: "mehmet@subu.edu.tr" },
        { name: "Zeynep Gül", email: "zeynep@subu.edu.tr" },
        { name: "Ali Can", email: "ali@subu.edu.tr" },
        { name: "Mücahit Arslan ", email: "mucahit@subu.edu.tr" },
        { name: "Ubeyd Balkan", email: "ubeyd@subu.edu.tr" },
        // İleride API'den alınacak
      ],
    };
  },
  methods: {
    filterUsers() {
      const term = this.search.toLowerCase();
      this.filteredUsers = this.allUsers
        .filter(
          (u) =>
            u.name.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term)
        )
        .filter((u) => !this.selectedUsers.some(sel => sel.email === u.email));
    },
    selectUser(user) {
      if (!this.selectedUsers.some(u => u.email === user.email)) {
        this.selectedUsers.push(user);
        this.search = "";
        this.filteredUsers = [];
        this.emitSelection();
      }
    },
    removeUser(user) {
      this.selectedUsers = this.selectedUsers.filter(
        (u) => u.email !== user.email
      );
      this.emitSelection();
    },
    emitSelection() {
      this.$emit("update-participants", this.selectedUsers);
    },
  },
};
</script>

<style scoped>
.text-subu {
  color: #002855;
}
.cursor-pointer {
  cursor: pointer;
}
.list-hover:hover {
  background-color: #f1f5f9;
}
</style>
