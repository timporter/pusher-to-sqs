var send_to_sqs,
    Pusher = require('pusher-client'),
    bitstamp = new Pusher('de504dc5763aeef9ff52'),
    order_book,
    AWS = require('aws-sdk'),
    SQS;

AWS.config.update({region: 'eu-west-1'});
SQS = new AWS.SQS();

order_book = bitstamp.subscribe('diff_order_book');
order_book.bind(
    'data',
    function (data) {
        send_to_sqs(data);
    }
);

live_trades = bitstamp.subscribe('live_trades');
live_trades.bind(
    'data',
    function (data) {
        send_to_sqs(data);
    }
);

send_to_sqs = function (data) {
    SQS.createQueue({QueueName: 'bitstamp_order_book_data'}, function (error, response) {
        if (error) {
            console.log(error);

            return;
        }

        console.log(data);

        SQS.sendMessage({
            QueueUrl: response.QueueUrl,
            MessageBody: JSON.stringify(data)
        }, function (error, response) {
            if (error) {
                console.log(error);

                return;
            }
        });
    });
};
