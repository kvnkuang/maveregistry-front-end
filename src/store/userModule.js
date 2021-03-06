import * as UserManage from "@/api/userManage.js"
import { handleError, displayErrorToast } from "@/api/errorHandler.js"
import { SnackbarProgrammatic as Snackbar } from 'buefy'
import { ToastProgrammatic as Toast } from 'buefy'
import { nanoid } from 'nanoid'

export const state = {
  user: undefined,
  roles: [],
  nonce: ""
}

export const getters = {
  hasLoggedIn: state => {
    return !!state.user
  },
  hasRole: (state) => (role) => {
    return state.roles.includes(role)
  },
  getUser: state => {
    return state.user
  },
  isOwner: (state, getters) => (owner) => {
    return getters.hasLoggedIn && state.user.username === owner
  },
  getNonce: (state) => {
    return state.nonce
  } 
}

export const mutations = {
  logoutUser(state) {
    state.user = undefined
  },
  setUser(state, user) {
    if (user) state.user = user
  },
  setRoles(state, roles) {
    state.roles = roles
  },
  setNonce(state, nonce) {
    state.nonce = nonce
  }
}

export const actions = {
  async logoutUser ({ commit }) {
    // Logout user no matter what
    commit('logoutUser')
    
    await UserManage.logoutUser()
  },
  async loginUserPassword ({ commit }, credential) {
    const user = await UserManage.loginUserPassword(credential.username, credential.password)

    commit('setUser', user)
  },
  async loginUserCache ({ commit }) {
    const user = await UserManage.loginUserCache()

    // Update user info if loggined in successfully
    commit('setUser', user)
  },
  async signupUserPassword ({ commit }, userInfo) {
    const user = await UserManage.signupUserPassword(userInfo)

    // Update user info if loggined in successfully
    commit('setUser', user)
  },
  async signupLoginUserGoogle ({ commit }, userInfo) {
    const user = await UserManage.signupLoginUserGoogle(userInfo)
    
    // Update user info if loggined in successfully
    commit('setUser', user)
  },
  async signupLoginUserOrcid ({ commit }, userInfo) {
    try {
      const user = await UserManage.signupLoginUserOrcid(userInfo)
      
      if (user && user.email) {
        // Update user info if loggined in successfully
        commit('setUser', user)
      }

      return user
    } catch (e) {
      // Handle email verfication failure
      // This error needs to be handled separately because we need to provide user
      // an option to resend verification email
      const error = await handleError(e)

      if (error instanceof Object && error.action === "resend_email") {
        Snackbar.open({
          message: error.message,
          type: "is-danger",
          position: "is-top",
          queue: false,
          actionText: "Resend Verification Email",
          indefinite: true,
          onAction: async () => {
            try {
              await UserManage.resendValidationEmail()
            } catch (err) {
              await displayErrorToast(err)
              return
            }
            
            Toast.open({
              message: "Verification Email Sent",
              duration: 5000,
              type: 'is-success'
            })
          }
        })

        return "resend_email"
      } else if (error === "missing email") {
        return "missing email"
      } else {
        throw e
      }
    }
  },
  async updateUserProfile ({ commit }, userInfo) {
    const user = await UserManage.updateUserProfile(userInfo)

    // Update user info if loggined in successfully
    commit('setUser', user)
  },
  async getRoles ({ commit }) {
    const roles = await UserManage.getRoles()

    // Update user roles
    commit('setRoles', roles)
  },
  async syncUserProfile ({ commit }) {
    const user = this.getters.getUser
    if (user && user.username) {
      const userInfo = await UserManage.fetchUserInfo(user.username)

      // Update user info
      commit('setUser', userInfo)
    }
  },
  async generateNonce ({ commit }) {
    const nonce = nanoid()
    commit('setNonce', nonce)

    return nonce
  }
}