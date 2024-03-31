const amqp = require('amqplib/callback_api');

function readMessage(queueName) {
  return new Promise((resolve, reject) => {
    amqp.connect(`${process.env.RABBITMQ_URL}`, (err, connection) => {
      if (err)
        reject(err);

      const messages = [];

      connection.createChannel((err, channel) => {
        if (err)
          reject(err);

        let qName = queueName + "";
        console.log("Queue Name:", qName);

        channel.assertQueue(qName, {
          durable: true
        });

        channel.consume(qName, (msg) => {
          if (msg !== null) {
            messages.push(msg.content.toString());
            console.log(`Received:${msg.content.toString()}`);
            channel.ack(msg);
          }
        }, { noAck: false }); // Ensure that message acknowledgments are enabled

        // Close the connection after a delay and resolve the Promise with the messages array
        setTimeout(() => {
          connection.close();
          resolve(messages);
        }, 500);
      });
    });
  });
}

module.exports = readMessage;
