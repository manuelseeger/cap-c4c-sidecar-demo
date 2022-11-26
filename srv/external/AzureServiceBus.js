const { ServiceBusClient } = require("@azure/service-bus");
const { DefaultAzureCredential } = require("@azure/identity");
const cds = require("@sap/cds");
const { getDestination } = require("@sap-cloud-sdk/core");

class AzureServiceBusService extends cds.ApplicationService {
  async init() {
    const destination = await getDestination(
      this.options.credentials.destination
    );

    const credential = new DefaultAzureCredential();
    this.serviceBusClient = new ServiceBusClient(destination.url, credential);

    const subscriptionName = "sidecar_e2e_seeg_sap_demo";
    const queueName = this.options.credentials.queue;

    this.receiver = this.serviceBusClient.createReceiver(
      queueName,
      subscriptionName
    );

    const myErrorHandler = async (error) => {
      console.log(error);
    };

    const asbEmitter = this;

    const messageHandler = async (message) => {
      const CockpitMessageTypes = ["Created", "Deleted", "Updated"];
      const eventName = [
        message.body.message.businessObject,
        message.body.message.node,
        CockpitMessageTypes[message.body.message.type],
      ].join(".");

      console.log("emitting", eventName);
      asbEmitter.emit(eventName, message.body);
    };

    this.receiver.subscribe({
      processMessage: messageHandler,
      processError: myErrorHandler,
    });

    await super.init();
  }
}

module.exports = AzureServiceBusService;
