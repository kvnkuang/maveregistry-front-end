<template>
  <div>
    <b-field
      grouped
      class="field-margin field-space-between"
    >
      <ValidationProvider
        rules="required"
        name="FirstName"
        v-slot="{ errors, valid }"
        class="name"
        :immediate="firstName !== ''"
      >
        <b-field
          :message="errors"
          :type="{ 'is-danger': errors[0], '': valid }"
          label="First Name"
        >
          <b-input
            type="text"
            placeholder="First Name"
            v-model.trim="firstName"
            @input="updateVal"
            custom-class="is-capitalized"
          />
        </b-field>
      </ValidationProvider>
      <ValidationProvider
        rules="required"
        name="LastName"
        v-slot="{ errors, valid }"
        class="name"
        :immediate="lastName !== ''"
      >
        <b-field
          :message="errors"
          :type="{ 'is-danger': errors[0], '': valid }"
          label="Last Name"
        >
          <b-input
            type="text"
            placeholder="Last Name"
            v-model.trim="lastName"
            @input="updateVal"
            custom-class="is-capitalized"
          />
        </b-field>
      </ValidationProvider>
    </b-field>

    <!-- Email -->
    <ValidationProvider
      rules="required|email"
      name="Email"
      v-slot="{ errors, valid }"
      :immediate="email !== ''"
    > 
      <b-field
        :message="errors"
        class="field-margin"
        :type="{ 'is-danger': errors[0], '': valid }"
        label="Email"
      >
        <b-input
          icon="mdil-email"
          type="email"
          placeholder="Email"
          v-model.trim="email"
          @input="updateVal"
        />
      </b-field>
    </ValidationProvider>

    <!-- Association -->
    <ValidationProvider
      rules="required"
      name="Affiliation"
      v-slot="{ errors, valid }"
      :immediate="affiliation !== ''"
    > 
      <b-field
        :message="errors"
        class="field-margin"
        :type="{ 'is-danger': errors[0], '': valid }"
        label="Affiliation"
      >
        <b-input
          icon="mdil-factory"
          v-model.trim="affiliation"
          type="affiliation"
          placeholder="Affiliation"
          @input="updateVal"
        />
      </b-field>
    </ValidationProvider>
    <!-- Website -->
    <ValidationProvider
      :rules="{ regex: 
        /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/ 
      }"
      name="Website (Optional)"
      v-slot="{ errors, valid }"
      immediate
    > 
      <b-field
        :message="errors"
        class="field-margin"
        :type="{ 'is-danger': errors[0], '': valid }"
        label="Website (Optional)"
      >
        <b-input
          icon="mdil-link"
          type="website"
          placeholder="http:// or https://"
          v-model.trim="website"
          @input="updateVal"
        />
      </b-field>
    </ValidationProvider>
  </div>
</template>

<script>
import { ValidationProvider } from 'vee-validate'

export default {
  components: {
    ValidationProvider
  },
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  watch: {
    value: {
      handler (val) {
        this.firstName = val.first_name
        this.lastName = val.last_name
        this.email = val.email
        this.affiliation = val.affiliation
        if (val.website) this.website = val.website
      },
      deep: true
    }
  },
  mounted() {
    this.firstName = this.value.first_name
    this.lastName = this.value.last_name
    this.email = this.value.email
    this.affiliation = this.value.affiliation
    if (this.value.website) this.website = this.value.website
  },
  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      affiliation: "",
      website: ""
    }
  },
  methods: {
    updateVal() {
      let ret = {
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email,
        affiliation: this.affiliation,
      }
      if (this.website) ret.website =this.website

      this.$emit("input", ret)
    },
  }
}
</script>