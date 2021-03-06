export const state = {
  showCookieConsentBanner: true,
  showTip: {
    why_follow: true,
    team_help: true,
    nomination: true
  }
}

export const getters = {
  showCookieConsentBanner: (state) => {
    return state.showCookieConsentBanner
  },
  showTip: (state) => (tip) => {
    return !!state.showTip[tip]
  }
}

export const mutations = {
  setCookieConsent(state) {
    state.showCookieConsentBanner = false
  },
  hideTip(state, tip) {
    if (state.showTip[tip]) state.showTip[tip] = false
  }
}

export const actions = {
  acceptCookieConsent({ commit }) {
    commit('setCookieConsent')
  },
  hideTip({ commit }, tip) {
    commit('hideTip', tip)
  }
}