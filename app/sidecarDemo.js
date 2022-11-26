const BASEPATH = "/cap";

Vue.createApp({
  data() {
    return {
      customer: {
        assetsCash: 0,
        assetsSecurities: 0,
        assetsRealEstate: 0,
        assetsOther: 0,
      },
    };
  },
  computed: {
    totalAssets() {
      return (
        (parseFloat(this.customer.assetsCash) || 0) +
        (parseFloat(this.customer.assetsOther) || 0) +
        (parseFloat(this.customer.assetsRealEstate) || 0) +
        (parseFloat(this.customer.assetsSecurities) || 0)
      );
    },
  },

  methods: {
    async getCustomerAssets(id) {
      // first check for an existing draft
      const response = await fetch(
        `${BASEPATH}/customer/IndividualCustomers(ID=${id},IsActiveEntity=false)`
      );
      if (response.ok) {
        const data = await response.json();
        this.customer = data;
      } else if (response.status == 404) {
        // then check for a committed, active version
        const response = await fetch(
          `${BASEPATH}/customer/IndividualCustomers(ID=${id},IsActiveEntity=true)`
        );
        if (response.ok) {
          const data = await response.json();
          this.customer = data;
        } else {
          // If no draft and no active version, create a new 
          // initial draft entry
          const requestOptions = {
            method: "POST",
            body: JSON.stringify({ ID: parseInt(id) }),
            headers: {
              "content-type": "application/json",
            },
          };
          const response = await fetch(
            `${BASEPATH}/customer/IndividualCustomers`,
            requestOptions
          );
          const data = await response.json();
          this.customer = data;
        }
      }
      return this.customer;
    },

    async submitDraft() {
      const payload = {
        assetsCash: this.customer.assetsCash,
        assetsOther: this.customer.assetsOther,
        assetsRealEstate: this.customer.assetsRealEstate,
        assetsSecurities: this.customer.assetsSecurities,
      };

      const requestOptions = {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: {
          "content-type": "application/json",
        },
      };
      const response = await fetch(
        `${BASEPATH}/customer/IndividualCustomers(ID=${this.customer.ID},IsActiveEntity=false)`,
        requestOptions
      );
      console.log(response);
      console.log(await response.json());
    },

    async enableDraft(id) {
      if (this.customer.HasDraftEntity) {
        return;
      }
      const requestOptions = {
        method: "POST",
        body: JSON.stringify({
          PreserveChanges: true,
        }),
        headers: {
          "content-type": "application/json",
        },
      };
      const response = await fetch(
        `${BASEPATH}/customer/IndividualCustomers(ID=${id},IsActiveEntity=true)/draftEdit`,
        requestOptions
      );
      console.log(response);
      console.log(await response.json());
    },

    async activateDraft() {
      const requestOptions = {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      };
      const response = await fetch(
        `${BASEPATH}/customer/IndividualCustomers(ID=${this.customer.ID},IsActiveEntity=false)/draftActivate`,
        requestOptions
      );
      console.log(response);
      console.log(await response.json());
      this.getCustomerAssets(this.customer.ID);
    },
  },

  async mounted() {
    const queryParams = new URLSearchParams(window.location.search);
    const id = parseInt(queryParams.get("customerId"));
    const customer = await this.getCustomerAssets(id);
    console.log(customer)
    if (customer.IsActiveEntity) {
      this.enableDraft(customer.ID);
    }
  },
}).mount("#app");
