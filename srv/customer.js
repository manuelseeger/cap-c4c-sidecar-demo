const cds = require("@sap/cds");
module.exports = async (srv) => {
  const asb = await cds.connect.to("AzureServiceBus");
  srv.before("PATCH", `IndividualCustomers`, async (req) => {
    console.log(req.data);
  });

  asb.on("IndividualCustomer.Root.Updated", async (msg) => {
    console.log(msg);

    const { IndividualCustomers } = srv.entities;

    const customer = await SELECT(IndividualCustomers).where({
      ObjectId: msg.rootEntityId,
      HasDraftEntity: true,
    });
    console.log(customer);
  });
};
