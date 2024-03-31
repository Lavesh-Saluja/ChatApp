const amqp = require('amqplib');

//publisher
const connect = async (message, phoneNumber) => {
    let connection;
    try {
         connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(phoneNumber + "", {
             durable:true
         });
        console.log("Message",JSON.stringify({message,phoneNumber}));
        channel.sendToQueue(phoneNumber + "", Buffer.from(JSON.stringify({ message })), {
            persistent:false     
        });
        console.log("Message enqueued successfully");
    } catch (error) {
        
        console.log(error);
    }
}

module.exports = connect ;
