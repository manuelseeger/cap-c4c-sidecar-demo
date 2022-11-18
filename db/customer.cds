namespace sidecar.customer;

entity IndividualCustomers {
    key ID               : Integer;
        ObjectId         : String(32);
        assetsSecurities : Decimal(12, 2);
        assetsCash       : Decimal(12, 2);
        assetsRealEstate : Decimal(12, 2);
        assetsOther      : Decimal(12, 2);
}
