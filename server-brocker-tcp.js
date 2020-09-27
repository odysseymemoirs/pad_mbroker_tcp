const net = require('net');

const brocker = net.createServer()

let currentClients = [] // {moduleName: '', ip: '', port: '', clientSocket}

const topics = [{
    name: 'topicOne',
    users: []
}]


brocker.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
});

brocker.on('connection', handleNewClientConnection)

brocker.on('close', () => {
    console.log('close')
})

function handleNewClientConnection(client) {


    console.log('Current active modules: ', brocker.connections)

    console.log(`New client from: ${client.remoteAddress}:${client.remotePort}`)

    client.on('data', handleClientData);
    client.once('close', handleClientClose);
    client.on('error', handleClientError);

    function handleClientData(data) {

        let parsedData = JSON.parse(data)

        switch (parsedData.command) {

            case 'SUBSCRIBE': return subscribe(client, parsedData)

            case 'PUBLISH': return publish(client, parsedData)

            case 'UNSUBSCRIBE': return unsubscribe(client, parsedData)

            case 'TOPICS': return retrieveAllTopics(client)

            case 'CREATE': return createTopic(client, parsedData)

            case 'HANDSHAKE': return handshake(client, parsedData)

            default: return console.log('no type')

        }
    }

    function handleClientClose() {

        console.log(`Client ${client.remoteAddress}:${client.remoteAddress} disconnected`);

        // currentClients = currentClients.filter(function (user) { return user.remotePort != client.remotePort && user.remoteAddress != client.remoteAddress; })

        // console.log('Current active modules: ', server.connections)

    }

    function handleClientError(err) {
        console.log('error')
    }
}

function handshake(client, data) {

    if (!currentClients[0] || !(currentClients.some(e => e.moduleName === data.moduleName))) {
        console.log('PUSH')
        currentClients.push({
            moduleName: data.moduleName,
            ip: client.remoteAddress,
            port: client.remotePort,
            clientSocket: client
        })
        return
    }


    for (i = 0; i < currentClients.length; i++) {

        if (currentClients[i].moduleName === data.moduleName) {
            // проверяем что у модуля не поменялся ip или порт
            // если поменялся то  
            if (currentClients[i].ip !== client.remoteAddress || currentClients[i].port !== client.remotePort) {

                // делаем broadcast всем подключенным к брокеру модулям
                const response = {
                    type: 'BROADCAST',
                    status: 301,
                    payload: `The ${data.moduleName} module IP or PORT has changed from ${currentClients[i].ip} ===> ${client.remoteAddress} ${currentClients[i].port} ===> ${client.remotePort} `
                }
                broadcast(response)

                // запоминаем новый ip или порт
                currentClients[i] = {
                    moduleName: data.moduleName,
                    ip: client.remoteAddress,
                    port: client.remotePort,
                    clientSocket: client
                }
                break;

            }
        }
    }

    console.log('handshake')
}

function publish(client, data) {

    const topicName = data.payload.topicName

    const message = data.payload.message

    if (!isTopic(topicName)) {
        return client.write(JSON.stringify({
            type: 'ERROR',
            status: 400,
            payload: 'Topic not exists'

        }))
    }

    topics.map((topic) => {

        // ищем нужный топик и отправляем все подписчикам сообщение
        if (topic.name === topicName) {
            topic.users.map((user) => {

                currentClients.map((c,index) => {
                    if(c.moduleName === user.moduleName) {
    
                        c.clientSocket.write(JSON.stringify({
                            message,
                            from: `${client.remoteAddress}:${client.remotePort}`,
                            topic: topic.name
                        }))
                    }
                })
                
               
            })
        }
    })

}

function broadcast(response) {
    console.log('broadcast')
    currentClients.map((client) => {
        client.clientSocket.write(JSON.stringify(response))
    })
}

function subscribe(client, data) {

    const topicName = data.payload.topicName

    if (!isTopic(topicName)) {

        return client.write(JSON.stringify(
            {
                type: 'ERROR',
                status: 400,
                payload: `${topicName} не существует`
            }))
    }

    // проверяем подписан ли клиент на топик
    if (topics.some(e => e.users.some(e => e.moduleName === data.moduleName))) {
        return console.log(client.remoteAddress, client.remoteAddress, `уже подписан на ${topicName}`)
    }

    topics.map((topic) => {
        if (topic.name === topicName) {

            currentClients.map((c,index) => {
                if(c.moduleName === data.moduleName) {

                    topic.users[index] = c
                }
            })

            console.log(client.remoteAddress, client.remotePort, 'подписался на ', topicName)
        }
    })

    console.table(topics)

    return client.write(JSON.stringify(
        {
            type: 'RESPONSE',
            status: 200,
            payload: `Вы подписались на ${topicName}`
        }))

}

function isTopic(topicName) {
    // checks if topic exists
    return topics.some(e => e.name === topicName)

}

function unsubscribe(user, data) {

    const topicName = data.payload.topicName

    topics.map((e) => e.users.map((u, userIndex) => {

        if (u.moduleName === data.moduleName) {
            e.users.splice(userIndex, 1)
            console.log(u.moduleName, `был удален из топика ${topicName}`)
        }
        console.table(topics)
    }
    ))

    // topics.map((u, index) => {
    //     if(u.address === user.address && u.port === user.port) {
    //         console.log(index)
    //         console.log(e.address, e.port, `был удален из топика ${topicName}`)
    //         console.table(topics)
    //     }
    // })
    // проверяем подписан ли клиент на топик

}

function createTopic(client, data) {

    const topicToCreate = data.payload.topicName

    if (isTopic(topicToCreate)) {
        return client.write(JSON.stringify(
            {
                type: 'ERROR',
                status: 400,
                payload: 'Такой topic уже существует'
            }))
    } else {
        topics.push({ name: topicToCreate, users: [] })

        return client.write(JSON.stringify(
            {
                type: 'RESPONSE',
                status: 200,
                payload: `topic ${topicToCreate} был создан`
            }))
    }
}

function retrieveAllTopics(client) {

    const allTopics = topics.map((t) => {
        return t.name
    })

    return client.write(JSON.stringify(
        {
            type: 'RESPONSE',
            status: 200,
            payload: allTopics
        }))
}

brocker.on('listening', () => {
    const address = brocker.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

brocker.listen(8000, '0.0.0.0');
