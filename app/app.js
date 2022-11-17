import C4cInput from "./C4CInput.js"

const $ = sel => document.querySelector(sel)
const GET = (url) => axios.get('/customer'+url)
const POST = (cmd,data) => axios.post('/customer'+cmd,data)

Vue.createApp ({
    components: {
        C4cInput: C4cInput
    },
    data() {
      return {
        customer: {
            assetsCash: 0,
            assetsSecurities: 0,
            assetsRealEstate: 0,
            assetsOther: 0
        },
      }
    },
    computed: {
        totalAssets() {
            return parseFloat(this.customer.assetsCash)
             + parseFloat(this.customer.assetsOther)
             + parseFloat(this.customer.assetsRealEstate)
             + parseFloat(this.customer.assetsSecurities)
        }
    },

    methods: {
        async fetch (id) {
            const response = await fetch(`/customer/IndividualCustomers(ID=${id},IsActiveEntity=true)`)
            const data = await response.json()
            this.customer = data
        },

        async submitDraft () {
            const payload = {
                assetsCash: this.customer.assetsCash,
                assetsOther: this.customer.assetsOther,
                assetsRealEstate: this.customer.assetsRealEstate,
                assetsSecurities: this.customer.assetsSecurities
            }

            const requestOptions = {
                method: 'PATCH',
                body: JSON.stringify(payload),
                headers: {
                    'content-type': 'application/json'
                }
            }
            const response = await fetch(`/customer/IndividualCustomers(ID=${this.customer.ID},IsActiveEntity=false)`, requestOptions)
            console.log(response)
            console.log(await response.json())
        },

        async enableDraft(id) {
            const requestOptions = {
                method: 'POST',
                body: JSON.stringify({
                    PreserveChanges: true
                }),
                headers: {
                    'content-type': 'application/json'
                }
            }
            const response = await fetch(`/customer/IndividualCustomers(ID=${id},IsActiveEntity=true)/draftEdit`, requestOptions)
            console.log(response)
            console.log(await response.json())
        },

        async activateDraft() {
            const requestOptions = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                }
            }
            const response = await fetch(`/customer/IndividualCustomers(ID=${this.customer.ID},IsActiveEntity=false)/draftActivate`, requestOptions)
            console.log(response)
            console.log(await response.json())
            this.fetch(this.customer.ID)
        }
    },

    mounted() {
        const queryParams = new URLSearchParams(window.location.search);
        this.fetch(queryParams.get('customerId'));
        this.enableDraft(queryParams.get('customerId'))
    }
}).mount('#app')


document.addEventListener('keydown', (event) => {
    // hide user info on request
    if (event.key === 'u')  return
})

axios.interceptors.request.use(csrfToken)
function csrfToken (request) {
    if (request.method === 'head' || request.method === 'get') return request
    if ('csrfToken' in document) {
        request.headers['x-csrf-token'] = document.csrfToken
        return request
    }
    return fetchToken().then(token => {
        document.csrfToken = token
        request.headers['x-csrf-token'] = document.csrfToken
        return request
    }).catch(_ => {
        document.csrfToken = null // set mark to not try again
        return request
    })

    function fetchToken() {
        return axios.get('/', { headers: { 'x-csrf-token': 'fetch' } })
        .then(res => res.headers['x-csrf-token'])
    }
}

