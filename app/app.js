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
        parseFloat(this.customer.assetsCash) +
        parseFloat(this.customer.assetsOther) +
        parseFloat(this.customer.assetsRealEstate) +
        parseFloat(this.customer.assetsSecurities)
      );
    },
  },

  methods: {
    async fetch(id) {
      const response = await fetch(
        `/customer/IndividualCustomers(ID=${id},IsActiveEntity=true)`
      );
      const data = await response.json();
      this.customer = data;
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
        `/customer/IndividualCustomers(ID=${this.customer.ID},IsActiveEntity=false)`,
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
        `/customer/IndividualCustomers(ID=${id},IsActiveEntity=true)/draftEdit`,
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
        `/customer/IndividualCustomers(ID=${this.customer.ID},IsActiveEntity=false)/draftActivate`,
        requestOptions
      );
      console.log(response);
      console.log(await response.json());
      this.fetch(this.customer.ID);
    },
  },

  async mounted() {
    const queryParams = new URLSearchParams(window.location.search);
    const customer = await this.fetch(queryParams.get("customerId"));
    this.enableDraft(customer.ID);
  },
}).mount("#app");
