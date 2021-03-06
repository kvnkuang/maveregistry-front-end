<template>
  <div>
    <!-- Header -->
    <div class="hero is-light">
      <div class="hero-body has-page-header-padding">
        <div class="container">
          <div class="content">
            <p
              class="is-size-3 has-text-weight-medium"
            >
              {{ isAction('new') ? 'Register New' : 'Edit' }} Project
            </p>
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
        <!-- Project information -->
        <ValidationObserver
          ref="observer"
          v-slot="{ passed }"
        >
          <div class="project-header">
            <p class="is-size-4 has-text-weight-bold">
              Target
            </p>
          </div>

          <div
            class="columns"
            v-if="target"
          >
            <div class="column is-7">
              <div class="project-content">
                <div class="columns">
                  <div class="column is-3">
                    <p class="is-size-5">
                      Name
                    </p>
                  </div>
                  <div class="column is-9 is-flex">
                    <p class="is-size-5">
                      <span class="is-uppercase">{{ target.name }}</span>
                      ({{ target.type }}, <span class="is-italic">{{ target.organism }}</span>)
                    </p>
                  </div>
                </div>

                <div class="columns">
                  <div class="column is-3">
                    <p class="is-size-5">
                      Features
                    </p>
                  </div>
                  <div class="column is-9 is-flex">
                    <TargetFeatureFiled
                      label="Find genomic features"
                      v-model="features"
                      class="has-fullwidth"
                    />
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
                  <p>Target name, type and relevant organism are not editable.</p>
                </div>
              </b-notification>
            </div>
          </div>
          
          <hr>

          <div class="project-header">
            <p class="is-size-4 has-text-weight-bold">
              People
            </p>
          </div>
        
          <div class="columns">
            <div class="column is-7">
              <!-- Project Lead -->
              <div class="project-content">
                <div
                  v-for="(lead, index) in leads"
                  :key="index"
                  class="columns"
                >
                  <div class="column is-3">
                    <span class="is-size-5">
                      Project Lead {{ index === 0 ? '(*)' : '' }}
                    </span>
                    <b-button
                      v-if="leads.length > 1"
                      icon-left="mdil-delete"
                      type="is-light"
                      @click="leads.splice(index, 1)"
                    >
                      Delete
                    </b-button>
                  </div>
                  <div class="column is-9">
                    <PersonalInfoField
                      v-model="leads[index]"
                    />
                  </div>
                </div>
                <!-- Add project lead -->
                <b-button
                  class="add-record"
                  type="is-light"
                  icon-left="mdil-plus"
                  expanded
                  @click="leads.push(newLead())"
                >
                  Add a Project Lead
                </b-button>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column is-7">
              <!-- Team -->
              <div class="project-content">
                <div class="columns">
                  <div class="column is-3">
                    <span class="is-size-5">
                      Team (*)
                    </span>
                  </div>
                  <div class="column is-9">
                    <TeamInfoField v-model="team" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column is-7">
              <!-- Collaborators -->
              <div class="project-content">
                <div
                  v-for="(collab, index) in collaborators"
                  :key="index"
                  class="columns"
                >
                  <div class="column is-3">
                    <span class="is-size-5">
                      Collaborator
                    </span>
                    <b-button
                      v-if="collaborators.length > 1"
                      icon-left="mdil-delete"
                      type="is-light"
                      @click="collaborators.splice(index, 1)"
                    >
                      Delete
                    </b-button>
                  </div>
                  <div class="column is-9">
                    <TeamInfoField
                      v-model="collaborators[index]"
                      :is-required="false"
                      is-collaborator
                    />
                  </div>
                </div>
                <!-- Add project lead -->
                <b-button
                  class="add-record"
                  type="is-light"
                  icon-left="mdil-plus"
                  expanded
                  @click="collaborators.push('')"
                >
                  Add a Collaborator
                </b-button>
              </div>
            </div>
          </div>

          <hr>
          <div class="project-header">
            <p class="is-size-4 has-text-weight-bold">
              Funding
            </p>
          </div>

          <div class="columns">
            <div class="column is-7">
              <!-- Funding -->
              <div class="project-content">
                <div class="columns">
                  <div class="column is-3">
                    <p class="is-size-5">
                      Seeking Funding
                    </p>
                  </div>
                  <div class="column is-9 is-flex">
                    <b-checkbox v-model="openForFunding">
                      Open for Funding Opportunities
                    </b-checkbox>
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
                  <p>Only trusted funders can access funding information</p>
                </div>
              </b-notification>
            </div>
          </div>

          <hr>
          
          <!-- Activity -->
          <div class="project-header">
            <p class="is-size-4 has-text-weight-bold">
              Activity
            </p>
          </div>

          <div
            class="columns"
            v-for="(activity, index) in activities"
            :key="index"
          >
            <div class="column is-7">
              <div class="project-content">
                <div class="columns">
                  <div class="column is-3">
                    <p
                      v-if="!activity.end_date"
                      class="is-size-5"
                    >
                      Current Activity (*)
                    </p>
                    <p
                      v-else
                      class="is-size-5"
                    >
                      Previous Activity (*)
                    </p>
                    <b-button
                      v-if="activities.length > 1"
                      icon-left="mdil-delete"
                      @click="activities.splice(index, 1)"
                    >
                      Delete
                    </b-button>
                  </div>
                  <div class="column is-9">
                    <ProjectActivityField v-model="activities[index]" />
                  </div>
                </div>
              </div>
            </div>

            <div
              class="column is-5"
              v-if="activity && activity.type"
            >
              <b-notification :closable="false">
                <div class="content">
                  <b-icon
                    class="header-icon"
                    type="is-primary"
                    custom-size="mdil-48px"
                    icon="mdil-lightbulb-on"
                  />
                  <p class="has-text-weight-bold">
                    Questions to consider
                  </p>
                  <ol class="font-14px">
                    <li
                      v-for="(question, id) in typeDetails[activity.type].questions"
                      :key="id"
                    >
                      {{ question }}
                    </li>
                  </ol>
                </div>
              </b-notification>
            </div>
          </div>

          <div class="columns">
            <div class="column is-7">
              <!-- Add project lead -->
              <b-button
                class="add-record"
                type="is-light"
                icon-left="mdil-plus"
                expanded
                @click="activities.push(newActivity())"
              >
                Add an Activity
              </b-button>
            </div>
          </div>

          <hr>

          <div class="columns">
            <div class="column is-4 is-offset-8">
              <b-button
                class="small-shadow"
                :disabled="!passed"
                expanded
                type="is-warning"
                size="is-medium"
                icon-left="mdil-content-save"
                @click="updateProject"
                :loading="isLoading.submit"
              >
                {{ isAction('new') ? 'Register' : 'Edit' }} Project
              </b-button>
            </div>
          </div>
        </ValidationObserver>
      </div>
    </div>
  </div>
