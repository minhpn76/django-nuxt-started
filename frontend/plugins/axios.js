export default function ({ $axios, store, router, req }, inject) {
  // https://stackoverflow.com/a/15724300
  function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
  }
  const apiCall = $axios.create()

  apiCall.interceptors.request.use(
    (config) => {
      // Do something before each request is sent
      const c = config

      // this cookie must be sent with each axios request
      // in order for POST / PUT /DELETE http methods to work

      // only do this on the client
      if (process.client) {
        const cookie = getCookie('csrftoken') || ''

        if (cookie) {
          c.headers['X-CSRFToken'] = cookie
        }
      }

      return c
    },
    (error) => {
      Promise.reject(error)
    }
  )
  function handleSuccess(response) {
    return { data: response.data }
  }

  function handleError(error) {
    // console.log(error)
    switch (error.response.status) {
      case 400:
        break
      case 401:
        // Log out user, remove token, clear state and redirect to login
        store.dispatch('auth/logout').then(router.push('/'))
        break
      case 404:
        // Show 404 page
        break
      case 500:
        // Server error redirect to 500
        break
      default:
        // Unknow error
        break
    }
    return Promise.reject(error)
  }

  apiCall.interceptors.response.use(handleSuccess, handleError)

  inject('apiCall', apiCall)
}
