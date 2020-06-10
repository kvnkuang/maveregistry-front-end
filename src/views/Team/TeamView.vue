<template>
  <div>
    <!-- Header -->
    <div class="hero is-light is-bold">
      <div class="hero-body has-page-header-padding">
        <div class="container">
          <div class="level is-mobile">
            <div class="level-left">
              <div class="content">
                <p class="is-size-3 has-text-weight-medium">
                  View Team
                </p>
              </div>
            </div>
            <!-- Show edit button if current user is the project creator -->
            <div
              class="level-right"
              v-if="isOwner"
            >
              <!-- Edit project -->
              <b-button
                icon-left="mdil-pencil"
                type="is-primary"
                size="is-medium"
              >
                Edit
              </b-button>
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
        <div class="columns">
          <div
            class="column is-6"
          >
            <div class="project-header">
              <p class="is-size-4 has-text-weight-bold">
                People
              </p>
            </div>

            <div class="project-content">
              <p
                class="is-size-5"
                v-if="principalInvestigator"
              >
                <b>Principal Investigator</b> <br>
                <!-- Email -->
                <a
                  v-if="principalInvestigator.email"
                  :href="'mailto:' + principalInvestigator.email"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <b-icon icon="mdil-email" />
                </a>

                <!-- Website -->
                <a
                  v-if="principalInvestigator.website"
                  :href="principalInvestigator.website"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <b-icon icon="mdil-link" />
                </a>

                <span class="is-capitalized">{{ principalInvestigator.first_name + " " + principalInvestigator.last_name }},</span>
                {{ principalInvestigator.affiliation }}
              </p>

              <p
                class="is-size-5"
                v-if="principalInvestigator"
              >
                <b>Members</b> <br>
                Under Development
              </p>
            </div>

            <hr>

            <!-- Add no project detail display -->
            <div
              class="no-project has-vcentered"
              style="height: 80%"
              v-if="!hasProject"
            >
              <div class="info-icon">
                <b-icon
                  icon="mdil-flask-empty"
                  custom-size="mdil-48px"
                  type="is-grey-light"
                />
              </div>
              <div class="info-content">
                <p class="has-text-grey">
                  <span class="is-size-5 has-text-grey-dark">No Projects Available</span><br>
                  Add a project by visiting the "MAVE Projects" page.
                </p>
              </div>
            </div>

            <div
              class="project-header"
              v-if="hasProject"
            >
              <p class="is-size-4 has-text-weight-bold">
                Projects
              </p>
            </div>

            <div
              class="project-content"
              v-if="hasProject"
            >
              <p
                class="is-size-5"
                v-for="(project, id) in projects"
                :key="id"
              >
                <b class="is-capitalized">
                  {{ project.target.name }} ({{ project.target.type }}),
                  <i>{{ project.target.organism }}</i>
                </b><br>
                <span v-if="project.activities">
                  <router-link
                    :to="{ name: 'Project View', params: { id: project.id } }"
                    target="_blank"
                  >
                    <b-icon icon="mdil-link" />
                  </router-link>
                  {{ project.activities.type }},
                  <i>
                    {{ project.activities.start_date.toLocaleDateString() }} -
                    {{ project.activities.end_date ? project.activities.end_date.toLocaleDateString() : "Present" }}
                  </i>
                </span>
              </p>
            </div>
          </div>

          <div class="column is-4 is-offset-2">
            <div class="project-header">
              <p class="is-size-4 has-text-weight-bold">
                About Team
              </p>
            </div>

            <div class="project-content">
              <p
                class="is-size-5"
                v-if="user"
              >
                <b>Creator</b> <br>
                <b-icon icon="mdil-account" />
                <router-link
                  :to="{ name: 'User Profile View', params: { username: user.username } }"
                  target="_blank"
                  class="is-capitalized"
                >
                  {{ user.first_name + ' ' + user.last_name }}
                </router-link>
              </p>
              <p class="is-size-5">
                <b>Last Update</b> <br>
                <b-icon icon="mdil-clock" />
                {{ updatedDate.toLocaleString() }}
              </p>
              <div
                class="is-size-5"
                v-if="(followerCount > 0 || requestCount > 0) && isOwner"
              >
                <b>Follower{{ followerCount > 1 ? 's' : '' }}</b> <br>
                <div class="buttons">
                  <b-button
                    v-if="followerCount > 0"
                    class="action-button"
                    icon-left="mdil-settings"
                    type="is-light"
                    @click="openFollowerModal(false)"
                  >
                    Manage <b>{{ followerCount }}</b> Follower{{ followerCount > 1 ? 's' : '' }}
                  </b-button>
                  <b-button
                    v-if="requestCount > 0"
                    class="action-button"
                    icon-left="mdil-comment-text"
                    type="is-light"
                    @click="openFollowerModal(true)"
                  >
                    Review <b>{{ requestCount }}</b> Request{{ requestCount > 1 ? 's' : '' }}
                  </b-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Manage follower modal -->
      <ManageFollowerModal
        :active.sync="isManageFollowerModalActive"
        :target="teamId"
        :is-request="isRequest"
        type="team"
        @change="fetchFollowerAndRequestCount(teamId)"
      />
    </div>
  </div>
</template>

<script>
import * as TeamManage from "@/api/teamManage.js"
import * as ProjectManage from "@/api/projectManage.js"
import * as FollowManage from "@/api/followManage.js"
import Error from '@/components/Error.vue'
import ManageFollowerModal from '@/components/Modal/ManageFollowerModal.vue'
import { handleError } from '@/api/errorHandler.js'

export default {
  components: {
    Error,
    ManageFollowerModal
  },
  computed: {
    teamId() {
      return this.$route.params.id
    },
    hasProject() {
      return this.projects.length > 0
    }
  },
  data () {
    return {
      isOwner: false,
      isLoading: {
        page: false
      },
      isManageFollowerModalActive: false,
      principalInvestigator: {},
      projects: [],
      updatedDate: new Date(),
      user: {},
      errorMessage: "",
      followerCount: 0,
      requestCount: 0,
      isRequest: false
    }
  },
  async mounted() {
    this.isLoading.page = true

    // Fetch team
    const team = await this.fetchTeam()

    // Fetch projects that the team has
    await this.fetchProjects(team.id)

    // Fetch team follower and request count
    await this.fetchFollowerAndRequestCount(team.id)

    this.isLoading.page = false
  },
  methods: {
    async fetchTeam() {
      // Fetch team
      let team
      try {
        team = await TeamManage.queryById(this.teamId)
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

      // Format creator and update date
      this.user = team.user
      this.updatedDate = team.update_date

      // Set owner property
      if (this.user && this.user.username) 
        this.isOwner = this.$store.state.hasLoggedIn && (this.user.username === this.$store.state.user.username)
      
      return team
    },
    async fetchProjects(teamId) {
      try {
        this.projects = await ProjectManage.fetchProjectByTeamId(teamId)
      } catch (error) {
        this.errorMessage = await handleError(error)
      }
    },
    async fetchFollowerAndRequestCount(teamId) {
      try {
        this.followerCount = await FollowManage.countFollows(teamId, "team")
        this.requestCount = await FollowManage.countFollows(teamId, "team", true)
      } catch (error) {
        this.errorMessage = await handleError(error)
      }
    },
    openFollowerModal(request) {
      this.isManageFollowerModalActive = true
      this.isRequest = request
    }
  }
}
</script>

<style lang="sass" scoped>
.action-button
  margin-top: 0.5rem
</style>