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
                  <span class="is-hidden-mobile">View</span>
                  Project
                </p>
              </div>
            </div>
            <!-- Show edit button if current user is the project creator -->
            <div
              class="level-right buttons"
              v-if="hasLoggedIn"
            >
              <!-- Edit project -->
              <b-button
                v-if="isOwner || isEditor"
                icon-left="mdil-pencil"
                type="is-warning"
                size="is-medium"
                class="small-shadow"
                @click="editProject"
              >
                Edit
              </b-button>
              <FollowButtonAction
                v-if="isMember && followStatus && !isOwner" 
                :follow-status="followStatus"
                type="project"
                :target-id="projectId"
                :creator="creator"
                @change="fetchProject(projectId)"
              />
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

      <!-- Project display -->
      <div
        class="content"
        v-else-if="!isLoading.page && errorMessage === ''"
      >
        <div class="columns">
          <div
            class="column is-6"
          >
            <div
              class="project-header"
              v-if="hasPeople"
            >
              <p class="is-size-4 has-text-weight-bold">
                People
              </p>
            </div>

            <div
              class="project-content"
              v-if="hasPeople"
            >
              <p
                class="is-size-5"
                v-if="leads.length > 0"
              >
                <span>
                  <b>{{ 'Project Lead' + (leads.length > 1 ? 's' : '') }}</b> <br>
                </span>
                <span
                  v-for="(lead, id) in leads"
                  :key="id"
                >
                  <a
                    :href="'mailto:' + lead.email"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <b-icon icon="mdil-email" />
                  </a>
                  <span class="is-capitalized">{{ lead.first_name + " " + lead.last_name }},</span>
                  {{ lead.position === "Other" ? lead.custom_position : lead.position }}<br>
                </span>
              </p>

              <p class="is-size-5">
                <span v-if="team">
                  <b>Team</b> <br>
                  <a
                    :href="'mailto:' + team.email"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <b-icon icon="mdil-email" />
                  </a>
                  <span class="is-capitalized">{{ team.first_name + " " + team.last_name }},</span>
                  {{ team.affiliation }}
                </span>
              </p>

              <p
                class="is-size-5"
                v-if="collaborators.length > 0"
              >
                <span>
                  <b>{{ 'Collaborator' + (collaborators.length > 1 ? 's' : '') }}</b> <br>
                </span>
                <span
                  v-for="(collaborator, id) in collaborators"
                  :key="id"
                >
                  <a
                    :href="'mailto:' + collaborator.email"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <b-icon icon="mdil-email" />
                  </a>
                  <span class="is-capitalized">{{ collaborator.first_name + " " + collaborator.last_name }},</span>
                  {{ collaborator.affiliation }}
                  <br>
                </span>
              </p>
            </div>

            <hr v-if="hasPeople && hasActivity">

            <!-- Add no project detail display -->
            <div
              class="no-project has-vcentered"
              v-if="!hasPeople && !hasActivity"
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
                  <span class="is-size-5 has-text-grey-dark">No Project Detail</span><br>
                  <span v-if="isOwner">Using the "Edit" function to add project detail.</span>
                  <span v-else>You may contact the creator for more information.</span>
                </p>
              </div>
            </div>

            <div
              class="project-header"
              v-if="hasActivity"
            >
              <p
                class="is-size-4 has-text-weight-bold"
              >
                Activity
              </p>
            </div>

            <div
              v-if="hasActivity"
            >
              <div class="timeline">
                <div
                  class="timeline-item"
                  v-for="(activity, id) in activities"
                  :key="id"
                >
                  <div class="timeline-marker icon has-background-primary-light">
                    <b-icon
                      :icon="progressIcons[activity.type]"
                      custom-size="mdil-24px"
                      type="is-primary"
                    />
                  </div>
                  <div class="timeline-content">
                    <b-tag
                      type="is-primary-light"
                      class="is-uppercase has-text-primary"
                    >
                      {{ formatTime(activity.start_date, activity.end_date) }}
                    </b-tag>
                    <p class="has-text-primary">
                      {{ activity.type }}
                    </p>
                    <span class="has-white-space-pre">{{ activity.description }}</span>
                    <b-taglist
                      v-if="activity.links && activity.links.length > 0"
                      attached
                      class="link-tags"
                    >
                      <b-tag
                        type="is-light"
                        class="font-14px"
                      >
                        <b-icon icon="mdil-link" />
                        Publications or other links
                      </b-tag>
                  
                      <b-tag class="has-background-white-bis font-14px">
                        <span
                          v-for="(link, linkId) in activity.links"
                          :key="linkId"
                        >
                          <a
                            :href="link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >{{ linkId + 1 }}</a>
                          <span v-if="activity.links.length > linkId + 1">, </span>
                        </span>
                      </b-tag>
                    </b-taglist>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="column is-4 is-offset-2">
            <div
              class="project-header"
              v-if="hasProject"
            >
              <p class="is-size-4 has-text-weight-bold">
                About Project
              </p>
            </div>
            
            <div
              class="project-content"
              v-if="hasProject"
            >
              <p
                class="is-size-5"
                v-if="target"
              >
                <b>Target</b> <br>
                <b-icon icon="mdil-pin" />
                <router-link
                  :to="{ path: '/projects', query: { 
                    type: target.type,
                    name: target.name}}"
                  target="_blank"
                >
                  <span class="is-capitalized">
                    {{ target.name.toUpperCase() }} ({{ target.type }})
                  </span>
                </router-link>
                <br>
              </p>
              <p
                class="is-size-5"
                v-if="target"
              >
                <b>Organism</b> <br>
                <b-icon icon="mdil-circle" />
                <router-link
                  :to="{ path: '/projects', query: { 
                    organism: target.organism}}"
                  target="_blank"
                >
                  <span class="is-italic">
                    {{ target.organism }}
                  </span>
                </router-link>
              </p>
              <p
                class="is-size-5"
                v-if="features && features.length > 0"
              >
                <b>Feature{{ features.length > 1 ? 's' : '' }}</b> <br>
                <b-icon icon="mdil-tag" />
                {{ features.join(", ") }}
              </p>
              <p
                class="is-size-5"
                v-if="funding"
              >
                <b>Funding</b> <br>
                <b-icon :icon="funding.open_for_funding ? 'mdil-eye' : 'mdil-eye-off'" />
                {{ funding.open_for_funding ? "Seeking" : "Not Seeking" }} Funding
              </p>
              <p
                class="is-size-5 is-capitalized"
                v-if="creator"
              >
                <b>Creator</b> <br>
                <b-icon icon="mdil-account" />
                <router-link
                  :to="{ name: 'User Profile View', params: { username: creator.username } }"
                  target="_blank"
                >
                  {{ creator.first_name + ' ' + creator.last_name }}
                </router-link> <br>
              </p>
              <p
                class="is-size-5"
                v-if="updatedDate"
              >
                <b>Last Update</b> <br>
                <b-icon icon="mdil-clock" />
                {{ updatedDate.toLocaleString() }}
              </p>
              <div
                class="is-size-5"
                v-if="isOwner && (followerCount > 0 || requestCount > 0)"
              >
                <b>Follower{{ followerCount > 1 ? 's' : '' }}</b> <br>
                <div
                  class="buttons"
                  style="margin-top: 0.25rem"
                >
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

            <div
              class="project-header"
              v-if="isMember"
            >
              <p class="is-size-4 has-text-weight-bold">
                Actions
              </p>
            </div>

            <div
              class="project-content action-buttons"
              v-if="isMember"
            >
              <TransferAction
                type="project"
                :load-page="loadPage"
                :is-owner="isOwner"
                :target-id="projectId"
                @transfer="loadPage"
                style="margin-bottom: 0.5rem"
              />
              <ReuqestOwnershipAction
                type="project"
                :target-id="projectId"
                :on-action="obtainProject"
                :is-owner="isOwner"
                style="margin-bottom: 0.5rem"
              />
              <b-button
                v-if="isOwner"
                icon-left="mdil-delete"
                type="is-light"
                expanded
                @click="isConfirmDeleteModalActive = true"
              >
                Delete Project
              </b-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Manage follower modal -->
      <ManageFollowerModal
        :active.sync="isManageFollowerModalActive"
        :target="projectId"
        :is-request="isRequest"
        type="project"
        @change="fetchFollowerAndRequestCount(projectId)"
      />

      <!-- Confirm Delete Modal -->
      <ConfirmDangerModal
        :active.sync="isConfirmDeleteModalActive"
        type="project"
        action="delete"
        :on-action="deleteProject"
      />
    </div>
  </div>
