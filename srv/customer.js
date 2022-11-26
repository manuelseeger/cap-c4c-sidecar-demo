const cds = require("@sap/cds");

module.exports = async (srv) => {
  // unsafe as it allows creating drafts on any entity (but not reading them)
  // only used to speed up demo
  const C4C_ID_Cache = new Map();

  const asb = await cds.connect.to("AzureServiceBus");
  const c4c = await cds.connect.to("C4C_Customer");

  srv.before("READ", "IndividualCustomers", async (req) => {
    const { ID: customerId, IsActiveEntity } = req.data;

    // READ is also emitted after CREATE, but without req.data
    // don't check against C4C on CAP-internal invokations of READ
    if (customerId) {
      const { IndividualCustomerCollection } = c4c.entities;

      const query = SELECT.one
        .from(IndividualCustomerCollection)
        .columns((c) => {
          c.CustomerID, c.ObjectID;
        })
        .where({ CustomerID: customerId.toString() });

      const c4cCustomer = await c4c.run(query);
      if (c4cCustomer) {
        C4C_ID_Cache.set(
          c4cCustomer.CustomerID.toString(),
          c4cCustomer.ObjectID
        );
        console.log("access granted");
      } else {
        req.reject(401, "No Access to this customer");
      }
    }
  });

  srv.before("NEW", "IndividualCustomers", async (req, next) => {
    const customer = req.data;
    if (!customer.ObjectID) {
      if (C4C_ID_Cache.has(customer.ID.toString())) {
        req.data.ObjectID = C4C_ID_Cache.get(customer.ID.toString());
      } else {
        const { IndividualCustomerCollection } = c4c.entities;

        const query = SELECT.one
          .from(IndividualCustomerCollection)
          .columns((c) => {
            c.CustomerID, c.ObjectID;
          })
          .where({ CustomerID: customer.ID.toString() });

        const c4cCustomer = await c4c.run(query);
        req.data.ObjectID = c4cCustomer.ObjectID;
      }
    }
  });

  asb.on("IndividualCustomer.Root.Updated", async (msg) => {
    console.log("Received change event for ", msg.data.message.entityId);
    const { IndividualCustomers, DraftAdministrativeData } = srv.entities;

    const draftEntry = await SELECT.one
      .from(IndividualCustomers.drafts)
      .columns((cust) => {
        cust.ID,
          cust.ObjectId,
          cust.assetsSecurities,
          cust.assetsCash,
          cust.assetsRealEstate,
          cust.assetsOther,
          cust.DraftAdministrativeData((admin) => {
            admin.InProcessByUser, admin.DraftUUID;
          });
      })
      .where({
        ObjectId: msg.data.message.entityId,
      });

    const activeCustomer = await SELECT.one.from(IndividualCustomers).where({
      ObjectId: msg.data.message.entityId,
    });

    if (draftEntry) {
      const {
        DraftAdministrativeData: draftAdministrativeDataEntity,
        ...draftCustomer
      } = draftEntry;
      // todo check if same processor
      // if (draftAdministrativeDataEntity.InProcessByUser == msg.data.message.changes[0].changedBy)
      if (activeCustomer) {
        const upd = await UPDATE(IndividualCustomers).with(draftCustomer);
      } else {
        const ins = await INSERT(draftCustomer).into(IndividualCustomers);
      }

      const del2 = await DELETE(DraftAdministrativeData).where({
        DraftUUID: draftAdministrativeDataEntity.DraftUUID,
      });
      const del = await DELETE(IndividualCustomers.drafts).where({
        DraftAdministrativeData_DraftUUID:
          draftAdministrativeDataEntity.DraftUUID,
      });
    }
  });
};