</template>

<script>
import PersonalInfoField from '@/components/Field/PersonalInfoField.vue'
import TeamInfoField from '@/components/Field/TeamInfoField.vue'
import ProjectActivityField from '@/components/Field/ProjectActivityField.vue'
import TargetFeatureFiled from '@/components/Field/TargetFeatureField.vue'
import Error from '@/components/Error.vue'
import { ValidationObserver } from 'vee-validate'
import { handleError, displayErrorToast } from "@/api/errorHandler.js"
import * as ProjectManage from "@/api/projectManage.js"

const progressTypeDetails = require("@/assets/script/variables.json").progress_type_details

// Helper functions
// Check if a person is empty
function isNotEmptyPerson (person, emptyPerson) {
  return JSON.stringify(person) !== JSON.stringify(emptyPerson)
}

export default {
  title: "Edit Project",
  components: {
    PersonalInfoField,
    TeamInfoField,
    ProjectActivityField,
    TargetFeatureFiled,
    ValidationObserver,
    Error
  },
  data () {
    return {
      target: undefined,
      leads: [
        this.newLead()
      ],
      positions: [
        "Student",
        "Post-doc Fellow",
        "Faculty",
        "Research Staff",
        "Other"
      ],
      team: "",
      collaborators: [""],
      openForFunding: false,
      activities: [
        this.newActivity()
      ],
      typeDetails: progressTypeDetails, 
      features: [],
      creator: undefined,
      followStatus: undefined,
      updatedDate: new Date,
      isLoading: {
        page: false,
        submit: false
      },
      errorMessage: "",
      hasInitLoad: false
    }
  },
  computed: {
    isOwner() {
      return this.hasLoggedIn && this.creator && this.creator.username && this.$store.getters.isOwner(this.creator.username)
    },
    isEditor() {
      return this.hasLoggedIn && this.followStatus && this.followStatus.can_edit
    },
    projectId() {
      return this.$route.params.id
    },
  },
  watch: {
    async currentUser() {
      if (this.hasInitLoad) await this.loadPage()
    }
  },
  async mounted() {
    this.isLoading.page = true

    if (this.isAction('edit') || this.isAction('new')) {
      await this.loadPage()
    }

    // If not owner or editor or invalid action jump to view page
    if ((!this.isAction('new') && !this.isAction('edit')) || (!this.isOwner && !this.isEditor)) {
      this.$router.push({ name: 'Project View', params: { id: this.projectId } })
      return
    }

    this.hasInitLoad = true
    this.isLoading.page = false
  },
  methods: {
    newLead() {
      return {
          first_name: "",
          last_name: "",
          email: "",
          position: "",
          custom_position: ""
      }
    },
    newActivity() {
      return {
        id: "",
        type: "",
        start_date: new Date(),
        description: "",
      }
    },
    async loadPage() {
      this.errorMessage = ""

      const project = await this.fetchProject(this.projectId, false)

      // Populate project details if editing
      if (project) {
        if (project.leads) this.leads = project.leads // Required, will always have value
        if (project.team) this.team = project.team.id // Required, will always have value
        if (project.collaborators && project.collaborators.length > 0) this.collaborators = project.collaborators.map(e => e.id)
        if (project.funding && project.funding.open_for_funding) this.openForFunding = project.funding.open_for_funding
        if (project.activities) this.activities = project.activities
        if (project.follow_status && project.follow_status.length > 0) this.followStatus = project.follow_status[0]
      }
    },
    async fetchProject(id) {
      // Error handling
      try {
        const project = await ProjectManage.fetchProject(id, true, true)

        if (!project) {
          this.errorMessage = "Project Not Found"
          return
        }
      
        this.target = project.target
        this.features = project.features
        this.creator = project.creator
        this.updatedDate = project.update_date

        return project
      } catch (error) {
        this.errorMessage = await handleError(error)
        throw error
      }
    },
    async updateProject() {
      this.isLoading.submit = true

      // Filter activities to remove empty links
      const activities = this.activities.map(e => {
        if (e.links) {
          const links = e.links.filter(e => e !== "")
          if (links.length < 1) {
            delete e.links
          } else {
            e.links = links
          }
        }
        return e
      })
      // Construct payload
      const project = {
        id: this.projectId,
        features: this.features,
        leads: this.leads.filter(e => isNotEmptyPerson(e, this.newLead())),
        team: this.team,
        collaborators: this.collaborators.filter(e => e !== ""),
        funding: {
          open_for_funding: this.openForFunding
        },
        activities: activities
      }

      // Update project
      try {
        await ProjectManage.updateProject(project)
      } catch (e) {
        await displayErrorToast(e)
        return
      } finally {
        this.isLoading.submit = false
      }

      // Update UI and router
      this.$router.push({ name: 'Project View', params: { id: this.projectId } })
    }
  }
}
</script>

<style lang="sass" scoped>
.infocard-content
  margin-left: 1rem
.input
  box-shadow: none
.has-margin-right
  margin-right: -0.15rem !important
</style>