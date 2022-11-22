using {sidecar.customer as db} from '../db/customer';

@requires : 'authenticated-user'
@path     : '/customer'
service CustomerService {
    entity IndividualCustomers as projection on db.IndividualCustomers;
    action activateDraft();
}

annotate CustomerService.IndividualCustomers with @odata.draft.enabled;
