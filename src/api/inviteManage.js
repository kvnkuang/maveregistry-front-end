import { Parse } from "./parseConnect.js"

// Define invite object
export const Invite = Parse.Object.extend("Invite", {
  initialize: function (attrs) {
    // Validate attrs
    if (!attrs) return
    if (!attrs.from) throw new Error("Missing inviter")
    if (!["email", "internal"].includes(attrs.type)) throw new Error("Invalid invite type")
    if (!attrs.external_user && !attrs.internal_user) throw new Error("Missing invitee")
    if (!attrs.target_type || attrs.target_type === "") throw new Error("Missing target type")
  },
  format: function(includeFrom = false) {
    let ret = {
      id: this.id,
      type: this.get("type"),
      target_type: this.get("target_type"),
      target_pointer: this.get("target_pointer"),
      create_date: this.get("createdAt")
    }

    if (includeFrom) {
      const from = this.get("from")
      ret.from = {
        id: from.id,
        username: from.get("username"),
        first_name: from.get("first_name"),
        last_name: from.get("last_name"),
        profile_image: from.get("profile_image")
      }
    }
    if (this.get("acceptedAt")) ret.accepted_at = this.get("acceptedAt")
    if (this.get("message")) ret.message = this.get("message")

    if (ret.type === "internal") {
      const user = this.get("internal_user")
      ret.user = {
        id: user.id,
        username: user.get("username"),
        first_name: user.get("first_name"),
        last_name: user.get("last_name"),
        profile_image: user.get("profile_image")
      }
    } else {
      ret.user = this.get("external_user")
    }

    return ret
  }
}, {
  fetchById: async function(id, objects = []) {
    // Set up basic query
    const query = new Parse.Query(Invite)
    query.equalTo("objectId", id)

    // Include additional objects
    for (let index = 0; index < objects.length; index++) {
      query.include(objects[index])
    }

    return await query.first()
  }
})
Parse.Object.registerSubclass("Invite", Invite)

// Query invitation by ID
export async function queryInvitation(id) {
  return await Parse.Cloud.run("fetchInvitation", { invite_id: id })
}

export async function queryInvitationMessage(targetType, targetPointer = undefined) {
  // Validate if logged in
  const currentUser = Parse.User.current()
  if (!currentUser) throw new Error("Not logged in")
  
  // Fetch invitation
  const query = new Parse.Query(Invite)
  query.equalTo("internal_user", currentUser)
  query.equalTo("target_type", targetType)
  if (targetPointer) {
    query.equalTo("target_pointer", targetPointer)
  } else {
    query.doesNotExist("target_pointer")
  }
  const invitation = await query.first()

  if (!invitation) return undefined
  return invitation.get("message")
}

// Query invitations
export async function queryInvitations(fromUser, targetType = undefined, targetPointer = undefined, pagination = undefined) {
  // If not from any user, throw error
  if (!fromUser) throw new Error("missing inviter")

  const query = new Parse.Query(Invite)
  query.equalTo("from", fromUser)
  query.include("internal_user")
  query.descending("createdAt")
  if (targetType) query.equalTo("target_type", targetType)
  if (targetPointer) {
    query.equalTo("target_pointer", targetPointer)
  } else {
    query.doesNotExist("target_pointer")
  }
  if (pagination) {
    query.limit(pagination.limit)
    query.skip((pagination.current - 1) * pagination.limit)
    query.withCount()
  }

  return await query.find()
}

// Fetch invitations
export async function fetchInvitations(targetType = undefined, targetPointer = undefined, pagination) {
  // Validate if logged in
  const currentUser = Parse.User.current()
  if (!currentUser) throw new Error("Not logged in")

  const invites = await queryInvitations(currentUser, targetType, targetPointer, pagination)

  return {
    count: invites.count,
    results: invites.results.map(e => e.format())
  }
}

// Create invitations
export async function addInvitations(invitees, targetType, targetPointer = undefined, message = "") {
  // If no invitees, throw error
  if (!invitees || invitees.length < 1) throw new Error("No invitees")

  // Validate if logged in
  const currentUser = Parse.User.current()
  if (!currentUser) throw new Error("Not logged in")

  // Query existing invitations
  const existInvit = await queryInvitations(currentUser, targetType, targetPointer)

  // If with existing invitations,
  // filter out invitees that already exist in invitations
  if (existInvit.length > 0) {
    invitees = invitees.filter((invitee) => {
      // Scan through existing invitations
      return !existInvit.some((invite) => {
        let toUser = invite.get("internal_user")
        if (toUser) {
          return toUser.id === invitee.id
        } else {
          const toUser = invite.get("external_user")
          return toUser.email === invitee.email
        }
      })
    })
  }

  // Batch query all internal users at once
  const query = new Parse.Query(Parse.User)
  const internalUserIds = invitees.map(invitee => invitee.id).filter(Boolean)
  query.containedIn("objectId", internalUserIds)
  const internalUsers = await query.find()

  // Create invite objects
  const invites = invitees.map((invitee) => {
    let attrs = {
      from: currentUser,
      target_type: targetType,
      target_pointer: targetPointer,
    }

    // Add message if available
    if (message) attrs.message = message

    if (invitee.email_invite) {
      attrs.type = "email"
      attrs.external_user = {
        first_name: invitee.first_name,
        last_name: invitee.last_name,
        email: invitee.email
      }
    } else {
      // Find internal user object
      const user = internalUsers.find(e => e.id === invitee.id)
      attrs.type = "internal"
      attrs.internal_user = user
    }

    return new Invite(attrs)
  })

  // Batch-save invites
  return await Parse.Object.saveAll(invites)
}

export async function removeInvite(id) {
  // Fetch invite
  const invite = await new Invite.fetchById(id)

  // Remove it
  if (invite) await invite.destroy()
}

export async function fetchRateLimitConfig(type = undefined, channel = undefined) {
  return await Parse.Cloud.run("fetchRateLimitConfig", { type: type, channel: channel })
}

export async function checkInviteStatus() {
  // Validate if logged in
  const currentUser = Parse.User.current()
  if (!currentUser) throw new Error("Not logged in")

  // Fetch invite status
  const externalUserQuery = new Parse.Query(Invite)
  externalUserQuery.equalTo("external_user.email", currentUser.get("email"))
  const internalUserQuery = new Parse.Query(Invite)
  internalUserQuery.equalTo("internal_user", currentUser)
  const query = Parse.Query.or(externalUserQuery, internalUserQuery)
  const invite = await query.first()

  return invite
}

export async function acceptInvitation(inviteId) {
  // Validate if logged in
  const currentUser = Parse.User.current()
  if (!currentUser) throw new Error("Not logged in")

  // Accept invitation at the backend
  await Parse.Cloud.run("acceptInvitation", { invite_id: inviteId })
}