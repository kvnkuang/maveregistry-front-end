<template>
  <div>
    <!-- Header -->
    <div class="hero is-light">
      <div class="hero-body has-page-header-padding">
        <div class="container">
          <div class="level is-mobile">
            <div class="level-left">
              <div class="content">
                <p class="is-size-3 has-text-weight-medium">
                  Edit Team
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container has-fullheight has-top-padding has-touch-container-padding">
      <!-- Loading -->
      <b-loading
        :is-full-page="false"
        :active="isLoading.page"
      />

      <Error
        v-if="!isLoading.page && errorMessage !== ''"
        :message="errorMessage"
      />

      <div
        class="content"
        v-else-if="!isLoading.page && errorMessage === ''"
      >
        <ValidationObserver
          ref="observer"
          v-slot="{ passed }"
        >
          <div class="columns">
            <div class="column is-7">
              <div class="project-header">
                <p class="is-size-4 has-text-weight-bold">
                  People
                </p>
              </div>

              <div
                class="project-content"
                v-if="principalInvestigator"
              >
                <div class="columns">
                  <div class="column is-3">
                    <span class="is-size-5">
                      Principal Investigator (*)
                    </span>
                  </div>

                  <div class="column is-9">
                    <PIInfoField v-model="principalInvestigator" />
                  </div>
                </div>

                <div
                  class="columns"
                  v-if="members.length > 0"
                >
                  <div class="column is-3">
                    <span class="is-size-5">
                      Members
                    </span>
                  </div>

                  <div class="column is-9">
                    <figure
                      v-for="(member, id) in members"
                      :key="id"
                      class="image is-48x48 is-inline-block member-icons"
                    >
                      <router-link
                        :to="{ name: 'User Profile View', params: { username: member.member.username } }"
                        target="_blank"
                        class="is-capitalized"
                      >
                        <b-tooltip
                          :label="`${member.member.first_name} ${member.member.last_name}`"
                          type="is-dark"
                        >
                          <img
                            :src="getProfileImageFromUser(member.member)"
                            class="is-rounded"
                          >
                        </b-tooltip>
                      </router-link>
                      <button
                        class="delete right-corner"
                        @click="requestId = member.id; isConfirmDeleteModalActive = true"
                      />
                    </figure>
                  </div>
                </div> 
              </div>
            </div>

            <div class="column is-5">
              <b-notification :closable="false">
                <div class="content">
                  <b-icon
                    class="header-icon"
                    type="is-primary"
                    custom-size="mdil-48px"
                    icon="mdil-information"
                  />

                  <div class="field-margin">
                    <div class="has-text-white has-round-title has-background-primary is-inline-block">
                      <b-icon icon="mdil-lightbulb" />
                      About
                    </div>

                    <p>
                      <span v-if="creator">
                        <b-icon icon="mdil-account" />
                        Creator: 
                        <router-link
                          :to="{ name: 'User Profile View', params: { username: creator.username } }"
                          target="_blank"
                          class="is-capitalized"
                        >
                          {{ creator.first_name }} {{ creator.last_name }}
                        </router-link>
                      </span>
                      <br>

                      <b-icon icon="mdil-clock" />
                      Last Update Date: {{ updatedDate.toLocaleString() }}
                    </p>
                  </div>
                </div>
              </b-notification>
            </div>
          </div>

          <hr>

          <div class="columns">
            <div class="column is-4 is-offset-8">
              <b-button
                :disabled="!passed"
                expanded
                class="small-shadow"
                type="is-warning"
                size="is-medium"
                icon-left="mdil-content-save"
                :loading="isLoading.submit"
                @click="editTeam"
              >
                Edit Team
              </b-button>
            </div>
          </div>
        </ValidationObserver>
      </div>

      <!-- Confirm Delete Modal -->
      <ConfirmDangerModal
        :active.sync="isConfirmDeleteModalActive"
        type="member"
        action="remove"
        :on-action="removeMember"
      />
    </div>
  </div>
</template>

<script>
import * as TeamManage from "@/api/teamManage.js"
import PIInfoField from '@/components/Field/PIInfoField.vue'
import { handleError, displayErrorToast } from "@/api/errorHandler.js"
import { ValidationObserver } from 'vee-validate'
import ConfirmDangerModal from '@/components/Modal/ConfirmDangerModal.vue'

export default {
  title: "Edit Team",
  components: {
    PIInfoField,
    ValidationObserver,
    ConfirmDangerModal
  },
  data() {
    return {
      isLoading: {
        page: false,
        submit: false
      },
      isConfirmDeleteModalActive: false,
      requestId: "",
      errorMessage: "",
      principalInvestigator: undefined,
      members: [],
      creator: undefined,
      updatedDate: new Date(),
      hasInitLoad: false
    }
  },
  computed: {
    teamId() {
      return this.$route.params.id
    },
    isOwner() {
      return this.hasLoggedIn && this.creator && this.creator.username && this.$store.getters.isOwner(this.creator.username)
    }
  },
  watch: {
    async currentUser() {
      if (this.hasInitLoad) {
        await this.fetchTeam()

        if (!this.isOwner) this.$router.push({ name: 'Team View', params: { id: this.teamId } })
      }
    }
  },
  async mounted() {
    this.isLoading.page = true

    // Fetch team
    if (this.isAction('edit')) await this.fetchTeam()

    // If invalid action jump to view page
    if (!this.isAction('edit') || !this.isOwner) {
      this.$router.push({ name: 'Team View', params: { id: this.teamId } })
      return
    }

    this.hasInitLoad = true
    this.isLoading.page = false
  },
  methods: {
    async fetchTeam() {
      // Fetch team
      let team
      try {
        team = await TeamManage.queryById(this.teamId, true, false)
      } catch (error) {
        this.errorMessage = await handleError(error)
        return
      }
      
      // Format PI
      this.principalInvestigator = {
        first_name: team.first_name,
        last_name: team.last_name,
        email: team.email,
        affiliation: team.affiliation
      }
      if (team.website && team.website.length > 0) this.principalInvestigator.website = team.website

      // Format members
      if (team.members) this.members = team.members

      // Format creator and update date
      this.creator = team.creator
      this.updatedDate = team.update_date
      
      return team
    },
    async editTeam() {
      this.isLoading.submit = true

      try {
        await TeamManage.updateTeam(this.teamId, this.principalInvestigator)
      } catch (error) {
        await displayErrorToast(error)
        return
      } finally {
        this.isLoading.submit = false
      }

      // Jump to view
      this.$router.push({ name: 'Team View', params: { id: this.teamId } })
    },
    async removeMember() {
      this.isLoading.page = true

      await TeamManage.leaveTeam(this.requestId)
      this.members = this.members.filter(e => e.id !== this.requestId)
      
      this.isLoading.page = false
    }
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/style/variables.sass"

.header-icon
  position: absolute
  right: 1.25rem
.member-icons
  margin: 0.5rem 0 0 0 !important
  &:not(:first-of-type)
    margin-left: 0.25rem !important
  img
    width: 48px
    height: 48px
  .right-corner
    position: absolute
    right: -0.5rem
    &:hover
      background-color: $danger
</style>