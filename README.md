# Message types 
1. COMMAND
    1. PUBLISH
    2. SUBSCRIBE
    3. UNSUBSCRIBE
    4. TOPICS
    5. CREATE
2. ERROR
3. RESPONSE
4. BROADCAST

# Message status code

    1. 200 - success
    3. 300 - redirect
    2. 400 - error
    4. 500 - server error
    5. 301 - module address changed

# Response body example

    {
        type: 'COMMAND',
        command: 'PUBLISH',
        payload: {
            topicName: 'Topic1',
            message: 'SOme text to publish'
        }

    }

    {
        type: 'COMMAND',
        command: 'SUBSCRIBE',
        payload: {
            topicName: 'Topic1',
            message: 'Some text to publish'
        }

    }
    
    {
        type: 'ERROR',
        status: 400,
        payload: 'Some text about error'

    }

    {
        type: 'RESPONSE',
        status: 200',
        payload: 'Some text to send client'

    }

        {
        type: 'BROADCAST',
        status: 200',
        payload: 'Some text to send client'

    }
