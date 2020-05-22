import { Parse } from "./parseConnect"

// Helper: parse user metadata
function parseUserMetadata (user) {
  return {
    username: user.get("username"),
    email: user.get("email"),
    first_name: user.get("first_name"),
    last_name: user.get("last_name")
  }
}

// Log in user with password
export async function loginUserPassword (username, password) {
  let res = new Object

  // Authenticate
  try {
    const user = await Parse.User.logIn(username, password)

    // Parse user
    res.user = parseUserMetadata(user)
  } catch (e) {
    res.error = e
  }

  return res
}

// Log in user from cache
export async function loginUserCache () {
  let res = new Object

  const currentUser = Parse.User.current()
  if (currentUser) {
    res.user = parseUserMetadata(currentUser)
  }

  return res
}

// Sign up user with username, email and password
export async function signupUserPassword (username, email, password, firstName, lastName) {
  let res = new Object

  // Prepare new user
  let user = new Parse.User()
  user.set("username", username)
  user.set("email", email)
  user.set("password", password)
  user.set("first_name", firstName)
  user.set("last_name", lastName)

  // Sign up
  try {
    const retUser = await user.signUp()

    // Parse user
    res.user = parseUserMetadata(retUser)
  } catch (e) {
    res.error = e
  }

  return res
}

// Sign up user with Google auth code
export async function signupLoginUserGoogle (userInfo) {
  let res = new Object

  // Sign up
  try {
    // Link account
    let user = new Parse.User()
    user.set("email", userInfo.email)
    user.set("first_name", userInfo.first_name)
    user.set("last_name", userInfo.last_name)
    await user.linkWith("google", {
      authData: userInfo.auth
    })

    // Set user info
    res.user = parseUserMetadata(Parse.User.current())
  } catch (e) {
    res.error = e
  }

  return res
}

// Sign up user with ORCID OAuth2
export async function signupLoginUserOrcid (userInfo) {
  // Register provider
  const provider = {
    authenticate: () => Promise.resolve(),
    restoreAuthentication() {
      return true;
    },
  
    getAuthType() {
      return 'orcid';
    },

    getAuthData() {
      return {
        authData: userInfo.auth
      }
    }
  };
  Parse.User._registerAuthenticationProvider(provider);

  let res = new Object

  // Sign up
  try {
    // Link account
    let user = new Parse.User()
    user.set("email", userInfo.email)
    user.set("first_name", userInfo.first_name)
    user.set("last_name", userInfo.last_name)
    await user.linkWith(provider.getAuthType(), provider.getAuthData())

    // Set user info
    res.user = parseUserMetadata(Parse.User.current())
  } catch (e) {
    res.error = e
  }

  console.log(res)
  return res
}

export async function logoutUser () {
  let res = new Object

  try {
    res.user = await Parse.User.logOut()
  } catch (e) {
    res.error = e
  }

  return res
}