<template>
  <b-modal
    id="welcome-modal"
    title="👋 Hoş Geldiniz!"
    hide-footer
    centered
    size="md"
  >
    <p class="my-3">
      Merhaba <strong>{{ user?.name || 'Kullanıcı' }}</strong>, <br />
      Salon Yöneticisi Paneli'ne hoş geldiniz. Buradan salonlarınıza ait toplantıları yönetebilirsiniz.
    </p>
  </b-modal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'WelcomeModal',
  computed: {
    ...mapGetters('auth', ['user'])
  }
};
</script>
