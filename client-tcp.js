
const net = require('net');

const inquirer = require('inquirer');

const BROCKER_IP = '0.0.0.0'

const BROCKER_PORT = 8000

const MODULE_NAME = "M2"

let client = net.connect(BROCKER_PORT, BROCKER_IP, () => {
    client.write(JSON.stringify({
        type: 'COMMAND',
        command: 'HANDSHAKE',
        moduleName: MODULE_NAME
    }))
})

client.on('data', (msg) => {
    handleMessage(msg)
})

client.on('close', () => {
    console.log('close')
})

client.on('error', (er) => {
    console.log('\n', er.message)
})

function handleMessage(msg) {

    console.log('\n\n')
    console.log(JSON.parse(msg, null, 4))
    console.log('\n\n')

}

(() => {


    recursiveAsyncReadLine()

})()

function recursiveAsyncReadLine() {

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'option',
                message: 'Choose option?',
                choices: ['Publish', 'Subscribe', 'Unsubscribe', 'Topics', 'Create'],
            },
        ])
        .then(answers => {

            switch (answers.option) {
                case "Publish":
                    publish()
                    break;
                case "Subscribe":
                    subscribe()
                    break;
                case "Unsubscribe":
                    unsubscribe()
                    break;
                case "Topics":
                    retrieveAllTopics()
                    break;
                case "Create":
                    createTopic()
                    break;
                default:
                    console.log("No such option. Please enter another:\n");
            }
        });
}

function publish() {

    inquirer
        .prompt([
            {
                name: 'topicName',
                message: 'Enter topic name: ',
            },
            {
                name: 'msg',
                message: 'Enter message to send: ',
            },
        ])
        .then(answers => {
            client.write(JSON.stringify({
                type: 'COMMAND',
                command: 'PUBLISH',
                moduleName: MODULE_NAME,
                payload: {
                    topicName: answers.topicName,
                    message: answers.msg
                }
            }))

            return recursiveAsyncReadLine()
        });
}

function subscribe() {
    inquirer
        .prompt([
            {
                name: 'topicName',
                message: 'Enter topic name',
            }
        ])
        .then(answers => {
            client.write(JSON.stringify({
                type: 'COMMAND',
                command: 'SUBSCRIBE',
                moduleName: MODULE_NAME,
                payload: {
                    topicName: answers.topicName,
                }
            }))

            return recursiveAsyncReadLine()
        });
}

function unsubscribe() {
    inquirer
        .prompt([
            {
                name: 'topicName',
                message: 'Enter topic name',
            }
        ])
        .then(answers => {
            client.write(JSON.stringify({
                type: 'COMMAND',
                command: 'UNSUBSCRIBE',
                moduleName: MODULE_NAME,
                payload: {
                    topicName: answers.topicName,
                }
            }))

            return recursiveAsyncReadLine()
        });
}

function retrieveAllTopics() {
    client.write(JSON.stringify({
        type: 'COMMAND',
        command: 'TOPICS',
        moduleName: MODULE_NAME,

    }))

    return recursiveAsyncReadLine()

}

function createTopic() {
    inquirer
        .prompt([
            {
                name: 'topicName',
                message: 'Enter topic name',
            }
        ])
        .then(answers => {
            client.write(JSON.stringify({
                type: 'COMMAND',
                command: 'CREATE',
                moduleName: MODULE_NAME,
                payload: {
                    topicName: answers.topicName,
                }
            }))

            return recursiveAsyncReadLine()
        });
}
