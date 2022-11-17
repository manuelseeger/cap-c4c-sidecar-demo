using { Currency, managed, sap } from '@sap/cds/common';
namespace sidecar.customer;

entity IndividualCustomers {
    key ID: Integer;
    ObjectId: UUID;
    assetsSecurities: Decimal(12,2);
    assetsCash: Decimal(12,2);
    assetsRealEstate: Decimal(12,2);
    assetsOther: Decimal(12,2);
}
