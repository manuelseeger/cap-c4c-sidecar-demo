using {sidecar.customer as db} from '../db/customer';

service CustomerService @(path : '/customer') {
    entity IndividualCustomers as projection on db.IndividualCustomers;
    action activateDraft();
}

annotate CustomerService.IndividualCustomers with @odata.draft.enabled;
