const cds = require("@sap/cds");

async function getC4CCustomer(customerId) {
  const c4c = await cds.connect.to("C4C_Customer");
  const { IndividualCustomerCollection } = c4c.entities;

  const query = SELECT.one
    .from(IndividualCustomerCollection)
    .columns((c) => {
      c.CustomerID, c.ObjectID;
    })
    .where({ CustomerID: customerId.toString() });

  const customer = await c4c.run(query);
  return customer;
}

module.exports = async (srv) => {
  const asb = await cds.connect.to("AzureServiceBus");

  srv.before("PATCH", `IndividualCustomers`, async (req) => {
    console.log(req.data);
  });

  srv.before("READ", "IndividualCustomers", async (req) => {
    const { ID: customerId, IsActiveEntity } = req.data;
    console.log(customerId);

    const c4cCustomer = getC4CCustomer(customerId);
    if (c4cCustomer) {
      console.log("access granted");
    } else {
      req.reject(401, "No Access to this customer");
    }
  });

  asb.on("IndividualCustomer.Root.Updated", async (msg) => {
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

  // helper method to allow update by event without ASB during dev
  srv.on("activateDraft", (srv, next) => {
    const asbPayload = {
      message: {
        id: "fa163e88-12c2-1eed-99e8-59faea9b8254",
        businessObject: "IndividualCustomer",
        node: "Root",
        timestamp: "2022-11-18T13:13:34Z",
        type: 2,
        rootEntityId: "E0714AE6DFAD4F66BAFF912B5101A6A6",
        entityId: "E0714AE6DFAD4F66BAFF912B5101A6A6",
        changes: [
          {
            node: "Individual Customer",
            type: 2,
            fields: [
              {
                fieldName: "PartialSystemAdministrativeData/LastChangeDateTime",
                newValue: "2022-11-18T13:13:34.3708660Z",
                oldValue: "2022-10-31T15:55:07.5295510Z",
              },
              {
                fieldName:
                  "PartialSystemAdministrativeData/LastChangeIdentityUUID/content",
                newValue: "00163EAC0EEF1EDBAAAFBD2AFD50BBAC",
                oldValue: "00163EDA473A1EECB2D7ADAF3AFC4E23",
              },
            ],
          },
          {
            node: "Common",
            type: 2,
            fields: [
              {
                fieldName: "ResourceVersionC4C",
                newValue: "4 ",
                oldValue: "3 ",
              },
              {
                fieldName: "",
                newValue: "CHF",
                oldValue: "",
              },
              {
                fieldName: "Occupation",
                newValue: "9999",
                oldValue: "",
              },
            ],
          },
        ],
      },
    };
    asb.emit("IndividualCustomer.Root.Updated", asbPayload);
    next();
  });
};
