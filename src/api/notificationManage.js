import { Parse } from "./parseConnect.js"

// Define notification object
export const Notification = Parse.Object.extend("Notification", {
  initialize: function (attrs) {
    // Validate attrs
    if (!attrs) return
    if (!attrs.id) throw new Error("Notification ID is empty")
    if (!attrs.time) throw new Error("Notification creation time is empty")
    if (!attrs.for) throw new Error("Notification is not addressed to a user")
    if (!attrs.message || attrs.message === "") throw new Error("Notification message is empty")
  },
  format: async function() {
    let ret = {
      id: this.id,
      time: this.get("createdAt").getTime(),
      message: this.get("message"),
      is_read: this.get("is_read"),
    }
    
    // If the notification has a target, format it
    const type = this.get("type")
    if (type) {
      ret.type = type
      const targetBody = this.get("target_body")
      let by = targetBody.by

      switch (type) {
        case "follow":
        case "transfer":
        case "join":
        case "invite":
          // If data is not available, fetch
          // This is because include is not implemented with LiveQuery
          if (!by.isDataAvailable()) await by.fetch()

          ret.by = {
            first_name: by.get("first_name"),
            last_name: by.get("last_name"),
            username: by.get("username"),
            profile_image: by.get("profile_image")
          }
          ret.target = {
            type: targetBody.type,
            id: targetBody.pointer.id
          }
          break
        case "update":
          ret.target = {
            type: targetBody.type,
            id: targetBody.pointer.id
          }
          break
        case "moderator_message":
          ret.by = by
          break
        case "funder_role":
          // If data is not available, fetch
          // This is because include is not implemented with LiveQuery
          if (!by.isDataAvailable()) await by.fetch()

          ret.by = {
            first_name: by.get("first_name"),
            last_name: by.get("last_name"),
            username: by.get("username"),
            profile_image: by.get("profile_image")
          }
          break
        default:
          break
      }
    }

    return ret
  }
})
Parse.Object.registerSubclass("Notification", Notification);

// Define Opt-out
export const OptOut = Parse.Object.extend("OptOut", {
  initialize: function (attrs) {
    // Validate attrs
    if (!attrs) return
    if (!attrs.email) throw new Error("Opt-out email is empty")
  }
})
Parse.Object.registerSubclass("OptOut", OptOut);

export async function retrieveAndSubscribe(commit) {
  const currentUser = Parse.User.current()

  if (!currentUser) return

  const query = new Parse.Query(Notification)
  query.equalTo("for", currentUser)
  query.include("target_body.by")
  query.select([
    "message", "is_read", "type", "target_body"
  ])

  // Retrieve all existing notifications
  let notifications = await query.find()
  if (notifications.length > 0) {
    notifications = await Promise.all(notifications.map(e => e.format()))
    commit("setNotifications", notifications)
  }

  // Subscribe to live changes
  const subscription = await query.subscribe()

  subscription.on("create", async (object) => {
    commit("addNotification", await object.format())
  })

  subscription.on("delete", (object) => {
    commit("removeNotification", object.id)
  })
}

export async function markAs(ids, asRead) {
  const query = new Parse.Query(Notification)
  query.containedIn("objectId", ids)
  let notifications = await query.find()
  notifications = notifications.map(e => e.set("is_read", asRead))
  await Parse.Object.saveAll(notifications)
}

export async function remove(id) {
  const query = new Parse.Query(Notification)
  const notification = await query.get(id)
  await notification.destroy()
}

export async function fetchOptOutStatus(email) {
  // Validate email
  if (!email) throw new Error("Missing email")

  // Fetch opt-out object
  const query = new Parse.Query(OptOut)
  query.equalTo("email", email)
  
  return await query.first()
}

export async function optOutEmail(email, response = undefined) {
  // Fetch opt-out object
  let optOut = await fetchOptOutStatus(email)

  if (optOut) {
    // If already opted out
    // opt in by removing the entry
    await optOut.destroy()
  } else {
    optOut = new OptOut({
      email: email
    })
    await optOut.save(null, { context: { captcha: response }})
  }
}