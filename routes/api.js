require('dotenv').config() // Load environment variables from .env file

const DEVICE_NUM = process.env.DEVICE_NUM
const SMARTTHINGS_KEY = process.env.SMARTTHINGS_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const axios = require('axios')

const apiRouter = require('express').Router()

apiRouter.post('/controlbulb', function (req, res) {
  // 전등, 전구, 불빛 등 텍스트가 들어오면 실행
  const { userRequest } = req.body
  const utterance = userRequest.utterance

  const responseBody = {
    version: '2.0',
    template: {
      outputs: [
        {
          simpleText: {
            text: 'bulb: ' + utterance,
          },
        },
      ],
    },
  }

  res.status(200).send(responseBody)
})

apiRouter.post('/controlair-on', async function (req, res) {
  // 공기청정기 켜줘 관련 텍스트가 들어오면 실행
  const { userRequest } = req.body
  const utterance = userRequest.utterance

  try {
    const url = `https://api.smartthings.com/v1/devices/${DEVICE_NUM}/commands`
    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'switch',
          command: 'on',
          arguments: [],
          name: 'on',
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: SMARTTHINGS_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: 'air: ' + utterance,
            },
          },
        ],
      },
    }

    res.status(200).send(responseBody)
  } catch (error) {
    console.error('오류가 발생했습니다.', error)
    res.status(500).send('오류가 발생했습니다.')
  }
})

apiRouter.post('/controlair-off', async function (req, res) {
  // 공기청정기 꺼줘 관련 텍스트가 들어오면 실행
  const { userRequest } = req.body
  const utterance = userRequest.utterance

  console.log(DEVICE_NUM)

  try {
    const url = `https://api.smartthings.com/v1/devices/${DEVICE_NUM}/commands`
    const jsonData = {
      commands: [
        {
          component: 'main',
          capability: 'switch',
          command: 'off',
          arguments: [],
          name: 'off',
        },
      ],
    }

    const options = {
      method: 'POST',
      headers: {
        Authorization: SMARTTHINGS_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    }

    const response = await fetch(url, options)
    const data = await response.json()

    const responseBody = {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: 'air: ' + utterance,
            },
          },
        ],
      },
    }

    res.status(200).send(responseBody)
  } catch (error) {
    console.error('오류가 발생했습니다.', error)
    res.status(500).send('오류가 발생했습니다.')
  }
})

apiRouter.post('/controlmonitor', function (req, res) {
  // 채널, 소리, TV, 모니터 등 텍스트가 들어오면 실행
  const { userRequest } = req.body
  const utterance = userRequest.utterance

  const responseBody = {
    version: '2.0',
    template: {
      outputs: [
        {
          simpleText: {
            text: 'monitor: ' + utterance,
          },
        },
      ],
    },
  }

  res.status(200).send(responseBody)
})

apiRouter.post('/chatgpt', function (req, res) {
  console.log('start step')
  // 다른 말은 지피티 응답

  const { userRequest } = req.body
  const utterance = userRequest.utterance

  axios
    .post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: utterance }],
        request_timeout: 120,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      },
    )
    .then((response) => {
      const resGPT = response.data.choices[0].message.content

      const responseBody = {
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: 'chatgpt: ' + resGPT,
              },
            },
          ],
        },
      }

      res.status(200).send(responseBody)
    })
    .catch((error) => {
      console.error('Error calling OpenAI API:', error)
      res.status(500).send('Error generating response')
    })
})

module.exports = apiRouter
