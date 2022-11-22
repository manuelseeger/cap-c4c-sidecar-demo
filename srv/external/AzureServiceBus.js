const { ServiceBusClient } = require("@azure/service-bus");
const { DefaultAzureCredential } = require("@azure/identity");
const cds = require("@sap/cds");

class AzureServiceBusService extends cds.ApplicationService {
  async init() {
    const fullyQualifiedNamespace = this.options.credentials.host;
    const credential = new DefaultAzureCredential();
    this.serviceBusClient = new ServiceBusClient(
      fullyQualifiedNamespace,
      credential
    );

    const subscriptionName = "sidecar_e2e_seeg_sap_demo";
    const topicName = this.options.credentials.topic;

    this.receiver = this.serviceBusClient.createReceiver(
      topicName,
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
