using { sidecar.customer as db } from '../db/customer';

service CustomerService @(path:'/customer') {
    entity IndividualCustomers as projection on db.IndividualCustomers;
    
    action submitDraft(customer: CustomerService.IndividualCustomers);
}

annotate CustomerService.IndividualCustomers with @odata.draft.enabled;