</template>

<style lang="sass" scoped>
.timeline
  .icon
    border: unset
    display: flex
    align-items: center
    height: 36px
    width: 36px
.link-tags
  margin-top: 0.5rem
  .icon
    display: inline-flex
    margin-left: -0.5rem !important
    margin-right: -0.5rem !important
</style>
<script>
import * as ProjectManage from "@/api/projectManage.js"
import * as FollowManage from "@/api/followManage.js"
import * as TransferManage from "@/api/transferManage.js"
import { handleError } from "@/api/errorHandler.js"
import Error from '@/components/Error.vue'
import ManageFollowerModal from '@/components/Modal/ManageFollowerModal.vue'
import FollowButtonAction from '@/components/Action/FollowButtonAction.vue'
import TransferAction from '@/components/Action/TransferAction.vue'
import ReuqestOwnershipAction from '@/components/Action/RequestOwnershipAction.vue'
import ConfirmDangerModal from '@/components/Modal/ConfirmDangerModal.vue'

const variables = require("@/assets/script/variables.json")

export default {
  title: "View Project",
  components: {
    Error,
    ManageFollowerModal,
    FollowButtonAction,
    TransferAction,
    ReuqestOwnershipAction,
    ConfirmDangerModal,
  },
  data() {
    return {
      isLoading: {
        page: false
      },
      hasProject: false,
      isManageFollowerModalActive: false,
      isConfirmDeleteModalActive: false,
      followStatus: undefined,
      isRequest: false,
      errorMessage: "",
      target: undefined,
      features: [],
      progressIcons: variables.progress_type_icons,
      creator: undefined,
      updatedDate: undefined,
      leads: [],
      team: undefined,
      collaborators: [],
      funding: undefined,
      activities: [],
      followerCount: 0,
      requestCount: 0,
      hasInitLoad: false
    }
  },
  computed: {
    projectId() {
      return this.$route.params.id
    },
    hasPeople() {
      return this.leads.length > 0 || this.team
    },
    hasActivity() {
      return this.activities.length > 0
    },
    isOwner() {
      return this.creator && this.creator.username && this.$store.getters.isOwner(this.creator.username)
    },
    isEditor() {
      return this.followStatus && this.followStatus.can_edit
    }
  },
  watch: {
    async currentUser() {
      if (this.hasInitLoad) await this.loadPage()
    }
  },
  async mounted() {
    this.isLoading.page = true

    await this.loadPage()
    this.hasInitLoad = true

    // Open follow request modal if needed
    if (this.hasDeepLink("#manage-request") && this.isOwner) this.openFollowerModal(true)

    this.isLoading.page = false
  },
  methods: {
    async loadPage() {
      this.errorMessage = ""
      
      const project = await this.fetchProject(this.projectId)
      if (project) {
        this.hasProject = true
        if (project.leads) this.leads = project.leads // Required, will always have value
        if (project.team) this.team = project.team // Required, will always have value
        if (project.collaborators)
          this.collaborators = project.collaborators
        if (project.funding) this.funding = project.funding
        if (project.activities) this.activities = project.activities.sort((a, b) => b.start_date - a.start_date ) // Order activities by starting date descendingly
      } else {
        this.hasProject = false
      }

      if (this.isOwner) {
        // Fetch team follower and request count
        await this.fetchFollowerAndRequestCount(this.projectId)
      }
    },
    async fetchProject(id) {
      // Error handling
      try {
        const project = await ProjectManage.fetchProject(id, true, true)

        if (!project) {
          this.errorMessage = await handleError({ message: "Project Not Found" })
          return
        }

        this.target = project.target
        this.features = project.features
        this.creator = project.creator
        this.updatedDate = project.update_date
        if (project.follow_status && project.follow_status.length > 0) this.followStatus = project.follow_status[0]

        return project
      } catch (error) {
        this.errorMessage = await handleError(error)
        throw error
      }
    },
    editProject() {
      this.$router.push({ name: 'Project Edit', params: { id: this.projectId, action: 'edit' } })
    },
    async fetchFollowerAndRequestCount(id) {
      try {
        this.followerCount = await FollowManage.countFollows(id, "project")
        this.requestCount = await FollowManage.countFollows(id, "project", true)
      } catch (error) {
        this.errorMessage = await handleError(error)
        throw error
      }
    },
    openFollowerModal(request) {
      this.isManageFollowerModalActive = true
      this.isRequest = request
    },
    formatTime(startDate, endDate = undefined) {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

      // If no end date or start and end date are within the same month,
      // just format the start date
      if (!endDate || (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear())) 
        return months[startDate.getMonth()] + " " + startDate.getFullYear()

      // If start and end date are within the same year but in different month
      if (startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() !== endDate.getMonth())
        return months[startDate.getMonth()] + " - " + months[endDate.getMonth()] + " " + startDate.getFullYear()

      // If start and end date are in different year
      if (startDate.getFullYear() !== endDate.getFullYear())
        return months[startDate.getMonth()] + " " + startDate.getFullYear() + " - " + months[endDate.getMonth()] + " " + endDate.getFullYear()
    },
    async obtainProject() {
      // If moderator, obtain project
      if (this.isModerator) {
        await ProjectManage.obtainProject(this.projectId)
      } else {
        const target = {
          type: "project",
          id: this.projectId
        }
        await TransferManage.requestOwnership(target, this.creator.id)
      }

      await this.loadPage()
    },
    async deleteProject() {
      await ProjectManage.deleteProject(this.projectId)
      this.$router.push({ name: 'Projects' })
    }
  }
}
</script>