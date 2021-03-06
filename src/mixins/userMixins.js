export default {
  computed: {
    hasLoggedIn() {
      return this.$store.getters.hasLoggedIn
    },
    isMember() {
      return this.$store.getters.hasRole("member")
    },
    isFunder() {
      return this.isMember && this.$store.getters.hasRole("funder") || this.isModerator
    },
    isModerator() {
      return this.isMember && this.$store.getters.hasRole("moderator")
    },
    currentUser() {
      return this.$store.getters.getUser
    }
  },
  methods: {
    getProfileImageFromUser(user) {
      // Set url as placeholder
      let url
      if (!user || !user.profile_image) return require("@/assets/image/blank-profile.png")

      if (typeof user.profile_image === "string") {
        url = user.profile_image
      } else if (typeof user.profile_image.url === "string") {
        url = user.profile_image.url
      } else {
        url = user.profile_image.url()
      }

      return url
    }
  }
}