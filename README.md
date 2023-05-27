# **RabbitMQ Consumer Service**

This project allows consuming messages from queues by connecting to RabbitMQ. Different services defined based on the type of the queue are used to consume a message from the queue. For example, we have SMS and email queues, and we can consume them simultaneously by defining consumer functions.

### **Prerequisites**

- Make sure Node.js is installed.
- Make sure RabbitMQ is installed.
- (Optional) Make sure MongoDB is installed.

### **Installation**

1. Open your terminal and enter the following command to clone a copy of this project:

   ```sh
   git clone https://github.com/0x178F/node-consumer.git
   ```

2. Go to the project directory:

   ```sh
   cd node-consumer
   ```

3. Run the following command to install the required dependencies:

   ```sh
   yarn install
   ```

### **Configuration**

Settings can be configured via configuration files under the **`config`** folder. Edit the relevant files to make the desired configurations. The queue names and the functions they should call are defined in enum/queues.js for easy configuration.

### **Running**

You can start the application by running the following command:

```sh
yarn dev
```

_NOTE: If you are deploying in a production environment, there is a docker-compose.yml file in the project._

### **Usage**

When the project is successfully started, it starts consuming messages from RabbitMQ and performs the related operations. It consumes messages in the specified functions depending on the queue type.

### **Features**

- **Message Consumption**: Connects to RabbitMQ and consumes messages from queues.
- **Error Handling**: In case of an error, messages can be retried a specified number of times according to the configuration. When the retry limit is exceeded, faulty messages are added to the error queue.
- **Graceful Shutdown**: Can be gracefully terminated, allowing the current processes to complete and handle the messages waiting to be consumed from RabbitMQ.
- **Health Check**: Can check the health status of the application and determine if the project is healthy.
